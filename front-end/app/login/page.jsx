"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiFetch(`${API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (result.ok) { showAlert("Login successful", "success"); setTimeout(() => router.push("/"), 800); }
    else showAlert(result.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "linear-gradient(135deg,#f8fafc 0%,#e0f2fe 50%,#f8fafc 100%)" }}>
      {/* Decorative blob */}
      <div className="fixed top-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(139,92,246,0.08),transparent)", filter: "blur(80px)" }} />

      {alert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      <div className="w-full max-w-md rounded-3xl border p-10 relative z-10 backdrop-blur-xl shadow-xl" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
        <div className="flex justify-center mb-4">
          <img src="/icon.png" alt="Logo" className="w-50 h-15 object-contain" />
        </div>
        <h2 className="text-center text-3xl font-black mb-1.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Sign In</h2>
        <p className="text-center text-slate-400 text-sm mb-8">Welcome back to E-2 Market</p>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Username or Email</label>
            <input className="w-full px-4 py-3 rounded-xl text-sm outline-none" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username or email" required />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-purple-500 hover:text-purple-400">Forgot Password?</Link>
            </div>
            <input className="w-full px-4 py-3 rounded-xl text-sm outline-none" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="py-3.5 rounded-xl font-bold text-base text-white mt-1 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
          New to E-2 Market?{" "}
          <Link href="/registration" className="text-purple-500 font-bold hover:text-purple-400">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
