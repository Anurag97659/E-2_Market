import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config({ path: "/.env" });
import jwt from "jsonwebtoken";

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    media: { type: [String], default: [] },
  },
  { timestamps: true }
);

const orderSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, default: 1 },
    priceAtOrder: { type: Number, required: true },
    otp: { type: String, required: true },
    status: {
      type: String,
      enum: ["ordered", "delivered"],
      default: "ordered",
    },
    review: reviewSchema,
  },
  { timestamps: true }
);

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const otpSchema = new Schema({
  code: { type: String },
  expiresAt: { type: Date },
});

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      index: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    fullname: {
      type: String,
      required: true,
      minlength: 3,
      index: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
      minlength: 3,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    cart: [cartItemSchema],
    orders: [orderSchema],
    otp: otpSchema,
    forgotPasswordOtp: otpSchema,
    pendingRegistration: {
      type: Schema.Types.Mixed,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } else return next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);