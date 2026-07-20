"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PriceComparison from "@/components/PriceComparison";
import PriceHistory from "@/components/PriceHistory";
import apiFetch from "@/utils/apiFetch";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function ProductPage() {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMedia, setReviewMedia] = useState([]);
  const [reviewMediaPreviews, setReviewMediaPreviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    fetch(`${API}/users/getProfile`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.statusCode === 200) setUser(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/products/getproductdetailsforproductpage/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d?.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/users/getorderlist`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const orders = d?.data || [];
        const hasDelivered = orders.some(
          (o) => o.product?._id === productId && o.status === "delivered" && !o.review
        );
        setCanReview(hasDelivered);
      })
      .catch(() => {});
  }, [user, productId]);

  const addToCart = async () => {
    if (!user) { router.push("/login"); return; }
    const result = await apiFetch(`${API}/products/addToCart`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (result.ok) showAlert("Added to cart successfully", "success");
    else showAlert(result.message);
  };

  const buyNow = () => {
    if (!user) { router.push("/login"); return; }
    router.push(`/bill?directBuy=${productId}&qty=${quantity}`);
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setReviewMedia(files);
    setReviewMediaPreviews(files.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video") ? "video" : "image",
    })));
  };

  const removeMedia = (idx) => {
    setReviewMedia((prev) => prev.filter((_, i) => i !== idx));
    setReviewMediaPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("rating", reviewRating);
    formData.append("comment", reviewComment);
    reviewMedia.forEach((f) => formData.append("reviewMedia", f));

    const result = await apiFetch(`${API}/users/addReview`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (result.ok) {
      showAlert("Review submitted successfully!", "success");
      setCanReview(false);
      setReviewComment("");
      setReviewRating(5);
      setReviewMedia([]);
      setReviewMediaPreviews([]);
      fetch(`${API}/products/getproductdetailsforproductpage/${productId}`)
        .then((r) => r.json())
        .then((d) => setProduct(d?.data || product));
    } else {
      showAlert(result.message);
    }
    setReviewLoading(false);
  };

  const allImages = product ? [product.Thumbnail, ...(product.Images || [])].filter(Boolean) : [];
  const avgRating = product?.averageRating || 0;
  const reviewCount = product?.reviews?.length || 0;

  const StarRow = ({ rating, size = "16px", interactive = false, onSelect }) =>
    [1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        onClick={() => interactive && onSelect && onSelect(s)}
        className="transition-colors duration-100"
        style={{
          color: s <= Math.round(rating) ? "#f59e0b" : "#e2e8f0",
          fontSize: size,
          cursor: interactive ? "pointer" : "default",
        }}
      >
        {s <= Math.round(rating) ? "★" : "☆"}
      </span>
    ));

  if (loading) return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />
      <div className="text-center py-20 text-slate-400 text-lg">Loading product...</div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />
      <div className="text-center py-20 text-slate-500">Product not found.</div>
    </div>
  );

  const isOwner = user && product.Owner?._id === user._id;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
      <Navbar />

      {alert && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-7 py-3 rounded-xl font-semibold text-sm z-[300] backdrop-blur-xl border max-w-[90vw] text-center ${alert.type === "success" ? "bg-emerald-500/15 border-emerald-500 text-emerald-600" : "bg-red-500/12 border-red-500 text-red-600"}`}>
          {alert.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="text-purple-500 hover:underline">Home</Link>
          {" / "}<span style={{ color: "var(--text-muted)" }}>{product.Category}</span>
          {" / "}<span style={{ color: "var(--text-main)" }}>{product.Title}</span>
        </div>

        {/* Main product section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Image gallery */}
          <div>
            <div className="rounded-2xl border overflow-hidden mb-3 flex items-center justify-center h-[400px] backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <img src={allImages[selectedImage]} alt={product.Title} className="max-h-[380px] max-w-full object-contain" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {allImages.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(i)} className="w-[72px] h-[72px] rounded-xl overflow-hidden cursor-pointer border-2 transition-colors" style={{ borderColor: selectedImage === i ? "#a855f7" : "var(--card-border)" }}>
                    <img src={img} alt={`view-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <h1 className="font-extrabold text-2xl mb-3 leading-snug" style={{ color: "var(--text-main)" }}>
              {product.Title}
            </h1>
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex"><StarRow rating={avgRating} size="20px" /></div>
                <span className="font-bold text-purple-400 text-base">{avgRating}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>({reviewCount} reviews)</span>
              </div>
            )}
            <div className="border-b pb-4 mb-4" style={{ borderColor: "var(--card-border)" }}>
              <p className="font-black text-3xl mb-1 text-purple-400">
                Rs.{product.Price?.toLocaleString()}
              </p>
              <p className="text-emerald-400 text-xs font-semibold">Free Delivery</p>
            </div>
            <div className="mb-4 text-sm flex flex-col gap-1" style={{ color: "var(--text-muted)" }}>
              <p>Category: <span className="font-semibold" style={{ color: "var(--text-main)" }}>{product.Category}</span></p>
              <p>Sold by: <span className="font-semibold" style={{ color: "var(--text-main)" }}>{product.Owner?.fullname}</span></p>
              <p className={`font-bold ${product.Quantity > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {product.Quantity > 0 ? `${product.Quantity} units available` : "Out of Stock"}
              </p>
            </div>
            <div className="border-t pt-4 mb-6" style={{ borderColor: "var(--card-border)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-main)" }}>{product.Description}</p>
            </div>

            {!isOwner && product.Quantity > 0 && (
              <>
                <div className="flex items-center gap-4 mb-5">
                  <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Quantity:</label>
                  <div className="flex items-center rounded-lg border overflow-hidden" style={{ background: "rgba(51,65,85,0.5)", borderColor: "rgba(139,92,246,0.3)" }}>
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 bg-transparent border-none text-white text-base cursor-pointer font-bold">-</button>
                    <span className="min-w-[40px] text-center text-white font-bold text-base">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(product.Quantity, q + 1))} className="w-9 h-9 bg-transparent border-none text-white text-base cursor-pointer font-bold">+</button>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Total: <span className="font-bold text-purple-400">Rs.{(product.Price * quantity).toLocaleString()}</span>
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={buyNow} className="flex-1 py-3.5 rounded-xl text-white font-bold text-base border-none cursor-pointer" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>Buy Now</button>
                  <button onClick={addToCart} className="flex-1 py-3.5 rounded-xl text-white font-bold text-base border-none cursor-pointer" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>Add to Cart</button>
                </div>
              </>
            )}
            {isOwner && (
              <div className="p-4 rounded-xl border" style={{ background: "rgba(124,58,237,0.1)", borderColor: "rgba(124,58,237,0.3)" }}>
                <p className="font-semibold text-sm text-center text-purple-400">This is your product</p>
                <div className="flex gap-2.5 mt-3">
                  <Link href={`/Edit-product/${product._id}`} className="flex-1 py-2.5 rounded-lg text-white font-bold text-center text-xs" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>Edit Details</Link>
                  <Link href={`/Edit-image/${product._id}`} className="flex-1 py-2.5 rounded-lg text-white font-bold text-center text-xs" style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)" }}>Edit Images</Link>
                </div>
              </div>
            )}
            {product.Quantity === 0 && !isOwner && (
              <div className="p-4 rounded-xl border text-center" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }}>
                <p className="font-bold text-red-400">Out of Stock</p>
              </div>
            )}
        </div>
      </div>

        {/* PRICE COMPARISON */}
        <PriceComparison productId={productId} />

        {/* PRICE HISTORY */}
        <PriceHistory productId={productId} />

        {/* REVIEWS SECTION */}
        <div id="reviews" className="rounded-2xl border p-8 backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-main)" }}>
            Customer Reviews
          </h2>

          {/* Rating overview */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-6 mb-7 pb-6 border-b" style={{ borderColor: "var(--card-border)" }}>
              <div className="text-center">
                <p className="text-5xl font-black text-amber-500 m-0 leading-none">{avgRating}</p>
                <div className="flex justify-center mt-2"><StarRow rating={avgRating} size="18px" /></div>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{reviewCount} reviews</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = product.reviews?.filter((r) => Math.round(r.rating) === star).length || 0;
                  const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs w-2" style={{ color: "var(--text-muted)" }}>{star}</span>
                      <span className="text-amber-400 text-xs">★</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.2)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#f59e0b,#f97316)" }} />
                      </div>
                      <span className="text-xs w-5" style={{ color: "var(--text-muted)" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MEDIA GALLERY AT TOP (shows images and videos with reviewer name & comment metadata) */}
          {(() => {
            const allMedia = (product.reviews || []).flatMap((rv) =>
              (rv.media || []).map((url) => ({
                url,
                isVideo: url.includes("/video/") || /\.(mp4|mov|webm|ogg)$/i.test(url),
                reviewerName: rv.user?.fullname || rv.user?.username || "Buyer",
                comment: rv.comment || "",
                rating: rv.rating,
                date: rv.createdAt,
              }))
            );
            if (allMedia.length === 0) return null;
            return (
              <div className="mb-8 pb-7 border-b" style={{ borderColor: "var(--card-border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  Photos & Videos from customers ({allMedia.length})
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                  {allMedia.map((item, gi) => (
                    <button
                      key={gi}
                      onClick={() => setLightbox({ items: allMedia, index: gi })}
                      className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 relative cursor-pointer focus:outline-none transition-all duration-150 hover:scale-105 hover:border-purple-400"
                      style={{ borderColor: "rgba(139,92,246,0.3)", background: "#1e1b4b", padding: 0 }}
                    >
                      {item.isVideo ? (
                        <>
                          <video src={item.url} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" opacity="0.9"><polygon points="5,3 19,12 5,21"/></svg>
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded font-black">VIDEO</div>
                        </>
                      ) : (
                        <img src={item.url} alt={`customer-photo-${gi}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* WRITE REVIEW */}
          {canReview && (
            <div className="rounded-xl border p-6 mb-7 bg-purple-500/5 border-purple-500/20">
              <h3 className="font-bold text-base mb-4 text-purple-400">Write a Review</h3>
              <form onSubmit={submitReview}>
                <div className="mb-4">
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-muted)" }}>Your Rating</label>
                  <div className="flex gap-1"><StarRow rating={reviewRating} size="32px" interactive onSelect={setReviewRating} /></div>
                </div>
                <div className="mb-4">
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-muted)" }}>Your Review (optional)</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full p-3.5 rounded-xl text-sm outline-none resize-vertical"
                  />
                </div>
                <div className="mb-5">
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-muted)" }}>Add Photos / Videos (optional, up to 5)</label>
                  <label className="inline-flex items-center gap-2 cursor-pointer px-4.5 py-2.5 rounded-xl text-xs font-bold border border-dashed border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/15 transition-colors">
                    <span>+</span> Choose Files
                    <input type="file" accept="image/*,video/*" multiple onChange={handleMediaSelect} className="hidden" />
                  </label>
                  {reviewMediaPreviews.length > 0 && (
                    <div className="flex gap-2.5 mt-3 flex-wrap">
                      {reviewMediaPreviews.map((item, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden border border-purple-500/30">
                          {item.type === "video" ? (
                            <video src={item.url} className="w-20 h-20 object-cover" />
                          ) : (
                            <img src={item.url} alt={`media-${i}`} className="w-20 h-20 object-cover" />
                          )}
                          <button type="button" onClick={() => removeMedia(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 border-none text-white text-xs cursor-pointer flex items-center justify-center">×</button>
                          {item.type === "video" && (
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded font-black">VIDEO</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={reviewLoading} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50 cursor-pointer border-none" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {/* REVIEWS LIST */}
          {product.reviews && product.reviews.length > 0 ? (
            <div className="flex flex-col gap-5">
              {product.reviews.map((review, i) => {
                const hasMedia = review.media && review.media.length > 0;
                const prevCount = product.reviews.slice(0, i).reduce((acc, r) => acc + (r.media?.length || 0), 0);
                const allMedia = (product.reviews || []).flatMap((rv) =>
                  (rv.media || []).map((url) => ({
                    url,
                    isVideo: url.includes("/video/") || /\.(mp4|mov|webm|ogg)$/i.test(url),
                    reviewerName: rv.user?.fullname || rv.user?.username || "Buyer",
                    comment: rv.comment || "",
                    rating: rv.rating,
                    date: rv.createdAt,
                  }))
                );
                return (
                  <div key={i} className="rounded-xl border p-5" style={{ borderColor: "var(--card-border)" }}>
                    {/* Header: avatar + name + stars + date */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                          {(review.user?.fullname || review.user?.username || "B")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-none mb-1" style={{ color: "var(--text-main)" }}>
                            {review.user?.fullname || review.user?.username || "Buyer"}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5"><StarRow rating={review.rating} size="13px" /></div>
                            <span className="text-amber-500 font-bold text-xs">{review.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm leading-relaxed ml-12 mb-3" style={{ color: "var(--text-main)" }}>{review.comment}</p>
                    )}

                    {/* Media thumbnails */}
                    {hasMedia && (
                      <div className="flex gap-2.5 ml-12 flex-wrap">
                        {review.media.map((url, mi) => {
                          const isVideo = url.includes("/video/") || /\.(mp4|mov|webm|ogg)$/i.test(url);
                          const gi = prevCount + mi;
                          return (
                            <button
                              key={mi}
                              onClick={() => setLightbox({ items: allMedia, index: gi })}
                              className="w-20 h-20 rounded-lg overflow-hidden border-2 relative cursor-pointer flex-shrink-0 focus:outline-none transition-all duration-150 hover:scale-105 hover:border-purple-400"
                              style={{ borderColor: "rgba(139,92,246,0.3)", background: "#1e1b4b", padding: 0 }}
                            >
                              {isVideo ? (
                                <>
                                  <video src={url} className="w-full h-full object-cover" muted />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity="0.9"><polygon points="5,3 19,12 5,21"/></svg>
                                  </div>
                                  <div className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-[7px] px-1 rounded font-black">VIDEO</div>
                                </>
                              ) : (
                                <img src={url} alt={`review-${i}-${mi}`} className="w-full h-full object-cover" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-6">
              No reviews yet. Be the first to review this product after delivery.
            </p>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightbox && (
        <LightboxModal
          items={lightbox.items}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

/* ─── Lightbox Modal ─────────────────────────────────────────── */
function LightboxModal({ items, initialIndex, onClose }) {
  const [idx, setIdx] = React.useState(initialIndex);
  const item = items[idx];

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx((i) => Math.min(items.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items.length, onClose]);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const Stars = ({ rating }) => [1,2,3,4,5].map((s) => (
    <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#4b5563", fontSize: "14px" }}>★</span>
  ));

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col"
      style={{ background: "rgba(0,0,0,0.95)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top info bar */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
              {item.reviewerName[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-none">{item.reviewerName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Stars rating={item.rating} />
                <span className="text-slate-400 text-xs">
                  {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
          {item.comment && (
            <p className="text-slate-300 text-sm ml-11 max-w-lg line-clamp-2">{item.comment}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 text-white text-2xl font-light cursor-pointer hover:bg-white/10 transition-colors ml-4 flex-shrink-0"
          style={{ background: "none", lineHeight: 1 }}
        >×</button>
      </div>

      {/* Main media display */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-16 py-4">
        {item.isVideo ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        ) : (
          <img
            key={item.url}
            src={item.url}
            alt="Review media"
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
          />
        )}

        {/* Prev arrow */}
        {idx > 0 && (
          <button
            onClick={() => setIdx(idx - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white text-2xl cursor-pointer hover:bg-white/15 transition-colors"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >‹</button>
        )}
        {/* Next arrow */}
        {idx < items.length - 1 && (
          <button
            onClick={() => setIdx(idx + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white text-2xl cursor-pointer hover:bg-white/15 transition-colors"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >›</button>
        )}
      </div>

      {/* Bottom thumbnail strip */}
      <div className="flex-shrink-0 border-t border-white/10 py-3 px-4" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="flex justify-center gap-2 overflow-x-auto">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-150 cursor-pointer"
              style={{
                borderColor: i === idx ? "#a855f7" : "transparent",
                background: "#1e1b4b",
                padding: 0,
                opacity: i === idx ? 1 : 0.5,
                transform: i === idx ? "scale(1.08)" : "scale(1)",
              }}
            >
              {it.isVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
              ) : (
                <img src={it.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
        <p className="text-center text-white/40 text-xs mt-2">{idx + 1} / {items.length} · ← → keys to navigate · Esc to close</p>
      </div>
    </div>
  );
}
