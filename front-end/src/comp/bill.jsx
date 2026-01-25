import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Bill() {
  const [username, setUsername] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({ cardNumber: "", expiry: "", cvv: "" });

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

  useEffect(() => {
    fetch("http://localhost:8000/e-2market/v1/users/getusercartlist", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data = ", data);
        setCartItems(data?.data || []);
      })
      .catch((error) => {
        console.error("Error fetching cart items:", error);
      });
  }, []);

  const logout = () => {
    fetch("http://localhost:8000/e-2market/v1/users/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) {
          alert("Logged out successfully");
          window.location.href = "/login";
        } else {
          alert("Logout failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const deleteuser = () => {
    alert("Are you sure you want to delete your account?");
    fetch("http://localhost:8000/e-2market/v1/users/delete", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) {
          alert("User deleted successfully");
          window.location.href = "/login";
        } else {
          alert("User deletion failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  const handlePayment = ()=>{
    alert(`Payment method: ${paymentMethod} selected. Proceeding to payment...`);
    fetch("http://localhost:8000/e-2market/v1/users/addtoOrder",{
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
  })
  .then((res) => res.json())
  .then((data) =>{
      alert(data.message || "Order placed successfully!");
  })
  .catch((error) =>{
      console.error("Error placing order:", error);
      alert("Something went wrong");
  });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <div className="w-56 h-screen fixed bg-white/10 backdrop-blur-md shadow-lg p-4 flex flex-col justify-between border-r border-white/20">
        <div>
          <h2 className="text-lg font-bold text-white mb-6 text-center">PAYMENT</h2>
          <div className="space-y-2">
            <Link to="/profile" className="block text-sm text-gray-100 font-medium py-2 px-3 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-purple-500">Profile</Link>
            <Link to="/search" className="block text-sm text-gray-100 font-medium py-2 px-3 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-purple-500">Search</Link>
            <Link to="/mycart" className="block text-sm text-gray-100 font-medium py-2 px-3 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-purple-500">My Cart</Link>
            <Link to="/orders" className="block text-sm text-gray-100 font-medium py-2 px-3 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-purple-500">Orders</Link>
            <Link to="/Change-details" className="block text-sm text-gray-100 font-medium py-2 px-3 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-purple-500">Change Details</Link>
            <Link to="/Change-password" className="block text-sm text-gray-100 font-medium py-2 px-3 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-purple-500">Change Password</Link>
          </div>
        </div>
        <div className="space-y-2">
          <button onClick={logout} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium">Logout</button>
          <button onClick={deleteuser} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium">Delete Account</button>
        </div>
      </div>

      <div className="flex-1 p-6 ml-56">
        <div className="w-full max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 text-center border-t-4 border-purple-500">
          <h2 className="text-2xl font-bold text-white">Welcome, {username}</h2>
        </div>

        <div className="w-full max-w-4xl my-4 mx-auto bg-white/10 backdrop-blur-md rounded-lg shadow-md p-4 text-center flex justify-between border border-white/20">
          <div className="flex-1">
            <h4 className="text-xs text-gray-300 font-medium mb-1">Total Items</h4>
            <h4 className="text-xl font-bold text-white">{cartItems.length}</h4>
          </div>
          <div className="border-l border-white/20"></div>
          <div className="flex-1">
            <h4 className="text-xs text-gray-300 font-medium mb-1">Total Amount</h4>
            <h4 className="text-xl font-bold text-white">₹ {cartItems.reduce((acc, item) => acc + item.Price, 0)}</h4>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 border border-white/20">
          <h3 className="text-lg font-bold mb-4 text-white">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 rounded-lg border-2 border-white/20 hover:border-purple-500 hover:bg-white/5 cursor-pointer transition-all duration-200">
              <input type="radio" name="payment" value="upi" 
                    checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-100">UPI</span>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-lg border-2 border-white/20 hover:border-purple-500 hover:bg-white/5 cursor-pointer transition-all duration-200">
              <input type="radio" name="payment" value="card" 
                    checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-100">Credit/Debit Card</span>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-lg border-2 border-white/20 hover:border-purple-500 hover:bg-white/5 cursor-pointer transition-all duration-200">
              <input type="radio" name="payment" value="emi" 
                    checked={paymentMethod === "emi"} onChange={() => setPaymentMethod("emi")} className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-100">EMI</span>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-lg border-2 border-white/20 hover:border-purple-500 hover:bg-white/5 cursor-pointer transition-all duration-200">
              <input type="radio" name="payment" value="cod" 
                        checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-100">Cash on Delivery (COD)</span>
            </label>
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            {paymentMethod === "upi" && (
              <input type="text" placeholder="Enter UPI ID" className="w-full p-2 text-sm bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-200" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            )}
            {paymentMethod === "card" && (
              <div className="space-y-2">
                <input type="text" placeholder="Card Number" className="w-full p-2 text-sm bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-200" value={cardDetails.cardNumber} onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })} />
                <input type="text" placeholder="Expiry (MM/YY)" className="w-full p-2 text-sm bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-200" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} />
              </div>
            )}
          </div>

          <button onClick={handlePayment} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 text-sm rounded-lg font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg">Proceed to Pay</button>
        </div>
      </div>
    </div>
  );
}

export default Bill;
