"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

function SellerDashboardContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "products");
  const [products, setProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [otpInputs, setOtpInputs] = useState({});
  const router = useRouter();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    const activeTab = searchParams.get("tab");
    if (activeTab) setTab(activeTab);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const fetches = [
      fetch(`${API}/products/sell`, { credentials: "include" })
        .then((r) => r.json()).then((d) => { if (d.statusCode === 200) setProducts(d.data || []); }),
      fetch(`${API}/products/seller/pendingOrders`, { credentials: "include" })
        .then((r) => r.json()).then((d) => { if (d.statusCode === 200) setPendingOrders(d.data || []); }),
      fetch(`${API}/products/seller/soldItems`, { credentials: "include" })
        .then((r) => r.json()).then((d) => { if (d.statusCode === 200) setSoldItems(d.data || []); }),
    ];
    Promise.all(fetches)
      .catch(() => showAlert("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    const result = await apiFetch(`${API}/products/deleteProduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });
    if (result.ok) {
      setProducts((p) => p.filter((x) => x._id !== productId));
      showAlert("Product deleted", "success");
    } else {
      showAlert(result.message);
    }
  };

  const confirmDelivery = async (orderId, buyerEmail) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length < 4) { showAlert("Enter the OTP shared by the buyer"); return; }
    const result = await apiFetch(`${API}/products/seller/confirmDelivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ buyerEmail, orderId, otp }),
    });
    if (result.ok) {
      showAlert("Delivery confirmed! Order moved to Sold Items", "success");
      const confirmed = pendingOrders.find((o) => o.orderId === orderId || o.orderId?.toString() === orderId.toString());
      setPendingOrders((p) => p.filter((o) => (o.orderId?.toString()) !== orderId.toString()));
      if (confirmed) setSoldItems((s) => [...s, { ...confirmed, status: "delivered" }]);
    } else {
      showAlert(result.message);
    }
  };

  const tabs = [
    { key: "products", label: `Your Products (${products.length})` },
    { key: "pending", label: `Pending Orders (${pendingOrders.length})` },
    { key: "sold", label: `Sold Items (${soldItems.length})` },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />

      {alert && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-7">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Seller Dashboard
          </h1>
          <Link href="/Add-product" className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            + Add Product
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-7 p-1 rounded-xl border" style={{ background: "rgba(30,27,75,0.2)", borderColor: "var(--card-border)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-none"
              style={{
                background: tab === t.key ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
                color: tab === t.key ? "#fff" : "var(--text-muted)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-14" style={{ color: "var(--text-muted)" }}>Loading...</div>
        ) : (
          <>
            {/* PRODUCTS TAB */}
            {tab === "products" && (
              products.length === 0 ? (
                <div className="text-center py-14" style={{ color: "var(--text-muted)" }}>
                  No products listed yet.{" "}
                  <Link href="/Add-product" className="text-purple-500 font-bold">Add your first product</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {products.map((p) => (
                    <div key={p._id} className="rounded-xl border overflow-hidden backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                      <img src={p.Thumbnail} alt={p.Title} className="w-full h-44 object-cover" />
                      <div className="p-4">
                        <h3 className="font-bold text-sm mb-1.5 line-clamp-1" style={{ color: "var(--text-main)" }}>{p.Title}</h3>
                        <p className="font-black text-lg mb-1 text-purple-400">Rs.{p.Price}</p>
                        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Category: {p.Category}</p>
                        <p className="text-xs mb-4" style={{ color: p.Quantity > 0 ? "#10b981" : "#ef4444" }}>
                          Stock: {p.Quantity}
                        </p>
                        <div className="flex gap-1.5">
                          <Link href={`/Edit-product/${p._id}`} className="flex-1 py-1.5 rounded-lg text-white font-bold text-center text-xs" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>Edit</Link>
                          <Link href={`/Edit-image/${p._id}`} className="flex-1 py-1.5 rounded-lg text-white font-bold text-center text-xs" style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)" }}>Images</Link>
                          <button onClick={() => handleDelete(p._id)} className="flex-1 py-1.5 rounded-lg text-white font-bold text-xs border-none cursor-pointer" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* PENDING ORDERS TAB */}
            {tab === "pending" && (
              pendingOrders.length === 0 ? (
                <div className="text-center py-14" style={{ color: "var(--text-muted)" }}>No pending orders.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingOrders.map((order) => (
                    <div key={order.orderId} className="rounded-xl border p-5 flex gap-5" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                      {order.product?.Thumbnail && (
                        <img src={order.product.Thumbnail} alt={order.product.Title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1.5" style={{ color: "var(--text-main)" }}>
                          {order.product?.Title}
                        </h3>
                        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                          Quantity: <span className="font-bold text-purple-400">{order.quantity}</span>
                          {" | "}Total: <span className="font-bold text-purple-400">Rs.{(order.priceAtOrder * order.quantity).toLocaleString()}</span>
                        </p>
                        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                          Buyer: <span style={{ color: "var(--text-main)" }}>{order.buyer?.name}</span>
                          {" | "}<span style={{ color: "var(--text-main)" }}>{order.buyer?.phone}</span>
                        </p>
                        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                          Deliver to: <span style={{ color: "var(--text-main)" }}>{order.buyer?.address}</span>
                        </p>
                        <div className="flex gap-2.5 items-center flex-wrap">
                          <input
                            type="text"
                            placeholder="Enter buyer's OTP to confirm delivery"
                            value={otpInputs[order.orderId] || ""}
                            onChange={(e) => setOtpInputs((prev) => ({ ...prev, [order.orderId]: e.target.value }))}
                            className="px-3.5 py-2 rounded-lg border text-sm outline-none w-60"
                          />
                          <button
                            onClick={() => confirmDelivery(order.orderId, order.buyer?.email)}
                            className="px-5 py-2 rounded-lg text-white font-bold text-xs border-none cursor-pointer"
                            style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
                          >
                            Confirm Delivery
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-md text-xs font-bold border bg-amber-500/10 border-amber-500/30 text-amber-400">
                          Pending
                        </span>
                        <p className="text-[10px] mt-2.5" style={{ color: "var(--text-muted)" }}>
                          {new Date(order.orderedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* SOLD ITEMS TAB */}
            {tab === "sold" && (
              soldItems.length === 0 ? (
                <div className="text-center py-14" style={{ color: "var(--text-muted)" }}>No sold items yet.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {soldItems.map((item, i) => (
                    <div key={i} className="rounded-xl border p-5 flex gap-5 items-center" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                      {item.product?.Thumbnail && (
                        <img src={item.product.Thumbnail} alt={item.product.Title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1.5" style={{ color: "var(--text-main)" }}>
                          {item.product?.Title}
                        </h3>
                        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                          Qty: <span className="font-bold text-emerald-400">{item.quantity}</span>
                          {" | "}Total: <span className="font-bold text-emerald-400">Rs.{(item.priceAtOrder * item.quantity).toLocaleString()}</span>
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Delivered to: <span style={{ color: "var(--text-main)" }}>{item.buyer?.name}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-md text-xs font-bold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                          Delivered
                        </span>
                        <p className="text-[10px] mt-2.5" style={{ color: "var(--text-muted)" }}>
                          {item.deliveredAt ? new Date(item.deliveredAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading seller dashboard...</div>}>
      <SellerDashboardContent />
    </Suspense>
  );
}
