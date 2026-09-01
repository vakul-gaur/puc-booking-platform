import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

import "./Footer.css";

const Footer = () => {
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowTopBtn(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <footer className="footer-custom">
            <div className="footer-wrapper">

                <div className="footer-grid">

                    <div className="footer-col">
                        <Link to="/" className="footer-heading">
                            <span className="logo-dark-txt">PUC</span>
                            <span className="logo-green-txt">Now</span>
                        </Link>

                        <p className="footer-text">
                            PUCNow is your trusted partner for hassle-free
                            PUC certificate booking across India. We connect
                            you with authorized testing centers for a seamless
                            experience.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h5 className="footer-heading">
                            Quick Links
                        </h5>

                        <ul className="footer-links">
                            <li>
                                <Link to="/"> › Home </Link>
                            </li>

                            <li>
                                <Link to="/signin"> › Sign In </Link>
                            </li>

                            <li>
                                <Link to="/signup"> › Sign Up </Link>
                            </li>
                        </ul>
                    </div>


                    <div className="footer-col">
                        <h5 className="footer-heading">
                            Resources
                        </h5>

                        <ul className="footer-links">
                            <li>
                                <a href="#faq"> › FAQ </a>
                            </li>

                            <li>
                                <a href="#regulations"> › PUC Regulations </a>
                            </li>

                            <li>
                                <a href="#standards"> › Emission Standards </a>
                            </li>

                            <li>
                                <a href="#help"> › Help Center </a>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h5 className="footer-heading"> Contact Us </h5>

                        <ul className="footer-contact-list">
                            <li> 📍 Haridwar, Uttarakhand - 249403 </li>

                            <li> 📞 +91 1234567890 </li>

                            <li> ✉️ support@pucnow.in </li>
                        </ul>
                    </div>

                </div>

                <hr className="footer-divider" />

                <div className="footer-bottom-bar">
                    <p className="footer-copyright">
                        &copy; 2026 PUCNow. All rights reserved.
                    </p>

                    <div className="footer-legal-links">
                        <Link to="/privacy-policy" className="footer-bottom-link"> Privacy Policy </Link>
                        <Link to="/terms" className="footer-bottom-link"> Terms of Service </Link>
                    </div>
                </div>

            </div>


            {showTopBtn && (
                <button type="button" className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
                    <ArrowUp size={20} />
                </button>
            )}
        </footer>
    );
};

export default Footer;