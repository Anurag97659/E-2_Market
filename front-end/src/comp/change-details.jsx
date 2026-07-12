import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function ChangeDetails() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const sendEmailOTP = async () => {
    if (!email.trim()) { showAlert("Enter the new email first"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/e-2market/v1/users/sendChangeEmailOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail: email }),
      });
      const data = await res.json();
      if (res.ok) { showAlert("OTP sent to new email", "success"); setOtpSent(true); }
      else showAlert(data.message || "Failed to send OTP");
    } catch { showAlert("Network error"); }
    setLoading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { username, email, fullname, phone, address };
      if (email && otpSent) body.otp = emailOtp;

      const res = await fetch("http://localhost:8000/e-2market/v1/users/updateDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("Details updated successfully", "success");
        setTimeout(() => navigate("/profile"), 1200);
      } else showAlert(data.message || "Update failed");
    } catch { showAlert("Network error"); }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(51,65,85,0.5)",
    border: "1px solid rgba(100,116,139,0.5)",
    borderRadius: "10px",
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>
      <Navbar />

      {alert && (
        <div style={{
          position: "fixed",
          top: "80px",
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

      <div style={{ maxWidth: "500px", margin: "40px auto", padding: "0 24px" }}>
        <div style={{
          background: "rgba(30,27,75,0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(139,92,246,0.25)",
          padding: "36px",
        }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "900",
            background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "28px",
          }}>
            Update Profile Details
          </h2>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input style={inputStyle} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Leave blank to keep current" />
            </div>

            <div>
              <label style={labelStyle}>Email (OTP verification required)</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setOtpSent(false); }}
                  placeholder="Leave blank to keep current"
                />
                {email && (
                  <button
                    type="button"
                    onClick={sendEmailOTP}
                    disabled={loading}
                    style={{
                      padding: "0 14px",
                      background: otpSent ? "#374151" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: loading || otpSent ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {otpSent ? "OTP Sent" : "Send OTP"}
                  </button>
                )}
              </div>
              {otpSent && (
                <div style={{ marginTop: "8px" }}>
                  <input
                    style={inputStyle}
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Leave blank to keep current" />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Leave blank to keep current" />
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Leave blank to keep current" />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px",
                background: loading ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
              }}
            >
              {loading ? "Updating..." : "Update Details"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
            <Link to="/profile" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>
              Back to Profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChangeDetails;
