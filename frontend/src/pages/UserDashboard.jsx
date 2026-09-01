import { useState, useEffect, useCallback } from "react";
import { Car, Plus, Minus, Navigation, CreditCard, CheckCircle2, Clock, FileText,
    ShieldCheck, AlertCircle, KeyRound, Calendar, Phone, UserCheck, Download} from "lucide-react";
import "./UserDashboard.css";

const VEHICLE_PRICING = { "2": 80, "3": 100, "4": 150 };

export default function UserDashboard() {
    const [user, setUser] = useState({ username: "User", contact: "" });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [vehicles, setVehicles] = useState([{ number: "", type: "2", fuel: "Petrol" }]);
    const [paymentType, setPaymentType] = useState("UPI");
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
    const [timeSlot, setTimeSlot] = useState("09:00 AM - 11:00 AM");

    const [address, setAddress] = useState("");
    const [area, setArea] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

    const API_URL = "http://localhost:8080/api";

    const fetchDashboardData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/user/bookings`, { credentials: "include" });
            const data = await res.json();
            if (res.ok && data.bookings) {
                setBookings(data.bookings);
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        }
    }, [API_URL]);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Cached user error", e);
            }
        }
        fetchDashboardData();

        const interval = setInterval(() => {
            fetchDashboardData();
        }, 8000);

        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const totalPrice = vehicles.reduce((sum, v) => sum + (VEHICLE_PRICING[v.type] || 80), 0);

    const handleVehicleChange = (index, field, value) => {
        const updated = [...vehicles];
        updated[index][field] = field === "number" ? value.toUpperCase() : value;
        setVehicles(updated);
    };

    const addVehicle = () => {
        setVehicles([...vehicles, { number: "", type: "2", fuel: "Petrol" }]);
    };

    const removeVehicle = (index) => {
        if (vehicles.length > 1) {
            setVehicles(vehicles.filter((_, i) => i !== index));
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setMessage("Geolocation not supported by browser.");
            setMessageType("error");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoordinates({ latitude, longitude });

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                    );
                    const data = await res.json();
                    if (data) {
                        setAddress(data.display_name || "");
                        const addr = data.address || {};
                        setArea(addr.suburb || addr.neighbourhood || addr.residential || addr.road || "");
                        setDistrict(addr.city || addr.town || addr.district || addr.county || "");
                        setState(addr.state || "");
                    }
                } 
                
                catch {
                    setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
                }
                setLocating(false);
            },
            () => {
                setMessage("Permission denied. Enter address manually.");
                setMessageType("error");
                setLocating(false);
            }
        );
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            setLoading(true);

            const payload = {
                vehicles,
                total_price: totalPrice,
                payment_type: paymentType,
                bookingDate, timeSlot,
                address, area: area || address,
                district, state,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
            };

            const res = await fetch(`${API_URL}/booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Booking failed.");
                setMessageType("error");
                return;
            }

            setMessage("PUC test booked! Safety OTP is generated below.");
            setMessageType("success");
            setVehicles([{ number: "", type: "2", fuel: "Petrol" }]);
            setAddress("");
            fetchDashboardData();
        } 
        
        catch (err) {
            console.error("Booking error:", err);
            setMessage("Server error. Please try again.");
            setMessageType("error");
        } 
        
        finally {
            setLoading(false);
        }
    };

    const activeBooking = bookings.find(
        (b) => b.status === "pending" || b.status === "accepted" || b.status === "in_progress"
    );

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <div className="dash-header slide-in">
                    <div>
                        <span className="badge-pill">
                            <ShieldCheck size={14} /> Official Doorstep PUC
                        </span>

                        <h2>Welcome, {user.username}!</h2>

                        <p className="subtitle">Book certified doorstep emission tests & track live inspection status.</p>
                    </div>

                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stat-icon green">
                                <FileText size={18} />
                            </div>

                            <div>
                                <h4>{bookings.length}</h4>
                                <label>Total Tests</label>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <Clock size={18} />
                            </div>

                            <div>
                                <h4>{activeBooking ? 1 : 0}</h4>
                                <label>Active Test</label>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon dark">
                                <ShieldCheck size={18} />
                            </div>

                            <div>
                                <h4>{bookings.filter((b) => b.status === "completed").length}</h4>
                                <label>Certificates</label>
                            </div>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`dash-alert ${messageType === "success" ? "alert-success" : "alert-error"} slide-in`}>
                        {messageType === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message}</span>
                    </div>
                )}

                {activeBooking && (
                    <div className="active-tracking-card slide-in">
                        <div className="tracking-top">
                            <div className="tracking-info">
                                <span className="live-pulse"></span>
                                <div>
                                    <h3>Doorstep Inspection Scheduled (#{activeBooking._id?.substring(18)})</h3>
                                    <p>Share this 4-digit code with the technician upon doorstep arrival</p>
                                </div>
                            </div>

                            <div className="uber-otp-card">
                                <label>
                                    <KeyRound size={14} /> Start Inspection OTP
                                </label>
                                <div className="otp-digits">{activeBooking.startOtp || "••••"}</div>
                            </div>
                        </div>

                        <div className="stepper-bar">
                            <div className="step-point completed">
                                <span className="dot">✓</span>
                                <label>Booked</label>
                            </div>

                            <div className={`step-line ${activeBooking.status !== "pending" ? "fill" : ""}`}></div>

                            <div className={`step-point ${activeBooking.status !== "pending" ? "completed" : "active"}`}>
                                <span className="dot">2</span>
                                <label>Assigned</label>
                            </div>

                            <div className={`step-line ${activeBooking.status === "in_progress" ? "fill" : ""}`}></div>

                            <div className={`step-point ${activeBooking.status === "in_progress" ? "active" : ""}`}>
                                <span className="dot">3</span>
                                <label>Testing</label>
                            </div>

                            <div className="step-line"></div>

                            <div className="step-point">
                                <span className="dot">4</span>
                                <label>Certified</label>
                            </div>
                        </div>

                        {activeBooking.checker ? (
                            <div className="assigned-checker-box slide-in">
                                <div className="checker-avatar">
                                    <UserCheck size={22} />
                                </div>
                                <div className="checker-meta">
                                    <strong>{activeBooking.checker.username} (Certified Inspector)</strong>
                                    <p>Status: Assigned & En Route to your doorstep</p>
                                </div>
                                <a
                                    href={`tel:${activeBooking.checker.contact || ""}`}
                                    className="btn-call-checker"
                                >
                                    <Phone size={14} /> Call Inspector ({activeBooking.checker.contact || "Assigned"})
                                </a>
                            </div>
                        ) : (
                            <div className="assigned-checker-box pending-assign">
                                <Clock size={18} />
                                <span>Assigning nearest certified mobile emission unit in <strong>{activeBooking.area || "your area"}</strong>...</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="dash-grid">
                    <div className="dash-card booking-form-card slide-in">
                        <div className="card-title-bar">
                            <div className="icon-badge">
                                <Car size={20} />
                            </div>
                            <div>
                                <h3>Schedule Doorstep PUC</h3>
                                <p>Valid government emission certificate valid for 6 months</p>
                            </div>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="booking-form">
                            <div className="section-block">
                                <div className="section-head">
                                    <label>Vehicles for Testing</label>
                                    <span className="vehicle-counter">{vehicles.length} Vehicle(s)</span>
                                </div>

                                {vehicles.map((v, i) => (
                                    <div key={i} className="vehicle-input-row">
                                        <div className="field-group flex-2">
                                            <label>Registration Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. DL01AB1234"
                                                value={v.number}
                                                onChange={(e) => handleVehicleChange(i, "number", e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="field-group flex-1">
                                            <label>Type</label>
                                            <select
                                                value={v.type}
                                                onChange={(e) => handleVehicleChange(i, "type", e.target.value)}
                                            >
                                                <option value="2">2-Wheeler (₹80)</option>
                                                <option value="3">3-Wheeler (₹100)</option>
                                                <option value="4">4-Wheeler (₹150)</option>
                                            </select>
                                        </div>

                                        <div className="field-group flex-1">
                                            <label>Fuel</label>
                                            <select
                                                value={v.fuel}
                                                onChange={(e) => handleVehicleChange(i, "fuel", e.target.value)}
                                            >
                                                <option value="Petrol">Petrol</option>
                                                <option value="Diesel">Diesel</option>
                                                <option value="CNG">CNG</option>
                                            </select>
                                        </div>

                                        {vehicles.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-remove-vehicle"
                                                onClick={() => removeVehicle(i)}
                                            >
                                                <Minus size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button type="button" className="btn-add-vehicle" onClick={addVehicle}>
                                    <Plus size={16} /> Add Another Vehicle
                                </button>
                            </div>

                            <div className="section-block">
                                <label className="block-label">Select Date & Preferred Slot</label>
                                <div className="form-grid-2">
                                    <div className="field-group">
                                        <label>
                                            <Calendar size={13} /> Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split("T")[0]}
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label>
                                            <Clock size={13} /> Preferred Time Slot
                                        </label>
                                        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                                            <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                                            <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                                            <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                                            <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                                            <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="section-block">
                                <div className="section-head">
                                    <label>Inspection Doorstep Address</label>
                                    <button
                                        type="button"
                                        className="btn-geo"
                                        onClick={handleGetLocation}
                                        disabled={locating}
                                    >
                                        <Navigation size={13} />
                                        {locating ? "Detecting..." : "Auto-Detect Location"}
                                    </button>
                                </div>

                                <div className="field-group">
                                    <textarea
                                        rows={2}
                                        placeholder="Full address, house/flat number, landmark..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-grid-3">
                                    <div className="field-group">
                                        <label>Area / Locality</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Navodaya Nagar"
                                            value={area}
                                            onChange={(e) => setArea(e.target.value)}
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label>City / District</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Haridwar"
                                            value={district}
                                            onChange={(e) => setDistrict(e.target.value)}
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Uttarakhand"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-bar">
                                <div className="price-tag">
                                    <span>Total Payable</span>
                                    <h3>₹{totalPrice}</h3>
                                </div>

                                <button type="submit" className="btn-book-now" disabled={loading}>
                                    <CreditCard size={18} />
                                    {loading ? "Scheduling..." : "Schedule Doorstep Test"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="dash-card history-card slide-in delay-1">
                        <div className="card-title-bar">
                            <div className="icon-badge green-badge">
                                <FileText size={20} />
                            </div>

                            <div>
                                <h3>PUC Records & Certificates</h3>
                                <p>Download your verified government PUC certificates</p>
                            </div>
                        </div>

                        <div className="history-list">
                            {bookings.length === 0 ? (
                                <div className="empty-history">
                                    <Car size={38} />
                                    <h4>No tests recorded yet</h4>
                                    <p>Your completed certificates will appear here.</p>
                                </div>
                            ) : (
                                bookings.map((b, idx) => (
                                    <div key={b._id || idx} className="history-item">
                                        <div className="history-item-top">
                                            <div className="vehicle-chips">
                                                {b.vehicles?.map((v, vIdx) => (
                                                    <span key={vIdx} className="vehicle-pill">
                                                        {v.number} ({v.type}W - {v.fuel})
                                                    </span>
                                                ))}
                                            </div>
                                            <span className={`status-pill ${String(b.status).toLowerCase()}`}>
                                                {b.status}
                                            </span>
                                        </div>

                                        <div className="history-item-meta">
                                            <span>
                                                <Calendar size={13} />
                                                {b.bookingDate
                                                    ? new Date(b.bookingDate).toLocaleDateString("en-IN")
                                                    : "Recent"}
                                            </span>
                                            <span>
                                                <Clock size={13} /> {b.timeSlot}
                                            </span>
                                            <span className="price">₹{b.totalPrice || 0}</span>
                                        </div>

                                        {b.status === "completed" && (
                                            <div className="cert-download-row">
                                                <span className="cert-valid-text">
                                                    <ShieldCheck size={14} color="#16a34a" /> PUC Valid for 6 Months
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn-download-cert"
                                                    onClick={() => window.open(b.certificateUrl || "#", "_blank")}
                                                >
                                                    <Download size={13} /> Download Certificate
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}