"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function EditProductImage() {
  const { productId } = useParams();
  const router = useRouter();
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) { setThumbnail(file); setThumbnailPreview(URL.createObjectURL(file)); }
  };

  const handleGallery = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setGalleryImages(files);
    setGalleryPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!thumbnail && galleryImages.length === 0) {
      showAlert("Select at least one image");
      return;
    }
    const formData = new FormData();
    if (thumbnail) formData.append("Thumbnail", thumbnail);
    galleryImages.forEach((img) => formData.append("Images", img));

    setLoading(true);
    const result = await apiFetch(
      `${API}/products/updateImage/${productId}`,
      { method: "PUT", credentials: "include", body: formData }
    );
    if (result.ok) {
      showAlert("Images updated successfully!", "success");
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

      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="rounded-3xl border p-9 backdrop-blur-xl shadow-xl" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="text-center text-2xl font-black mb-7 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Update Product Images
          </h2>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
                Thumbnail Image
              </label>
              <input type="file" accept="image/*" onChange={handleThumbnail} className={inputStyle} />
              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="thumbnail preview" className="w-24 h-24 object-cover rounded-lg mt-3 border-2 border-purple-500/40" />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
                Gallery Images (up to 5)
              </label>
              <input type="file" accept="image/*" multiple onChange={handleGallery} className={inputStyle} />
              {galleryPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {galleryPreviews.map((src, i) => (
                    <img key={i} src={src} alt={`gallery-${i}`} className="w-16 h-16 object-cover rounded-lg border border-purple-500/30" />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="py-3.5 rounded-xl font-bold text-base text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
              style={{ background: loading ? "#6b7280" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)" }}
            >
              {loading ? "Uploading..." : "Update Images"}
            </button>
          </div>

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
