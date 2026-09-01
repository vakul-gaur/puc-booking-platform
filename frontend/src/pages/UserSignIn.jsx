import { useState } from "react";
import "./UserSignIn.css";
import { Link, useNavigate } from "react-router-dom";

function UserSignIn() {
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

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Invalid username or password.");
                setMessageType("error");
                return;
            }

            setMessage("Login successful! Redirecting to Dashboard...");
            setMessageType("success");

            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            setTimeout(() => {
                navigate("/user-dashboard");
            }, 1000);
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to connect to the server. Please try again.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body-signin">
            <div className="auth-wrapper">
                <div className="background-shape"></div>
                <div className="secondary-shape"></div>

                <div className="credentials-panel signin">
                    <h2 className="slide-element">Login</h2>

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

                    <form onSubmit={handleSubmit} id="userLoginForm">
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
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </div>

                        <div className="switch-link slide-element">
                            <p>
                                Don't have an account?
                                <br />
                                <Link to="/signup">Sign Up</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="welcome-section signin">
                    <h2 className="slide-element">WELCOME BACK!</h2>
                </div>
            </div>
        </div>
    );
}

export default UserSignIn;