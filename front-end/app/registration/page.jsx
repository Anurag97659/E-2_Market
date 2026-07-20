"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function Registration() {
  const [step, setStep] = useState(1);
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
  const router = useRouter();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { showAlert("Passwords do not match"); return; }
    if (password.length < 8) { showAlert("Password must be at least 8 characters"); return; }
    setLoading(true);
    const result = await apiFetch(`${API}/users/sendRegistrationOTP`, {
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
    const result = await apiFetch(`${API}/users/verifyRegistrationOTP`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (result.ok) { showAlert("Account created successfully!", "success"); setTimeout(() => router.push("/login"), 1500); }
    else showAlert(result.message);
    setLoading(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
  const labelCls = "block text-xs font-bold uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: "linear-gradient(135deg,#f8fafc 0%,#e0f2fe 50%,#f8fafc 100%)" }}>
      <div className="fixed top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(139,92,246,0.10),transparent)", filter: "blur(60px)" }} />
      <div className="fixed bottom-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(59,130,246,0.10),transparent)", filter: "blur(60px)" }} />

      {alert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      <div
        className="w-full rounded-3xl border p-10 relative z-10 backdrop-blur-xl shadow-xl transition-all duration-300"
        style={{ maxWidth: step === 1 ? "560px" : "400px", background: "var(--card-bg)", borderColor: "var(--card-border)" }}
      >
        <div className="flex justify-center mb-4">
          <img src="/icon.png" alt="Logo" className="w-50 h-15 object-contain" />
        </div>
        <h2 className="text-center text-3xl font-black mb-1.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {step === 1 ? "Create Account" : "Verify Email"}
        </h2>
        <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {step === 1 ? "Join the E-2 Market community" : `Enter the OTP sent to ${email}`}
        </p>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-7">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: s === step ? "28px" : "8px",
                background: s === step ? "#a855f7" : s < step ? "#10b981" : "rgba(139,92,246,0.3)",
              }}
            />
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={sendOTP} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Full Name</label><input className={inputCls} type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="John Doe" required /></div>
              <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Username</label><input className={inputCls} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" required /></div>
            </div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Email</label><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Password</label><input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars" required /></div>
              <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Confirm</label><input className={inputCls} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat" required /></div>
            </div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Phone</label><input className={inputCls} type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" required /></div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Address</label><input className={inputCls} type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City" required /></div>
            <button type="submit" disabled={loading} className="py-3.5 rounded-xl font-bold text-base text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}>
              {loading ? "Sending OTP..." : "Send Verification OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="flex flex-col gap-5">
            <div>
              <label className={labelCls} style={{ color: "var(--text-muted)" }}>Enter 6-digit OTP</label>
              <input className="w-full px-4 py-3 rounded-xl text-3xl text-center tracking-[12px] font-bold outline-none" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="------" maxLength={6} required />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} className="py-3.5 rounded-xl font-bold text-base text-white disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: loading || otp.length < 6 ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}>
              {loading ? "Verifying..." : "Verify and Create Account"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="py-2.5 rounded-xl text-sm border bg-transparent cursor-pointer" style={{ color: "var(--text-muted)", borderColor: "rgba(139,92,246,0.3)" }}>Back to Form</button>
          </form>
        )}

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="text-purple-500 font-bold hover:text-purple-400">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
