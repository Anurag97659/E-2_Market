import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";

function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [userOrders, setUserOrders] = useState([]);

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/users/getProfile", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.statusCode === 200) setUser(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8000/e-2market/v1/products/getproductdetailsforproductpage/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d?.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!user) return;
    fetch("http://localhost:8000/e-2market/v1/users/getorderlist", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const orders = d?.data || [];
        setUserOrders(orders);
        const hasDelivered = orders.some(
          (o) => o.product?._id === productId && o.status === "delivered" && !o.review
        );
        setCanReview(hasDelivered);
      })
      .catch(() => {});
  }, [user, productId]);

  const addToCart = () => {
    if (!user) { navigate("/login"); return; }
    fetch("http://localhost:8000/e-2market/v1/products/addToCart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.statusCode === 200) showAlert("Added to cart", "success");
        else showAlert(d.message || "Failed to add to cart");
      })
      .catch(() => showAlert("Failed to add to cart"));
  };

  const buyNow = () => {
    if (!user) { navigate("/login"); return; }
    navigate(`/bill?directBuy=${productId}&qty=${quantity}`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const res = await fetch("http://localhost:8000/e-2market/v1/users/addReview", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("Review submitted!", "success");
        setCanReview(false);
        // Refresh product to show new review
        fetch(`http://localhost:8000/e-2market/v1/products/getproductdetailsforproductpage/${productId}`)
          .then((r) => r.json())
          .then((d) => setProduct(d?.data || product));
      } else showAlert(data.message || "Failed to submit review");
    } catch { showAlert("Network error"); }
    setReviewLoading(false);
  };

  const allImages = product ? [product.Thumbnail, ...(product.Images || [])].filter(Boolean) : [];
  const avgRating = product?.averageRating || 0;
  const reviewCount = product?.reviews?.length || 0;

  const stars = (rating, size = "16px") => {
    return [1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#374151", fontSize: size }}>
        {s <= Math.round(rating) ? "★" : "☆"}
      </span>
    ));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Navbar />
        <p style={{ color: "#94a3b8", fontSize: "18px" }}>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "80px", color: "#64748b" }}>Product not found.</div>
      </div>
    );
  }

  const isOwner = user && product.Owner?._id === user._id;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#0f172a 100%)" }}>
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
        }}>
          {alert.msg}
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: "20px", fontSize: "13px", color: "#64748b" }}>
          <Link to="/" style={{ color: "#c084fc", textDecoration: "none" }}>Home</Link>
          {" / "}
          <span style={{ color: "#94a3b8" }}>{product.Category}</span>
          {" / "}
          <span style={{ color: "#e2e8f0" }}>{product.Title}</span>
        </div>

        {/* Main product section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "48px" }}>
          {/* Image gallery */}
          <div>
            <div style={{
              background: "rgba(30,27,75,0.6)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
            }}>
              <img
                src={allImages[selectedImage]}
                alt={product.Title}
                style={{ maxHeight: "380px", maxWidth: "100%", objectFit: "contain" }}
              />
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: `2px solid ${selectedImage === i ? "#a855f7" : "rgba(139,92,246,0.2)"}`,
                      transition: "border-color 0.2s",
                    }}
                  >
                    <img src={img} alt={`view-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <h1 style={{
              color: "#e2e8f0",
              fontWeight: "800",
              fontSize: "26px",
              lineHeight: "1.3",
              marginBottom: "12px",
            }}>
              {product.Title}
            </h1>

            {/* Rating summary */}
            {reviewCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ display: "flex" }}>{stars(avgRating, "20px")}</div>
                <span style={{ color: "#c084fc", fontWeight: "700", fontSize: "16px" }}>{avgRating}</span>
                <span style={{ color: "#64748b", fontSize: "14px" }}>({reviewCount} reviews)</span>
              </div>
            )}

            <div style={{ borderBottom: "1px solid rgba(139,92,246,0.2)", paddingBottom: "16px", marginBottom: "16px" }}>
              <p style={{ color: "#e2e8f0", fontSize: "36px", fontWeight: "900", marginBottom: "4px" }}>
                Rs.{product.Price?.toLocaleString()}
              </p>
              <p style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>Free Delivery</p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "4px" }}>
                Category: <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{product.Category}</span>
              </p>
              <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "4px" }}>
                Sold by: <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{product.Owner?.fullname}</span>
              </p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: product.Quantity > 0 ? "#10b981" : "#ef4444" }}>
                {product.Quantity > 0 ? `${product.Quantity} units available` : "Out of Stock"}
              </p>
            </div>

            <div style={{ borderTop: "1px solid rgba(139,92,246,0.2)", paddingTop: "16px", marginBottom: "24px" }}>
              <p style={{ color: "#e2e8f0", lineHeight: "1.7", fontSize: "14px" }}>{product.Description}</p>
            </div>

            {!isOwner && product.Quantity > 0 && (
              <>
                {/* Quantity selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <label style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>Quantity:</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0", background: "rgba(51,65,85,0.5)", borderRadius: "10px", border: "1px solid rgba(139,92,246,0.3)", overflow: "hidden" }}>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{ width: "36px", height: "36px", background: "none", border: "none", color: "#e2e8f0", fontSize: "18px", cursor: "pointer", fontWeight: "700" }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: "40px", textAlign: "center", color: "#fff", fontWeight: "700", fontSize: "16px" }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.Quantity, q + 1))}
                      style={{ width: "36px", height: "36px", background: "none", border: "none", color: "#e2e8f0", fontSize: "18px", cursor: "pointer", fontWeight: "700" }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>
                    Total: <span style={{ color: "#c084fc", fontWeight: "700" }}>Rs.{(product.Price * quantity).toLocaleString()}</span>
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={buyNow}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={addToCart}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </>
            )}

            {isOwner && (
              <div style={{ padding: "16px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px" }}>
                <p style={{ color: "#c084fc", fontSize: "14px", fontWeight: "600", textAlign: "center" }}>
                  This is your product
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <Link to={`/Edit-product/${product._id}`} style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontWeight: "700", fontSize: "13px" }}>Edit Details</Link>
                  <Link to={`/Edit-image/${product._id}`} style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg,#0ea5e9,#2563eb)", color: "#fff", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontWeight: "700", fontSize: "13px" }}>Edit Images</Link>
                </div>
              </div>
            )}

            {product.Quantity === 0 && !isOwner && (
              <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", textAlign: "center" }}>
                <p style={{ color: "#fca5a5", fontWeight: "700" }}>Out of Stock</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div style={{
          background: "rgba(30,27,75,0.6)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "20px",
          padding: "32px",
        }}>
          <h2 style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#e2e8f0",
            marginBottom: "24px",
          }}>
            Customer Reviews
          </h2>

          {/* Rating overview */}
          {reviewCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "28px", paddingBottom: "24px", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "48px", fontWeight: "900", color: "#f59e0b", lineHeight: 1 }}>{avgRating}</p>
                <div style={{ display: "flex", justifyContent: "center" }}>{stars(avgRating, "18px")}</div>
                <p style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>{reviewCount} reviews</p>
              </div>
              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = product.reviews?.filter((r) => Math.round(r.rating) === star).length || 0;
                  const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                  return (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "12px", width: "8px" }}>{star}</span>
                      <span style={{ color: "#f59e0b", fontSize: "12px" }}>★</span>
                      <div style={{ flex: 1, height: "6px", background: "rgba(139,92,246,0.2)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#f59e0b,#f97316)", borderRadius: "3px", transition: "width 0.5s" }} />
                      </div>
                      <span style={{ color: "#64748b", fontSize: "11px", width: "20px" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review form - only for buyers with delivered orders */}
          {canReview && (
            <div style={{
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "14px",
              padding: "24px",
              marginBottom: "28px",
            }}>
              <h3 style={{ color: "#c084fc", fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>
                Write a Review
              </h3>
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                    Your Rating
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        style={{
                          fontSize: "28px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: s <= reviewRating ? "#f59e0b" : "#374151",
                          padding: "0 2px",
                          transition: "color 0.15s",
                        }}
                      >
                        {s <= reviewRating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Your Review (optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "rgba(51,65,85,0.5)",
                      border: "1px solid rgba(100,116,139,0.5)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  style={{
                    padding: "10px 24px",
                    background: reviewLoading ? "#374151" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: reviewLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          {product.reviews && product.reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {product.reviews.map((review, i) => (
                <div key={i} style={{
                  background: "rgba(15,23,42,0.5)",
                  border: "1px solid rgba(139,92,246,0.1)",
                  borderRadius: "12px",
                  padding: "18px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <p style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>
                        {review.user?.fullname || review.user?.username || "Buyer"}
                      </p>
                      <div style={{ display: "flex", gap: "2px" }}>{stars(review.rating, "14px")}</div>
                    </div>
                    <span style={{ color: "#475569", fontSize: "12px" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginTop: "8px" }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#475569", fontSize: "15px", textAlign: "center", padding: "24px" }}>
              No reviews yet. Be the first to review this product after delivery.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
