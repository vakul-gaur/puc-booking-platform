import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, AlertTriangle, CheckCircle2, Car, Calendar, UserCheck } from "lucide-react";

export default function VerifyCertificate() {
    const [params] = useSearchParams();
    const cert = params.get("cert");
    const veh = params.get("veh");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (veh) {
            fetch(`http://localhost:8080/api/verify-certificate?cert=${cert}&veh=${encodeURIComponent(veh)}`)
                .then((r) => r.json())
                .then((res) => {
                    setData(res);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [cert, veh]);

    if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Verifying Certificate Authenticity...</div>;

    return (
        <div style={{ maxWidth: "480px", margin: "40px auto", padding: "24px", background: "#fff", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "center", fontFamily: "sans-serif" }}>
            {data?.valid ? (
                <>
                    <div style={{ width: "60px", height: "60px", background: "#dcfce7", color: "#16a34a", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>Authentic PUC Certificate</h2>
                    <span style={{ display: "inline-block", background: "#16a34a", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                        ACTIVE & COMPLIANT
                    </span>

                    <div style={{ marginTop: "24px", textAlign: "left", background: "#f8fafc", padding: "16px", borderRadius: "12px", fontSize: "14px", lineHeight: "1.8" }}>
                        <div><strong>Vehicle:</strong> {veh}</div>
                        <div><strong>Certificate No:</strong> {cert}</div>
                        <div><strong>Tested On:</strong> {new Date(data.testedOn).toLocaleDateString("en-IN")}</div>
                        <div><strong>Valid Until:</strong> {new Date(data.validUntil).toLocaleDateString("en-IN")}</div>
                        <div><strong>Authorized Inspector:</strong> {data.inspector}</div>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ width: "60px", height: "60px", background: "#fee2e2", color: "#dc2626", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                        <AlertTriangle size={32} />
                    </div>
                    <h2 style={{ margin: "0 0 6px", color: "#991b1b" }}>Certificate Invalid / Expired</h2>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>No active compliance record found for this certificate.</p>
                </>
            )}
        </div>
    );
}