"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState("light"); 
  const sellerRef = useRef(null);
  const profileRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";
    fetch(`${API}/users/getProfile`, { credentials: "include" })
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
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";
    fetch(`${API}/users/logout`, { method: "POST", credentials: "include" }).then(() => {
      setUser(null);
      router.push("/login");
    });
  };

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 border-b backdrop-blur-xl transition-all duration-300"
      style={{
        background: "var(--nav-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
      >
        <img src="/icon.png" alt="Logo" className="w-40 h-13 object-contain" />
        
      </Link>

      <div className="flex items-center gap-1">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/search">Search</NavLink>
        {user && (
          <>
            <NavLink href="/orders">Orders</NavLink>
            <NavLink href="/mycart">Cart</NavLink>

            {/* Seller dropdown */}
            <div ref={sellerRef} className="relative">
              <button
                onClick={() => setSellerOpen(!sellerOpen)}
                className="text-sm font-semibold px-3 py-1.5 rounded-md border transition-colors duration-200"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "rgba(139,92,246,0.4)",
                  background: "none",
                }}
              >
                Seller {sellerOpen ? "▲" : "▼"}
              </button>
              {sellerOpen && (
                <div
                  className="absolute top-[calc(100%+8px)] left-0 min-w-[180px] rounded-xl overflow-hidden z-50 shadow-2xl border"
                  style={{
                    background: "var(--dropdown-bg)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <DropdownLink href="/seller?tab=products" onClick={() => setSellerOpen(false)}>Your Products</DropdownLink>
                  <DropdownLink href="/seller?tab=pending" onClick={() => setSellerOpen(false)}>Pending Orders</DropdownLink>
                  <DropdownLink href="/seller?tab=sold" onClick={() => setSellerOpen(false)}>Sold Items</DropdownLink>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-colors duration-200 hover:bg-purple-500/10"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          )}
        </button>

        {user ? (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer border-none"
            >
              {user.username?.toUpperCase()}
            </button>
            {profileOpen && (
              <div
                className="absolute top-[calc(100%+8px)] right-0 min-w-[180px] rounded-xl overflow-hidden z-50 shadow-2xl border"
                style={{
                  background: "var(--dropdown-bg)",
                  borderColor: "var(--card-border)",
                }}
              >
                <DropdownLink href="/profile" onClick={() => setProfileOpen(false)}>Profile</DropdownLink>
                <DropdownLink href="/Change-details" onClick={() => setProfileOpen(false)}>Change Details</DropdownLink>
                <DropdownLink href="/Change-password" onClick={() => setProfileOpen(false)}>Change Password</DropdownLink>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-[11px] text-sm font-medium text-red-400 border-none cursor-pointer transition-colors hover:bg-red-500/10"
                  style={{ background: "none", borderTop: "1px solid var(--card-border)" }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login" className="text-purple-400 font-bold text-sm hover:text-purple-300 transition-colors">
              Login
            </Link>
            <Link
              href="/registration"
              className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 hover:text-purple-500"
      style={{ color: "var(--text-muted)", textDecoration: "none" }}
    >
      {children}
    </Link>
  );
}

function DropdownLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-[11px] text-sm font-medium transition-colors hover:bg-purple-500/10"
      style={{
        color: "var(--text-main)",
        textDecoration: "none",
        borderBottom: "1px solid var(--card-border)",
      }}
    >
      {children}
    </Link>
  );
}
