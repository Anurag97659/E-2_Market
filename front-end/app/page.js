"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  useEffect(() => {
    fetch(`${API}/users/getProfile`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.statusCode === 200) setUser(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/products/getAllProducts`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setProducts(d?.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = async (productId) => {
    if (!user) { router.push("/login"); return; }
    const result = await apiFetch(`${API}/products/addToCart`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (result.ok) showAlert("Added to cart successfully", "success");
    else showAlert(result.message);
  };

  const stars = (avg) => {
    const full = Math.floor(avg);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />

      {/* Alert */}
      {alert && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border ${
            alert.type === "success"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
              : "bg-red-500/15 border-red-500 text-red-300"
          }`}
        >
          {alert.msg}
        </div>
      )}

      {/* Hero (guest only) */}
      {!user && (
        <div
          className="text-center px-6 py-16 border-b"
          style={{ borderColor: "rgba(139,92,246,0.15)" }}
        >
          <div className="flex justify-center mb-4 animate-bounce">
            <img src="/icon.png" alt="E-2 Market Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            E-2 Market
          </h1>
          <p className="text-slate-400 text-lg mb-7">
            Buy and sell products easily. Log in to add to cart or buy.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="bg-gradient-to-r from-violet-700 to-purple-500 text-white px-7 py-3 rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
            >
              Login
            </Link>
            <Link
              href="/registration"
              className="border text-purple-400 px-7 py-3 rounded-xl font-bold text-base hover:bg-purple-500/10 transition-colors"
              style={{ borderColor: "rgba(139,92,246,0.5)" }}
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="font-extrabold text-xl mb-6" style={{ color: "var(--text-main)" }}>
          {user ? "Products for You" : "Browse Products"}
        </h2>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-lg">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-base">No products available right now.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {products.map((product) => {
              const avgRating = product.averageRating || 0;
              const reviewCount = product.reviews?.length || 0;
              return (
                <div
                  key={product._id}
                  className="rounded-2xl overflow-hidden flex flex-col border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm cursor-pointer"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <Link href={`/product_page/${product._id}`} className="block">
                    <img
                      src={product.Thumbnail}
                      alt={product.Title}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <Link href={`/product_page/${product._id}`} style={{ textDecoration: "none" }}>
                      <h3
                        className="font-bold text-sm mb-1.5 leading-snug line-clamp-2"
                        style={{ color: "var(--text-main)" }}
                      >
                        {product.Title}
                      </h3>
                    </Link>

                    {reviewCount > 0 && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-amber-400 text-xs tracking-wide">{stars(avgRating)}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>({reviewCount})</span>
                      </div>
                    )}

                    <p
                      className="text-xs mb-2 line-clamp-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {product.Description}
                    </p>
                    <p className="text-slate-500 text-xs mb-1">{product.Category}</p>
                    <p className="text-indigo-400 text-xs mb-3">
                      {product.Quantity > 0 ? `${product.Quantity} in stock` : "Out of stock"}
                    </p>

                    <div className="mt-auto">
                      <p className="text-lg font-extrabold text-purple-400 mb-3">
                        Rs.{product.Price}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!user) { router.push("/login"); return; }
                            router.push(`/bill?directBuy=${product._id}`);
                          }}
                          disabled={product.Quantity === 0}
                          className="flex-1 py-2 rounded-lg font-bold text-xs text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: product.Quantity === 0 ? "#374151" : "linear-gradient(135deg,#f59e0b,#d97706)",
                          }}
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={() => addToCart(product._id)}
                          disabled={product.Quantity === 0}
                          className="flex-1 py-2 rounded-lg font-bold text-xs text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: product.Quantity === 0 ? "#374151" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
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
