import React,{useEffect,useState} from "react";
import{Link} from "react-router-dom";

function Dash(){
    const [username, setUsername]=useState("");
    const [sell, setsell]=useState([]);

    useEffect(()=>{
        fetch("http://localhost:8000/e-2market/v1/users/getUsername",{
            method:"GET",
            credentials:"include",
        })
            .then((res)=>{
                if (res.status === 401){
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
    },[]);

    useEffect(()=>{
        fetch("http://localhost:8000/e-2market/v1/products/sell",{
            method:"GET",
            credentials:"include",
        })
            .then((res)=>res.json())
            .then((data)=>{
                console.log("API Response:",data);
                setsell(data?.data || []);
            })
            .catch((error)=>{
                console.error("Error fetching products:",error);
            });
    }, []);

    const logout=()=>{
        fetch("http://localhost:8000/e-2market/v1/users/logout",{
            method:"POST",
            credentials:"include",
        })
            .then((res)=>{
                if (res.status===200){
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

    const handleDelete=(productId)=>{
        if(!window.confirm("Are you sure you want to delete this product?")) return;
    
        fetch("http://localhost:8000/e-2market/v1/products/deleteProduct",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            credentials:"include",
            body:JSON.stringify({productId}), 
        })
            .then((res)=>res.json())
            .then((data)=>{
                if (data.success){
                    alert("Product deleted successfully");
                    setsell((prevSell)=>prevSell.filter((p)=>p._id !== productId)); 
                } else{
                    alert(data.message || "Failed to delete product.");
                }
            })
            .catch((error)=>{
                console.error("Error deleting product:",error);
            });
    };

    const deleteuser=()=>{
        if(!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        fetch("http://localhost:8000/e-2market/v1/users/delete",{
            method:"POST",
            credentials:"include",
        })
            .then((res)=>{
                if (res.status===200){
                    alert("User deleted successfully");
                    window.location.href="/login";
                } else{
                    alert("User deletion failed. Please try again.");
                }
            })
            .catch((error)=>{
                console.error("Error deleting user:",error);
            });
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
           
            <div className="w-64 h-screen fixed bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between border-r border-purple-500/20">
                <div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 text-center">Dashboard</h2>
                    <nav className="space-y-2">
                        <Link to="/profile" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Profile</Link>
                        <Link to="/search" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Search</Link>
                        <Link to="/mycart" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">My Cart</Link>
                        <Link to="/orders" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Orders</Link>
                        <Link to="/Change-details" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Details</Link>
                        <Link to="/Change-password" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Password</Link>
                    </nav>
                </div>
                <div className="space-y-3">
                    <button onClick={logout} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-200">Logout</button>
                    <button onClick={deleteuser} className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white py-2 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-pink-500 hover:to-red-500 transition-all duration-200">Delete Account</button>
                </div>
            </div>

          
            <div className="flex-1 p-8 ml-64">
                <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center mb-8 border border-purple-500/20">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Welcome, <span>{username}</span></h2>
                </div>

                <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
                    <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 text-center">Your Products</h2>
                    <div className="flex justify-end mb-6">
                        <Link to="/Add-product" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-bold flex items-center gap-2">+ Add Product</Link>
                    </div>
                    {sell.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sell.map((product) => (
                                <div key={product._id} className="bg-slate-700/40 border border-purple-500/20 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-purple-500/40 flex flex-col backdrop-blur-sm">
                                    <img src={product.Image} alt={product.Title} className="w-full h-48 object-cover rounded-lg mb-4" />
                                    <h3 className="text-lg font-bold text-slate-100 mb-2">{product.Title}</h3>
                                    <p className="text-slate-300 text-sm mb-4 flex-grow line-clamp-3">{product.Description}</p>
                                    <div className="space-y-1 mb-4">
                                        <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">₹{product.Price}</p>
                                        <p className="text-slate-400 text-sm">Category: <span className="font-semibold text-slate-300">{product.Category}</span></p>
                                        <p className="text-slate-400 text-sm">Quantity: <span className="font-semibold text-slate-300">{product.Quantity}</span></p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-auto">
                                        <Link to={`/Edit-product/${product._id}`} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 text-center font-bold text-xs">Edit</Link>
                                        <Link to={`/Edit-image/${product._id}`} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-400 hover:to-cyan-400 transition-all duration-200 text-center font-bold text-xs">Edit Image</Link>
                                        <button onClick={() => handleDelete(product._id)} className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-2 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-pink-500 hover:to-red-500 transition-all duration-200 font-bold text-xs">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-400 text-lg">No products listed yet.</p>
                            <Link to="/Add-product" className="text-purple-400 hover:text-pink-400 font-bold mt-2 inline-block transition-colors duration-200">Start adding products</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dash;
