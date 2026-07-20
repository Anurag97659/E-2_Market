"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

export default function Dash() {
  const [username, setUsername] = useState("");
  const [sell, setSell] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API}/users/getUsername`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          router.push("/login");
        }
        return res.json();
      })
      .then((data) => {
        if (data?.data?.username) {
          setUsername(String(data.data.username).toUpperCase());
        }
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, [router]);

  useEffect(() => {
    fetch(`${API}/products/sell`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setSell(data?.data || []);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const logout = () => {
    fetch(`${API}/users/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) {
          alert("Logged out successfully");
          router.push("/login");
        } else {
          alert("Logout failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const handleDelete = (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    fetch(`${API}/products/deleteProduct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ productId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success || data.statusCode === 200 || !data.message) {
          alert("Product deleted successfully");
          setSell((prevSell) => prevSell.filter((p) => p._id !== productId));
        } else {
          alert(data.message || "Failed to delete product.");
        }
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      });
  };

  const deleteuser = () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    fetch(`${API}/users/delete`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) {
          alert("User deleted successfully");
          router.push("/login");
        } else {
          alert("User deletion failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 via-purple-100 to-slate-200 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-64 h-screen fixed bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between border-r border-purple-500/20">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8 text-center">Dashboard</h2>
          <nav className="space-y-2">
            <Link href="/profile" className="block text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Profile</Link>
            <Link href="/search" className="block text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Search</Link>
            <Link href="/mycart" className="block text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">My Cart</Link>
            <Link href="/orders" className="block text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Orders</Link>
            <Link href="/Change-details" className="block text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Details</Link>
            <Link href="/Change-password" className="block text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Password</Link>
          </nav>
        </div>
        <div className="space-y-3">
          <button onClick={logout} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-200 border-none cursor-pointer">Logout</button>
          <button onClick={deleteuser} className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white py-2 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-pink-500 hover:to-red-500 transition-all duration-200 border-none cursor-pointer">Delete Account</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="w-full max-w-4xl mx-auto bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center mb-8 border border-purple-500/20">
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome, <span style={{ color: "var(--text-main)" }}>{username}</span></h2>
        </div>

        <div className="w-full max-w-6xl mx-auto bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8 text-center">Your Products</h2>
          <div className="flex justify-end mb-6">
            <Link href="/Add-product" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-bold flex items-center gap-2 border-none">+ Add Product</Link>
          </div>
          {sell.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sell.map((product) => (
                <div key={product._id} className="bg-white/50 dark:bg-slate-700/40 border border-purple-500/20 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-purple-500/40 flex flex-col backdrop-blur-sm">
                  <img src={product.Image || product.Thumbnail} alt={product.Title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-main)" }}>{product.Title}</h3>
                  <p className="text-sm mb-4 flex-grow line-clamp-3" style={{ color: "var(--text-muted)" }}>{product.Description}</p>
                  <div className="space-y-1 mb-4">
                    <p className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">₹{product.Price}</p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Category: <span className="font-semibold" style={{ color: "var(--text-main)" }}>{product.Category}</span></p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Quantity: <span className="font-semibold" style={{ color: "var(--text-main)" }}>{product.Quantity}</span></p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    <Link href={`/Edit-product/${product._id}`} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 text-center font-bold text-xs">Edit</Link>
                    <Link href={`/Edit-image/${product._id}`} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-400 hover:to-cyan-400 transition-all duration-200 text-center font-bold text-xs">Edit Image</Link>
                    <button onClick={() => handleDelete(product._id)} className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-2 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-pink-500 hover:to-red-500 transition-all duration-200 font-bold text-xs border-none cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>No products listed yet.</p>
              <Link href="/Add-product" className="text-purple-500 hover:text-pink-500 font-bold mt-2 inline-block transition-colors duration-200">Start adding products</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
