import { Category } from "@/models/Category";
import { mongooseConnect } from "../lib/mongoose";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === "GET") {
    res.json(await Category.find().populate("parent"));
  }

  if (method === "POST") {
    const { name_ge, name_en, name_ru, parentCategory, properties } = req.body;
    const categoryDoc = await Category.create({
      name_ge,
      name_en,
      name_ru,
      parent: parentCategory || undefined,
      properties,
    });
    res.json(categoryDoc);
  }

  if (method === "PUT") {
    const { name_ge, name_en, name_ru, parentCategory, properties, _id } =
      req.body;
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
  }

  if (method === "DELETE") {
    const { _id } = req.query;
    await Category.deleteOne({ _id });
    res.json("ok");
  }
}
