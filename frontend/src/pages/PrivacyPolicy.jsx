import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Eye, FileText, Server, Bell, RefreshCw,
    CheckCircle2, ArrowLeft, Mail, AlertCircle } from "lucide-react";
import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pp-wrapper">
            <div className="pp-blob pp-blob-1"></div>
            <div className="pp-blob pp-blob-2"></div>

            <div className="pp-container">\
                <Link to="/" className="pp-back-btn">
                    <ArrowLeft size={18} />
                    <span>Back to PUCNow</span>
                </Link>

                <header className="pp-header">
                    <div className="pp-badge">
                        <ShieldCheck size={16} />
                        <span>PUCNow Compliance & Trust Desk</span>
                    </div>

                    <h1 className="pp-title">Privacy Policy</h1>

                    <p className="pp-subtitle"> Official privacy practices for PUCNow on-demand vehicle emission testing, automated Form 59 certification, and Parivahan verification. </p>

                    <div className="pp-meta">
                        <span><strong>Effective:</strong> August 2026</span>
                        <span className="pp-dot">•</span>
                        <span><strong>Standard:</strong> CMVR Rule 115(2) Compliant</span>
                    </div>
                </header>

                <main className="pp-card">
                    <div className="pp-callout">
                        <AlertCircle className="pp-callout-icon" size={22} />
                        <div className="pp-callout-text">
                            <strong>Statutory Assurance:</strong> PUCNow operates in strict adherence to Central Motor Vehicles Rules (CMVR), 1989. We securely process vehicle registration details only to conduct verified tests and issue authentic, digitally verifiable Form 59 certificates.
                        </div>
                    </div>

                    <section className="pp-section">
                        <div className="pp-section-header">
                            <div className="pp-icon-box"><FileText size={20} /></div>
                            <h2>1. About PUCNow & Scope</h2>
                        </div>

                        <p> Welcome to <strong>PUCNow</strong> ("Platform", "we", "our"). PUCNow delivers doorstep automotive pollution testing through certified mobile field technicians. This Privacy Policy details how we collect, verify, process, and protect your personal credentials and motor vehicle data. </p>
                    </section>

                    <section className="pp-section">
                        <div className="pp-section-header">
                            <div className="pp-icon-box"><Eye size={20} /></div>
                            <h2>2. Information Collected by PUCNow</h2>
                        </div>

                        <p> To schedule doorstep technicians and validate emissions, PUCNow collects: </p>

                        <div className="pp-grid">
                            <div className="pp-grid-item">
                                <h4>User Details</h4>
                                <p>Full name, active mobile number for test OTP verification, and doorstep service location.</p>
                            </div>

                            <div className="pp-grid-item">
                                <h4>Vehicle Credentials</h4>
                                <p>Registration plate number, fuel category (Petrol/Diesel/CNG), BS emission norms, and RTO codes.</p>
                            </div>

                            <div className="pp-grid-item">
                                <h4>Plate Photo Verification</h4>
                                <p>Live camera snapshot of the physical number plate captured on-site by our authorized PUCNow checker.</p>
                            </div>

                            <div className="pp-grid-item">
                                <h4>Live Location Data</h4>
                                <p>GPS coordinates utilized strictly for dispatching the nearest available technician and routing.</p>
                            </div>
                        </div>
                    </section>

                    <section className="pp-section">
                        <div className="pp-section-header">
                            <div className="pp-icon-box"><Server size={20} /></div>
                            <h2>3. Automated Vehicle Number Verification</h2>
                        </div>

                        <p> When a booking is initiated on PUCNow, your vehicle number is parsed via real-time automotive gateways (such as RapidAPI / Vahan databases) to: </p>

                        <ul className="pp-list">
                            <li><CheckCircle2 size={16} className="pp-check" /> Auto-fill accurate manufacturing date, fuel type, and engine emission limits.</li>
                            <li><CheckCircle2 size={16} className="pp-check" /> Prevent duplicate test bookings within the statutory 180-day validity period.</li>
                            <li><CheckCircle2 size={16} className="pp-check" /> Map authentic State Transport Authority and RTO jurisdiction stamps.</li>
                        </ul>
                    </section>

                    <section className="pp-section">
                        <div className="pp-section-header">
                            <div className="pp-icon-box"><Lock size={20} /></div>
                            <h2>4. Form 59 Certificate & Public QR Policy</h2>
                        </div>

                        <p> Every Form 59 PDF certificate generated by PUCNow carries a tamper-proof Public QR Code. Traffic police and regulatory officers can scan this code to confirm validity and emissions status. </p>

                        <p className="pp-subtext">
                            <strong>Privacy Safeguard:</strong> Personal contact numbers are masked on all publicly accessible PUCNow certificates (e.g. <code>******6026</code>) to prevent data harvesting.
                        </p>
                    </section>

                    <section className="pp-section">
                        <div className="pp-section-header">
                            <div className="pp-icon-box"><Bell size={20} /></div>
                            <h2>5. Transactional SMS & 6-Month Renewal Alerts</h2>
                        </div>

                        <p> PUCNow uses automated transactional SMS gateways solely for: </p>

                        <ul className="pp-list">
                            <li><CheckCircle2 size={16} className="pp-check" /> 4-digit start OTP dispatch prior to testing.</li>
                            <li><CheckCircle2 size={16} className="pp-check" /> Instant certificate download links upon test pass.</li>
                            <li><CheckCircle2 size={16} className="pp-check" /> Automated 6-month expiry reminders sent 7 days before certificate expiration.</li>
                        </ul>
                    </section>

                    <section className="pp-section">
                        <div className="pp-section-header">
                            <div className="pp-icon-box"><RefreshCw size={20} /></div>
                            <h2>6. Data Security & Storage</h2>
                        </div>
                        <p> All interactions across the PUCNow ecosystem are encrypted over SSL/TLS. Vehicle test readings (CO, Hydrocarbons, Smoke Density) and inspector logs are archived securely in accordance with motor vehicle compliance guidelines. </p>
                    </section>

                    <div className="pp-help-box">
                        <div className="pp-help-content">
                            <h3>Have privacy questions or need data correction?</h3>
                            <p>Reach out directly to the PUCNow Data Compliance Team.</p>
                        </div>
                        
                        <a href="mailto:support@pucnow.in" className="pp-contact-btn">
                            <Mail size={16} />
                            <span>support@pucnow.in</span>
                        </a>
                    </div>
                </main>

                <footer className="pp-footer">
                    <p> &copy; 2026 PUCNow Technologies. All Rights Reserved. </p>
                </footer>
            </div>
        </div>
    );
}