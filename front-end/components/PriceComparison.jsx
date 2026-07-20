"use client";
import React, { useState } from "react";
import apiFetch, { API_BASE } from "@/utils/apiFetch";

const formatPrice = (price, currency = "INR") => price === null || price === undefined
  ? "Not available"
  : new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);

export default function PriceComparison({ productId }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const comparePrices = async () => {
    setLoading(true); setError("");
    const result = await apiFetch(`${API_BASE}/products/${productId}/compare-prices`);
    if (result.ok) setComparison(result.data);
    else setError(result.message || "Could not compare prices right now.");
    setLoading(false);
  };

  const filteredListings = comparison
    ? comparison.listings.filter((l) => l.price !== null && l.availability !== "not_found")
    : [];
  const hasExternalListings = filteredListings.some((l) => l.platform !== "E-2 Market");

  return (
    <section className="mb-12 border rounded-2xl p-6 backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex gap-4 items-center justify-between flex-wrap mb-4">
        <div>
          <h2 className="m-0 text-xl font-bold" style={{ color: "var(--text-main)" }}>Compare prices</h2>
          <p className="m-1.5 text-xs" style={{ color: "var(--text-muted)" }}>Compare popular Indian platforms, sorted from cheapest to highest.</p>
        </div>
        <button onClick={comparePrices} disabled={loading} className="px-5 py-3 rounded-xl text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50" style={{ background: loading ? "#4b5563" : "linear-gradient(135deg,#0ea5e9,#6366f1)" }}>
          {loading ? "Searching prices..." : "Compare Prices"}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      {comparison && <>
        {!comparison.providerConfigured && <p className="text-amber-400 bg-amber-500/10 rounded-lg p-3 text-xs mb-4">Live marketplace search needs a SERPAPI_KEY on the backend. Your E-2 Market price is shown below; add the key to enable retailer listings and images.</p>}
        {hasExternalListings ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[850px] text-sm text-left">
              <thead>
                <tr className="bg-slate-500/10 text-slate-400">
                  {["Platform", "Image", "Item name", "Price", "Delivery", "Rating", "Link"].map((heading) => <th key={heading} className="p-3 border-b border-purple-500/20">{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.platform} style={{ color: "var(--text-main)" }}>
                    <td className="p-3 border-b border-purple-500/10 font-bold">{listing.platform}</td>
                    <td className="p-2 border-b border-purple-500/10">{listing.image ? <img src={listing.image} alt={`${listing.platform} product`} className="w-12 h-12 object-contain rounded bg-white border" /> : <span className="text-slate-500">—</span>}</td>
                    <td className="p-3 border-b border-purple-500/10 max-w-[240px] truncate">{listing.itemName}</td>
                    <td className="p-3 border-b border-purple-500/10 font-bold text-emerald-400">{formatPrice(listing.price, listing.currency)}</td>
                    <td className="p-3 border-b border-purple-500/10" style={{ color: "var(--text-muted)" }}>{listing.delivery || "—"}</td>
                    <td className="p-3 border-b border-purple-500/10 text-amber-400">{listing.rating ? `${listing.rating}${listing.reviews ? ` (${listing.reviews})` : ""}` : "—"}</td>
                    <td className="p-3 border-b border-purple-500/10">{listing.url ? <a href={listing.url} target="_blank" rel="noreferrer" className="text-purple-500 font-bold">View offer</a> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm mt-3 italic" style={{ color: "var(--text-muted)" }}>No comparison details are currently available on other platforms for this specific product model.</p>
        )}
        <p className="text-[10px] mt-3.5" style={{ color: "var(--text-muted)" }}>Prices and availability were captured on {new Date(comparison.comparedAt).toLocaleString()}. Verify the final price and delivery charge on the retailer’s page.</p>
      </>}
    </section>
  );
}
