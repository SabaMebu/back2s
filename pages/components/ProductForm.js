import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title_en: existingTitleEn,
  title_ge: existingTitleGe,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  // State variables
  const [title_en, setTitleEn] = useState(existingTitleEn || "");
  const [title_ge, setTitleGe] = useState(existingTitleGe || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [savedTitleEn, setSavedTitleEn] = useState("");
  const [savedTitleGe, setSavedTitleGe] = useState("");
  const router = useRouter();

  // Fetch categories
  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  // Save product (create or update)
  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title_en,
      title_ge,
      description,
      price,
      images,
      category,
      properties: productProperties,
    };
    if (_id) {
      // Update existing product
      await axios.put("/api/products", { ...data, _id });
    } else {
      // Create new product
      await axios.post("/api/products", data);
    }

    // Save the titles to display them on the front-end
    setSavedTitleEn(title_en);
    setSavedTitleGe(title_ge);

    // Redirect or display confirmation
    setGoToProducts(true);
  }

  // Redirect to products page after save
  if (goToProducts) {
    router.push("/products");
  }

  // Handle image upload
  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const res = await axios.post("/api/upload", data);
      setImages((oldImages) => [...oldImages, ...res.data.links]);
      setIsUploading(false);
    }
  }

  // Update images order
  function updateImagesOrder(images) {
    setImages(images);
  }

  // Update product properties
  function setProductProp(propName, value) {
    setProductProperties((prev) => ({
      ...prev,
      [propName]: value,
    }));
  }

  // Properties to fill based on category hierarchy (currently commented out)
  const propertiesToFill = [];
  // Uncomment this block if you need to handle category-based properties
  // if (categories.length > 0 && category) {
  //   let catInfo = categories.find(({ _id }) => _id === category);
  //   propertiesToFill.push(...catInfo.properties);
  //   while (catInfo?.parent?._id) {
  //     const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
  //     propertiesToFill.push(...parentCat.properties);
  //     catInfo = parentCat;
  //   }
  // }

  return (
    <form onSubmit={saveProduct}>
      {/* Title in English */}
      <label>Product name (English)</label>
      <input
        type="text"
        placeholder="Product name in English"
        value={title_en}
        onChange={(ev) => setTitleEn(ev.target.value)}
      />

      {/* Title in Georgian */}
      <label>Product name (Georgian)</label>
      <input
        type="text"
        placeholder="Product name in Georgian"
        value={title_ge}
        onChange={(ev) => setTitleGe(ev.target.value)}
      />

      {/* Category */}
      <label>Category</label>
      <select value={category} onChange={(ev) => setCategory(ev.target.value)}>
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
      </select>

      {/* Properties */}
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name}>
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <select
              value={productProperties[p.name] || ""}
              onChange={(ev) => setProductProp(p.name, ev.target.value)}
            >
              {p.values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ))}

      {/* Images */}
      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {images?.map((link) => (
            <div
              key={link}
              className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
            >
              <img src={link} alt="" className="rounded-lg" />
            </div>
          ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add image</div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>

      {/* Description */}
      <label>Description</label>
      <textarea
        placeholder="Product description"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      />

      {/* Price */}
      <label>Price (in USD)</label>
      <input
        type="number"
        placeholder="Product price"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />

      {/* Submit Button */}
      <button type="submit" className="btn-primary">
        Save
      </button>

      {/* Display saved titles */}
      {savedTitleEn && savedTitleGe && (
        <div className="mt-4">
          <h3>Saved Titles:</h3>
          <p>
            <strong>English:</strong> {savedTitleEn}
          </p>
          <p>
            <strong>Georgian:</strong> {savedTitleGe}
          </p>
        </div>
      )}
    </form>
  );
}
