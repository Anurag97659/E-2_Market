import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import apiFetch from "../utils/apiFetch";

function Registration() {
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { showAlert("Passwords do not match"); return; }
    if (password.length < 8) { showAlert("Password must be at least 8 characters"); return; }
    setLoading(true);
    const result = await apiFetch("http://localhost:8000/e-2market/v1/users/sendRegistrationOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, fullname, email, phone, address }),
    });
    if (result.ok) { showAlert("OTP sent to your email", "success"); setStep(2); }
    else showAlert(result.message);
    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiFetch("http://localhost:8000/e-2market/v1/users/verifyRegistrationOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (result.ok) {
      showAlert("Account created successfully!", "success");
      setTimeout(() => navigate("/login"), 1500);
    } else showAlert(result.message);
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(51,65,85,0.5)",
    border: "1px solid rgba(100,116,139,0.5)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        position: "fixed",
        top: "25%",
        left: "25%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle,rgba(139,92,246,0.15),transparent)",
        borderRadius: "50%",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed",
        bottom: "25%",
        right: "25%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle,rgba(59,130,246,0.15),transparent)",
        borderRadius: "50%",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      {alert && (
        <div style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          background: alert.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
          border: `1px solid ${alert.type === "success" ? "#10b981" : "#ef4444"}`,
          color: alert.type === "success" ? "#6ee7b7" : "#fca5a5",
          padding: "12px 28px",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "14px",
          zIndex: 300,
          backdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
        }}>
          {alert.msg}
        </div>
      )}

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: step === 1 ? "560px" : "400px",
          background: "rgba(30,27,75,0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(139,92,246,0.25)",
          padding: "40px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h2 style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "900",
          background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "6px",
        }}>
          {step === 1 ? "Create Account" : "Verify Email"}
        </h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: "13px", marginBottom: "28px" }}>
          {step === 1 ? "Join the E-2 Market community" : `Enter the OTP sent to ${email}`}
        </p>

        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              width: s === step ? "28px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: s === step ? "#a855f7" : s < step ? "#10b981" : "rgba(139,92,246,0.3)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={sendOTP} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="John Doe" required />
              </div>
              <div>
                <label style={labelStyle}>Username</label>
                <input style={inputStyle} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" required />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" required />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, State" required />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                background: loading ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
              }}
            >
              {loading ? "Sending OTP..." : "Send Verification OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Enter 6-digit OTP</label>
              <input
                style={{
                  ...inputStyle,
                  fontSize: "28px",
                  textAlign: "center",
                  letterSpacing: "12px",
                  fontWeight: "700",
                }}
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="------"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              style={{
                padding: "14px",
                background: loading || otp.length < 6 ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "16px",
                cursor: loading || otp.length < 6 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Verifying..." : "Verify and Create Account"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                padding: "10px",
                background: "none",
                color: "#94a3b8",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Back to Form
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#64748b" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Registration;
