import { Router } from "express";
import {
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
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Registration (OTP flow)
router.route("/sendRegistrationOTP").post(sendRegistrationOTP);
router.route("/verifyRegistrationOTP").post(verifyRegistrationOTP);

// Auth
router.route("/login").post(upload.none(), loginuser);
router.route("/logout").post(verifyJWT, logoutuser);
router.route("/refreshToken").get(refreshAccessToken);

// Forgot password
router.route("/forgotPassword").post(sendForgotPasswordOTP);
router.route("/verifyForgotOTP").post(verifyForgotPasswordOTP);
router.route("/resetPassword").post(resetPassword);

// Profile
router.route("/getUsername").get(verifyJWT, getUsername);
router.route("/getProfile").get(verifyJWT, getProfile);
router.route("/updateDetails").post(verifyJWT, updateDetails);
router.route("/sendChangeEmailOTP").post(verifyJWT, sendChangeEmailOTP);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/delete").post(verifyJWT, deleteUser);

// Cart
router.route("/getusercartlist").get(verifyJWT, getusercartlist);

// Orders
router.route("/getorderlist").get(verifyJWT, getOrderlist);
router.route("/addtoOrder").post(verifyJWT, addToOrders);
router.route("/cancelOrder").post(verifyJWT, cancelOrder);

// Reviews
router.route("/addReview").post(
  verifyJWT,
  upload.fields([{ name: "reviewMedia", maxCount: 5 }]),
  addReview
);


export default router;