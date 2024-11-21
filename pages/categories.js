import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import axios from "axios";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [nameGe, setNameGe] = useState(""); // Georgian name
  const [nameEn, setNameEn] = useState(""); // English name
  const [nameRu, setNameRu] = useState(""); // Russian name
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }

  async function saveCategory(ev) {
    ev.preventDefault();
    const data = {
      name_ge: nameGe,
      name_en: nameEn,
      name_ru: nameRu,
      parentCategory,
    };

    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }

    setNameGe("");
    setNameEn("");
    setNameRu("");
    setParentCategory("");
    fetchCategories();
  }

  function editCategory(category) {
    setEditedCategory(category);
    setNameGe(category.name_ge || "");
    setNameEn(category.name_en || "");
    setNameRu(category.name_ru || "");
    setParentCategory(category.parent?._id || "");
  }

  function deleteCategory(category) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${
          category.name_ge || category.name_en || category.name_ru
        }?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id);
          fetchCategories();
        }
      });
  }

  function addProperty() {
    setProperties((prev) => [...prev, { name: "", values: "" }]);
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category: ${
              editedCategory.name_ge ||
              editedCategory.name_en ||
              editedCategory.name_ru
            }`
          : "Create new category"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Category name (Georgian)"
            onChange={(ev) => setNameGe(ev.target.value)}
            value={nameGe}
          />
          <input
            type="text"
            placeholder="Category name (English)"
            onChange={(ev) => setNameEn(ev.target.value)}
            value={nameEn}
          />
          <input
            type="text"
            placeholder="Category name (Russian)"
            onChange={(ev) => setNameRu(ev.target.value)}
            value={nameRu}
          />
          <select
            value={parentCategory}
            onChange={(ev) => setParentCategory(ev.target.value)}
          >
            <option value="">No parent category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name_ge || category.name_en || category.name_ru}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Properties</label>
          <button
            type="button"
            onClick={addProperty}
            className="btn-default text-sm"
          >
            Add new property
          </button>
        </div>
        <button type="submit" className="btn-primary py-1">
          Save
        </button>
      </form>
      <table className="basic mt-4">
        <thead>
          <tr>
            <td>Category name (Georgian)</td>
            <td>Category name (English)</td>
            <td>Category name (Russian)</td>
            <td>Parent category</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>{category.name_ge}</td>
              <td>{category.name_en}</td>
              <td>{category.name_ru}</td>
              <td>
                {category.parent
                  ? category.parent.name_ge ||
                    category.parent.name_en ||
                    category.parent.name_ru
                  : "None"}
              </td>
              <td>
                <button
                  onClick={() => editCategory(category)}
                  className="btn-primary mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category)}
                  className="btn-primary"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
