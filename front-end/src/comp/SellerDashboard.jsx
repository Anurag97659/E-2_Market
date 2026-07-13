import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import apiFetch from "../utils/apiFetch";

function SellerDashboard() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "products");
  const [products, setProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [otpInputs, setOtpInputs] = useState({}); // orderId -> otp
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    setTab(searchParams.get("tab") || "products");
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const fetches = [
      fetch("http://localhost:8000/e-2market/v1/products/sell", { credentials: "include" })
        .then((r) => r.json()).then((d) => { if (d.statusCode === 200) setProducts(d.data || []); }),
      fetch("http://localhost:8000/e-2market/v1/products/seller/pendingOrders", { credentials: "include" })
        .then((r) => r.json()).then((d) => { if (d.statusCode === 200) setPendingOrders(d.data || []); }),
      fetch("http://localhost:8000/e-2market/v1/products/seller/soldItems", { credentials: "include" })
        .then((r) => r.json()).then((d) => { if (d.statusCode === 200) setSoldItems(d.data || []); }),
    ];
    Promise.all(fetches)
      .catch(() => showAlert("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    const result = await apiFetch("http://localhost:8000/e-2market/v1/products/deleteProduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });
    if (result.ok) { setProducts((p) => p.filter((x) => x._id !== productId)); showAlert("Product deleted", "success"); }
    else showAlert(result.message);
  };

  const confirmDelivery = async (orderId, buyerEmail) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length < 4) { showAlert("Enter the OTP shared by the buyer"); return; }
    const result = await apiFetch("http://localhost:8000/e-2market/v1/products/seller/confirmDelivery", {
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
    } else showAlert(result.message);
  };

  const tabs = [
    { key: "products", label: `Your Products (${products.length})` },
    { key: "pending", label: `Pending Orders (${pendingOrders.length})` },
    { key: "sold", label: `Sold Items (${soldItems.length})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-gradient)" }}>
      <Navbar />

      {alert && (
        <div style={{
          position: "fixed",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: alert.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
          border: `1px solid ${alert.type === "success" ? "#10b981" : "#ef4444"}`,
          color: alert.type === "success" ? "#6ee7b7" : "#fca5a5",
          padding: "12px 28px",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "14px",
          zIndex: 300,
          backdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
        }}>
          {alert.msg}
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "900",
            background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Seller Dashboard
          </h1>
          <Link to="/Add-product" style={{
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "14px",
          }}>
            + Add Product
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "28px", background: "rgba(30,27,75,0.5)", padding: "4px", borderRadius: "12px", border: "1px solid rgba(139,92,246,0.2)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: tab === t.key ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "none",
                border: "none",
                borderRadius: "8px",
                color: tab === t.key ? "#fff" : "#94a3b8",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading...</div>
        ) : (
          <>
            {/* YOUR PRODUCTS TAB */}
            {tab === "products" && (
              products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
                  No products listed yet.{" "}
                  <Link to="/Add-product" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>Add your first product</Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" }}>
                  {products.map((p) => (
                    <div key={p._id} style={{
                      background: "rgba(30,27,75,0.6)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      borderRadius: "16px",
                      overflow: "hidden",
                    }}>
                      <img src={p.Thumbnail} alt={p.Title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                      <div style={{ padding: "16px" }}>
                        <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>{p.Title}</h3>
                        <p style={{ color: "#c084fc", fontWeight: "800", fontSize: "18px", marginBottom: "4px" }}>Rs.{p.Price}</p>
                        <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>Category: {p.Category}</p>
                        <p style={{ color: p.Quantity > 0 ? "#6ee7b7" : "#f87171", fontSize: "12px", marginBottom: "16px" }}>
                          Stock: {p.Quantity}
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link to={`/Edit-product/${p._id}`} style={{
                            flex: 1, padding: "8px 0", background: "linear-gradient(135deg,#f59e0b,#d97706)",
                            color: "#fff", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontWeight: "700", fontSize: "12px"
                          }}>Edit</Link>
                          <Link to={`/Edit-image/${p._id}`} style={{
                            flex: 1, padding: "8px 0", background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                            color: "#fff", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontWeight: "700", fontSize: "12px"
                          }}>Images</Link>
                          <button onClick={() => handleDelete(p._id)} style={{
                            flex: 1, padding: "8px 0", background: "linear-gradient(135deg,#dc2626,#b91c1c)",
                            color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px"
                          }}>Delete</button>
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
                <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>No pending orders.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {pendingOrders.map((order) => (
                    <div key={order.orderId} style={{
                      background: "rgba(30,27,75,0.6)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex",
                      gap: "20px",
                      alignItems: "flex-start",
                    }}>
                      {order.product?.Thumbnail && (
                        <img src={order.product.Thumbnail} alt={order.product.Title} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
                          {order.product?.Title}
                        </h3>
                        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "2px" }}>
                          Quantity: <span style={{ color: "#c084fc", fontWeight: "700" }}>{order.quantity}</span>
                          {" | "}Total: <span style={{ color: "#c084fc", fontWeight: "700" }}>Rs.{(order.priceAtOrder * order.quantity).toLocaleString()}</span>
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "2px" }}>
                          Buyer: <span style={{ color: "#e2e8f0" }}>{order.buyer?.name}</span>
                          {" | "}<span style={{ color: "#e2e8f0" }}>{order.buyer?.phone}</span>
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "12px" }}>
                          Deliver to: <span style={{ color: "#e2e8f0" }}>{order.buyer?.address}</span>
                        </p>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            placeholder="Enter buyer's OTP to confirm delivery"
                            value={otpInputs[order.orderId] || ""}
                            onChange={(e) => setOtpInputs((prev) => ({ ...prev, [order.orderId]: e.target.value }))}
                            style={{
                              padding: "8px 14px",
                              background: "rgba(51,65,85,0.5)",
                              border: "1px solid rgba(100,116,139,0.5)",
                              borderRadius: "8px",
                              color: "#fff",
                              fontSize: "14px",
                              width: "240px",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => confirmDelivery(order.orderId, order.buyer?.email)}
                            style={{
                              padding: "9px 20px",
                              background: "linear-gradient(135deg,#10b981,#059669)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "700",
                              fontSize: "13px",
                            }}
                          >
                            Confirm Delivery
                          </button>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{
                          background: "rgba(245,158,11,0.15)",
                          border: "1px solid rgba(245,158,11,0.4)",
                          color: "#fcd34d",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}>
                          Pending
                        </span>
                        <p style={{ color: "#64748b", fontSize: "11px", marginTop: "6px" }}>
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
                <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>No sold items yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {soldItems.map((item, i) => (
                    <div key={i} style={{
                      background: "rgba(30,27,75,0.6)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}>
                      {item.product?.Thumbnail && (
                        <img src={item.product.Thumbnail} alt={item.product.Title} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
                          {item.product?.Title}
                        </h3>
                        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "2px" }}>
                          Qty: <span style={{ color: "#6ee7b7", fontWeight: "700" }}>{item.quantity}</span>
                          {" | "}Total: <span style={{ color: "#6ee7b7", fontWeight: "700" }}>Rs.{(item.priceAtOrder * item.quantity).toLocaleString()}</span>
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                          Delivered to: <span style={{ color: "#e2e8f0" }}>{item.buyer?.name}</span>
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{
                          background: "rgba(16,185,129,0.15)",
                          border: "1px solid rgba(16,185,129,0.4)",
                          color: "#6ee7b7",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}>
                          Delivered
                        </span>
                        <p style={{ color: "#64748b", fontSize: "11px", marginTop: "6px" }}>
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

export default SellerDashboard;
