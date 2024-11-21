import mongoose, { model, models, Schema } from "mongoose";

const CategorySchema = new Schema({
  name_en: { type: String, required: true },
  name_ge: { type: String, required: true },
  name_ru: { type: String, required: true },
  parent: { type: mongoose.Types.ObjectId, ref: "Category" },
  properties: [{ type: Object }],
});
export const Category = models?.Category || model("Category", CategorySchema);
