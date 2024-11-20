import { Product } from "@/models/Product";
import { mongooseConnect } from "../lib/mongoose";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === "GET") {
    if (req.query?.id) {
      // Fetch single product by ID
      const product = await Product.findOne({ _id: req.query.id });
      res.json(product);
    } else {
      // Fetch all products
      const products = await Product.find();
      res.json(products);
    }
  }

  if (method === "POST") {
    // Create a new product
    const {
      title_ge,
      title_en,
      description_en,
      description_ge,
      price,
      images,
      category,
      properties,
    } = req.body;

    const productDoc = await Product.create({
      title_ge,
      title_en,
      description_en,
      description_ge,
      price,
      images,
      category,
      properties,
    });
    res.json(productDoc);
  }

  if (method === "PUT") {
    // Update an existing product
    const {
      title_ge,
      title_en,
      description_ge,
      description_en,
      price,
      images,
      category,
      properties,
      _id,
    } = req.body;

    await Product.updateOne(
      { _id },
      {
        title_ge,
        title_en,
        description_ge,
        description_en,
        price,
        images,
        category,
        properties,
      }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      // Delete a product by ID
      await Product.deleteOne({ _id: req.query?.id });
      res.json(true);
    }
  }
}
