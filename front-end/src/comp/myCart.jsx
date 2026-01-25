import React,{useEffect,useState} from "react";
import{Link} from "react-router-dom";

function MyCart(){
    const[username,setUsername]=useState("");
    const[cartItems,setCartItems]=useState([]);

    useEffect(()=>{
        fetch("http://localhost:8000/e-2market/v1/users/getUsername",{
            method:"GET",
            credentials:"include",
        })
            .then((res)=>{
                if(res.status=== 401){
                    alert("Session expired. Please login again.");
                    window.location.href="/login";
                }
                return res.json();
            })
            .then((data)=>{
                setUsername(String(data.data.username).toUpperCase());
            })
            .catch((error)=>{
                console.error("Error fetching user details:", error);
            });
    }, []);

    useEffect(()=>{
        fetch("http://localhost:8000/e-2market/v1/users/getusercartlist",{
            method:"GET",
            credentials:"include",
        })
            .then((res)=>res.json())
            .then((data)=>{
                console.log("data = ",data);
                setCartItems(data?.data||[]);
            })
            .catch((error)=>{
                console.error("Error fetching cart items:", error);
            });
    }, []);

    const removeFromCart=(productId)=>{
        fetch("http://localhost:8000/e-2market/v1/products/removeFromCart",{
            method:"POST",
            credentials:"include",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ productId }),
        })
            .then((res)=>res.json())
            .then((data)=>{
                alert(data.message || "Item removed from cart!");
                setCartItems(cartItems.filter((item)=>item._id !== productId));
            })
            .catch((error)=>{
                console.error("Error removing item from cart:", error);
            });
    };

    const logout=()=>{
        fetch("http://localhost:8000/e-2market/v1/users/logout",{
            method:"POST",
            credentials:"include",
        })
            .then((res)=>{
                if(res.status=== 200){
                    alert("Logged out successfully");
                    window.location.href="/login";
                } else{
                    alert("Logout failed. Please try again.");
                }
            })
            .catch((error)=>{
                console.error("Error logging out:", error);
            });
    };

    const totalAmount = cartItems.reduce((acc, item)=>acc + item.Price, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
            <div className="w-64 h-screen fixed bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between border-r border-purple-500/20">
                <div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 text-center">My Cart</h2>
                    <nav className="space-y-2">
                        <Link to="/profile" className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Profile</Link>
                        <Link to="/dash" className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Dashboard</Link>
                        <Link to="/search" className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Search</Link>
                        <Link to="/orders" className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Orders</Link>
                        <Link to="/Change-details" className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Details</Link>
                        <Link to="/Change-password" className="block text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Password</Link>
                    </nav>
                </div>
                <div className="space-y-3">
                    <button onClick={logout} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-200">Logout</button>
                </div>
            </div>

            <div className="flex-1 p-8 ml-64">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">Shopping Cart</h1>
                <p className="text-white mb-6">Welcome, {username}</p>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        {cartItems.length > 0 ? (
                            <div className="bg-slate-700/40 rounded-lg shadow-lg p-4">
                                {cartItems.map((product, index) => (
                                    <div key={product._id} className={`border-b p-4 flex gap-4 ${index === cartItems.length - 1 ? 'border-b-0' : ''}`}>
                                        <img src={product.Image} alt={product.Name} className="w-32 h-32 object-cover rounded" />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white">{product.Title}</h3>
                                            <p className="text-white text-sm mt-1">Price: <span className="text-lg font-bold text-slate-200">₹{product.Price}</span></p>
                                            <button
                                                onClick={() => removeFromCart(product._id)}
                                                className="mt-3 bg-gradient-to-r from-red-600 to-red-800 text-white px-3 py-1 rounded hover:bg-red-700 transition font-medium text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-700/40 rounded-lg shadow-lg p-8 text-center">
                                <p className="text-white text-lg">Your cart is empty</p>
                            </div>
                        )}
                    </div>

                    <div className="col-span-1">
                        <div className="bg-slate-700/40 rounded-lg shadow-lg p-4 sticky top-6">
                            <div className="border-b pb-4 mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-white">Subtotal:</span>
                                    <span className="text-white font-semibold">₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-white">Shipping:</span>
                                    <span className="text-green-400 font-semibold">FREE</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white">Tax:</span>
                                    <span className="text-white font-semibold">₹0</span>
                                </div>
                            </div>
                            <div className="flex justify-between mb-6 text-lg font-bold">
                                <span className="text-white">Total ({cartItems.length} items):</span>
                                <span className="text-white">₹{totalAmount}</span>
                            </div>
                            <Link to="/bill" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded font-bold hover:bg-gradient-to-l transition text-center block">
                                Proceed to Buy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyCart;
