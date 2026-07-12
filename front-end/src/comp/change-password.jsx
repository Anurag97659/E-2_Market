import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showAlert("Passwords do not match"); return; }
    if (newPassword.length < 8) { showAlert("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/e-2market/v1/users/changePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("Password changed successfully!", "success");
        setTimeout(() => navigate("/profile"), 1200);
      } else showAlert(data.message || "Password change failed");
    } catch { showAlert("Network error"); }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(51,65,85,0.5)",
    border: "1px solid rgba(100,116,139,0.5)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
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

      <div style={{ maxWidth: "460px", margin: "40px auto", padding: "0 24px" }}>
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
            Change Password
          </h2>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Old Password", value: oldPassword, setter: setOldPassword, placeholder: "Current password" },
              { label: "New Password", value: newPassword, setter: setNewPassword, placeholder: "Min 8 characters" },
              { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, placeholder: "Repeat new password" },
            ].map((field) => (
              <div key={field.label}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                  {field.label}
                </label>
                <input
                  style={inputStyle}
                  type="password"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}

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
              {loading ? "Changing..." : "Change Password"}
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

export default ChangePassword;
