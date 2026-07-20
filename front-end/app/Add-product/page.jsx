"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleGallery = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setGalleryImages(files);
    setGalleryPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeGalleryImage = (idx) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!thumbnail) { showAlert("Thumbnail image is required"); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", description);
    formData.append("Price", price);
    formData.append("Category", category);
    formData.append("Quantity", quantity);
    formData.append("Thumbnail", thumbnail);
    galleryImages.forEach((img) => formData.append("Images", img));

    const result = await apiFetch(`${API}/products/registerProduct`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (result.ok) {
      showAlert("Product added successfully!", "success");
      setTimeout(() => router.push("/seller?tab=products"), 1200);
    } else {
      showAlert(result.message);
    }
    setLoading(false);
  };

  const inputStyle = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none";
  const labelStyle = "block text-xs font-bold uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />

      {alert && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border whitespace-nowrap ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="rounded-3xl border p-9 backdrop-blur-xl shadow-xl" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="text-center text-2xl font-black mb-7 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Add New Product
          </h2>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className={labelStyle} style={{ color: "var(--text-muted)" }}>Product Title</label>
              <input className={inputStyle} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product title" required />
            </div>

            <div>
              <label className={labelStyle} style={{ color: "var(--text-muted)" }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed product description..."
                rows={4}
                required
                className={`${inputStyle} resize-vertical`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelStyle} style={{ color: "var(--text-muted)" }}>Price (Rs.)</label>
                <input className={inputStyle} type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" required />
              </div>
              <div>
                <label className={labelStyle} style={{ color: "var(--text-muted)" }}>Quantity</label>
                <input className={inputStyle} type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" required />
              </div>
              <div>
                <label className={labelStyle} style={{ color: "var(--text-muted)" }}>Category</label>
                <input className={inputStyle} type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" required />
              </div>
            </div>

            <div>
              <label className={labelStyle} style={{ color: "var(--text-muted)" }}>Thumbnail Image (required)</label>
              <input type="file" accept="image/*" onChange={handleThumbnail} className={inputStyle} />
              {thumbnailPreview && (
                <div className="mt-3">
                  <img src={thumbnailPreview} alt="thumbnail preview" className="w-28 h-28 object-cover rounded-lg border-2 border-purple-500/40" />
                </div>
              )}
            </div>

            <div>
              <label className={labelStyle} style={{ color: "var(--text-muted)" }}>Gallery Images (up to 5, optional)</label>
              <input type="file" accept="image/*" multiple onChange={handleGallery} className={inputStyle} />
              {galleryPreviews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {galleryPreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt={`gallery-${i}`} className="w-20 h-20 object-cover rounded-lg border border-purple-500/30" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border-none text-white text-xs cursor-pointer flex items-center justify-center font-bold"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3.5 rounded-xl font-bold text-base text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
              style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}
            >
              {loading ? "Uploading..." : "Add Product"}
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
