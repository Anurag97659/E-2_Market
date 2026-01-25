import React,{ useEffect, useState } from "react";
import{ Link } from "react-router-dom";

function Orders(){
    const [username, setUsername] = useState("");
    const [orderItems, setOrderItems] = useState([]);

    useEffect(() =>{
        fetch("http://localhost:8000/e-2market/v1/users/getUsername",{
            method: "GET",
            credentials: "include",
        })
            .then((res) =>{
                if(res.status === 401){
                    alert("Session expired. Please login again.");
                    window.location.href = "/login";
                }
                return res.json();
            })
            .then((data) =>{
                setUsername(String(data.data.username).toUpperCase());
            })
            .catch((error) =>{
                console.error("Username error:", error);
            });
    }, []);

    useEffect(() =>{
        fetch("http://localhost:8000/e-2market/v1/users/getorderlist",{
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) =>{
                setOrderItems(
                    Array.isArray(data?.data?.orders)
                        ? data.data.orders
                        : []
                );
            })
            .catch((error) =>{
                console.error("Order fetch error:", error);
                setOrderItems([]);
            });
    }, []);

    const cancelOrder =(productId) =>{
        if(!window.confirm("Are you sure you want to cancel this order?")){
            return;
        }

        fetch("http://localhost:8000/e-2market/v1/users/cancelOrder",{
            method: "POST",
            credentials: "include",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
        })
            .then((res) => res.json())
            .then((data) =>{
                alert(data.message || "Order cancelled");

                // Update UI
                setOrderItems(
                    orderItems.filter((item) => item._id !== productId)
                );
            })
            .catch((error) =>{
                console.error("Cancel error:", error);
                alert("Failed to cancel order");
            });
    };

    // Logout
    const logout =() =>{
        fetch("http://localhost:8000/e-2market/v1/users/logout",{
            method: "POST",
            credentials: "include",
        })
            .then((res) =>{
                if(res.status === 200){
                    alert("Logged out successfully");
                    window.location.href = "/login";
                } else{
                    alert("Logout failed");
                }
            })
            .catch((error) =>{
                console.error("Logout error:", error);
            });

               
};

    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

            {/* Sidebar */}
            <div className="w-64 h-screen fixed bg-slate-800/80 backdrop-blur-2xl shadow-lg p-6 flex flex-col justify-between border-r border-purple-500/20">
                <div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
                        Orders
                    </h2>

                    <div className="space-y-1">
                        <Link to="/profile" className="block text-slate-300 text-sm py-3 px-4 hover:bg-purple-500/20 rounded transition">Profile</Link>
                        <Link to="/mycart" className="block text-slate-300 text-sm py-3 px-4 hover:bg-purple-500/20 rounded transition">My Cart</Link>
                        <Link to="/dash" className="block text-slate-300 text-sm py-3 px-4 hover:bg-purple-500/20 rounded transition">Dashboard</Link>
                        <Link to="/search" className="block text-slate-300 text-sm py-3 px-4 hover:bg-purple-500/20 rounded transition">Search</Link>
                        <Link to="/Change-details" className="block text-slate-300 text-sm py-3 px-4 hover:bg-purple-500/20 rounded transition">Change Details</Link>
                        <Link to="/Change-password" className="block text-slate-300 text-sm py-3 px-4 hover:bg-purple-500/20 rounded transition">Change Password</Link>
                    </div>
                </div>

                <button onClick={logout} className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 rounded-lg hover:shadow-lg transition font-semibold text-sm">
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Your Orders
                    </h1>
                    <p className="text-slate-400 mb-8">Welcome, {username}</p>

                    {orderItems.length > 0 ? (
                        <div className="space-y-4">
                            {orderItems.map((product) => (
                                <div key={product._id} className="bg-slate-800/80 backdrop-blur-2xl border border-purple-500/20 rounded-xl p-6 flex gap-6 hover:shadow-2xl hover:border-purple-500/40 transition">
                                    <img src={product.Image} alt={product.Title} className="w-32 h-32 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-100">{product.Title}</h3>
                                        <p className="text-slate-400 text-sm mt-2">
                                            Price: <span className="font-bold text-purple-400">₹{product.Price}</span>
                                        </p>
                                        <div className="mt-4 flex gap-3 items-center">
                                            <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-lg border border-green-500/30">
                                                On The Way
                                            </span>
                                            <button onClick={() => cancelOrder(product._id)} className="bg-red-600/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-500 transition border border-red-500/30">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-800/80 backdrop-blur-2xl border border-purple-500/20 rounded-xl p-12 text-center">
                            <p className="text-slate-400 text-lg">You haven't placed any orders yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Orders;
