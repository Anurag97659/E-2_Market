"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

function BillContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    if (directBuyProductId) {
      fetch(`${API}/products/getproductdetailsforproductpage/${directBuyProductId}`)
        .then((r) => r.json())
        .then((d) => {
          setDirectProduct(d?.data || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch(`${API}/users/getusercartlist`, { credentials: "include" })
        .then((r) => {
          if (r.status === 401) { router.push("/login"); return; }
          return r.json();
        })
        .then((d) => {
          setCartItems(d?.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [directBuyProductId, router]);

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

    const result = await apiFetch(`${API}/users/addtoOrder`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (result.ok) {
      setOrderSuccess(true);
      showAlert("Order placed! OTP sent to your email.", "success");
    } else {
      showAlert(result.message);
    }
    setPlacing(false);
  };

  const inputStyle = "w-full px-4 py-3 rounded-xl text-sm outline-none mt-3";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />

      {alert && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      {orderSuccess ? (
        <div className="max-w-md mx-auto mt-16 px-6 text-center">
          <div className="rounded-3xl border p-12 backdrop-blur-xl shadow-xl bg-emerald-500/5 border-emerald-500/20">
            <div className="text-5xl text-emerald-400 mb-4">✓</div>
            <h2 className="text-emerald-400 font-black text-2xl mb-3">Order Placed!</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Your order has been placed. Check your email for the delivery OTP. You can also find the OTP in your Orders section.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/orders" className="px-5 py-3 rounded-xl text-sm font-bold text-white text-center hover:opacity-90" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>View Orders</Link>
              <Link href="/" className="px-5 py-3 rounded-xl text-sm font-bold border text-purple-400 hover:bg-purple-500/10 transition-colors" style={{ borderColor: "rgba(139,92,246,0.4)" }}>Continue Shopping</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {directBuyProductId ? "Buy Now" : "Checkout"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border p-5 backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-main)" }}>Order Items</h3>
                {loading ? (
                  <p className="text-center py-5" style={{ color: "var(--text-muted)" }}>Loading...</p>
                ) : displayItems.length === 0 ? (
                  <p className="text-center py-5" style={{ color: "var(--text-muted)" }}>{directBuyProductId ? "Product not found" : "Your cart is empty"}</p>
                ) : (
                  displayItems.map((item, i) => (
                    <div key={i} className="flex gap-4 py-3" style={{ borderBottom: i < displayItems.length - 1 ? "1px solid var(--card-border)" : "none" }}>
                      <img src={item.product?.Thumbnail} alt={item.product?.Title} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-main)" }}>{item.product?.Title}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Rs.{item.price} x {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm text-purple-400">Rs.{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl border p-5 backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-main)" }}>Payment Method</h3>
                <div className="flex flex-col gap-2.5">
                  {[
                    { value: "upi", label: "UPI" },
                    { value: "card", label: "Credit / Debit Card" },
                    { value: "emi", label: "EMI" },
                    { value: "cod", label: "Cash on Delivery (COD)" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200" style={{ background: paymentMethod === opt.value ? "rgba(124,58,237,0.12)" : "rgba(15,23,42,0.4)", borderColor: paymentMethod === opt.value ? "rgba(139,92,246,0.5)" : "var(--card-border)" }}>
                      <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-purple-500" />
                      <span className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>{opt.label}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === "upi" && (
                  <input type="text" placeholder="Enter UPI ID (e.g. name@upi)" value={upiId} onChange={(e) => setUpiId(e.target.value)} className={inputStyle} />
                )}

                {paymentMethod === "card" && (
                  <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Card Number" value={cardDetails.cardNumber} onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })} className={inputStyle} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Expiry (MM/YY)" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" />
                      <input type="text" placeholder="CVV" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="rounded-2xl border p-6 sticky top-20" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <h3 className="font-bold text-sm mb-5" style={{ color: "var(--text-main)" }}>Order Summary</h3>
                <div className="flex flex-col gap-3 mb-5 pb-5 border-b" style={{ borderColor: "var(--card-border)" }}>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Items ({displayItems.length})</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>Rs.{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Shipping</span>
                    <span className="text-sm font-semibold text-emerald-400">Free</span>
                  </div>
                </div>
                <div className="flex justify-between mb-5">
                  <span className="text-sm font-bold" style={{ color: "var(--text-main)" }}>Total</span>
                  <span className="text-lg font-black text-purple-400">Rs.{totalAmount.toLocaleString()}</span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={placing || displayItems.length === 0}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: placing || displayItems.length === 0 ? "#4b5563" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </button>
                <p className="text-center text-[10px] mt-2.5" style={{ color: "var(--text-muted)" }}>OTP will be sent to your email on order placement</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Bill() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading checkout...</div>}>
      <BillContent />
    </Suspense>
  );
}
