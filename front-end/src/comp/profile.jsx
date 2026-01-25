import React,{useEffect,useState} from"react";
import{Link} from"react-router-dom";

function Profile(){
    const[username,setUsername]=useState("");
    const[email,setEmail]=useState("");
    const[phone,setPhone]=useState("");
    const[fullname,setFullname]=useState("");
    const[address,setAddress]=useState("");

    useEffect(()=>{
        fetch("http://localhost:8000/e-2market/v1/users/getProfile",{
            method:"GET",
            credentials:"include",
        })
            .then((res)=>{
                if (res.status === 401){
                    alert("Session expired. Please login again.");
                    window.location.href ="/login";
                }
                return res.json();
            })
            .then((data)=>{
                setUsername(String(data.data.username).toUpperCase());
                setEmail(String(data.data.email));
                setPhone(String(data.data.phone));
                setFullname(String(data.data.fullname));
                setAddress(String(data.data.address));
                
            })
            .catch((error)=>{
                console.error("Error fetching user details:", error);
            });
    }, []);
  
    const logout=()=>{
        fetch("http://localhost:8000/e-2market/v1/users/logout",{
            method:"POST",
            credentials:"include",
        })
            .then((res)=>{
                if (res.status === 200){
                    alert("Logged out successfully");
                    window.location.href ="/login";
                } else{
                    alert("Logout failed. Please try again.");
                }
            })
            .catch((error)=>{
                console.error("Error logging out:", error);
            });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
            
            <div className="w-64 h-screen fixed bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between border-r border-purple-500/20">
                <div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 text-center">Profile</h2>
                    <nav className="space-y-2">
                        <Link to="/dash" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Dashboard</Link>
                        <Link to="/search" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Search</Link>
                        <Link to="/mycart" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">My Cart</Link>
                        <Link to="/orders" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Orders</Link>
                        <Link to="/Change-details" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Details</Link>
                        <Link to="/Change-password" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 border border-transparent hover:border-purple-500/30">Change Password</Link>
                    </nav>
                </div>
                <button onClick={logout} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-200">Logout</button>
            </div>

            
            <div className="ml-64 p-8 w-full">
                <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 text-center">Profile Details</h2>
                    <div className="space-y-6">
                        <div className="pb-4 border-b border-purple-500/20">
                            <p className="text-lg font-semibold text-slate-300"><span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Fullname</span>: <span className="text-slate-400">{fullname}</span></p>
                        </div>
                        <div className="pb-4 border-b border-purple-500/20">
                            <p className="text-lg font-semibold text-slate-300"><span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Username</span>: <span className="text-slate-400">{username}</span></p>
                        </div>
                        <div className="pb-4 border-b border-purple-500/20">
                            <p className="text-lg font-semibold text-slate-300"><span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Email</span>: <span className="text-slate-400">{email}</span></p>
                        </div>
                        <div className="pb-4 border-b border-purple-500/20">
                            <p className="text-lg font-semibold text-slate-300"><span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Phone</span>: <span className="text-slate-400">{phone}</span></p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-300"><span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Address</span>: <span className="text-slate-400">{address}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
