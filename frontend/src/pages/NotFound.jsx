import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "20px"
        }}>
            <AlertTriangle size={56} color="#ef4444" style={{ marginBottom: "16px" }} />
            <h1 style={{ fontSize: "3rem", margin: "0", color: "#0f172a" }}>404</h1>
            <h2 style={{ margin: "8px 0 16px", color: "#334155" }}>Page Not Found</h2>
            <p style={{ color: "#64748b", maxWidth: "400px", marginBottom: "24px" }}>
                "The page you're looking for doesn't exist, has been moved, or is temporarily unavailable."
            </p>
            <Link
                to="/"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#0f172a",
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "600"
                }}
            >
                <Home size={16} /> Go to Home
            </Link>
        </div>
    );
}