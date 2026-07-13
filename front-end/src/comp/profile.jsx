import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/users/getProfile", {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) { navigate("/login"); return; }
        return res.json();
      })
      .then((data) => { if (data?.data) setUser(data.data); })
      .catch(() => {});
  }, []);

  const fields = user
    ? [
        { label: "Full Name", value: user.fullname },
        { label: "Username", value: user.username?.toUpperCase() },
        { label: "Email", value: user.email },
        { label: "Phone", value: user.phone },
        { label: "Address", value: user.address },
      ]
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-gradient)" }}>
      <Navbar />

      <div style={{ maxWidth: "640px", margin: "40px auto", padding: "0 24px" }}>
        <div style={{
          background: "rgba(30,27,75,0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(139,92,246,0.25)",
          padding: "36px",
        }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "26px",
            fontWeight: "900",
            background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "28px",
          }}>
            Your Profile
          </h2>

          {!user ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Loading...</p>
          ) : (
            <>
              {/* Avatar initials */}
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: "28px",
                fontWeight: "900",
                color: "#fff",
              }}>
                {user.fullname?.[0]?.toUpperCase()}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {fields.map((field, i) => (
                  <div
                    key={field.label}
                    style={{
                      padding: "16px 0",
                      borderBottom: i < fields.length - 1 ? "1px solid rgba(139,92,246,0.12)" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {field.label}
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0" }}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
                <Link to="/Change-details" style={{
                  flex: 1, padding: "11px", background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  color: "#fff", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontWeight: "700", fontSize: "13px"
                }}>
                  Edit Details
                </Link>
                <Link to="/Change-password" style={{
                  flex: 1, padding: "11px", border: "1px solid rgba(139,92,246,0.4)",
                  color: "#c084fc", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontWeight: "700", fontSize: "13px"
                }}>
                  Change Password
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
