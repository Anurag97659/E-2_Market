import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiFetch from "../utils/apiFetch";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiFetch("http://localhost:8000/e-2market/v1/users/forgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (result.ok) { showAlert("OTP sent to your email", "success"); setStep(2); }
    else showAlert(result.message);
    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiFetch("http://localhost:8000/e-2market/v1/users/verifyForgotOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (result.ok) { showAlert("OTP verified", "success"); setStep(3); }
    else showAlert(result.message);
    setLoading(false);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showAlert("Passwords do not match"); return; }
    if (newPassword.length < 8) { showAlert("Password must be at least 8 characters"); return; }
    setLoading(true);
    const result = await apiFetch("http://localhost:8000/e-2market/v1/users/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
    });
    if (result.ok) {
      showAlert("Password reset successfully!", "success");
      setTimeout(() => navigate("/login"), 1500);
    } else showAlert(result.message);
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    background: "rgba(51,65,85,0.5)", border: "1px solid rgba(100,116,139,0.5)",
    borderRadius: "12px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px",
  };

  const stepLabels = ["Enter Email", "Verify OTP", "New Password"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-gradient)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      {alert && (
        <div style={{
          position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
          background: alert.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
          border: `1px solid ${alert.type === "success" ? "#10b981" : "#ef4444"}`,
          color: alert.type === "success" ? "#6ee7b7" : "#fca5a5",
          padding: "12px 28px", borderRadius: "10px", fontWeight: "600", fontSize: "14px",
          zIndex: 300, backdropFilter: "blur(12px)", whiteSpace: "nowrap",
        }}>
          {alert.msg}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "420px", background: "rgba(30,27,75,0.7)", backdropFilter: "blur(20px)", borderRadius: "24px", border: "1px solid rgba(139,92,246,0.25)", padding: "40px" }}>
        <h2 style={{ textAlign: "center", fontSize: "26px", fontWeight: "900", background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "6px" }}>
          Reset Password
        </h2>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "28px", marginTop: "16px" }}>
          {stepLabels.map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i + 1 === step ? "#a855f7" : i + 1 < step ? "#10b981" : "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#fff" }}>
                  {i + 1 < step ? "+" : i + 1}
                </div>
                <span style={{ fontSize: "10px", color: i + 1 === step ? "#c084fc" : "#64748b", fontWeight: "600" }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && <div style={{ width: "40px", height: "1px", background: i + 1 < step ? "#10b981" : "rgba(139,92,246,0.2)", margin: "0 4px", marginBottom: "20px" }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={sendOTP} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Registered Email</label>
              <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <button type="submit" disabled={loading} style={{ padding: "14px", background: loading ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOTP} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Enter 6-digit OTP</label>
              <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "8px" }}>Sent to {email}</p>
              <input style={{ ...inputStyle, fontSize: "28px", textAlign: "center", letterSpacing: "12px", fontWeight: "700" }} type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="------" maxLength={6} required />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} style={{ padding: "14px", background: loading || otp.length < 6 ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading || otp.length < 6 ? "not-allowed" : "pointer" }}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "1px solid rgba(139,92,246,0.3)", color: "#94a3b8", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>Back</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" required />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required />
            </div>
            <button type="submit" disabled={loading} style={{ padding: "14px", background: loading ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#64748b" }}>
          Remembered your password?{" "}
          <Link to="/login" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
