import { Category } from "@/models/Category";
import { mongooseConnect } from "../lib/mongoose";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === "GET") {
    // Fetch all categories, including parent category details
    res.json(await Category.find().populate("parent"));
  }

  if (method === "POST") {
    try {
      const { name_ge, name_en, name_ru, parentCategory, properties } = req.body;
      console.log(req.body);
      const categoryDoc = await Category.create({
        name_ge,
        name_en,
        name_ru,
        parent: parentCategory || undefined,
        properties,
      });
      res.json(categoryDoc);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create category", details: error.message });
    }
  }

  if (method === "PUT") {
    try {
      const { name_ge, name_en, name_ru, parentCategory, properties, _id } = req.body;
      const categoryDoc = await Category.updateOne(
        { _id },
        {
          name_ge,
          name_en,
          name_ru,
          parent: parentCategory || undefined,
          properties,
        }
      );
      res.json(categoryDoc);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update category", details: error.message });
    }
  }

  if (method === "DELETE") {
    try {
      const { _id } = req.query;
      await Category.deleteOne({ _id });
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete category", details: error.message });
    }
  }
}
