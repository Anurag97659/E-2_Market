import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "./Navbar";
import apiFetch from "../utils/apiFetch";

function Bill() {
  const [searchParams] = useSearchParams();
  const directBuyProductId = searchParams.get("directBuy");
  const directBuyQty = parseInt(searchParams.get("qty")) || 1;

  const [cartItems, setCartItems] = useState([]);
  const [directProduct, setDirectProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    if (directBuyProductId) {
      // Direct buy - fetch single product
      fetch(`http://localhost:8000/e-2market/v1/products/getproductdetailsforproductpage/${directBuyProductId}`)
        .then((r) => r.json())
        .then((d) => {
          setDirectProduct(d?.data || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // Cart checkout
      fetch("http://localhost:8000/e-2market/v1/users/getusercartlist", { credentials: "include" })
        .then((r) => {
          if (r.status === 401) { navigate("/login"); return; }
          return r.json();
        })
        .then((d) => {
          setCartItems(d?.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [directBuyProductId]);

  const displayItems = directBuyProductId
    ? directProduct
      ? [{ product: directProduct, quantity: directBuyQty, price: directProduct.Price }]
      : []
    : cartItems.map((c) => ({ product: c.product, quantity: c.quantity, price: c.product?.Price || 0 }));

  const totalAmount = displayItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePayment = async () => {
    if (paymentMethod === "upi" && !upiId.trim()) { showAlert("Please enter your UPI ID"); return; }
    if (paymentMethod === "card" && !cardDetails.cardNumber.trim()) { showAlert("Please enter card details"); return; }

    setPlacing(true);
    const body = { paymentMethod };
    if (directBuyProductId) { body.directBuyProductId = directBuyProductId; body.directBuyQuantity = directBuyQty; }

    const result = await apiFetch("http://localhost:8000/e-2market/v1/users/addtoOrder", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (result.ok) { setOrderSuccess(true); showAlert("Order placed! OTP sent to your email.", "success"); }
    else showAlert(result.message);
    setPlacing(false);
  };

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
          maxWidth: "90vw",
          textAlign: "center",
        }}>
          {alert.msg}
        </div>
      )}

      {orderSuccess ? (
        <div style={{ maxWidth: "500px", margin: "60px auto", padding: "24px", textAlign: "center" }}>
          <div style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "20px",
            padding: "48px 32px",
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>
              <span style={{ color: "#10b981" }}>+</span>
            </div>
            <h2 style={{ color: "#6ee7b7", fontWeight: "900", fontSize: "24px", marginBottom: "12px" }}>
              Order Placed!
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
              Your order has been placed. Check your email for the delivery OTP. You can also find the OTP in your Orders section.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link to="/orders" style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                color: "#fff",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "14px",
              }}>
                View Orders
              </Link>
              <Link to="/" style={{
                padding: "12px 24px",
                border: "1px solid rgba(139,92,246,0.4)",
                color: "#c084fc",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "14px",
              }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
          <h1 style={{
            fontSize: "26px",
            fontWeight: "900",
            background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "24px",
          }}>
            {directBuyProductId ? "Buy Now" : "Checkout"}
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>
            {/* Items */}
            <div>
              <div style={{
                background: "rgba(30,27,75,0.6)",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
              }}>
                <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>
                  Order Items
                </h3>
                {loading ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Loading...</p>
                ) : displayItems.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>
                    {directBuyProductId ? "Product not found" : "Your cart is empty"}
                  </p>
                ) : (
                  displayItems.map((item, i) => (
                    <div key={i} style={{
                      display: "flex",
                      gap: "16px",
                      padding: "12px 0",
                      borderBottom: i < displayItems.length - 1 ? "1px solid rgba(139,92,246,0.1)" : "none",
                    }}>
                      <img
                        src={item.product?.Thumbnail}
                        alt={item.product?.Title}
                        style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px" }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#e2e8f0", fontWeight: "600", fontSize: "14px", marginBottom: "4px" }}>
                          {item.product?.Title}
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                          Rs.{item.price} x {item.quantity}
                        </p>
                      </div>
                      <p style={{ color: "#c084fc", fontWeight: "700", fontSize: "15px" }}>
                        Rs.{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Payment method */}
              <div style={{
                background: "rgba(30,27,75,0.6)",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "16px",
                padding: "20px",
              }}>
                <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>
                  Payment Method
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { value: "upi", label: "UPI" },
                    { value: "card", label: "Credit / Debit Card" },
                    { value: "emi", label: "EMI" },
                    { value: "cod", label: "Cash on Delivery (COD)" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        background: paymentMethod === opt.value ? "rgba(124,58,237,0.15)" : "rgba(15,23,42,0.4)",
                        border: `1px solid ${paymentMethod === opt.value ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.15)"}`,
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        style={{ accentColor: "#a855f7" }}
                      />
                      <span style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "600" }}>{opt.label}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === "upi" && (
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. name@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "11px 14px",
                      background: "rgba(51,65,85,0.5)",
                      border: "1px solid rgba(100,116,139,0.5)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                )}

                {paymentMethod === "card" && (
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input type="text" placeholder="Card Number" value={cardDetails.cardNumber} onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })} style={{ padding: "11px 14px", background: "rgba(51,65,85,0.5)", border: "1px solid rgba(100,116,139,0.5)", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <input type="text" placeholder="Expiry (MM/YY)" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} style={{ padding: "11px 14px", background: "rgba(51,65,85,0.5)", border: "1px solid rgba(100,116,139,0.5)", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none" }} />
                      <input type="text" placeholder="CVV" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} style={{ padding: "11px 14px", background: "rgba(51,65,85,0.5)", border: "1px solid rgba(100,116,139,0.5)", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
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
                    <span style={{ color: "#94a3b8", fontSize: "14px" }}>Items ({displayItems.length})</span>
                    <span style={{ color: "#e2e8f0", fontWeight: "600" }}>Rs.{totalAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8", fontSize: "14px" }}>Shipping</span>
                    <span style={{ color: "#10b981", fontWeight: "600" }}>Free</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px" }}>Total</span>
                  <span style={{ color: "#c084fc", fontWeight: "900", fontSize: "20px" }}>Rs.{totalAmount.toLocaleString()}</span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={placing || displayItems.length === 0}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: placing || displayItems.length === 0 ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "15px",
                    cursor: placing || displayItems.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </button>
                <p style={{ color: "#475569", fontSize: "11px", textAlign: "center", marginTop: "10px" }}>
                  OTP will be sent to your email on order placement
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bill;
