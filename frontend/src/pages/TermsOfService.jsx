import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Scale, ShieldAlert, CheckCircle2, Clock, Truck, CreditCard,
    FileCheck, AlertOctagon, ArrowLeft, Mail, HelpCircle } from "lucide-react";
import "./TermsOfService.css";

export default function TermsOfService() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="tos-wrapper">
            <div className="tos-blob tos-blob-1"></div>
            <div className="tos-blob tos-blob-2"></div>

            <div className="tos-container">
                <Link to="/" className="tos-back-btn">
                    <ArrowLeft size={18} />
                    <span>Back to PUCNow</span>
                </Link>

                <header className="tos-header">
                    <div className="tos-badge">
                        <Scale size={16} />
                        <span>Legal Agreement & User Terms</span>
                    </div>

                    <h1 className="tos-title">Terms of Service</h1>

                    <p className="tos-subtitle">
                        Please read these terms carefully before scheduling a doorstep vehicle emission inspection on PUCNow.
                    </p>

                    <div className="tos-meta">
                        <span><strong>Effective:</strong> August 2026</span>
                        <span className="tos-dot">•</span>
                        <span><strong>Standard:</strong> CMVR 1989 Compliant</span>
                    </div>
                </header>

                <main className="tos-card">
                    <div className="tos-callout">
                        <ShieldAlert className="tos-callout-icon" size={22} />
                        <div className="tos-callout-text">
                            <strong>Statutory Binding:</strong> By booking a service through PUCNow, you agree to comply with the Central Motor Vehicles Rules (CMVR), 1989. PUCNow facilitates authorized doorstep smoke testing and digital Form 59 issuance.
                        </div>
                    </div>

                    <section className="tos-section">
                        <div className="tos-section-header">
                            <div className="tos-icon-box"><FileCheck size={20} /></div>
                            <h2>1. Acceptance of Terms</h2>
                        </div>

                        <p> By accessing our website, creating an account, or scheduling an on-demand doorstep inspection with 
                            <strong>PUCNow</strong> ("Platform", "we", "our"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must refrain from using the platform. 
                        </p>
                    </section>

                    <section className="tos-section">
                        <div className="tos-section-header">
                            <div className="tos-icon-box"><Truck size={20} /></div>
                            <h2>2. Doorstep Testing & Inspection Workflow</h2>
                        </div>

                        <p>To ensure smooth and accurate test execution, the vehicle owner agrees to:</p>

                        <div className="tos-grid">
                            <div className="tos-grid-item">
                                <h4>Vehicle Availability</h4>
                                <p>Ensure the registered vehicle is parked in an accessible, safe, and open area at the selected time slot.</p>
                            </div>

                            <div className="tos-grid-item">
                                <h4>OTP Verification</h4>
                                <p>Provide the 4-digit start OTP received via SMS to the authorized checker before the physical test begins.</p>
                            </div>

                            <div className="tos-grid-item">
                                <h4>Number Plate Clarity</h4>
                                <p>Ensure the high-security or standard registration plate is clean and visible for mandatory photographic proof.</p>
                            </div>

                            <div className="tos-grid-item">
                                <h4>Engine Readiness</h4>
                                <p>Ensure the vehicle has sufficient fuel and the engine is in a condition to undergo idling and high-RPM testing.</p>
                            </div>
                        </div>
                    </section>

                    <section className="tos-section">
                        <div className="tos-section-header">
                            <div className="tos-icon-box"><Clock size={20} /></div>
                            <h2>3. 180-Day Statutory Validity Rule</h2>
                        </div>

                        <p> Under Indian transport regulations, standard PUC certificates carry a maximum validity of <strong>180 days (6 months)</strong>. </p>

                        <ul className="tos-list">
                            <li><CheckCircle2 size={16} className="tos-check" /> PUCNow strictly restricts duplicate test bookings for vehicles with an active, valid test record.</li>
                            <li><CheckCircle2 size={16} className="tos-check" /> Re-testing is only unlocked when the existing certificate has expired or is within 7 days of expiration.</li>
                        </ul>
                    </section>

                    <section className="tos-section">
                        <div className="tos-section-header">
                            <div className="tos-icon-box"><CreditCard size={20} /></div>
                            <h2>4. Pricing, Payments & Commission Split</h2>
                        </div>

                        <p> All service charges are transparently listed prior to booking confirmation. </p>

                        <ul className="tos-list">
                            <li><CheckCircle2 size={16} className="tos-check" /> <strong>Payment Options:</strong> Payments can be completed online (UPI/Card) or via Cash on Delivery (COD) upon inspection completion.</li>
                            <li><CheckCircle2 size={16} className="tos-check" /> <strong>Partner Settlement:</strong> PUCNow operates on a structured partner model where certified technicians receive 80% earnings, with 20% platform compliance fees.</li>
                        </ul>
                    </section>

                    <section className="tos-section">
                        <div className="tos-section-header">
                            <div className="tos-icon-box"><AlertOctagon size={20} /></div>
                            <h2>5. Test Results & Certificate Issuance</h2>
                        </div>
                        
                        <p> The emission test results (CO, Hydrocarbons, Lambda, Smoke Density) are recorded automatically based on analyzer sensor readings: </p>
                        
                        <ul className="tos-list">
                            <li><CheckCircle2 size={16} className="tos-check" /> If a vehicle passes, a verified Form 59 certificate with an official QR code is generated instantly.</li>
                            <li><CheckCircle2 size={16} className="tos-check" /> If a vehicle exceeds emission limits, a rejection report is recorded. Doorstep convenience fees remain non-refundable once the physical test is completed.</li>
                        </ul>
                    </section>

                    <section className="tos-section">
                        <div className="tos-section-header">
                            <div className="tos-icon-box"><HelpCircle size={20} /></div>
                            <h2>6. Cancellation & Rescheduling Policy</h2>
                        </div>

                        <p> Users may cancel or reschedule a booking free of charge up until a technician is dispatched. Once the technician arrives on-site or verifies the start OTP, cancellations are not permitted. </p>
                    </section>

                    <div className="tos-help-box">
                        <div className="tos-help-content">
                            <h3>Need clarification regarding these terms?</h3>
                            <p>Contact our Legal and Support Operations Desk.</p>
                        </div>
                        
                        <a href="mailto:gaurvakul25@gmail.com" className="tos-contact-btn">
                            <Mail size={16} />
                            <span>gaurvakul25@gmail.com</span>
                        </a>
                    </div>
                </main>

                <footer className="tos-footer">
                    <p> &copy; 2026 PUCNow Technologies. All Rights Reserved.</p>
                </footer>
            </div>
        </div>
    );
}