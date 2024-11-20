import mongoose, { model, Schema, models } from "mongoose";

const ProductSchema = new Schema({
  title_en: { type: String, required: true },
  title_ge: { type: String, required: true },
  description_en: { type: String }, // Added English description field
  description_ge: { type: String }, // Added Georgian description field
  images: [{ type: String }],
  category: { type: mongoose.Types.ObjectId, ref: "Category" },
});

export const Product = models.Product || model("Product", ProductSchema);
