import React,{useEffect,useState} from "react";
import {Link} from "react-router-dom";

function Search() {
 const[username,setUsername]=useState("");
 const[result,setResult]=useState([]);
 const[searchQuery,setSearchQuery]=useState("");
 const[category,setCategory]=useState("");
 const[minPrice,setMinPrice]=useState("");
 const[maxPrice,setMaxPrice]=useState("");
 const[sortBy,setSortBy]=useState("");
 const[sortOrder,setSortOrder]=useState("asc");

  useEffect(()=>{
    fetch("http://localhost:8000/e-2market/v1/users/getUsername",{
      method: "GET",
      credentials: "include",
    })
      .then((res)=>{
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          window.location.href="/login";
        }
        return res.json();
      })
      .then((data)=>{
        setUsername(String(data.data.username).toUpperCase());
      })
      .catch((error)=>{
        console.error("Error fetching user details:",error);
      });
  },[]);

  const logout=()=>{
    fetch("http://localhost:8000/e-2market/v1/users/logout",{
      method: "POST",
      credentials: "include",
    })
      .then((res)=>{
        if (res.status === 200) {
          alert("Logged out successfully");
          window.location.href="/login";
        } else {
          alert("Logout failed. Please try again.");
        }
      })
      .catch((error)=>{
        console.error("Error logging out:",error);
      });
  };

  const submit=(e)=>{
    e.preventDefault();
    const query=new URLSearchParams({
      search: searchQuery,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    }).toString();

    fetch(`http://localhost:8000/e-2market/v1/products/search?${query}`,{
      method: "GET",
      credentials: "include",
    })
      .then((res)=>{
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          window.location.href="/login";
        }
        return res.json();
      })
      .then((data)=>{
        setResult(data?.data || []);
      })
      .catch((error)=>{
        console.error("Error fetching search results:",error);
      });
  };

  const addToCart=(productId)=>{
    fetch("http://localhost:8000/e-2market/v1/products/addToCart",{
      method: "POST",
      credentials: "include",
      headers:{"Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
      .then((res)=>res.json())
      .then((data)=>{
        alert(data.message || "Product added to cart!");
      })
      .catch((error)=>{
        console.error("Error adding product to cart:",error);
        alert("You are the owner of this product");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <div className="w-64 h-screen fixed bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between border-r border-purple-500/20">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 text-center">Search</h2>
          <nav className="space-y-2">
            <Link to="/dash" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Dashboard</Link>
            <Link to="/mycart" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">My Cart</Link>
            <Link to="/profile" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Profile</Link>
            <Link to="/orders" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Orders</Link>
            <Link to="/Change-details" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Details</Link>
            <Link to="/Change-password" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Password</Link>
          </nav>
        </div>
        <button onClick={logout} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-200">🚪 Logout</button>
      </div>

      <main className="flex-1 p-8 ml-64">
        <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center mb-8 border border-purple-500/20">
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Welcome, {username}</h2>
        </div>

        <div className="flex justify-center mb-8">
          <form onSubmit={submit} className="flex flex-col gap-6 w-full max-w-6xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 py-2 px-4 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              />
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all font-semibold">🔍 Search</button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Min Price</label>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min Price" className="w-full py-2 px-4 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Max Price</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max Price" className="w-full py-2 px-4 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="w-full py-2 px-4 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full py-2 px-4 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200">
                  <option value="" className="bg-slate-800 text-slate-100">Sort By</option>
                  <option value="Price" className="bg-slate-800 text-slate-100">Price</option>
                  <option value="Title" className="bg-slate-800 text-slate-100">Title</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Order</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full py-2 px-4 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200">
                  <option value="asc" className="bg-slate-800 text-slate-100">Ascending</option>
                  <option value="desc" className="bg-slate-800 text-slate-100">Descending</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-10">
          {result.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {result.map((product) => (
                <div key={product._id} className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-purple-500/40 flex flex-col">
                  <Link to={`/product_page/${product._id}`} className="block">
                    <img src={product.Image} alt={product.Name} className="w-full h-48 object-cover mb-4 rounded-lg" />
                  </Link>
                  <h3 className="text-lg font-bold text-slate-100 line-clamp-2 mb-2">{product.Title}</h3>
                  <p className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-lg mb-2">₹{product.Price}</p>
                  <p className="text-slate-300 text-sm mb-4 flex-grow line-clamp-2">{product.Description}</p>
                  <button onClick={() => addToCart(product._id)} className="mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all font-semibold">Add to Cart</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-lg text-center mt-6">No products found</p>
          )}
        </div>
      </main>
    </div>
  );
}


export default Search;
