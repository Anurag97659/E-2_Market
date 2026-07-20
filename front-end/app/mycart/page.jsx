"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function MyCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    fetch(`${API}/users/getusercartlist`, {
      credentials: "include",
    })
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return; }
        return r.json();
      })
      .then((d) => {
        setCartItems(d?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) { removeFromCart(productId); return; }
    const result = await apiFetch(`${API}/products/addToCart`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: newQty }),
    });
    if (result.ok) {
      setCartItems((prev) =>
        prev.map((item) =>
          (item.product?._id || item.product) === productId
            ? { ...item, quantity: newQty }
            : item
        )
      );
    } else {
      showAlert(result.message);
    }
  };

  const removeFromCart = async (productId) => {
    const result = await apiFetch(`${API}/products/removeFromCart`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (result.ok) {
      setCartItems((prev) => prev.filter((item) => (item.product?._id || item.product) !== productId));
      showAlert("Item removed from cart", "success");
    } else {
      showAlert(result.message);
    }
  };

  const totalAmount = cartItems.reduce((acc, item) => {
    const price = item.product?.Price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />

      {alert && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Shopping Cart
        </h1>

        {loading ? (
          <div className="text-center py-14" style={{ color: "var(--text-muted)" }}>Loading cart...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
            <div>
              {cartItems.length === 0 ? (
                <div className="rounded-2xl border p-14 text-center backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <p className="text-base mb-4" style={{ color: "var(--text-muted)" }}>Your cart is empty.</p>
                  <Link href="/" className="text-purple-500 font-bold hover:text-purple-400">Browse Products</Link>
                </div>
              ) : (
                <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  {cartItems.map((item, i) => {
                    const product = item.product || {};
                    const productId = product._id || item.product;
                    const qty = item.quantity || 1;
                    const price = product.Price || 0;
                    return (
                      <div
                        key={productId}
                        className="flex gap-4 p-5"
                        style={{ borderBottom: i < cartItems.length - 1 ? "1px solid var(--card-border)" : "none" }}
                      >
                        <Link href={`/product_page/${productId}`} className="block flex-shrink-0">
                          <img
                            src={product.Thumbnail}
                            alt={product.Title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link href={`/product_page/${productId}`} style={{ textDecoration: "none" }}>
                            <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text-main)" }}>
                              {product.Title}
                            </h3>
                          </Link>
                          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{product.Category}</p>
                          <p className="font-extrabold text-base mb-3 text-purple-400">
                            Rs.{price.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-lg border overflow-hidden" style={{ background: "rgba(51,65,85,0.5)", borderColor: "rgba(139,92,246,0.3)" }}>
                              <button onClick={() => updateQuantity(productId, qty - 1)} className="w-8 h-8 bg-transparent border-none text-white text-base font-bold cursor-pointer">-</button>
                              <span className="min-w-9 text-center text-white text-sm font-bold">{qty}</span>
                              <button onClick={() => updateQuantity(productId, qty + 1)} className="w-8 h-8 bg-transparent border-none text-white text-base font-bold cursor-pointer">+</button>
                            </div>
                            <button
                              onClick={() => removeFromCart(productId)}
                              className="px-3.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
                              style={{ background: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.3)", color: "#fca5a5" }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-base text-purple-400">
                            Rs.{(price * qty).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="rounded-2xl border p-6 sticky top-20" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <h3 className="font-bold text-sm mb-5" style={{ color: "var(--text-main)" }}>
                  Order Summary
                </h3>
                <div className="flex flex-col gap-3 mb-5 pb-5 border-b" style={{ borderColor: "var(--card-border)" }}>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Subtotal ({cartItems.length} items)</span>
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
                <Link
                  href="/bill"
                  className="block py-3 rounded-xl font-bold text-sm text-white text-center hover:opacity-90 transition-opacity"
                  style={{
                    background: cartItems.length === 0 ? "#4b5563" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                    pointerEvents: cartItems.length === 0 ? "none" : "auto",
                  }}
                >
                  Proceed to Checkout
                </Link>
                <Link href="/" className="block text-center mt-3 text-xs font-semibold hover:text-purple-400" style={{ color: "var(--text-muted)" }}>
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
