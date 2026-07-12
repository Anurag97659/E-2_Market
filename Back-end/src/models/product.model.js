import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const productSchema = new Schema(
  {
    Title: {
      type: String,
      required: true,
      unique: false,
      minlength: 3,
      index: true,
      trim: true,
    },
    Description: {
      type: String,
      required: true,
      unique: false,
      minlength: 3,
      trim: true,
    },
    Price: {
      type: Number,
      required: true,
    },
    Thumbnail: {
      type: String,
      required: true,
    },
    Images: {
      type: [String],
      default: [],
    },
    Category: {
      type: String,
      required: true,
      minlength: 3,
      index: true,
      trim: true,
    },
    Quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    Owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual for average rating
productSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export const Product = mongoose.model("Product", productSchema);
