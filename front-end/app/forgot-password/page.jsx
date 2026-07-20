"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const showAlert = (msg, type = "error") => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 4000); };

  const sendOTP = async (e) => {
    e.preventDefault(); setLoading(true);
    const result = await apiFetch(`${API}/users/forgotPassword`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (result.ok) { showAlert("OTP sent to your email", "success"); setStep(2); } else showAlert(result.message);
    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault(); setLoading(true);
    const result = await apiFetch(`${API}/users/verifyForgotOTP`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) });
    if (result.ok) { showAlert("OTP verified", "success"); setStep(3); } else showAlert(result.message);
    setLoading(false);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showAlert("Passwords do not match"); return; }
    if (newPassword.length < 8) { showAlert("Password must be at least 8 characters"); return; }
    setLoading(true);
    const result = await apiFetch(`${API}/users/resetPassword`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp, newPassword, confirmPassword }) });
    if (result.ok) { showAlert("Password reset successfully!", "success"); setTimeout(() => router.push("/login"), 1500); } else showAlert(result.message);
    setLoading(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
  const stepLabels = ["Enter Email", "Verify OTP", "New Password"];

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-gradient)" }}>
      {alert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>{alert.msg}</div>
      )}
      <div className="w-full max-w-md rounded-3xl border p-10 backdrop-blur-xl shadow-xl" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
        <h2 className="text-center text-2xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Reset Password</h2>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-7">
          {stepLabels.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: i + 1 === step ? "#a855f7" : i + 1 < step ? "#10b981" : "rgba(139,92,246,0.2)" }}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: i + 1 === step ? "#a855f7" : "var(--text-muted)" }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && <div className="w-10 h-px mx-1 mb-5" style={{ background: i + 1 < step ? "#10b981" : "rgba(139,92,246,0.2)" }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={sendOTP} className="flex flex-col gap-5">
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Registered Email</label><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
            <button type="submit" disabled={loading} className="py-3.5 rounded-xl font-bold text-base text-white disabled:opacity-60" style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7)" }}>{loading ? "Sending OTP..." : "Send OTP"}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOTP} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Enter 6-digit OTP</label>
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Sent to {email}</p>
              <input className="w-full px-4 py-3 rounded-xl text-3xl text-center tracking-[12px] font-bold outline-none" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="------" maxLength={6} required />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} className="py-3.5 rounded-xl font-bold text-base text-white disabled:opacity-60" style={{ background: loading || otp.length < 6 ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7)" }}>{loading ? "Verifying..." : "Verify OTP"}</button>
            <button type="button" onClick={() => setStep(1)} className="py-2.5 rounded-xl text-sm border bg-transparent cursor-pointer" style={{ color: "var(--text-muted)", borderColor: "rgba(139,92,246,0.3)" }}>Back</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword} className="flex flex-col gap-4">
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>New Password</label><input className={inputCls} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" required /></div>
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Confirm Password</label><input className={inputCls} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required /></div>
            <button type="submit" disabled={loading} className="py-3.5 rounded-xl font-bold text-base text-white disabled:opacity-60" style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}>{loading ? "Resetting..." : "Reset Password"}</button>
          </form>
        )}

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>Remembered your password?{" "}<Link href="/login" className="text-purple-500 font-bold hover:text-purple-400">Sign In</Link></p>
      </div>
    </div>
  );
}
