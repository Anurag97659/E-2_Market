"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const showAlert = (msg, type = "error") => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 4000); };

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showAlert("Passwords do not match"); return; }
    if (newPassword.length < 8) { showAlert("Password must be at least 8 characters"); return; }
    setLoading(true);
    const result = await apiFetch(`${API}/users/changePassword`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ oldPassword, newPassword, confirmPassword }) });
    if (result.ok) { showAlert("Password changed successfully!", "success"); setTimeout(() => router.push("/profile"), 1200); } else showAlert(result.message);
    setLoading(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
  const fields = [
    { label: "Old Password", value: oldPassword, setter: setOldPassword, placeholder: "Current password" },
    { label: "New Password", value: newPassword, setter: setNewPassword, placeholder: "Min 8 characters" },
    { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, placeholder: "Repeat new password" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />
      {alert && (<div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>{alert.msg}</div>)}
      <div className="max-w-md mx-auto px-6 mt-10">
        <div className="rounded-2xl border p-9 backdrop-blur-xl shadow-lg" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="text-center text-2xl font-black mb-7 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Change Password</h2>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {fields.map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>{field.label}</label>
                <input className={inputCls} type="password" value={field.value} onChange={(e) => field.setter(e.target.value)} placeholder={field.placeholder} required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="py-3.5 rounded-xl font-bold text-base text-white mt-2 disabled:opacity-60" style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}>{loading ? "Changing..." : "Change Password"}</button>
          </form>
          <p className="text-center mt-5 text-sm"><Link href="/profile" className="text-purple-500 font-bold hover:text-purple-400">Back to Profile</Link></p>
        </div>
      </div>
    </div>
  );
}
