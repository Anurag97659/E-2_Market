"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function Search() {
  const [result, setResult] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const showAlert = (msg, type = "error") => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 4000); };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    const query = new URLSearchParams({ search: searchQuery, category, minPrice, maxPrice, sortBy, sortOrder }).toString();
    const result = await apiFetch(`${API}/products/search?${query}`, { credentials: "include" });
    if (result.ok) setResult(Array.isArray(result.data) ? result.data : []);
    else showAlert(result.message);
    setSearched(true); setLoading(false);
  };

  const addToCart = async (productId) => {
    const result = await apiFetch(`${API}/products/addToCart`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: 1 }) });
    if (result.ok) showAlert("Added to cart successfully", "success");
    else if (result.message === "Network error. Please check your connection.") showAlert(result.message);
    else router.push("/login");
  };

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />
      {alert && (<div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>{alert.msg}</div>)}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Search Products</h1>
        <div className="rounded-2xl border p-6 mb-7 backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex gap-2.5">
              <input className={`${inputCls} flex-1`} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for products, categories..." />
              <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60 whitespace-nowrap" style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#7c3aed,#a855f7)" }}>{loading ? "Searching..." : "Search"}</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div><label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Min Price</label><input className={inputCls} type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Max Price</label><input className={inputCls} type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Category</label><input className={inputCls} type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Sort By</label>
                <select className={inputCls} value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="">Default</option><option value="Price">Price</option><option value="Title">Name</option></select>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Order</label>
                <select className={inputCls} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}><option value="asc">Ascending</option><option value="desc">Descending</option></select>
              </div>
            </div>
          </form>
        </div>

        {searched && (
          result.length > 0 ? (
            <>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{result.length} product(s) found</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {result.map((product) => (
                  <div key={product._id} className="rounded-xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                    <Link href={`/product_page/${product._id}`} className="block"><img src={product.Thumbnail} alt={product.Title} className="w-full h-44 object-cover" /></Link>
                    <div className="p-3.5 flex-1 flex flex-col">
                      <Link href={`/product_page/${product._id}`} style={{ textDecoration: "none" }}><h3 className="font-bold text-sm mb-1.5" style={{ color: "var(--text-main)" }}>{product.Title}</h3></Link>
                      <p className="text-purple-400 font-extrabold text-base mb-1">Rs.{product.Price}</p>
                      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{product.Category}</p>
                      <div className="mt-auto flex gap-1.5">
                        <button onClick={() => router.push(`/bill?directBuy=${product._id}`)} className="flex-1 py-2 rounded-lg font-bold text-xs text-white" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>Buy Now</button>
                        <button onClick={() => addToCart(product._id)} className="flex-1 py-2 rounded-lg font-bold text-xs text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>Add to Cart</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (<div className="text-center py-14" style={{ color: "var(--text-muted)" }}>No products found for your search.</div>)
        )}
      </div>
    </div>
  );
}
