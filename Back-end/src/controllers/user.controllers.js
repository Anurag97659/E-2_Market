import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { Product } from "../models/product.model.js";
import jwt from "jsonwebtoken";
import {ApiResponse} from '../utils/ApiResponse.js';
import dotenv from "dotenv";
dotenv.config({
    path: "/.env"
});

const registeruser=asyncHandler(async(req,res)=>{
    const{username,email,password,fullname,phone,address}=req.body;
    if(!fullname){
        throw new ApiError(400,"Fullname is required");
   }
    if(!password){
        throw new ApiError(400,"Password is required");
   }
    if(!email){
        throw new ApiError(400,"Email is required");
   }
    if(!username){
        throw new ApiError(400,"Username is required");
   }
    if(!phone){
        throw new ApiError(400,"Phone number is required");
   }
    if(!address){
        throw new ApiError(400,"Address is required");
   }

    const checkingUserExistance=await User.findOne({
        $or:[{email},{username}]
   });
    if(checkingUserExistance){
        throw new ApiError(409,"User or email already exists");
   }

    const user=await User.create({username, email, password, fullname, phone, address});
    const createUser=await User.findById(user._id).select("-password -refreshToken");
    if(!createUser){
        throw new ApiError(500,"User creation failed due to some internal problem");
   }

    return res.status(200).json(
        new ApiResponse(200, createUser,"User created successfully")
    );
});

const generateAccessTokenAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
   } catch(error){
        throw new ApiError(500,`Token generation failed while generating access token and refresh token:${error.message}`);
   }
};

const loginuser=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body;

    if(!email && !username){
        throw new ApiError(400,"Email or username is required");
   }

    const user=await User.findOne({
        $or:[{email},{username}]
   });

    if(!user){
        throw new ApiError(404,"User not found");
   }

    const isPasswordRight=await user.isPasswordCorrect(password);
    if(!isPasswordRight){
        throw new ApiError(401,"Password is incorrect");
   }

    const{accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);
    const loggedUser=await User.findById(user._id).select("-password -refreshToken");
    // console.log('accessToken = ',accessToken);
    // console.log('refreshToken = ',refreshToken);
    const options={
        httpOnly:true,
        secure:true
   };
    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,{
                user:loggedUser,
                accessToken,
                refreshToken
           },"User logged in successfully")
        );
});

const logoutuser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken: 1,
     },
   },
    {
      new:true,
   }
  );

  const options={
    httpOnly:true,
    secure:true,
 };
  return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"));
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword,confirmPassword}=req.body;
    if(newPassword !==confirmPassword){
        throw new ApiError(401,"New password and confirm password are different");
   }
    const user=await User.findById(req.user?._id);
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Wrong old password");
   }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Password changed successfully")
        );
});

const updateDetails=asyncHandler(async(req,res)=>{
    const {username,email,fullname,phone,address}=req.body;
    if(!username && !email && !fullname && !phone && !address){
        throw new ApiError(400,"At least one field is required to update");
   }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                username,
                email,
                fullname,
                phone,
                address
           }
       },
        {new:true}
    ).select("-password");
    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Details updated successfully")
        );
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
   }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"User not found by refresh token");
       }
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(400,"Refresh token does not match -> Invalid refresh token");
       }
        const options={
            httpOnly: true,
            secure: true
       };
        const {accessToken, newRefreshToken}=await generateAccessTokenAndRefreshToken(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,{
                    accessToken,
                    refreshToken: newRefreshToken
               },"Access token updated")
            );
   } catch(error){
        throw new ApiError(400, `Invalid refresh token: ${error.message}`);
   }
});

const deleteUser=asyncHandler(async(req,res)=>{
    const user=await User.findByIdAndDelete(req.user?._id);
    if(!user){
        throw new ApiError(404,"User not found");
   }
    return res
        .status(200)
        .json(
            new ApiResponse(200, user,"User deleted successfully")
        );
});

const getUsername=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id).select("username");
    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Username fetched successfully")
        );
});

const getProfile=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id).select("-password -refreshToken");  
    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Profile fetched successfully")
        );
});

const getusercartlist = asyncHandler(async (req, res)=>{
    const user = await User.findById(req.user?._id)
        .populate({
            path: "cart",
            select: "Title Price Image",
        })
        .select("cart");
        console.log("user = ",user);

    if(!user){
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, user.cart,"Cart fetched successfully"));
});

const addToOrders = asyncHandler(async (req, res) =>{
    const userId = req.user._id;
    const user = await User.findById(userId).populate("cart"); 

    if(!user){throw new ApiError(404, "User not found");}

    if(user.cart.length === 0){throw new ApiError(400, "Your cart is empty. Add products before ordering.");}
    user.orders.push(...user.cart);
    user.cart = [];
    await user.save();

    res.status(200)
    .json(
        new ApiResponse
        (200, 
        user.orders,
            "Order placed successfully!"
        )
    );
});

const getOrderlist=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id).populate({
        path: "orders",
        select: "Title Price Image",
    }).select("orders");
    if(!user){
        throw new ApiError(404, "User not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Orders fetched successfully")
        );

});


const cancelOrder = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { orders: productId } },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await Product.findByIdAndUpdate(
        productId,
        { $unset: { Client: "" } }
    );

    res.status(200).json(
        new ApiResponse(200, user, "Order cancelled successfully")
    );
});

export {
    registeruser,
    loginuser,
    logoutuser,
    changeCurrentPassword,
    updateDetails,
    refreshAccessToken,
    deleteUser,
    getUsername,
    getProfile,
    getusercartlist,
    getOrderlist,
    addToOrders,
    cancelOrder

};
