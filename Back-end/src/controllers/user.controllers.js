import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  sendOTPEmail,
  sendForgotPasswordEmail,
  sendOrderConfirmationEmail,
  sendSellerNotificationEmail,
} from "../utils/mailer.js";
import dotenv from "dotenv";
dotenv.config({ path: "/.env" });

/* ─── helpers ─────────────────────────────────────────────── */
const generateOTP = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000); // 10 min

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      `Token generation failed: ${error.message}`
    );
  }
};

/* ─── REGISTRATION WITH OTP ───────────────────────────────── */

// Step 1: Send OTP to email
const sendRegistrationOTP = asyncHandler(async (req, res) => {
  const { username, email, password, fullname, phone, address } = req.body;

  if (!fullname) throw new ApiError(400, "Full name is required");
  if (!password) throw new ApiError(400, "Password is required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!username) throw new ApiError(400, "Username is required");
  if (!phone) throw new ApiError(400, "Phone number is required");
  if (!address) throw new ApiError(400, "Address is required");
  if (password.length < 8)
    throw new ApiError(400, "Password must be at least 8 characters");

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new ApiError(409, "Username or email already exists");

  const otp = generateOTP();

  // Store pending registration in a temp user doc (unverified)
  await User.deleteOne({ email, emailVerified: false }); // clear stale
  const tempUser = await User.create({
    username,
    email,
    password,
    fullname,
    phone,
    address,
    emailVerified: false,
    otp: { code: otp, expiresAt: otpExpiry() },
  });

  await sendOTPEmail(email, otp, "account registration");

  return res
    .status(200)
    .json(new ApiResponse(200, { email }, "OTP sent to your email"));
});

// Step 2: Verify OTP and activate account
const verifyRegistrationOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const user = await User.findOne({ email, emailVerified: false });
  if (!user) throw new ApiError(404, "No pending registration found for this email");

  if (!user.otp?.code) throw new ApiError(400, "No OTP was sent. Please register again.");
  if (user.otp.expiresAt < new Date()) throw new ApiError(400, "OTP has expired. Please register again.");
  if (user.otp.code !== otp.trim()) throw new ApiError(400, "Invalid OTP");

  user.emailVerified = true;
  user.otp = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Account verified successfully. You can now log in."));
});

/* ─── LOGIN ────────────────────────────────────────────────── */
const loginuser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username)
    throw new ApiError(400, "Email or username is required");

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) throw new ApiError(404, "User not found");

  if (!user.emailVerified)
    throw new ApiError(403, "Email not verified. Please complete registration.");

  const isPasswordRight = await user.isPasswordCorrect(password);
  if (!isPasswordRight) throw new ApiError(401, "Incorrect password");

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

/* ─── LOGOUT ───────────────────────────────────────────────── */
const logoutuser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/* ─── FORGOT PASSWORD ──────────────────────────────────────── */
const sendForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email, emailVerified: true });
  if (!user) throw new ApiError(404, "No account found with this email");

  const otp = generateOTP();
  user.forgotPasswordOtp = { code: otp, expiresAt: otpExpiry() };
  await user.save({ validateBeforeSave: false });

  await sendForgotPasswordEmail(email, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, { email }, "OTP sent to your email"));
});

const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const user = await User.findOne({ email, emailVerified: true });
  if (!user) throw new ApiError(404, "User not found");

  if (!user.forgotPasswordOtp?.code)
    throw new ApiError(400, "No OTP requested. Please request a new one.");
  if (user.forgotPasswordOtp.expiresAt < new Date())
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  if (user.forgotPasswordOtp.code !== otp.trim())
    throw new ApiError(400, "Invalid OTP");

  // Mark OTP as verified by replacing code with a verified token
  user.forgotPasswordOtp = { code: "VERIFIED_" + otp, expiresAt: otpExpiry() };
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { email }, "OTP verified successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  if (!email || !otp || !newPassword || !confirmPassword)
    throw new ApiError(400, "All fields are required");
  if (newPassword !== confirmPassword)
    throw new ApiError(400, "Passwords do not match");
  if (newPassword.length < 8)
    throw new ApiError(400, "Password must be at least 8 characters");

  const user = await User.findOne({ email, emailVerified: true });
  if (!user) throw new ApiError(404, "User not found");

  if (!user.forgotPasswordOtp?.code?.startsWith("VERIFIED_"))
    throw new ApiError(400, "Please verify OTP first");
  if (user.forgotPasswordOtp.expiresAt < new Date())
    throw new ApiError(400, "Session expired. Please start over.");

  user.password = newPassword;
  user.forgotPasswordOtp = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

/* ─── CHANGE PASSWORD ──────────────────────────────────────── */
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword)
    throw new ApiError(401, "New password and confirm password do not match");
  if (newPassword.length < 8)
    throw new ApiError(400, "Password must be at least 8 characters");

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(401, "Incorrect old password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/* ─── UPDATE DETAILS ───────────────────────────────────────── */
const sendChangeEmailOTP = asyncHandler(async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) throw new ApiError(400, "New email is required");

  const existing = await User.findOne({ email: newEmail });
  if (existing) throw new ApiError(409, "This email is already in use");

  const otp = generateOTP();
  const user = await User.findById(req.user._id);
  user.otp = { code: otp, expiresAt: otpExpiry() };
  await user.save({ validateBeforeSave: false });

  await sendOTPEmail(newEmail, otp, "email change");

  return res
    .status(200)
    .json(new ApiResponse(200, { newEmail }, "OTP sent to new email"));
});

const updateDetails = asyncHandler(async (req, res) => {
  const { username, email, fullname, phone, address, otp } = req.body;

  if (!username && !email && !fullname && !phone && !address)
    throw new ApiError(400, "At least one field is required to update");

  const currentUser = await User.findById(req.user._id);

  // If email is being changed, verify OTP
  if (email && email !== currentUser.email) {
    if (!otp) throw new ApiError(400, "OTP is required to change email");
    if (!currentUser.otp?.code)
      throw new ApiError(400, "No OTP sent. Please request OTP for email change first.");
    if (currentUser.otp.expiresAt < new Date())
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    if (currentUser.otp.code !== otp.trim())
      throw new ApiError(400, "Invalid OTP");
    currentUser.otp = undefined;
  }

  const updateFields = {};
  if (username) updateFields.username = username;
  if (email) updateFields.email = email;
  if (fullname) updateFields.fullname = fullname;
  if (phone) updateFields.phone = phone;
  if (address) updateFields.address = address;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Details updated successfully"));
});

/* ─── REFRESH TOKEN ────────────────────────────────────────── */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "User not found");
    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(400, "Invalid refresh token");

    const options = { httpOnly: true, secure: true };
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, `Invalid refresh token: ${error.message}`);
  }
});

/* ─── DELETE USER ──────────────────────────────────────────── */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user?._id);
  if (!user) throw new ApiError(404, "User not found");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User deleted successfully"));
});

/* ─── PROFILE GETTERS ──────────────────────────────────────── */
const getUsername = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select("username");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Username fetched successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

/* ─── CART ─────────────────────────────────────────────────── */
const getusercartlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id)
    .populate({
      path: "cart.product",
      select: "Title Price Thumbnail Images Category Quantity",
    })
    .select("cart");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user.cart, "Cart fetched successfully"));
});

/* ─── ORDERS ───────────────────────────────────────────────── */
const addToOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { directBuyProductId, directBuyQuantity, paymentMethod } = req.body;

  const user = await User.findById(userId).populate("cart.product");
  if (!user) throw new ApiError(404, "User not found");

  let itemsToOrder = [];

  if (directBuyProductId) {
    // Direct buy - single product
    const qty = parseInt(directBuyQuantity) || 1;
    const product = await Product.findById(directBuyProductId).populate("Owner");
    if (!product) throw new ApiError(404, "Product not found");
    if (product.Quantity < qty)
      throw new ApiError(400, `Only ${product.Quantity} units available`);
    itemsToOrder.push({ product, qty });
  } else {
    // Cart checkout
    if (!user.cart || user.cart.length === 0)
      throw new ApiError(400, "Your cart is empty");

    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.product._id || cartItem.product).populate("Owner");
      if (!product) continue;
      const qty = cartItem.quantity || 1;
      if (product.Quantity < qty)
        throw new ApiError(400, `Only ${product.Quantity} units of "${product.Title}" available`);
      itemsToOrder.push({ product, qty });
    }
  }

  const buyerUser = await User.findById(userId).select("fullname phone address email");
  const newOrders = [];

  for (const { product, qty } of itemsToOrder) {
    const otp = generateOTP();
    const totalPrice = product.Price * qty;

    // Deduct quantity
    await Product.findByIdAndUpdate(product._id, {
      $inc: { Quantity: -qty },
    });

    const orderEntry = {
      product: product._id,
      quantity: qty,
      priceAtOrder: product.Price,
      otp,
      status: "ordered",
    };
    newOrders.push(orderEntry);

    // Send buyer confirmation email
    await sendOrderConfirmationEmail(buyerUser.email, {
      productTitle: product.Title,
      quantity: qty,
      totalPrice,
      otp,
    });

    // Send seller notification
    if (product.Owner?.email) {
      await sendSellerNotificationEmail(product.Owner.email, {
        productTitle: product.Title,
        quantity: qty,
        buyerName: buyerUser.fullname,
        buyerPhone: buyerUser.phone,
        deliveryAddress: buyerUser.address,
      });
    }
  }

  // Push orders to user
  user.orders.push(...newOrders);

  // Clear cart if not direct buy
  if (!directBuyProductId) {
    user.cart = [];
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { ordersPlaced: newOrders.length }, "Order placed successfully")
  );
});

const getOrderlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id)
    .populate({
      path: "orders.product",
      select: "Title Price Thumbnail Images Category Owner",
      populate: { path: "Owner", select: "fullname email" },
    })
    .select("orders");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user.orders, "Orders fetched successfully"));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user._id;

  if (!orderId) throw new ApiError(400, "Order ID is required");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const orderIndex = user.orders.findIndex(
    (o) => o._id.toString() === orderId
  );
  if (orderIndex === -1) throw new ApiError(404, "Order not found");

  const order = user.orders[orderIndex];
  if (order.status === "delivered")
    throw new ApiError(400, "Delivered orders cannot be cancelled");

  // Restore product quantity
  await Product.findByIdAndUpdate(order.product, {
    $inc: { Quantity: order.quantity },
  });

  user.orders.splice(orderIndex, 1);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order cancelled successfully"));
});

/* ─── REVIEWS ──────────────────────────────────────────────── */
const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user._id;

  if (!productId) throw new ApiError(400, "Product ID is required");
  if (!rating || rating < 1 || rating > 5)
    throw new ApiError(400, "Rating must be between 1 and 5");

  // Check if user has a delivered order for this product
  const user = await User.findById(userId).select("orders");
  const hasDeliveredOrder = user.orders.some(
    (o) =>
      o.product.toString() === productId && o.status === "delivered" && !o.review
  );

  if (!hasDeliveredOrder)
    throw new ApiError(
      403,
      "You can only review products you have received. Review already submitted."
    );

  // Add review to product
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const existingReview = product.reviews.find(
    (r) => r.user.toString() === userId.toString()
  );
  if (existingReview)
    throw new ApiError(400, "You have already reviewed this product");

  product.reviews.push({ user: userId, rating: Number(rating), comment });
  await product.save();

  // Mark the order as reviewed
  const orderToMark = user.orders.find(
    (o) => o.product.toString() === productId && o.status === "delivered" && !o.review
  );
  if (orderToMark) {
    orderToMark.review = { user: userId, rating: Number(rating), comment };
    await user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review submitted successfully"));
});

export {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  loginuser,
  logoutuser,
  changeCurrentPassword,
  sendChangeEmailOTP,
  updateDetails,
  refreshAccessToken,
  deleteUser,
  getUsername,
  getProfile,
  getusercartlist,
  getOrderlist,
  addToOrders,
  cancelOrder,
  addReview,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
};
