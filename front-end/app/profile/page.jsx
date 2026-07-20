"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function Profile() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API}/users/getProfile`, { credentials: "include" })
      .then((res) => { if (res.status === 401) { router.push("/login"); return; } return res.json(); })
      .then((data) => { if (data?.data) setUser(data.data); })
      .catch(() => {});
  }, []);

  const fields = user ? [
    { label: "Full Name", value: user.fullname },
    { label: "Username", value: user.username?.toUpperCase() },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone },
    { label: "Address", value: user.address },
  ] : [];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-6 mt-10">
        <div className="rounded-2xl border p-9 backdrop-blur-xl shadow-lg" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="text-center text-2xl font-black mb-7 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Your Profile</h2>
          {!user ? (
            <p className="text-center" style={{ color: "var(--text-muted)" }}>Loading...</p>
          ) : (
            <>
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-400 flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white">
                {user.fullname?.[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col">
                {fields.map((field, i) => (
                  <div key={field.label} className="flex justify-between items-center py-4" style={{ borderBottom: i < fields.length - 1 ? "1px solid var(--card-border)" : "none" }}>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{field.label}</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>{field.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5 mt-7">
                <Link href="/Change-details" className="flex-1 py-2.5 rounded-xl text-center font-bold text-sm text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>Edit Details</Link>
                <Link href="/Change-password" className="flex-1 py-2.5 rounded-xl text-center font-bold text-sm border text-purple-500" style={{ borderColor: "rgba(139,92,246,0.4)" }}>Change Password</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
