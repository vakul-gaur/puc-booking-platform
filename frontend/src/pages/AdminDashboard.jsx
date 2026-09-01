import { useState, useEffect } from "react";
import { ShieldCheck, Users, DollarSign, CheckCircle2, XCircle, Clock, TrendingUp, RefreshCw, FileText, ExternalLink, 
        AlertCircle, Eye, Calendar, MapPin, Phone, Mail, Award, Lock, LogOut} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: "", password: "" });
    const [loginError, setLoginError] = useState("");

    // Data States
    const [checkers, setCheckers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({totalUsers: 0, totalCheckers: 0, pendingApprovals: 0, totalBookings: 0, 
        totalRevenue: 0, platformEarnings: 0, partnerPayouts: 0});

    // UI States
    const [activeTab, setActiveTab] = useState("checkers");
    const [selectedChecker, setSelectedChecker] = useState(null);
    const [rejectionInput, setRejectionInput] = useState("");
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");

    const API_URL = "http://localhost:8080/api/admin";

    useEffect(() => { checkAuthStatus(); }, []);

    const checkAuthStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/check-auth`, { credentials: "include" });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsAuthenticated(true);
                fetchAdminData();
            } else {
                setIsAuthenticated(false);
            }
        } 
        
        catch {
            setIsAuthenticated(false);
        }
    };

    // Admin Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(loginForm),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setIsAuthenticated(true);
                fetchAdminData();
            } else {
                setLoginError(data.message || "Invalid Admin Credentials");
            }
        } catch {
            setLoginError("Server unreachable. Please verify backend connection.");
        }
    };

    // Admin Logout
    const handleLogout = async () => {
        await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
        setIsAuthenticated(false);
        setLoginForm({ username: "", password: "" });
    };

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/dashboard`, { credentials: "include" });
            const data = await res.json();
            if (res.ok && data.success) {
                setCheckers(data.checkers || []);
                setBookings(data.bookings || []);
                setStats(data.stats || {});
            }
        } 
        
        catch (err) {
            console.error("Failed to fetch admin data", err);
        } 
        
        finally {
            setLoading(false);
        }
    };

    // Verification Action (Approve / Reject)
    const handleVerifySubmit = async (status) => {
        if (!selectedChecker) return;

        if (status === "rejected" && !rejectionInput.trim()) {
            alert("Please specify a reason for rejecting the application.");
            return;
        }

        try {
            setActionLoading(true);
            const res = await fetch(`${API_URL}/verify-checker`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    checkerId: selectedChecker._id,
                    status,
                    rejectionReason: status === "rejected" ? rejectionInput.trim() : ""
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMessage(`Technician application marked as ${status.toUpperCase()}.`);
                setSelectedChecker(null);
                setShowRejectBox(false);
                setRejectionInput("");
                fetchAdminData();
            } 
            
            else {
                alert(data.message || "Action failed.");
            }
        } 
        
        catch (err) {
            console.error("Verification error:", err);
        } 
        
        finally {
            setActionLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-wrapper">
                <div className="admin-login-card">
                    <div className="login-icon"> <ShieldCheck size={32} /> </div>
                    <h2>Admin Portal Login</h2>
                    <p>Enter Administrator credentials to continue</p>

                    {loginError && <div className="login-error-msg">{loginError}</div>}

                    <form onSubmit={handleLogin} className="admin-login-form">
                        <div className="input-group">
                            <label>Admin Username</label>
                            <input
                                type="text"
                                placeholder="e.g. admin"
                                value={loginForm.username}
                                onChange={(e) =>
                                    setLoginForm({ ...loginForm, username: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={loginForm.password}
                                onChange={(e) =>
                                    setLoginForm({ ...loginForm, password: e.target.value })
                                }
                                required
                            />
                        </div>

                        <button type="submit" className="btn-admin-login">
                            <Lock size={16} /> Authenticate Admin
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="admin-wrapper">
            <div className="admin-container">
                <div className="admin-head-bar">
                    <div>
                        <h2>PUCNow Admin Dashboard</h2>
                        <p>Manage users, checkers, and inspections.</p>
                    </div>
                    <div className="admin-action-bar">
                        <button className="btn-refresh-admin" onClick={fetchAdminData} disabled={loading}>
                            <RefreshCw size={15} /> {loading ? "Updating..." : "Refresh"}
                        </button>
                        <button className="btn-admin-logout" onClick={handleLogout}>
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                </div>

                {message && (
                    <div className="admin-alert">
                        <CheckCircle2 size={16} /> <span>{message}</span>
                    </div>
                )}

                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon orange"><Clock size={22} /></div>
                        <div>
                            <label>Pending Verifications</label>
                            <h3>{stats.pendingApprovals || 0}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon green"><ShieldCheck size={22} /></div>
                        <div>
                            <label>Authorized Inspectors</label>
                            <h3>{checkers.filter(c => c.authorizationStatus === "approved").length}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon blue"><Users size={22} /></div>
                        <div>
                            <label>Total Partners</label>
                            <h3>{stats.totalCheckers || 0}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon dark"><TrendingUp size={22} /></div>
                        <div>
                            <label>Platform Commission (20%)</label>
                            <h3 className="text-green">₹{stats.platformEarnings || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === "checkers" ? "active" : ""}`}
                        onClick={() => setActiveTab("checkers")}
                    >
                        Technician Verifications ({stats.totalCheckers || 0})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
                        onClick={() => setActiveTab("bookings")}
                    >
                        All Doorstep Bookings ({stats.totalBookings || 0})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "financials" ? "active" : ""}`}
                        onClick={() => setActiveTab("financials")}
                    >
                        Partner Payout Ledger
                    </button>
                </div>

                {/* Checker's Verification */}
                {activeTab === "checkers" && (
                    <div className="admin-table-card">
                        <div className="table-card-head">
                            <h3>Technician Verification Queue</h3>
                            <span>Examine uploaded government licenses, proofs, and approve mobile inspection units</span>
                        </div>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Technician Name</th>
                                    <th>Contact & DL</th>
                                    <th>Assigned Area</th>
                                    <th>ID Proof Type</th>
                                    <th>Documents</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checkers.map((c) => (
                                    <tr key={c._id}>
                                        <td>
                                            <strong>{c.username}</strong>
                                            <br />
                                            <small className="text-muted">{c.email}</small>
                                        </td>

                                        <td>
                                            {c.contact}
                                            <br />
                                            <small>DL: <strong>{c.licenseNumber}</strong></small>
                                        </td>

                                        <td>{c.area}, {c.city || c.state}</td>

                                        <td>
                                            <span className="id-proof-tag">
                                                {c.documents?.idProofType || "GOVT ID"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="doc-count-tag">
                                                {c.documents?.documentFiles?.length || 0} File(s)
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`status-tag ${c.authorizationStatus}`}>
                                                {c.authorizationStatus}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="btn-review-app"
                                                onClick={() => {
                                                    setSelectedChecker(c);
                                                    setShowRejectBox(false);
                                                    setRejectionInput(c.rejectionReason || "");
                                                }}
                                            >
                                                <Eye size={13} /> Review Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* All bookings */}
                {activeTab === "bookings" && (
                    <div className="admin-table-card">
                        <div className="table-card-head">
                            <h3>Master Bookings Log</h3>
                            <span>Real-time tracking of test schedules, assigned units & OTP statuses</span>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Customer</th>
                                    <th>Vehicles</th>
                                    <th>Technician</th>
                                    <th>Gross Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b._id}>
                                        <td>#{b._id.substring(18)}</td>
                                        <td>
                                            {b.user?.username || "Valued Customer"}
                                            <br />
                                            <small>{b.user?.contact}</small>
                                        </td>

                                        <td>
                                            {b.vehicles?.map((v, i) => (
                                                <span key={i} className="v-pill">{v.number}</span>
                                            ))}
                                        </td>

                                        <td>{b.checker ? b.checker.username : <span className="text-amber">Unassigned</span>}</td>
                                        
                                        <td><strong>₹{b.totalPrice}</strong></td>
                                        
                                        <td>{b.paymentType} ({b.paymentStatus})</td>
                                        
                                        <td><span className={`status-tag ${b.status}`}>{b.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Financial Settlement */}
                {activeTab === "financials" && (
                    <div className="admin-table-card">
                        <div className="table-card-head">
                            <h3>Partner Revenue & Commission Split Ledger</h3>
                            <span>Monitor 80% technician share, 20% platform cut, and COD dues</span>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Technician</th>
                                    <th>Wallet (Online Credit)</th>
                                    <th>Commission Due (COD Cash in Hand)</th>
                                    <th>Total Net Earned</th>
                                    <th>Account Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checkers.map((c) => (
                                    <tr key={c._id}>
                                        <td><strong>{c.username}</strong> ({c.contact})</td>
                                        
                                        <td><strong className="text-green">₹{c.walletBalance || 0}</strong></td>
                                        
                                        <td><strong className="text-red">₹{c.commissionDue || 0}</strong></td>
                                        
                                        <td>₹{c.totalEarnings || 0}</td>
                                        
                                        <td>
                                            <span className="badge-settle">
                                                {c.commissionDue > 500 ? "Settlement Required" : "Good Standing"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Checker's Verification */}
            {selectedChecker && (
                <div className="modal-overlay">
                    <div className="review-modal-box">
                        <div className="modal-head">
                            <div className="head-left">
                                <Award size={22} color="#2563eb" />
                                <div>
                                    <h3>Verification Dossier: {selectedChecker.username}</h3>
                                    <p>ID: {selectedChecker.checkerId || selectedChecker._id}</p>
                                </div>
                            </div>
                            <button className="btn-close-modal" onClick={() => setSelectedChecker(null)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="details-summary-grid">
                                <div className="summary-item">
                                    <label><Phone size={13} /> Contact</label>
                                    <p>{selectedChecker.contact}</p>
                                </div>

                                <div className="summary-item">
                                    <label><Mail size={13} /> Email</label>
                                    <p>{selectedChecker.email}</p>
                                </div>

                                <div className="summary-item">
                                    <label><Award size={13} /> License Number</label>
                                    <p><strong>{selectedChecker.licenseNumber}</strong></p>
                                </div>

                                <div className="summary-item">
                                    <label><Calendar size={13} /> License Expiry</label>
                                    <p>{selectedChecker.licenseExpiry ? new Date(selectedChecker.licenseExpiry).toLocaleDateString("en-IN") : "N/A"}</p>
                                </div>

                                <div className="summary-item full-span">
                                    <label><MapPin size={13} /> Locality & Jurisdiction</label>
                                    <p>{selectedChecker.area}, {selectedChecker.city}, {selectedChecker.state} - {selectedChecker.address}</p>
                                </div>
                            </div>

                            {/* Uploaded Documents */}
                            <div className="uploaded-docs-section">
                                <h4>
                                    <FileText size={16} /> Uploaded Verification Documents ({selectedChecker.documents?.idProofType || "Proof"})
                                </h4>
                                
                                <div className="doc-preview-grid">
                                    {selectedChecker.documents?.documentFiles?.map((fileUrl, idx) => (
                                        <div key={idx} className="doc-preview-card">
                                            <div className="doc-frame">
                                                {fileUrl.endsWith(".pdf") ? (
                                                    <div className="pdf-placeholder">
                                                        <FileText size={32} color="#ef4444" />
                                                        <span>PDF Document</span>
                                                    </div>
                                                ) : (
                                                    <img src={fileUrl} alt={`Proof document ${idx + 1}`} />
                                                )}
                                            </div>
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn-open-file"
                                            >
                                                <ExternalLink size={12} /> Open Full View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            {selectedChecker.authorizationStatus === "rejected" && selectedChecker.rejectionReason && (
                                <div className="rejection-history-box">
                                    <AlertCircle size={16} color="#b91c1c" />
                                    <div>
                                        <strong>Current Rejection Reason:</strong>
                                        <p>{selectedChecker.rejectionReason}</p>
                                    </div>
                                </div>
                            )}

                            {showRejectBox && (
                                <div className="reject-input-drawer">
                                    <label>Specify Reason for Rejection (Visible to Technician):</label>
                                    <textarea
                                        rows={3}
                                        placeholder="e.g. License photo is blurred, expired validity date, or address mismatch..."
                                        value={rejectionInput}
                                        onChange={(e) => setRejectionInput(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={() => setSelectedChecker(null)}
                            >
                                Close
                            </button>

                            {!showRejectBox ? (
                                <div className="modal-action-btns">
                                    <button
                                        type="button"
                                        className="btn-trigger-reject"
                                        onClick={() => setShowRejectBox(true)}
                                        disabled={actionLoading}
                                    >
                                        <XCircle size={15} /> Reject Application
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-modal-approve"
                                        onClick={() => handleVerifySubmit("approved")}
                                        disabled={actionLoading}
                                    >
                                        <CheckCircle2 size={15} /> Approve & Grant Authorization
                                    </button>
                                </div>
                            ) : (
                                <div className="modal-action-btns">
                                    <button
                                        type="button"
                                        className="btn-cancel-reject"
                                        onClick={() => setShowRejectBox(false)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-confirm-reject"
                                        onClick={() => handleVerifySubmit("rejected")}
                                        disabled={actionLoading || !rejectionInput.trim()}
                                    >
                                        <XCircle size={15} /> Confirm Rejection
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}