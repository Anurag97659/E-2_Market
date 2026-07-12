import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/users/getProfile", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => { if (d.statusCode === 200) setUser(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/products/getAllProducts", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setProducts(d?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = (productId) => {
    if (!user) { navigate("/login"); return; }
    fetch("http://localhost:8000/e-2market/v1/products/addToCart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.statusCode === 200) showAlert("Added to cart", "success");
        else showAlert(d.message || "Failed to add to cart");
      })
      .catch(() => showAlert("Failed to add to cart"));
  };

  const stars = (avg) => {
    const full = Math.floor(avg);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>
      <Navbar />

      {/* Alert */}
      {alert && (
        <div style={{
          position: "fixed",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: alert.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${alert.type === "success" ? "#10b981" : "#ef4444"}`,
          color: alert.type === "success" ? "#6ee7b7" : "#fca5a5",
          padding: "12px 28px",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "14px",
          zIndex: 300,
          backdropFilter: "blur(12px)",
        }}>
          {alert.msg}
        </div>
      )}

      {/* Hero */}
      {!user && (
        <div style={{
          textAlign: "center",
          padding: "60px 24px 40px",
          borderBottom: "1px solid rgba(139,92,246,0.15)",
        }}>
          <h1 style={{
            fontSize: "clamp(32px,5vw,56px)",
            fontWeight: "900",
            background: "linear-gradient(90deg,#60a5fa,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 12px",
          }}>
            E-2 Market
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "18px", marginBottom: "28px" }}>
            Buy and sell products easily. Log in to add to cart or buy.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link to="/login" style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "15px",
            }}>
              Login
            </Link>
            <Link to="/registration" style={{
              border: "1px solid rgba(139,92,246,0.5)",
              color: "#c084fc",
              padding: "12px 28px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "15px",
            }}>
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        <h2 style={{
          color: "#e2e8f0",
          fontWeight: "800",
          fontSize: "22px",
          marginBottom: "24px",
        }}>
          {user ? "Products for You" : "Browse Products"}
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8", fontSize: "18px" }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#64748b", fontSize: "16px" }}>
            No products available right now.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
            gap: "20px",
          }}>
            {products.map((product) => {
              const avgRating = product.averageRating || 0;
              const reviewCount = product.reviews?.length || 0;
              return (
                <div
                  key={product._id}
                  style={{
                    background: "rgba(30,27,75,0.6)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s,box-shadow 0.2s",
                    backdropFilter: "blur(10px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(139,92,246,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Link to={`/product_page/${product._id}`} style={{ display: "block" }}>
                    <img
                      src={product.Thumbnail}
                      alt={product.Title}
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                    />
                  </Link>
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <Link
                      to={`/product_page/${product._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <h3 style={{
                        color: "#e2e8f0",
                        fontWeight: "700",
                        fontSize: "15px",
                        marginBottom: "6px",
                        lineHeight: "1.3",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {product.Title}
                      </h3>
                    </Link>

                    {reviewCount > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                        <span style={{ color: "#f59e0b", fontSize: "13px", letterSpacing: "1px" }}>
                          {stars(avgRating)}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>({reviewCount})</span>
                      </div>
                    )}

                    <p style={{
                      color: "#94a3b8",
                      fontSize: "12px",
                      marginBottom: "8px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {product.Description}
                    </p>

                    <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>
                      {product.Category}
                    </p>

                    <p style={{
                      color: "#a5b4fc",
                      fontSize: "11px",
                      marginBottom: "12px",
                    }}>
                      {product.Quantity > 0 ? `${product.Quantity} in stock` : "Out of stock"}
                    </p>

                    <div style={{ marginTop: "auto" }}>
                      <p style={{
                        fontSize: "20px",
                        fontWeight: "800",
                        color: "#c084fc",
                        marginBottom: "12px",
                      }}>
                        Rs.{product.Price}
                      </p>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            if (!user) { navigate("/login"); return; }
                            navigate(`/bill?directBuy=${product._id}`);
                          }}
                          disabled={product.Quantity === 0}
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            background: product.Quantity === 0 ? "#374151" : "linear-gradient(135deg,#f59e0b,#d97706)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: product.Quantity === 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={() => addToCart(product._id)}
                          disabled={product.Quantity === 0}
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            background: product.Quantity === 0 ? "#374151" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: product.Quantity === 0 ? "not-allowed" : "pointer",
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

export default Home;
