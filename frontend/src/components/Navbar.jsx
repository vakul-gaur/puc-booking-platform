import { useState, useEffect } from "react";
import { User, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import logoImg from "../assets/logo.png";
import "./Navbar.css";

export default function Navbar({ isLoggedIn, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === "/";

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedChecker = localStorage.getItem("checker");

        if (isLoggedIn || storedUser || storedChecker) {
            setAuthenticated(true);
            setUserRole(storedChecker ? "checker" : "user");
        } else {
            setAuthenticated(false);
            setUserRole(null);
        }
    }, [isLoggedIn, location]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const closeMenu = () => setIsOpen(false);

    const handleSignIn = () => {
        closeMenu();
        navigate("/signin");
    };

    const handlePartnerWithUs = () => {
        closeMenu();
        navigate("/checker-signup");
    };

    const handleLogout = async () => {
        closeMenu();
        try {
            const endpoint = userRole === "checker" ? "http://localhost:8080/api/auth/checkerlogout" : "http://localhost:8080/api/auth/logout";
            await fetch(endpoint, { method: "POST", credentials: "include" });
        } 
        
        catch (err) {
            console.error("Logout error:", err);
        } 
        
        finally {
            localStorage.removeItem("user");
            localStorage.removeItem("checker");
            setAuthenticated(false);
            setUserRole(null);

            if (onLogout) onLogout();
            navigate("/signin");
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="brand-logo" onClick={closeMenu}>
                        <img src={logoImg} alt="PUCNow" className="logo-image" />
                    </Link>

                    <button type="button" className="hamburger-btn" onClick={() => setIsOpen((prev) => !prev)} aria-label="Toggle Menu">
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>

                    <div className={`nav-menu ${isOpen ? "open" : ""}`}>
                        {authenticated && !isHomePage ? (
                            <button type="button" className="btn-logout" onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                            </button>
                        ) : (
                            <>
                                <button type="button" className="btn-checker" onClick={handlePartnerWithUs}>
                                    <User size={16} /> Partner with us
                                </button>

                                <button type="button" className="btn-signin" onClick={handleSignIn}>
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {isOpen && <div className="nav-backdrop" onClick={closeMenu} />}
        </>
    );
}