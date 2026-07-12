import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState(null);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const sellerRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/users/getProfile", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => { if (d.statusCode === 200) setUser(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (sellerRef.current && !sellerRef.current.contains(e.target)) setSellerOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    fetch("http://localhost:8000/e-2market/v1/users/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setUser(null);
      navigate("/login");
    });
  };

  return (
    <nav style={{
      background: "rgba(15,23,42,0.95)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(139,92,246,0.2)",
      padding: "0 24px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/" style={{
        fontSize: "22px",
        fontWeight: "900",
        background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textDecoration: "none",
        letterSpacing: "-0.5px",
      }}>
        E-2 Market
      </Link>

      {/* Center links */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link to="/" style={navLinkStyle}>Home</Link>
        <Link to="/search" style={navLinkStyle}>Search</Link>
        {user && (
          <>
            <Link to="/orders" style={navLinkStyle}>Orders</Link>
            <Link to="/mycart" style={navLinkStyle}>Cart</Link>

            {/* Seller dropdown */}
            <div ref={sellerRef} style={{ position: "relative" }}>
              <button
                onClick={() => setSellerOpen(!sellerOpen)}
                style={{
                  ...navLinkStyle,
                  background: "none",
                  border: "1px solid rgba(139,92,246,0.4)",
                  cursor: "pointer",
                  borderRadius: "6px",
                  padding: "6px 14px",
                }}
              >
                Seller {sellerOpen ? "^" : "v"}
              </button>
              {sellerOpen && (
                <div style={dropdownStyle}>
                  <Link to="/seller?tab=products" style={dropdownItemStyle} onClick={() => setSellerOpen(false)}>
                    Your Products
                  </Link>
                  <Link to="/seller?tab=pending" style={dropdownItemStyle} onClick={() => setSellerOpen(false)}>
                    Pending Orders
                  </Link>
                  <Link to="/seller?tab=sold" style={dropdownItemStyle} onClick={() => setSellerOpen(false)}>
                    Sold Items
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {user ? (
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              {user.username?.toUpperCase()}
            </button>
            {profileOpen && (
              <div style={{ ...dropdownStyle, right: 0, left: "auto" }}>
                <Link to="/profile" style={dropdownItemStyle} onClick={() => setProfileOpen(false)}>
                  Profile
                </Link>
                <Link to="/Change-details" style={dropdownItemStyle} onClick={() => setProfileOpen(false)}>
                  Change Details
                </Link>
                <Link to="/Change-password" style={dropdownItemStyle} onClick={() => setProfileOpen(false)}>
                  Change Password
                </Link>
                <button
                  onClick={logout}
                  style={{ ...dropdownItemStyle, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#f87171" }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" style={{
              color: "#c084fc",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
            }}>
              Login
            </Link>
            <Link to="/registration" style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              color: "#fff",
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const navLinkStyle = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "600",
  padding: "6px 12px",
  borderRadius: "6px",
  transition: "color 0.2s",
};

const dropdownStyle = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  background: "rgba(15,23,42,0.98)",
  border: "1px solid rgba(139,92,246,0.3)",
  borderRadius: "10px",
  minWidth: "180px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  overflow: "hidden",
  zIndex: 200,
};

const dropdownItemStyle = {
  display: "block",
  padding: "11px 16px",
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "500",
  borderBottom: "1px solid rgba(139,92,246,0.1)",
};

export default Navbar;
