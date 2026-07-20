"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function EditProductDetails() {
  const { productId } = useParams();
  const router = useRouter();
  const [Title, setTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [Price, setPrice] = useState("");
  const [Category, setCategory] = useState("");
  const [Quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    // Optionally pre-populate current details
    fetch(`${API}/products/getproductdetailsforproductpage/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          setTitle(d.data.Title || "");
          setDescription(d.data.Description || "");
          setPrice(d.data.Price || "");
          setCategory(d.data.Category || "");
          setQuantity(d.data.Quantity || "");
        }
      })
      .catch(() => {});
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiFetch(
      `${API}/products/updateProduct/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ Title, Description, Price, Category, Quantity }),
      }
    );
    if (result.ok) {
      showAlert("Product updated successfully!", "success");
      setTimeout(() => router.push("/seller?tab=products"), 1200);
    } else {
      showAlert(result.message);
    }
    setLoading(false);
  };

  const inputStyle = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />

      {alert && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="rounded-3xl border p-9 backdrop-blur-xl shadow-xl" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="text-center text-2xl font-black mb-7 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Update Product Details
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: "Title", type: "text", value: Title, setter: setTitle, placeholder: "Product title" },
              { label: "Price (Rs.)", type: "number", value: Price, setter: setPrice, placeholder: "0" },
              { label: "Category", type: "text", value: Category, setter: setCategory, placeholder: "e.g. Electronics" },
              { label: "Quantity", type: "number", value: Quantity, setter: setQuantity, placeholder: "0" },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
                  {field.label}
                </label>
                <input
                  className={inputStyle}
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
                Description
              </label>
              <textarea
                value={Description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Product description"
                required
                className={`${inputStyle} resize-vertical`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3.5 rounded-xl font-bold text-base text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
              style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </form>

          <p className="text-center mt-5 text-sm">
            <Link href="/seller?tab=products" className="text-purple-500 font-bold hover:text-purple-400">
              Back to Your Products
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
