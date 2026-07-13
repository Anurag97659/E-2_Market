import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import apiFetch from "../utils/apiFetch";

function EditProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiFetch(
      `http://localhost:8000/e-2market/v1/products/updateProduct/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ Title, Description, Price, Category, Quantity }),
      }
    );
    if (result.ok) {
      showAlert("Product updated successfully!", "success");
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

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
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
            fontSize: "24px",
            fontWeight: "900",
            background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "28px",
          }}>
            Update Product Details
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Title", type: "text", value: Title, setter: setTitle, placeholder: "Product title" },
              { label: "Price (Rs.)", type: "number", value: Price, setter: setPrice, placeholder: "0" },
              { label: "Category", type: "text", value: Category, setter: setCategory, placeholder: "e.g. Electronics" },
              { label: "Quantity", type: "number", value: Quantity, setter: setQuantity, placeholder: "0" },
            ].map((field) => (
              <div key={field.label}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                  {field.label}
                </label>
                <input
                  style={inputStyle}
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                Description
              </label>
              <textarea
                value={Description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Product description"
                required
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
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
                marginTop: "8px",
              }}
            >
              {loading ? "Updating..." : "Update Product"}
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

export default EditProductDetails;
