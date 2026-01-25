import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import REGISTRATION from './comp/registration';
import Login from './comp/login';
import Dash from './comp/dashboard';
import Product from './comp/Product';
import EditProductDetails from './comp/EditProductDetails';
import EditProductImage from './comp/EditProductImage';
import Search from './comp/search';
import MyCart from './comp/myCart';
import ChangeDetails from './comp/change-details';
import ChangePassword from './comp/change-password';
import Profile from './comp/profile';
import Bill from './comp/bill';
import Orders from './comp/Orders';
import ProductPage from './comp/product_page';

function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<REGISTRATION/>} /> 
        <Route path="/registration" element={<REGISTRATION/>} />
        <Route path="/login" element={<Login/>} />
        <Route path='/Change-details' element={<ChangeDetails/>} />
        <Route path='/Change-password' element={<ChangePassword/>} />
        <Route path='/dash' element={<Dash/>} />
        <Route path='/Add-product' element={<Product/>} />
        <Route path='/Edit-product/:productId' element={<EditProductDetails/>} />
        <Route path='/Edit-image/:productId' element={<EditProductImage/>} />
        <Route path="/search" element={<Search/>} />
        <Route path="/mycart" element={<MyCart/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/bill" element={<Bill/>} />
        <Route path="/orders" element={<Orders/>} />
        <Route path="/product_page/:productId" element={<ProductPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
