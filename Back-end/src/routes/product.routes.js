import { Router } from "express";
import {
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
  getSellerPendingOrders,
  getSellerSoldItems,
  confirmDeliveryBySeller,
} from "../controllers/product.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optionalJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Register product with thumbnail + multiple gallery images
router.route("/registerProduct").post(
  verifyJWT,
  upload.fields([
    { name: "Thumbnail", maxCount: 1 },
    { name: "Images", maxCount: 5 },
  ]),
  registerProduct
);

// Update product details
router.route("/updateProduct/:productId").put(verifyJWT, updateProduct);

// Update product images
router.route("/updateImage/:productId").put(
  verifyJWT,
  upload.fields([
    { name: "Thumbnail", maxCount: 1 },
    { name: "Images", maxCount: 5 },
  ]),
  updateImage
);

// Delete
router.route("/deleteProduct").post(verifyJWT, deleteProduct);

// Seller views
router.route("/sell").get(verifyJWT, sell);
router.route("/seller/pendingOrders").get(verifyJWT, getSellerPendingOrders);
router.route("/seller/soldItems").get(verifyJWT, getSellerSoldItems);
router.route("/seller/confirmDelivery").post(verifyJWT, confirmDeliveryBySeller);

// Public product listing (home page) - works with or without auth
router.route("/getAllProducts").get(optionalJWT, getAllProducts);

// Search - works with or without auth
router.route("/search").get(optionalJWT, search);

// Cart
router.post("/addToCart", verifyJWT, addToCart);
router.post("/removeFromCart", verifyJWT, removeFromCart);

// Product detail - public (no auth required)
router.get("/getproductdetailsforproductpage/:productId", getproductdetailsforproductpage);

export default router;