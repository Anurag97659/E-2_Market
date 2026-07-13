import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./comp/registration";
import Login from "./comp/login";
import ForgotPassword from "./comp/ForgotPassword";
import SellerDashboard from "./comp/SellerDashboard";
import Product from "./comp/Product";
import EditProductDetails from "./comp/EditProductDetails";
import EditProductImage from "./comp/EditProductImage";
import Search from "./comp/search";
import MyCart from "./comp/myCart";
import ChangeDetails from "./comp/change-details";
import ChangePassword from "./comp/change-password";
import Profile from "./comp/profile";
import Bill from "./comp/bill";
import Orders from "./comp/Orders";
import ProductPage from "./comp/product_page";
import Home from "./comp/Home";
import Dash from "./comp/dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/Change-details" element={<ChangeDetails />} />
        <Route path="/Change-password" element={<ChangePassword />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/Add-product" element={<Product />} />
        <Route path="/Edit-product/:productId" element={<EditProductDetails />} />
        <Route path="/Edit-image/:productId" element={<EditProductImage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/mycart" element={<MyCart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bill" element={<Bill />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/product_page/:productId" element={<ProductPage />} />
        <Route path="/dash" element={<Dash />} /> 
      </Routes>
    </Router>
  );
}

export default App;
