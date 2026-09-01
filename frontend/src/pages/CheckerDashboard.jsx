import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Power, Phone, Navigation, KeyRound, CheckCircle2, Clock, TrendingUp, FileText, Car,
        AlertCircle, UploadCloud, RefreshCw, Wallet, DollarSign, Check, MapPin, Calendar } from "lucide-react";
import "./CheckerDashboard.css";

export default function CheckerDashboard() {
    const [checker, setChecker] = useState({ username: "Checker", contact: "", licenseNumber: "", 
        license_number: "", authorizationStatus: "pending", rejectionReason: "", area: "", city: "", 
        walletBalance: 0, commissionDue: 0, totalEarnings: 0,
    });

    const [isOnline, setIsOnline] = useState(true);
    const [activeBooking, setActiveBooking] = useState(null);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [earnings, setEarnings] = useState({ today: 0, monthly: 0, last24Hours: 0, completedJobs: 0 });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpInput, setOtpInput] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const [proofFiles, setProofFiles] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState("Paid");
    const [completeLoading, setCompleteLoading] = useState(false);

    const API_URL = "http://localhost:8080/api";

    // Dashboard Data
    const fetchDashboardData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/checker/dashboard`, {
                credentials: "include",
            });
            const data = await res.json();

            if (res.ok && data.success) {
                if (data.checker) {
                    setChecker(data.checker);
                    localStorage.setItem("checker", JSON.stringify(data.checker));
                }
                setActiveBooking(data.activeBooking || null);
                setPendingBookings(data.pendingBookings || []);
                if (data.earnings) setEarnings(data.earnings);
            }
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
        }
    }, [API_URL]);

    useEffect(() => {
        const savedChecker = localStorage.getItem("checker");
        if (savedChecker) {
            try {
                const parsed = JSON.parse(savedChecker);
                setChecker(parsed);
            } catch (e) {
                console.error("Cached checker parse error", e);
            }
        }

        fetchDashboardData();

        const interval = setInterval(() => {
            if (isOnline && !activeBooking) {
                fetchDashboardData();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [fetchDashboardData, isOnline, activeBooking]);

    // Accept Booking
    const handleAcceptBooking = async (bookingId) => {
        if (checker.authorizationStatus !== "approved") {
            setMessage("Your account is not approved by the admin yet.");
            setMessageType("error");
            return;
        }

        if (activeBooking) {
            setMessage("Please complete your current active inspection first.");
            setMessageType("error");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const res = await fetch(`${API_URL}/checker/accept-booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ booking_id: bookingId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Could not accept booking.");
                setMessageType("error");
                return;
            }

            setMessage("Booking accepted! Navigate to customer doorstep.");
            setMessageType("success");
            fetchDashboardData();
        } 
        
        catch (err) {
            console.error("Accept error:", err);
            setMessage("Server error while accepting booking.");
            setMessageType("error");
        } 
        
        finally {
            setLoading(false);
        }
    };

    // Verify Customer OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!/^\d{4}$/.test(otpInput.trim())) {
            setMessage("Please enter a valid 4-digit customer OTP.");
            setMessageType("error");
            return;
        }

        try {
            setOtpLoading(true);
            const res = await fetch(`${API_URL}/checker/verify-start-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    booking_id: activeBooking._id,
                    otp: otpInput.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Invalid OTP code.");
                setMessageType("error");
                return;
            }

            setMessage("OTP Verified successfully! Inspection unlocked.");
            setMessageType("success");
            setShowOtpModal(false);
            setOtpInput("");
            fetchDashboardData();
        } 
        
        catch (err) {
            console.error("OTP verification error:", err);
            setMessage("Failed to verify OTP.");
            setMessageType("error");
        } 
        
        finally {
            setOtpLoading(false);
        }
    };

    // Complete Inspection
    const handleCompleteBooking = async (e) => {
        e.preventDefault();

        if (proofFiles.length === 0) {
            setMessage("Please upload number plate photo.");
            setMessageType("error");
            return;
        }

        try {
            setCompleteLoading(true);
            setMessage("");

            const formData = new FormData();
            formData.append("booking_id", activeBooking._id);
            formData.append("payment_status", paymentStatus);

            proofFiles.forEach((file) => {
                formData.append("proofPhoto", file);
            });

            const res = await fetch(`${API_URL}/checker/complete-booking`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Failed to complete test.");
                setMessageType("error");
                return;
            }

            setMessage("Inspection completed! Payout & certificate recorded.");
            setMessageType("success");
            setProofFiles([]);
            fetchDashboardData();
        } 
        
        catch (err) {
            console.error("Complete error:", err);
            setMessage("Error uploading completion proof.");
            setMessageType("error");
        } 
        
        finally {
            setCompleteLoading(false);
        }
    };

    const isAuthorized = checker.authorizationStatus === "approved";
    const currentDL = checker.licenseNumber || checker.license_number || "";

    return (
        <div className="checker-dash-wrapper">
            <div className="checker-dash-container">
                <div className="checker-top-bar slide-in">
                    <div className="profile-identity">
                        <div className="shield-avatar">
                            <ShieldCheck size={26} />
                        </div>
                        <div>
                            <div className="name-status-row">
                                <h2>{checker.username}</h2>
                                <span
                                    className={`auth-badge ${
                                        checker.authorizationStatus === "approved"
                                            ? "approved"
                                            : checker.authorizationStatus === "rejected"
                                            ? "rejected"
                                            : "pending"
                                    }`}
                                >
                                    {checker.authorizationStatus === "approved"
                                        ? "Verified Inspector"
                                        : checker.authorizationStatus === "rejected"
                                        ? "Application Rejected"
                                        : "Approval Pending"}
                                </span>
                            </div>

                            <p className="meta-sub">
                                <span>
                                    <Phone size={13} /> {checker.contact || "—"}
                                </span>
                                <span>
                                    <FileText size={13} /> DL:{" "}
                                    <strong>{currentDL ? currentDL : "Registered"}</strong>
                                </span>
                                <span>
                                    <Navigation size={13} /> Area: {checker.area || checker.city || "All Localities"}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="duty-toggle-box">
                        <button
                            type="button"
                            className={`btn-duty ${isOnline && isAuthorized ? "online" : "offline"}`}
                            onClick={() => {
                                if (!isAuthorized) {
                                    alert("Account is pending approval. You cannot switch to On Duty.");
                                    return;
                                }
                                setIsOnline((prev) => !prev);
                            }}
                            disabled={!isAuthorized}
                        >
                            <Power size={16} />
                            {!isAuthorized
                                ? "DUTY LOCKED"
                                : isOnline
                                ? "ON DUTY (Accepting)"
                                : "OFF DUTY (Paused)"}
                        </button>
                    </div>
                </div>

                {checker.authorizationStatus === "pending" && (
                    <div className="checker-status-alert pending slide-in">
                        <div className="status-alert-icon">
                            <Clock size={22} />
                        </div>
                        <div>
                            <h4>Application Under Admin Verification</h4>
                            <p>
                                Your submitted driving license, government ID, and test certifications are currently being reviewed by the Admin. Once verified, job acceptance controls will automatically unlock.
                            </p>
                        </div>
                    </div>
                )}

                {checker.authorizationStatus === "rejected" && (
                    <div className="checker-status-alert rejected slide-in">
                        <div className="status-alert-icon">
                            <AlertCircle size={22} />
                        </div>
                        <div>
                            <h4>Application Rejected by Admin</h4>
                            <p>
                                <strong>Reason:</strong>{" "}
                                {checker.rejectionReason ||
                                    "Submitted documents did not meet standard PUC mobile unit authorization criteria."}
                            </p>
                            <span className="contact-admin-hint">
                                Please re-submit valid credentials or contact platform support.
                            </span>
                        </div>
                    </div>
                )}

                <div className="earnings-grid slide-in">
                    <div className="earn-card today">
                        <div className="earn-icon green">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <label>Today's Income</label>
                            <h3>₹ {earnings.today || 0}</h3>
                        </div>
                    </div>

                    <div className="earn-card recent">
                        <div className="earn-icon blue">
                            <Clock size={20} />
                        </div>
                        <div>
                            <label>Wallet Balance (80% Cut)</label>
                            <h3 className="text-green">₹ {checker.walletBalance || 0}</h3>
                        </div>
                    </div>

                    <div className="earn-card monthly">
                        <div className="earn-icon amber">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <label>COD Commission Due</label>
                            <h3 className="text-red">₹ {checker.commissionDue || 0}</h3>
                        </div>
                    </div>

                    <div className="earn-card jobs">
                        <div className="earn-icon dark">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <label>Completed Tests</label>
                            <h3>{earnings.completedJobs || checker.completedBookings || 0}</h3>
                        </div>
                    </div>
                </div>

                {message && (
                    <div
                        className={`dash-alert ${
                            messageType === "success" ? "alert-success" : "alert-error"
                        } slide-in`}
                    >
                        {messageType === "success" ? (
                            <CheckCircle2 size={18} />
                        ) : (
                            <AlertCircle size={18} />
                        )}
                        <span>{message}</span>
                    </div>
                )}

                {activeBooking && (
                    <div className="active-job-card slide-in">
                        <div className="job-header">
                            <div className="job-title-block">
                                <span className="live-pulse"></span>
                                <div>
                                    <h3>Active Doorstep Job: #{activeBooking._id?.substring(18)}</h3>
                                    <p>
                                        Customer:{" "}
                                        <strong>
                                            {activeBooking.user?.username || "Valued Customer"}
                                        </strong>
                                    </p>
                                </div>
                            </div>

                            <span className={`job-status-pill ${activeBooking.status}`}>
                                {activeBooking.status === "in_progress"
                                    ? "Inspection In Progress"
                                    : "Accepted (On Route)"}
                            </span>
                        </div>

                        <div className="job-details-grid">
                            <div className="detail-item full-width">
                                <label>
                                    <Navigation size={13} /> Destination Address:
                                </label>
                                <p className="address-text">{activeBooking.address}</p>
                            </div>

                            <div className="detail-item">
                                <label>
                                    <DollarSign size={13} /> Amount to Collect:
                                </label>
                                <p className="price-bold">
                                    ₹ {activeBooking.totalPrice || activeBooking.price || 0}{" "}
                                    <small>({activeBooking.paymentType})</small>
                                </p>
                            </div>

                            <div className="detail-item">
                                <label>
                                    <Clock size={13} /> Scheduled Time Slot:
                                </label>
                                <p>{activeBooking.timeSlot || "Standard Direct Delivery"}</p>
                            </div>
                        </div>

                        <div className="job-vehicles-box">
                            <label>Vehicles for Testing:</label>
                            <div className="vehicle-pills-row">
                                {activeBooking.vehicles?.map((v, i) => (
                                    <div key={i} className="job-vehicle-badge">
                                        <Car size={14} />
                                        <strong>{v.number}</strong>
                                        <span>({v.type}W - {v.fuel})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="job-action-buttons">
                            <a
                                href={`tel:${activeBooking.user?.contact || ""}`}
                                className="btn-action call"
                            >
                                <Phone size={15} /> Call Customer
                            </a>

                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    activeBooking.address
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-action maps"
                            >
                                <Navigation size={15} /> Open Navigation
                            </a>

                            {activeBooking.status !== "in_progress" && (
                                <button
                                    type="button"
                                    className="btn-action otp"
                                    onClick={() => setShowOtpModal(true)}
                                >
                                    <KeyRound size={15} /> Enter Customer OTP
                                </button>
                            )}
                        </div>

                        {activeBooking.status === "in_progress" ? (
                            <form onSubmit={handleCompleteBooking} className="completion-form">
                                <h4>
                                    <Check size={16} /> Complete Inspection & Upload Number Plate Photo
                                </h4>

                                <div className="form-row-2">
                                    <div className="field-block">
                                        <label>Number Plate Photo</label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,application/pdf"
                                            onChange={(e) =>
                                                setProofFiles(Array.from(e.target.files))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="field-block">
                                        <label>Payment Collection Status</label>
                                        <select
                                            value={paymentStatus}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            required
                                        >
                                            <option value="Paid">Payment Received (Paid)</option>
                                            <option value="Pending">Payment Pending</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit-complete"
                                    disabled={completeLoading}
                                >
                                    <UploadCloud size={18} />
                                    {completeLoading
                                        ? "Uploading Certificate..."
                                        : "Finish Job & Mark Completed"}
                                </button>
                            </form>
                        ) : (
                            <div className="otp-lock-banner">
                                <KeyRound size={16} />
                                <span>
                                    Ask the customer for their 4-digit OTP upon doorstep arrival to unlock test completion.
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="pending-pool-card slide-in delay-1">
                    <div className="pool-header">
                        <div>
                            <h3>
                                <Car size={20} /> Nearby Inspection Requests ({pendingBookings.length})
                            </h3>
                            <p>Pick & accept jobs matching your registered locality and jurisdiction</p>
                        </div>

                        <button
                            type="button"
                            className="btn-refresh"
                            onClick={fetchDashboardData}
                        >
                            <RefreshCw size={14} /> Refresh List
                        </button>
                    </div>

                    {!isAuthorized ? (
                        <div className="lock-state-box">
                            <ShieldCheck size={36} color="#f59e0b" />
                            <h4>Account Authorization Pending</h4>
                            <p>Your account is under admin review. Nearby jobs will unlock once approved.</p>
                        </div>
                    ) : !isOnline ? (
                        <div className="lock-state-box">
                            <Power size={36} color="#94a3b8" />
                            <h4>You are currently Off Duty</h4>
                            <p>Switch to "On Duty" to accept incoming customer requests.</p>
                        </div>
                    ) : pendingBookings.length === 0 ? (
                        <div className="lock-state-box">
                            <CheckCircle2 size={36} color="#16a34a" />
                            <h4>No Pending Bookings in Your Locality</h4>
                            <p>New customer bookings in your area will automatically appear here.</p>
                        </div>
                    ) : (
                        <div className="pool-table-wrap">
                            <table className="pool-table">
                                <thead>
                                    <tr>
                                        <th>Vehicles</th>
                                        <th>Schedule / Slot</th>
                                        <th>Address & Landmark</th>
                                        <th>Gross Amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingBookings.map((b) => (
                                        <tr key={b._id}>
                                            <td>
                                                <div className="table-vehicles">
                                                    {b.vehicles?.map((v, idx) => (
                                                        <span key={idx} className="table-vehicle-pill">
                                                            {v.number} ({v.type}W - {v.fuel})
                                                        </span>
                                                    ))}
                                                </div>
                                                {b.distanceKm !== null && b.distanceKm !== undefined && (
                                                    <span className="distance-badge">
                                                        <MapPin size={11} /> {b.distanceKm} km away
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="slot-badge">
                                                    <Calendar size={11} />{" "}
                                                    {b.bookingDate
                                                        ? new Date(b.bookingDate).toLocaleDateString("en-IN")
                                                        : "Today"}
                                                    <br />
                                                    <small>{b.timeSlot}</small>
                                                </span>
                                            </td>
                                            <td className="addr-cell">{b.address}</td>
                                            <td>
                                                <strong className="table-price">
                                                    ₹ {b.totalPrice || b.price || 0}
                                                </strong>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-accept-job"
                                                    onClick={() => handleAcceptBooking(b._id)}
                                                    disabled={loading || Boolean(activeBooking)}
                                                    title={
                                                        activeBooking
                                                            ? "Complete active job first"
                                                            : "Accept this job"
                                                    }
                                                >
                                                    {activeBooking
                                                        ? "Busy"
                                                        : loading
                                                        ? "Accepting..."
                                                        : "Accept Job"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showOtpModal && (
                <div className="modal-overlay">
                    <div className="modal-box slide-in">
                        <div className="modal-top">
                            <div className="modal-icon">
                                <KeyRound size={22} />
                            </div>
                            <h3>Enter 4-Digit Customer OTP</h3>
                            <p>Ask the vehicle owner for the start code.</p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="otp-form">
                            <input
                                type="text"
                                maxLength={4}
                                placeholder="0 0 0 0"
                                value={otpInput}
                                onChange={(e) =>
                                    setOtpInput(e.target.value.replace(/\D/g, ""))
                                }
                                autoFocus
                                required
                            />

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowOtpModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-verify"
                                    disabled={otpLoading || otpInput.length < 4}
                                >
                                    {otpLoading ? "Verifying..." : "Verify & Begin Test"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}