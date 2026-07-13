import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import apiFetch from "../utils/apiFetch";

function Product() {
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
  const navigate = useNavigate();

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

    const result = await apiFetch("http://localhost:8000/e-2market/v1/products/registerProduct", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (result.ok) {
      showAlert("Product added successfully!", "success");
      setTimeout(() => navigate("/seller?tab=products"), 1200);
    } else {
      showAlert(result.message);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(51,65,85,0.5)",
    border: "1px solid rgba(100,116,139,0.5)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
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
          whiteSpace: "nowrap",
        }}>
          {alert.msg}
        </div>
      )}

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 24px" }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "rgba(30,27,75,0.7)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(139,92,246,0.25)",
            padding: "36px",
          }}
        >
          <h2 style={{
            textAlign: "center",
            fontSize: "26px",
            fontWeight: "900",
            background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "28px",
          }}>
            Add New Product
          </h2>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Product Title</label>
              <input style={inputStyle} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product title" required />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed product description..."
                rows={4}
                required
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Price (Rs.)</label>
                <input style={inputStyle} type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" required />
              </div>
              <div>
                <label style={labelStyle}>Quantity</label>
                <input style={inputStyle} type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" required />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <input style={inputStyle} type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" required />
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label style={labelStyle}>Thumbnail Image (required)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnail}
                style={{ ...inputStyle, color: "#94a3b8" }}
              />
              {thumbnailPreview && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={thumbnailPreview}
                    alt="thumbnail preview"
                    style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "10px", border: "2px solid rgba(139,92,246,0.4)" }}
                  />
                </div>
              )}
            </div>

            {/* Gallery images */}
            <div>
              <label style={labelStyle}>Gallery Images (up to 5, optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGallery}
                style={{ ...inputStyle, color: "#94a3b8" }}
              />
              {galleryPreviews.length > 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  {galleryPreviews.map((src, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={src}
                        alt={`gallery-${i}`}
                        style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(139,92,246,0.3)" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#dc2626",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
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
              style={{
                padding: "14px",
                background: loading ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
              }}
            >
              {loading ? "Uploading..." : "Add Product"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
            <Link to="/seller?tab=products" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>
              Back to Your Products
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Product;
