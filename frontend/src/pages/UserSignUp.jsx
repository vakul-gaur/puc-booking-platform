import { useState } from "react";
import "./UserSignUp.css";
import { Link, useNavigate } from "react-router-dom";

function UserSignUp() {
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
        username: "",
        contact: "",
        email: "",
        password: "",
    });

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
                    role: "user",
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
        } catch (error) {
            console.error("Send OTP error:", error);
            setMessage("Unable to send OTP. Please try again.");
            setMessageType("error");
        } finally {
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
            setMessage("Please verify your mobile number first.");
            setMessageType("error");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message);
                setMessageType("error");
                return;
            }

            setMessage("Registration successful! Redirecting to Sign In...");
            setMessageType("success");

            setTimeout(() => {
                navigate("/signin");
            }, 1200);
        } 
        
        catch (error) {
            console.error("Signup error:", error);
            setMessage("Registration failed. Please try again.");
            setMessageType("error");
        } 
        
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="body-signup">
            <div className="auth-wrapper">
                <div className="background-shape"></div>
                <div className="secondary-shape"></div>

                <div className="credentials-panel signup">
                    <h2 className="slide-element">Register</h2>

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

                    <form onSubmit={handleSubmit} id="signupForm">
                        <div className="field-wrapper slide-element">
                            <input
                                type="text"
                                name="username"
                                id="reg-username"
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
                                id="reg-contact"
                                value={formData.contact}
                                onChange={handleChange}
                                required
                                maxLength={10}
                                inputMode="numeric"
                                autoComplete="tel"
                            />
                            <label>Contact</label>
                            <i className="fa-solid fa-phone"></i>
                        </div>

                        <div className="field-wrapper slide-element">
                            <button
                                type="button"
                                id="sendOtpBtn"
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
                                <div
                                    className="field-wrapper slide-element"
                                    id="otpSection"
                                >
                                    <input
                                        type="text"
                                        id="otpInput"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value.replace(/\D/g, "")
                                            )
                                        }
                                        maxLength={6}
                                        inputMode="numeric"
                                        placeholder=" "
                                        disabled={otpVerified}
                                        required
                                    />
                                    <label>Enter OTP</label>
                                    <i className="fa-solid fa-key"></i>
                                </div>

                                <div
                                    className="field-wrapper slide-element"
                                    id="verifyOtpSection"
                                >
                                    <button
                                        type="button"
                                        id="verifyOtpBtn"
                                        className="submit-button verify-btn"
                                        onClick={handleVerifyOtp}
                                        disabled={verifyLoading || otpVerified}
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

                        <div
                            className="field-wrapper slide-element"
                            id="email"
                        >
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
                            <button
                                className="submit-button"
                                type="submit"
                                id="registerBtn"
                                disabled={!otpVerified || loading}
                                style={{
                                    opacity: otpVerified && !loading ? 1 : 0.5,
                                    cursor:
                                        otpVerified && !loading
                                            ? "pointer"
                                            : "not-allowed",
                                }}
                            >
                                {loading ? "Creating Account..." : "Register"}
                            </button>
                        </div>

                        <div className="switch-link slide-element">
                            <p>
                                Already have an account?
                                <br />
                                <Link to="/signin">Sign In</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="welcome-section signup">
                    <h2 className="slide-element">WELCOME!</h2>
                </div>
            </div>
        </div>
    );
}

export default UserSignUp;