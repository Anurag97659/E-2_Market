"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function Orders() {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    fetch(`${API}/users/getorderlist`, {
      credentials: "include",
    })
      .then((r) => {
        if (r.status === 401) { window.location.href = "/login"; return; }
        return r.json();
      })
      .then((d) => {
        setOrderItems(Array.isArray(d?.data) ? d.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    const result = await apiFetch(`${API}/users/cancelOrder`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (result.ok) {
      showAlert("Order cancelled", "success");
      setOrderItems((prev) => prev.filter((o) => o._id !== orderId));
    } else {
      showAlert(result.message);
    }
  };

  const statusColor = (status) => status === "delivered" ? "#10b981" : "#f59e0b";
  const statusBg = (status) => status === "delivered" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)";
  const statusBorder = (status) => status === "delivered" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)";
  const statusLabel = (status) => status === "delivered" ? "Delivered" : "On the Way";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />

      {alert && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Your Orders
        </h1>

        {loading ? (
          <div className="text-center py-14" style={{ color: "var(--text-muted)" }}>Loading orders...</div>
        ) : orderItems.length === 0 ? (
          <div className="rounded-2xl border p-14 text-center backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <p className="text-base" style={{ color: "var(--text-muted)" }}>You have not placed any orders yet.</p>
            <Link href="/" className="text-purple-500 font-bold hover:text-purple-400 mt-3 inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orderItems.map((order) => {
              const product = order.product || {};
              const orderedAt = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
              return (
                <div key={order._id} className="rounded-2xl border p-5 flex gap-5" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <Link href={`/product_page/${product._id}`} className="block flex-shrink-0">
                    <img
                      src={product.Thumbnail}
                      alt={product.Title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  <div className="flex-1">
                    <Link href={`/product_page/${product._id}`} style={{ textDecoration: "none" }}>
                      <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text-main)" }}>
                        {product.Title}
                      </h3>
                    </Link>
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      Rs.{order.priceAtOrder} x {order.quantity} = <span className="font-bold text-purple-400">Rs.{(order.priceAtOrder * order.quantity).toLocaleString()}</span>
                    </p>
                    <p className="text-xs mb-3 text-slate-500">
                      Ordered on {orderedAt}
                    </p>

                    <div className="flex gap-2.5 items-center flex-wrap">
                      <span className="px-3 py-1 rounded-md text-xs font-bold border" style={{ background: statusBg(order.status), borderColor: statusBorder(order.status), color: statusColor(order.status) }}>
                        {statusLabel(order.status)}
                      </span>

                      {order.status !== "delivered" && (
                        <>
                          <div className="rounded-lg border px-3 py-1 flex items-center gap-2 bg-purple-500/10 border-purple-500/30">
                            <span className="text-[10px] font-semibold text-slate-500">DELIVERY OTP</span>
                            <span className="text-base font-black text-purple-400 tracking-[3px]">
                              {order.otp}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">Share with seller on delivery</span>
                        </>
                      )}

                      {order.status === "delivered" && !order.review && (
                        <Link href={`/product_page/${product._id}#reviews`} className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white text-center hover:opacity-90" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                          Write a Review
                        </Link>
                      )}

                      {order.status === "delivered" && order.review && (
                        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          Reviewed
                        </span>
                      )}

                      {order.status !== "delivered" && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="px-3.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
                          style={{ background: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.3)", color: "#fca5a5" }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
