import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import apiFetch from "../utils/apiFetch";

function Orders() {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/users/getorderlist", {
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
    const result = await apiFetch("http://localhost:8000/e-2market/v1/users/cancelOrder", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (result.ok) { showAlert("Order cancelled", "success"); setOrderItems((prev) => prev.filter((o) => o._id !== orderId)); }
    else showAlert(result.message);
  };

  const statusColor = (status) => status === "delivered" ? "#10b981" : "#f59e0b";
  const statusBg = (status) => status === "delivered" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)";
  const statusBorder = (status) => status === "delivered" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)";
  const statusLabel = (status) => status === "delivered" ? "Delivered" : "On the Way";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>
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

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{
          fontSize: "28px",
          fontWeight: "900",
          background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "28px",
        }}>
          Your Orders
        </h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading orders...</div>
        ) : orderItems.length === 0 ? (
          <div style={{
            background: "rgba(30,27,75,0.6)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "16px",
            padding: "60px",
            textAlign: "center",
          }}>
            <p style={{ color: "#64748b", fontSize: "16px" }}>You have not placed any orders yet.</p>
            <Link to="/" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none", marginTop: "12px", display: "inline-block" }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orderItems.map((order) => {
              const product = order.product || {};
              const orderedAt = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
              return (
                <div key={order._id} style={{
                  background: "rgba(30,27,75,0.6)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  gap: "20px",
                }}>
                  {/* Product image */}
                  <Link to={`/product_page/${product._id}`} style={{ display: "block", flexShrink: 0 }}>
                    <img
                      src={product.Thumbnail}
                      alt={product.Title}
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px" }}
                    />
                  </Link>

                  <div style={{ flex: 1 }}>
                    <Link to={`/product_page/${product._id}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
                        {product.Title}
                      </h3>
                    </Link>
                    <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "2px" }}>
                      Rs.{order.priceAtOrder} x {order.quantity} = <span style={{ color: "#c084fc", fontWeight: "700" }}>Rs.{(order.priceAtOrder * order.quantity).toLocaleString()}</span>
                    </p>
                    <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "12px" }}>
                      Ordered on {orderedAt}
                    </p>

                    {/* Status and OTP */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{
                        background: statusBg(order.status),
                        border: `1px solid ${statusBorder(order.status)}`,
                        color: statusColor(order.status),
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}>
                        {statusLabel(order.status)}
                      </span>

                      {order.status !== "delivered" && (
                        <>
                          <div style={{
                            background: "rgba(124,58,237,0.12)",
                            border: "1px solid rgba(124,58,237,0.3)",
                            borderRadius: "8px",
                            padding: "6px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}>
                            <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600" }}>DELIVERY OTP</span>
                            <span style={{ color: "#c084fc", fontSize: "18px", fontWeight: "900", letterSpacing: "4px" }}>
                              {order.otp}
                            </span>
                          </div>
                          <span style={{ color: "#475569", fontSize: "11px" }}>Share with seller on delivery</span>
                        </>
                      )}

                      {order.status === "delivered" && !order.review && (
                        <Link to={`/product_page/${product._id}#reviews`} style={{
                          padding: "6px 14px",
                          background: "linear-gradient(135deg,#f59e0b,#d97706)",
                          color: "#fff",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}>
                          Write a Review
                        </Link>
                      )}

                      {order.status === "delivered" && order.review && (
                        <span style={{
                          background: "rgba(16,185,129,0.12)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          color: "#6ee7b7",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}>
                          Reviewed
                        </span>
                      )}

                      {order.status !== "delivered" && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          style={{
                            padding: "6px 14px",
                            background: "rgba(220,38,38,0.12)",
                            border: "1px solid rgba(220,38,38,0.3)",
                            color: "#fca5a5",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
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

export default Orders;
