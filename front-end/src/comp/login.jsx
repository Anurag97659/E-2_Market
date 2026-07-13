import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiFetch from "../utils/apiFetch";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiFetch("http://localhost:8000/e-2market/v1/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (result.ok) { showAlert("Login successful", "success"); setTimeout(() => navigate("/"), 800); }
    else showAlert(result.message);
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
        top: "20%",
        left: "20%",
        width: "350px",
        height: "350px",
        background: "radial-gradient(circle,rgba(139,92,246,0.12),transparent)",
        borderRadius: "50%",
        filter: "blur(80px)",
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

      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "rgba(30,27,75,0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(139,92,246,0.25)",
        padding: "40px",
        position: "relative",
        zIndex: 10,
      }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "900",
          background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "6px",
        }}>
          Sign In
        </h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: "13px", marginBottom: "32px" }}>
          Welcome back to E-2 Market
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
              Username or Email
            </label>
            <input
              style={inputStyle}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              required
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: "12px", color: "#c084fc", textDecoration: "none", fontWeight: "600" }}>
                Forgot Password?
              </Link>
            </div>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
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
              marginTop: "4px",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#64748b" }}>
          New to E-2 Market?{" "}
          <Link to="/registration" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
