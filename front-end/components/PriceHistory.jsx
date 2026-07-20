"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import apiFetch, { API_BASE } from "@/utils/apiFetch";

const formatINR = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
};

function PriceChart({ history }) {
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const pointsRef = useRef([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 1) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const PAD = { top: 24, right: 24, bottom: 72, left: 72 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const prices = history.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const paddedMin = minP - range * 0.12;
    const paddedMax = maxP + range * 0.12;
    const paddedRange = paddedMax - paddedMin;

    const toX = (i) => PAD.left + (i / Math.max(history.length - 1, 1)) * chartW;
    const toY = (p) => PAD.top + chartH - ((p - paddedMin) / paddedRange) * chartH;

    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(139,92,246,0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = PAD.top + (i / 5) * chartH;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();

      const val = paddedMax - (i / 5) * paddedRange;
      ctx.fillStyle = "#64748b";
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(formatINR(val), PAD.left - 8, y + 4);
    }

    history.forEach((p, i) => {
      const x = toX(i);
      const baseY = PAD.top + chartH;

      ctx.strokeStyle = "rgba(139,92,246,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY + 6);
      ctx.stroke();

      ctx.save();
      ctx.translate(x, baseY + 10);
      ctx.rotate(-Math.PI / 4.5);
      ctx.textAlign = "right";
      ctx.fillStyle = "#64748b";
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText(formatDate(p.changedAt), 0, 0);
      ctx.restore();
    });

    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
    grad.addColorStop(0, "rgba(139,92,246,0.35)");
    grad.addColorStop(1, "rgba(139,92,246,0.0)");

    ctx.beginPath();
    history.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.price);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(toX(history.length - 1), PAD.top + chartH);
    ctx.lineTo(toX(0), PAD.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    history.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.price);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    const dots = [];
    history.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.price);
      dots.push({ x, y, price: p.price, date: p.changedAt });

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#c084fc";
      ctx.fill();
      ctx.strokeStyle = "#1e1b4b";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    pointsRef.current = dots;
  }, [history]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => ro.disconnect();
  }, [draw]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const tooltip = tooltipRef.current;
    if (!canvas || !tooltip) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width / window.devicePixelRatio;
    const scaleY = canvas.height / rect.height / window.devicePixelRatio;
    const lx = mx * scaleX;
    const ly = my * scaleY;

    let nearest = null;
    let minDist = Infinity;
    pointsRef.current.forEach((pt) => {
      const dist = Math.hypot(pt.x - lx, pt.y - ly);
      if (dist < minDist) { minDist = dist; nearest = pt; }
    });

    if (nearest && minDist < 28) {
      tooltip.style.display = "block";
      tooltip.style.left = `${nearest.x / scaleX + 12}px`;
      tooltip.style.top = `${nearest.y / scaleY - 36}px`;
      tooltip.textContent = `${formatINR(nearest.price)} · ${formatDate(nearest.date)}`;
    } else {
      tooltip.style.display = "none";
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  };

  return (
    <div className="relative w-full h-[260px]">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full block cursor-crosshair"
      />
      <div
        ref={tooltipRef}
        className="hidden absolute pointer-events-none rounded-lg border px-3 py-1.5 text-xs font-bold whitespace-nowrap z-10"
        style={{
          background: "rgba(15,23,42,0.92)",
          borderColor: "rgba(139,92,246,0.5)",
          color: "#e2e8f0",
        }}
      />
    </div>
  );
}

export default function PriceHistory({ productId }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    if (data) { setOpen((o) => !o); return; }
    setLoading(true);
    setError("");
    const result = await apiFetch(`${API_BASE}/products/${productId}/price-history`);
    if (result.ok) {
      setData(result.data);
      setOpen(true);
    } else {
      setError(result.message || "Could not load price history.");
    }
    setLoading(false);
  };

  const hasHistory = data && data.history && data.history.length > 0;
  const hasChanges = data && data.history && data.history.length > 1;

  return (
    <section className="mb-12 border rounded-2xl p-6 backdrop-blur-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex gap-4 items-center justify-between flex-wrap mb-4">
        <div>
          <h2 className="m-0 text-xl font-bold" style={{ color: "var(--text-main)" }}>Price History</h2>
          <p className="m-1.5 text-xs" style={{ color: "var(--text-muted)" }}>Track how the price of this product has changed over time.</p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-5 py-3 rounded-xl text-white font-bold text-sm border-none cursor-pointer transition-colors duration-250 disabled:opacity-50"
          style={{
            background: loading
              ? "#4b5563"
              : open
                ? "linear-gradient(135deg,#6366f1,#a21caf)"
                : "linear-gradient(135deg,#0ea5e9,#6366f1)",
          }}
        >
          {loading ? "Loading…" : open ? "Hide Price History" : "Show Price History"}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      {open && hasHistory && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border mb-5 bg-slate-500/5" style={{ borderColor: "var(--card-border)" }}>
            <Stat label="Current Price" value={formatINR(data.currentPrice)} color="#6ee7b7" />
            <Stat label="Lowest Ever" value={formatINR(Math.min(...data.history.map(h => h.price)))} color="#a78bfa" />
            <Stat label="Highest Ever" value={formatINR(Math.max(...data.history.map(h => h.price)))} color="#f87171" />
            <Stat label="Price Changes" value={data.history.length} color="#fcd34d" />
          </div>

          {hasChanges ? (
            <PriceChart history={data.history} />
          ) : (
            <p className="text-sm italic m-0" style={{ color: "var(--text-muted)" }}>
              This product has been listed at <strong className="text-emerald-400">{formatINR(data.currentPrice)}</strong> since it was first listed. No price changes recorded yet.
            </p>
          )}
          <p className="text-[10px] mt-3.5" style={{ color: "var(--text-muted)" }}>Price history is recorded on every seller update. Historical data may not exist for older listings.</p>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 m-0">{label}</p>
      <p className="text-lg font-black mt-1 m-0" style={{ color }}>{value}</p>
    </div>
  );
}
