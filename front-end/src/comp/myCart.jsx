import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function MyCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/users/getusercartlist", {
      credentials: "include",
    })
      .then((r) => {
        if (r.status === 401) { navigate("/login"); return; }
        return r.json();
      })
      .then((d) => {
        setCartItems(d?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) { removeFromCart(productId); return; }
    try {
      const res = await fetch("http://localhost:8000/e-2market/v1/products/addToCart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQty }),
      });
      const data = await res.json();
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            (item.product?._id || item.product) === productId
              ? { ...item, quantity: newQty }
              : item
          )
        );
      } else showAlert(data.message || "Failed to update quantity");
    } catch { showAlert("Network error"); }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch("http://localhost:8000/e-2market/v1/products/removeFromCart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => (item.product?._id || item.product) !== productId));
        showAlert("Item removed", "success");
      } else showAlert(data.message || "Failed to remove");
    } catch { showAlert("Network error"); }
  };

  const totalAmount = cartItems.reduce((acc, item) => {
    const price = item.product?.Price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

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

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{
          fontSize: "28px",
          fontWeight: "900",
          background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "28px",
        }}>
          Shopping Cart
        </h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading cart...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
            <div>
              {cartItems.length === 0 ? (
                <div style={{
                  background: "rgba(30,27,75,0.6)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "16px",
                  padding: "60px",
                  textAlign: "center",
                }}>
                  <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "16px" }}>Your cart is empty.</p>
                  <Link to="/" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>Browse Products</Link>
                </div>
              ) : (
                <div style={{
                  background: "rgba(30,27,75,0.6)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}>
                  {cartItems.map((item, i) => {
                    const product = item.product || {};
                    const productId = product._id || item.product;
                    const qty = item.quantity || 1;
                    const price = product.Price || 0;
                    return (
                      <div
                        key={productId}
                        style={{
                          display: "flex",
                          gap: "16px",
                          padding: "20px",
                          borderBottom: i < cartItems.length - 1 ? "1px solid rgba(139,92,246,0.1)" : "none",
                        }}
                      >
                        <Link to={`/product_page/${productId}`} style={{ display: "block", flexShrink: 0 }}>
                          <img
                            src={product.Thumbnail}
                            alt={product.Title}
                            style={{ width: "96px", height: "96px", objectFit: "cover", borderRadius: "10px" }}
                          />
                        </Link>
                        <div style={{ flex: 1 }}>
                          <Link to={`/product_page/${productId}`} style={{ textDecoration: "none" }}>
                            <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>
                              {product.Title}
                            </h3>
                          </Link>
                          <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "8px" }}>{product.Category}</p>
                          <p style={{ color: "#c084fc", fontWeight: "800", fontSize: "17px", marginBottom: "12px" }}>
                            Rs.{price.toLocaleString()}
                          </p>
                          {/* Quantity controls */}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", background: "rgba(51,65,85,0.5)", borderRadius: "8px", border: "1px solid rgba(139,92,246,0.3)", overflow: "hidden" }}>
                              <button onClick={() => updateQuantity(productId, qty - 1)} style={{ width: "32px", height: "32px", background: "none", border: "none", color: "#e2e8f0", fontSize: "16px", cursor: "pointer", fontWeight: "700" }}>-</button>
                              <span style={{ minWidth: "36px", textAlign: "center", color: "#fff", fontWeight: "700", fontSize: "14px" }}>{qty}</span>
                              <button onClick={() => updateQuantity(productId, qty + 1)} style={{ width: "32px", height: "32px", background: "none", border: "none", color: "#e2e8f0", fontSize: "16px", cursor: "pointer", fontWeight: "700" }}>+</button>
                            </div>
                            <button
                              onClick={() => removeFromCart(productId)}
                              style={{ padding: "6px 14px", background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ color: "#c084fc", fontWeight: "800", fontSize: "17px" }}>
                            Rs.{(price * qty).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <div style={{
                background: "rgba(30,27,75,0.6)",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "16px",
                padding: "24px",
                position: "sticky",
                top: "80px",
              }}>
                <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px", marginBottom: "20px" }}>
                  Order Summary
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8", fontSize: "14px" }}>Subtotal ({cartItems.length} items)</span>
                    <span style={{ color: "#e2e8f0", fontWeight: "600" }}>Rs.{totalAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8", fontSize: "14px" }}>Shipping</span>
                    <span style={{ color: "#10b981", fontWeight: "600" }}>Free</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px" }}>Total</span>
                  <span style={{ color: "#c084fc", fontWeight: "900", fontSize: "22px" }}>Rs.{totalAmount.toLocaleString()}</span>
                </div>
                <Link
                  to="/bill"
                  style={{
                    display: "block",
                    padding: "14px",
                    background: cartItems.length === 0 ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                    color: "#fff",
                    borderRadius: "12px",
                    textDecoration: "none",
                    textAlign: "center",
                    fontWeight: "700",
                    fontSize: "15px",
                    pointerEvents: cartItems.length === 0 ? "none" : "auto",
                  }}
                >
                  Proceed to Checkout
                </Link>
                <Link to="/" style={{ display: "block", textAlign: "center", marginTop: "12px", color: "#64748b", fontSize: "13px", textDecoration: "none" }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCart;
