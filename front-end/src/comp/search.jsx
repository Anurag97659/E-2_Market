import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import apiFetch from "../utils/apiFetch";

function Search() {
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
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const query = new URLSearchParams({ search: searchQuery, category, minPrice, maxPrice, sortBy, sortOrder }).toString();
    const result = await apiFetch(`http://localhost:8000/e-2market/v1/products/search?${query}`, { credentials: "include" });
    if (result.ok) setResult(Array.isArray(result.data) ? result.data : []);
    else showAlert(result.message);
    setSearched(true);
    setLoading(false);
  };

  const addToCart = async (productId) => {
    const result = await apiFetch("http://localhost:8000/e-2market/v1/products/addToCart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (result.ok) showAlert("Added to cart successfully", "success");
    else if (result.message === "Network error. Please check your connection.") showAlert(result.message);
    else { navigate("/login"); }
  };

  const inputStyle = {
    padding: "10px 14px",
    background: "rgba(51,65,85,0.5)",
    border: "1px solid rgba(100,116,139,0.4)",
    borderRadius: "10px",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    width: "100%",
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

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{
          fontSize: "26px",
          fontWeight: "900",
          background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "24px",
        }}>
          Search Products
        </h1>

        {/* Search form */}
        <div style={{
          background: "rgba(30,27,75,0.6)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "28px",
        }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, categories..."
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 24px",
                  background: loading ? "#374151" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Min Price</label>
                <input style={inputStyle} type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Max Price</label>
                <input style={inputStyle} type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Category</label>
                <input style={inputStyle} type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Sort By</label>
                <select style={inputStyle} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="">Default</option>
                  <option value="Price">Price</option>
                  <option value="Title">Name</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Order</label>
                <select style={inputStyle} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {searched && (
          result.length > 0 ? (
            <>
              <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>{result.length} product(s) found</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "18px" }}>
                {result.map((product) => (
                  <div
                    key={product._id}
                    style={{
                      background: "rgba(30,27,75,0.6)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      borderRadius: "14px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s,box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 32px rgba(139,92,246,0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <Link to={`/product_page/${product._id}`} style={{ display: "block" }}>
                      <img src={product.Thumbnail} alt={product.Title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                    </Link>
                    <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <Link to={`/product_page/${product._id}`} style={{ textDecoration: "none" }}>
                        <h3 style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "14px", marginBottom: "6px", lineHeight: "1.3" }}>{product.Title}</h3>
                      </Link>
                      <p style={{ color: "#c084fc", fontWeight: "800", fontSize: "18px", marginBottom: "6px" }}>Rs.{product.Price}</p>
                      <p style={{ color: "#64748b", fontSize: "11px", marginBottom: "12px" }}>{product.Category}</p>
                      <div style={{ marginTop: "auto", display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => navigate(`/bill?directBuy=${product._id}`)}
                          style={{ flex: 1, padding: "8px 0", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={() => addToCart(product._id)}
                          style={{ flex: 1, padding: "8px 0", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
              No products found for your search.
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Search;
