import { useState } from "react";
import "./CheckerSignUp.css";
import { Link, useNavigate } from "react-router-dom";

function CheckerSignUp() {
    const navigate = useNavigate();

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        username: "", contact: "", email: "", password: "", area: "", city: "", state: "", 
        address: "", licenseNumber: "", licenseExpiry: "", idProofType: "",
    });

    const [documentFiles, setDocumentFiles] = useState([]);

    const API_URL = "http://localhost:8080/api/auth";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "contact") {
            setOtpSent(false);
            setOtpVerified(false);
            setOtp("");
        }
        setMessage("");
    };

    const handleFileChange = (e) => {
        setDocumentFiles(Array.from(e.target.files));
    };

    const handleSendOtp = async () => {
        if (!/^\d{10}$/.test(formData.contact)) {
            setMessage("Please enter a valid 10-digit contact number.");
            setMessageType("error");
            return;
        }

        try {
            setOtpLoading(true);
            setMessage("");

            const response = await fetch(`${API_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    contact: formData.contact,
                    role: "checker",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message);
                setMessageType("error");
                return;
            }

            setOtpSent(true);
            setOtpVerified(false);
            setOtp("");
            setMessage(data.message || "OTP sent successfully.");
            setMessageType("success");
        } 
        
        catch (error) {
            console.error("Send OTP error:", error);
            setMessage("Unable to send OTP. Please try again.");
            setMessageType("error");
        } 
        
        finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!/^\d{6}$/.test(otp)) {
            setMessage("Please enter a valid 6-digit OTP.");
            setMessageType("error");
            return;
        }

        try {
            setVerifyLoading(true);
            setMessage("");

            const response = await fetch(`${API_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    contact: formData.contact,
                    otp: otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setOtpVerified(false);
                setMessage(data.message);
                setMessageType("error");
                return;
            }

            setOtpVerified(true);
            setMessage(data.message || "OTP verified successfully.");
            setMessageType("success");
        } 
        
        catch (error) {
            console.error("Verify OTP error:", error);
            setMessage("Unable to verify OTP. Please try again.");
            setMessageType("error");
        } 
        
        finally {
            setVerifyLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpVerified) {
            setMessage("Please verify your contact number first.");
            setMessageType("error");
            return;
        }

        if (documentFiles.length === 0) {
            setMessage("Please upload at least one document.");
            setMessageType("error");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const uploadData = new FormData();
            Object.keys(formData).forEach((key) => {
                uploadData.append(key, formData[key]);
            });

            documentFiles.forEach((file) => {
                uploadData.append("documents", file);
            });

            const response = await fetch(`${API_URL}/checkersignup`, {
                method: "POST",
                credentials: "include",
                body: uploadData,
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message);
                setMessageType("error");
                return;
            }

            setMessage("Application submitted successfully! Redirecting...");
            setMessageType("success");

            setTimeout(() => {
                navigate("/checker-signin");
            }, 1200);
        } 
        
        catch (error) {
            console.error("Checker signup error:", error);
            setMessage("Registration failed. Please try again.");
            setMessageType("error");
        } 
        
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="body-signup">
            <div className="auth-wrapper checker-wrapper">
                <div className="background-shape"></div>
                <div className="secondary-shape"></div>

                <div className="credentials-panel signup">
                    <h2 className="slide-element">Apply as Checker</h2>

                    {message && (
                        <div
                            className={`flash-box ${
                                messageType === "success"
                                    ? "flash-success"
                                    : "flash-error"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} id="checkerSignupForm">
                        <div className="signup-grid">
                            <div className="field-wrapper slide-element">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    autoComplete="name"
                                />
                                <label>Full Name</label>
                                <i className="fa-solid fa-user"></i>
                            </div>

                            <div className="field-wrapper slide-element">
                                <input
                                    type="tel"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required
                                    maxLength={10}
                                    inputMode="numeric"
                                    autoComplete="tel"
                                />
                                <label>Contact Number</label>
                                <i className="fa-solid fa-phone"></i>
                            </div>

                            <div className="field-wrapper slide-element span-full">
                                <button
                                    type="button"
                                    className="submit-button otp-btn"
                                    onClick={handleSendOtp}
                                    disabled={otpLoading}
                                >
                                    {otpLoading
                                        ? "Sending OTP..."
                                        : otpSent
                                        ? "Resend OTP"
                                        : "Send OTP"}
                                </button>
                            </div>

                            {otpSent && (
                                <>
                                    <div className="field-wrapper slide-element">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) =>
                                                setOtp(
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                            }
                                            maxLength={6}
                                            inputMode="numeric"
                                            disabled={otpVerified}
                                            placeholder=" "
                                            required
                                        />
                                        <label>Enter 6-digit OTP</label>
                                        <i className="fa-solid fa-key"></i>
                                    </div>

                                    <div className="field-wrapper slide-element">
                                        <button
                                            type="button"
                                            className="submit-button verify-btn"
                                            onClick={handleVerifyOtp}
                                            disabled={
                                                verifyLoading || otpVerified
                                            }
                                        >
                                            {verifyLoading
                                                ? "Verifying..."
                                                : otpVerified
                                                ? "OTP Verified ✓"
                                                : "Verify OTP"}
                                        </button>
                                    </div>
                                </>
                            )}

                            <div className="field-wrapper slide-element">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                                <label>Email</label>
                                <i className="fa-solid fa-envelope"></i>
                            </div>

                            <div className="field-wrapper slide-element">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <label>Password</label>
                                <i className="fa-solid fa-lock"></i>
                            </div>

                            <div className="field-wrapper slide-element">
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    required
                                />
                                <label>Area / Locality</label>
                                <i className="fa-solid fa-location-dot"></i>
                            </div>

                            <div className="field-wrapper slide-element">
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                                <label>City</label>
                                <i className="fa-solid fa-city"></i>
                            </div>

                            <div className="field-wrapper slide-element">
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                                <label>State</label>
                                <i className="fa-solid fa-map"></i>
                            </div>

                            <div className="field-wrapper slide-element">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                                <label>Address</label>
                                <i className="fa-solid fa-house"></i>
                            </div>

                            <div className="field-wrapper slide-element">
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    required
                                />
                                <label>License Number</label>
                                <i className="fa-solid fa-id-card"></i>
                            </div>

                            <div className="field-wrapper slide-element date-field">
                                <input
                                    type="date"
                                    name="licenseExpiry"
                                    value={formData.licenseExpiry}
                                    onChange={handleChange}
                                    required
                                />
                                <label>License Expiry Date</label>
                                <i className="fa-solid fa-calendar"></i>
                            </div>

                            <div className="field-wrapper slide-element">
                                <select
                                    name="idProofType"
                                    value={formData.idProofType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled hidden>
                                        Select ID Proof
                                    </option>
                                    <option value="AADHAAR">Aadhaar Card</option>
                                    <option value="DL">Driving License</option>
                                    <option value="PASSPORT">Passport</option>
                                </select>
                                <label>ID Proof Type</label>
                                <i className="fa-solid fa-address-card"></i>
                            </div>

                            <div className="field-wrapper slide-element span-full">
                                <input
                                    type="file"
                                    name="documents"
                                    onChange={handleFileChange}
                                    multiple
                                    required
                                />
                                <label>Upload ID Documents (PDF / Image)</label>
                                <i className="fa-solid fa-file-arrow-up"></i>
                            </div>
                        </div>

                        <div
                            className="field-wrapper slide-element"
                            style={{ marginTop: "18px" }}
                        >
                            <button
                                className="submit-button"
                                type="submit"
                                disabled={!otpVerified || loading}
                                style={{
                                    opacity: otpVerified && !loading ? 1 : 0.5,
                                    cursor:
                                        otpVerified && !loading
                                            ? "pointer"
                                            : "not-allowed",
                                }}
                            >
                                {loading
                                    ? "Submitting Application..."
                                    : "Apply for Checker Verification"}
                            </button>
                        </div>

                        <div className="switch-link slide-element">
                            <p>
                                Already have an account? <br />
                                <Link to="/checker-signin">Sign In</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="welcome-section signup">
                    <h2 className="slide-element">JOIN AS CHECKER!</h2>
                </div>
            </div>
        </div>
    );
}

export default CheckerSignUp;