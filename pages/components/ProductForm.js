import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title_ge: existingTitleGe,
  title_en: existingTitleEn,
  title_ru: existingTitleRu,
  description_ge: existingDescriptionGe,
  description_en: existingDescriptionEn,
  description_ru: existingDescriptionRu,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  const [title_ge, setTitleGe] = useState(existingTitleGe || "");
  const [title_en, setTitleEn] = useState(existingTitleEn || "");
  const [title_ru, setTitleRu] = useState(existingTitleRu || "");
  const [description_ge, setDescriptionGe] = useState(
    existingDescriptionGe || ""
  );
  const [description_en, setDescriptionEn] = useState(
    existingDescriptionEn || ""
  );
  const [description_ru, setDescriptionRu] = useState(
    existingDescriptionRu || ""
  );
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title_ge,
      title_en,
      title_ru,
      description_ge,
      description_en,
      description_ru,
      price,
      images,
      category,
      properties: productProperties,
    };

    if (_id) {
      // update
      await axios.put("/api/products", { ...data, _id });
    } else {
      // create
      await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  }

  if (goToProducts) {
    router.push("/products");
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const res = await axios.post("/api/upload", data);
      setImages((oldImages) => {
        return [...oldImages, ...res.data.links];
      });
      setIsUploading(false);
    }
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  const propertiesToFill = [];

  return (
    <form onSubmit={saveProduct}>
      <label>Product name (Georgian)</label>
      <input
        type="text"
        placeholder="product name (georgian)"
        value={title_ge}
        onChange={(ev) => setTitleGe(ev.target.value)}
      />
      <label>Product name (English)</label>
      <input
        type="text"
        placeholder="product name (english)"
        value={title_en}
        onChange={(ev) => setTitleEn(ev.target.value)}
      />
      <label>Product name (Russian)</label>
      <input
        type="text"
        placeholder="product name (russian)"
        value={title_ru}
        onChange={(ev) => setTitleRu(ev.target.value)}
      />

      <label>Category</label>
      <select value={category} onChange={(ev) => setCategory(ev.target.value)}>
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name_en}
            </option>
          ))}
      </select>

      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name} className="">
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={(ev) => setProductProp(p.name, ev.target.value)}
              >
                {p.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((link) => (
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

      <label>Description (Georgian)</label>
      <textarea
        placeholder="description (georgian)"
        value={description_ge}
        onChange={(ev) => setDescriptionGe(ev.target.value)}
      />

      <label>Description (English)</label>
      <textarea
        placeholder="description (english)"
        value={description_en}
        onChange={(ev) => setDescriptionEn(ev.target.value)}
      />

      <label>Description (Russian)</label>
      <textarea
        placeholder="description (russian)"
        value={description_ru}
        onChange={(ev) => setDescriptionRu(ev.target.value)}
      />

      <label>Price (in USD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />

      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}
