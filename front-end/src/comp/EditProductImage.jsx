import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";

function EditProductImage() {
  const { productId } = useParams();
  const navigate = useNavigate();
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
    try {
      const response = await fetch(
        `http://localhost:8000/e-2market/v1/products/updateImage/${productId}`,
        { method: "PUT", credentials: "include", body: formData }
      );
      const data = await response.json();
      if (response.ok) {
        showAlert("Images updated successfully!", "success");
        setTimeout(() => navigate("/seller?tab=products"), 1200);
      } else showAlert(data.message || "Update failed");
    } catch { showAlert("Network error"); }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(51,65,85,0.5)",
    border: "1px solid rgba(100,116,139,0.5)",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>
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

      <div style={{ maxWidth: "540px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{
          background: "rgba(30,27,75,0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(139,92,246,0.25)",
          padding: "36px",
        }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "900",
            background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "28px",
          }}>
            Update Product Images
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Thumbnail */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                Thumbnail Image
              </label>
              <input type="file" accept="image/*" onChange={handleThumbnail} style={inputStyle} />
              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="thumbnail preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px", marginTop: "10px", border: "2px solid rgba(139,92,246,0.4)" }} />
              )}
            </div>

            {/* Gallery */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                Gallery Images (up to 5)
              </label>
              <input type="file" accept="image/*" multiple onChange={handleGallery} style={inputStyle} />
              {galleryPreviews.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                  {galleryPreviews.map((src, i) => (
                    <img key={i} src={src} alt={`gallery-${i}`} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(139,92,246,0.3)" }} />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "13px",
                background: loading ? "#374151" : "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Uploading..." : "Update Images"}
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
            <Link to="/seller?tab=products" style={{ color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>
              Back to Your Products
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EditProductImage;
