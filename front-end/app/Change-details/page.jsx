"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function ChangeDetails() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const showAlert = (msg, type = "error") => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 4000); };

  const sendEmailOTP = async () => {
    if (!email.trim()) { showAlert("Enter the new email first"); return; }
    setLoading(true);
    const result = await apiFetch(`${API}/users/sendChangeEmailOTP`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ newEmail: email }) });
    if (result.ok) { showAlert("OTP sent to new email", "success"); setOtpSent(true); } else showAlert(result.message);
    setLoading(false);
  };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    const body = { username, email, fullname, phone, address };
    if (email && otpSent) body.otp = emailOtp;
    const result = await apiFetch(`${API}/users/updateDetails`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    if (result.ok) { showAlert("Details updated successfully", "success"); setTimeout(() => router.push("/profile"), 1200); } else showAlert(result.message);
    setLoading(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
  const labelCls = "block text-xs font-bold uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />
      {alert && (<div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>{alert.msg}</div>)}
      <div className="max-w-lg mx-auto px-6 mt-10">
        <div className="rounded-2xl border p-9 backdrop-blur-xl shadow-lg" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="text-center text-2xl font-black mb-7 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Update Profile Details</h2>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Username</label><input className={inputCls} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Leave blank to keep current" /></div>
            <div>
              <label className={labelCls} style={{ color: "var(--text-muted)" }}>Email (OTP required)</label>
              <div className="flex gap-2">
                <input className={`${inputCls} flex-1`} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setOtpSent(false); }} placeholder="Leave blank to keep current" />
                {email && (<button type="button" onClick={sendEmailOTP} disabled={loading || otpSent} className="px-3.5 rounded-xl text-xs font-bold text-white disabled:opacity-60 cursor-pointer whitespace-nowrap" style={{ background: otpSent ? "#6b7280" : "linear-gradient(135deg,#7c3aed,#a855f7)" }}>{otpSent ? "OTP Sent" : "Send OTP"}</button>)}
              </div>
              {otpSent && (<div className="mt-2"><input className={inputCls} type="text" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit OTP" maxLength={6} /></div>)}
            </div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Full Name</label><input className={inputCls} type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Leave blank to keep current" /></div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Phone</label><input className={inputCls} type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Leave blank to keep current" /></div>
            <div><label className={labelCls} style={{ color: "var(--text-muted)" }}>Address</label><input className={inputCls} type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Leave blank to keep current" /></div>
            <button type="submit" disabled={loading} className="py-3.5 rounded-xl font-bold text-base text-white mt-2 disabled:opacity-60" style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}>{loading ? "Updating..." : "Update Details"}</button>
          </form>
          <p className="text-center mt-5 text-sm"><Link href="/profile" className="text-purple-500 font-bold hover:text-purple-400">Back to Profile</Link></p>
        </div>
      </div>
    </div>
  );
}
