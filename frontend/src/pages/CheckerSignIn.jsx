import { useState } from "react";
import "./CheckerSignIn.css";
import { Link, useNavigate } from "react-router-dom";

function CheckerSignIn() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const API_URL = "http://localhost:8080/api/auth";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const response = await fetch(`${API_URL}/checkerlogin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Invalid credentials.");
                setMessageType("error");
                return;
            }

            setMessage("Login successful! Redirecting...");
            setMessageType("success");

            if (data.checker) {
                localStorage.setItem("checker", JSON.stringify(data.checker));
            }

            setTimeout(() => {
                navigate("/checker-dashboard");
            }, 1000);
        } 
        
        catch (error) {
            console.error("Checker login error:", error);
            setMessage("Unable to connect to the server. Please try again.");
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
                    <h2 className="slide-element">Checker Login</h2>

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

                    <form onSubmit={handleSubmit} id="checkerLoginForm">
                        <div className="field-wrapper slide-element">
                            <input
                                type="text"
                                name="username"
                                id="login-username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                            />
                            <label>Username / Full Name</label>
                            <i className="fa-solid fa-user"></i>
                        </div>

                        <div className="field-wrapper slide-element">
                            <input
                                type="password"
                                name="password"
                                id="login-password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                            />
                            <label>Password</label>
                            <i className="fa-solid fa-lock"></i>
                        </div>

                        <div
                            className="field-wrapper slide-element"
                            style={{ marginTop: "10px" }}
                        >
                            <button
                                className="submit-button"
                                type="submit"
                                id="loginBtn"
                                disabled={loading}
                                style={{
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                            >
                                {loading ? "Authenticating..." : "Login"}
                            </button>
                        </div>

                        <div className="switch-link slide-element">
                            <p>
                                Don't have a checker account?
                                <br />
                                <Link to="/checker-signup">
                                    Apply for Checker Verification
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="welcome-section signup">
                    <h2 className="slide-element">WELCOME BACK!</h2>
                </div>
            </div>
        </div>
    );
}

export default CheckerSignIn;