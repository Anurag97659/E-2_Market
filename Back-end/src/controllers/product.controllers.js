import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import dotenv from "dotenv";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { buildComparison } from "../utils/priceComparison.service.js";
dotenv.config({ path: "/.env" });

/* ─── REGISTER PRODUCT ────────────────────────────────────── */
const registerProduct = asyncHandler(async (req, res) => {
  const { Title, Description, Price, Category, Quantity } = req.body;
  const userId = req.user._id;

  if (!userId) throw new ApiError(400, "User not found");
  if (!Title || Title.trim() === "") throw new ApiError(400, "Title is required");
  if (!Description || Description.trim() === "") throw new ApiError(400, "Description is required");
  if (!Price) throw new ApiError(400, "Price is required");
  if (!Category || Category.trim() === "") throw new ApiError(400, "Category is required");
  if (!Quantity) throw new ApiError(400, "Quantity is required");

  // Thumbnail (required)
  if (!req.files || !req.files.Thumbnail || req.files.Thumbnail.length === 0)
    throw new ApiError(400, "Thumbnail image is required");

  const thumbnailLocalPath = req.files.Thumbnail[0]?.path;
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail image is required");

  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailUpload) throw new ApiError(500, "Thumbnail upload failed");

  // Additional images (optional)
  let imagesUrls = [];
  if (req.files.Images && req.files.Images.length > 0) {
    for (const file of req.files.Images) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded) imagesUrls.push(uploaded.secure_url);
    }
  }

  const product = await Product.create({
    Title,
    Description,
    Price,
    Category,
    Quantity,
    Owner: userId,
    Thumbnail: thumbnailUpload.secure_url,
    Images: imagesUrls,
    priceHistory: [{ price: Number(Price), changedAt: new Date() }],
  });

  const created = await Product.findById(product._id);
  if (!created) throw new ApiError(500, "Product creation failed");

  return res
    .status(200)
    .json(new ApiResponse(200, created, "Product created successfully"));
});

/* ─── UPDATE PRODUCT DETAILS ──────────────────────────────── */
const updateProduct = asyncHandler(async (req, res) => {
  const { Title, Description, Price, Category, Quantity } = req.body;
  const { productId } = req.params;

  if (!productId) throw new ApiError(400, "Product not found");
  if (!Title && !Description && !Price && !Category && !Quantity)
    throw new ApiError(400, "At least one field is required to update");

  const userId = req.user._id;

  // Fetch current product to detect a price change
  const existing = await Product.findOne({ _id: productId, Owner: userId });
  if (!existing) throw new ApiError(404, "Product not found");

  const updateData = { Title, Description, Price, Category, Quantity };
  const newPrice = Price !== undefined ? Number(Price) : null;

  // Push a new priceHistory entry only when the price actually changes
  if (newPrice !== null && newPrice !== existing.Price) {
    await Product.findByIdAndUpdate(productId, {
      $push: { priceHistory: { price: newPrice, changedAt: new Date() } },
    });
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, Owner: userId },
    { $set: updateData },
    { new: true }
  );

  if (!product) throw new ApiError(500, "Product update failed");

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

/* ─── UPDATE IMAGES ───────────────────────────────────────── */
const updateImage = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  if (!productId) throw new ApiError(400, "Product not found");

  let updateData = {};

  if (req.files?.Thumbnail && req.files.Thumbnail.length > 0) {
    const uploaded = await uploadOnCloudinary(req.files.Thumbnail[0].path);
    if (!uploaded) throw new ApiError(500, "Thumbnail upload failed");
    updateData.Thumbnail = uploaded.secure_url;
  }

  if (req.files?.Images && req.files.Images.length > 0) {
    const urls = [];
    for (const file of req.files.Images) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded) urls.push(uploaded.secure_url);
    }
    updateData.Images = urls;
  }

  if (Object.keys(updateData).length === 0)
    throw new ApiError(400, "No images provided");

  const product = await Product.findOneAndUpdate(
    { _id: productId, Owner: userId },
    { $set: updateData },
    { new: true }
  );

  if (!product) throw new ApiError(500, "Product image update failed");

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product images updated successfully"));
});

/* ─── DELETE PRODUCT ──────────────────────────────────────── */
const deleteProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) throw new ApiError(400, "Product not found");

  const productOwner = await Product.findOne({ _id: productId }).select("Owner");
  if (!productOwner) throw new ApiError(404, "Product not found");

  if (userId.toString() !== productOwner.Owner.toString())
    throw new ApiError(403, "You are not authorized to delete this product");

  const product = await Product.findOneAndDelete({ _id: productId, Owner: userId });
  if (!product) throw new ApiError(500, "Product deletion failed");

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product deleted successfully"));
});

/* ─── SELLER: OWN PRODUCTS ────────────────────────────────── */
const sell = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const products = await Product.find({ Owner: userId });
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

/* ─── SELLER: PENDING ORDERS ──────────────────────────────── */
const getSellerPendingOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  // Find all products owned by seller
  const sellerProducts = await Product.find({ Owner: sellerId }).select("_id Title Thumbnail Price");
  const productIds = sellerProducts.map((p) => p._id.toString());

  // Find all users who have orders for seller's products with status 'ordered'
  const buyers = await User.find({
    "orders.product": { $in: productIds },
    "orders.status": "ordered",
  }).select("fullname email phone address orders");

  const pendingOrders = [];
  for (const buyer of buyers) {
    for (const order of buyer.orders) {
      if (
        productIds.includes(order.product.toString()) &&
        order.status === "ordered"
      ) {
        const product = sellerProducts.find(
          (p) => p._id.toString() === order.product.toString()
        );
        pendingOrders.push({
          orderId: order._id,
          product,
          quantity: order.quantity,
          priceAtOrder: order.priceAtOrder,
          orderedAt: order.createdAt,
          buyer: {
            id: buyer._id,
            name: buyer.fullname,
            email: buyer.email,
            phone: buyer.phone,
            address: buyer.address,
          },
        });
      }
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, pendingOrders, "Pending orders fetched"));
});

/* ─── SELLER: CONFIRM DELIVERY ────────────────────────────── */
const confirmDeliveryBySeller = asyncHandler(async (req, res) => {
  const { buyerEmail, orderId, otp } = req.body;
  const sellerId = req.user._id;

  if (!buyerEmail || !orderId || !otp)
    throw new ApiError(400, "Buyer email, order ID, and OTP are required");

  const buyer = await User.findOne({ email: buyerEmail });
  if (!buyer) throw new ApiError(404, "Buyer not found");

  const order = buyer.orders.id(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  // Verify seller owns the product
  const product = await Product.findById(order.product);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.Owner.toString() !== sellerId.toString())
    throw new ApiError(403, "You are not authorized to confirm this order");

  if (order.status === "delivered")
    throw new ApiError(400, "Order already marked as delivered");

  if (order.otp !== otp.trim())
    throw new ApiError(400, "Invalid OTP. Please ask the buyer for the correct OTP.");

  order.status = "delivered";
  await buyer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Delivery confirmed successfully"));
});

/* ─── SELLER: SOLD ITEMS ──────────────────────────────────── */
const getSellerSoldItems = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const sellerProducts = await Product.find({ Owner: sellerId }).select("_id Title Thumbnail Price");
  const productIds = sellerProducts.map((p) => p._id.toString());

  const buyers = await User.find({
    "orders.product": { $in: productIds },
    "orders.status": "delivered",
  }).select("fullname email phone address orders");

  const soldItems = [];
  for (const buyer of buyers) {
    for (const order of buyer.orders) {
      if (
        productIds.includes(order.product.toString()) &&
        order.status === "delivered"
      ) {
        const product = sellerProducts.find(
          (p) => p._id.toString() === order.product.toString()
        );
        soldItems.push({
          orderId: order._id,
          product,
          quantity: order.quantity,
          priceAtOrder: order.priceAtOrder,
          deliveredAt: order.updatedAt,
          buyer: {
            name: buyer.fullname,
            email: buyer.email,
            phone: buyer.phone,
          },
        });
      }
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, soldItems, "Sold items fetched"));
});

/* ─── SEARCH ──────────────────────────────────────────────── */
const search = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sortBy, sortOrder } = req.query;

  let filter = {};

  if (search) {
    filter.$or = [
      { Title: { $regex: search, $options: "i" } },
      { Description: { $regex: search, $options: "i" } },
      { Category: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filter.Category = category;
  if (minPrice) filter.Price = { ...filter.Price, $gte: Number(minPrice) };
  if (maxPrice) filter.Price = { ...filter.Price, $lte: Number(maxPrice) };

  // Exclude seller's own products if logged in
  if (req.user?._id) {
    filter.Owner = { $ne: req.user._id };
  }

  let sort = {};
  if (sortBy) sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const products = await Product.find(filter).sort(sort);

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products found successfully"));
});

/* ─── GET ALL PRODUCTS (for home page) ────────────────────── */
const getAllProducts = asyncHandler(async (req, res) => {
  let filter = { Quantity: { $gt: 0 } };

  // Exclude own products if authenticated
  if (req.user?._id) {
    filter.Owner = { $ne: req.user._id };
  }

  const products = await Product.find(filter)
    .populate("Owner", "fullname")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

/* ─── CART OPERATIONS ─────────────────────────────────────── */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  const qty = parseInt(quantity) || 1;

  if (!productId) throw new ApiError(400, "Product ID is required");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  if (String(product.Owner) === String(userId))
    throw new ApiError(400, "You cannot add your own product to the cart");

  if (product.Quantity < qty)
    throw new ApiError(400, `Only ${product.Quantity} units available`);

  const user = await User.findById(userId);
  const cartIndex = user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (cartIndex > -1) {
    user.cart[cartIndex].quantity = qty;
  } else {
    user.cart.push({ product: productId, quantity: qty });
  }

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user.cart, "Product added to cart successfully"));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) throw new ApiError(400, "Product ID is required");

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { cart: { product: productId } } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user.cart, "Product removed from cart"));
});

/* ─── PRODUCT DETAIL PAGE ─────────────────────────────────── */
const getproductdetailsforproductpage = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new ApiError(400, "Product ID is required");

  const product = await Product.findById(productId)
    .populate("Owner", "fullname email")
    .populate("reviews.user", "fullname username");

  if (!product) throw new ApiError(404, "Product not found");

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product details fetched successfully"));
});

const comparePrices = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new ApiError(400, "Product ID is required");

  const product = await Product.findById(productId).select("Title Price Thumbnail");
  if (!product) throw new ApiError(404, "Product not found");

  const comparison = await buildComparison({
    title: product.Title,
    price: product.Price,
    thumbnail: product.Thumbnail,
    productId: product._id,
  });
  return res.status(200).json(new ApiResponse(200, comparison, "Price comparison fetched successfully"));
});

/* ─── PRICE HISTORY ───────────────────────────────────────── */
const getPriceHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new ApiError(400, "Product ID is required");

  const product = await Product.findById(productId).select("Title Price priceHistory");
  if (!product) throw new ApiError(404, "Product not found");

  // Sort history oldest → newest
  const history = (product.priceHistory || []).slice().sort(
    (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
  );

  return res.status(200).json(
    new ApiResponse(200, { title: product.Title, currentPrice: product.Price, history }, "Price history fetched")
  );
});

export {
  registerProduct,
  updateProduct,
  updateImage,
  deleteProduct,
  sell,
  search,
  getAllProducts,
  addToCart,
  removeFromCart,
  getproductdetailsforproductpage,
  comparePrices,
  getPriceHistory,
  getSellerPendingOrders,
  getSellerSoldItems,
  confirmDeliveryBySeller,
};
