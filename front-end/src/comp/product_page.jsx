import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ProductPage() {
  const [productDetails, setProductDetails] = useState(null);
  const [username, setUsername] = useState("");

  const productId = window.location.pathname.split("/").pop();

  useEffect(() => {
    fetch(
      `http://localhost:8000/e-2market/v1/products/getproductdetailsforproductpage/${productId}`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((res) => {
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          window.location.href = "/login";
        }
        return res.json();
      })
      .then((data) => {
        setProductDetails(data?.data || null);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  }, [productId]);

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/users/getUsername", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          window.location.href = "/login";
        }
        return res.json();
      })
      .then((data) => {
        setUsername(String(data.data.username).toUpperCase());
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, []);


  const logout = () => {
    fetch("http://localhost:8000/e-2market/v1/users/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          window.location.href = "/login";
        }
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

 
  const addToCart = () => {
    fetch("http://localhost:8000/e-2market/v1/products/addToCart", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Product added to cart!");
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        alert("Failed to add product");
      });
  };

 
  const buyNow = () => {
    fetch("http://localhost:8000/e-2market/v1/products/addToCart", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Redirecting to checkout...");
        window.location.href = "/bill";
      })
      .catch((error) => {
        console.error("Error in Buy Now:", error);
        alert("Failed to proceed");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl text-white p-4 sticky top-0 z-50 shadow-2xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/dash" className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              E-2 Market
            </Link>
            <div className="space-x-6 hidden md:flex">
              <Link to="/search" className="hover:text-purple-300 transition-colors">
                Search
              </Link>
              <Link to="/orders" className="hover:text-purple-300 transition-colors">
                Orders
              </Link>
              <Link to="/profile" className="hover:text-purple-300 transition-colors">
                Account
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/mycart" className="hover:text-purple-300 text-lg font-semibold transition-colors">
              🛒 Cart
            </Link>
            <p className="text-sm text-gray-300">
              Hello, <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">{username}</span>
            </p>
            <button onClick={logout} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded hover:from-blue-500 hover:to-purple-500 font-semibold transition-all">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {productDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex justify-center bg-gradient-to-br from-orange-500/30 via-pink-500/30 to-red-500/30 p-8 rounded-lg backdrop-blur-xl border border-orange-400/20">
              <img src={productDetails.Image} alt={productDetails.Title} className="max-h-96 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                {productDetails.Title}
              </h1>
              <div className="border-b border-purple-500/20 pb-4 mb-4">
                <p className="text-4xl font-bold text-pink-400 mb-2">
                  ₹{productDetails.Price}
                </p>
                <p className="text-sm text-gray-300">FREE Delivery</p>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {productDetails.Description}
              </p>
              <p className="text-gray-300 mb-8 text-lg">
                <span className="font-bold">Category:</span> {productDetails.Category}
              </p>
              <div className="space-y-3">
                <button onClick={addToCart} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg text-lg transition-all">
                  Add to Cart
                </button>
                <button onClick={buyNow} className="w-full border-2 border-purple-500/50 text-white font-bold py-3 rounded-lg hover:bg-purple-500/20 text-lg transition-all">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-xl mt-16 animate-pulse">
            Loading product details...
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductPage;
