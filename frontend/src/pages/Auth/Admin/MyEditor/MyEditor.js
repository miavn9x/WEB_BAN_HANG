import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Helmet } from "react-helmet";
import { WithContext as ReactTags } from "react-tag-input";
import Select from "react-select"; // Sử dụng react-select

const MyEditor = () => {
  // Các state quản lý dữ liệu bài viết
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // Sử dụng mảng các object cho tags, mỗi tag có id và text
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Các state liên quan đến sản phẩm và danh mục
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [genericOptions, setGenericOptions] = useState([]);
  const [selectedGeneric, setSelectedGeneric] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  // State để reset lại Editor (thay đổi key thì Editor được re-mount)
  const [editorKey, setEditorKey] = useState(0);

  // Gợi ý cho thẻ tags
  const tagSuggestions = [
    { id: "#noibat", text: "#noibat" },
    { id: "#tinmoi", text: "#tinmoi" },
    { id: "#baimoi", text: "#baimoi" },
    { id: "#hot", text: "#hot" },
    { id: "#sale", text: "#sale" },
    { id: "#xemnhieu", text: "#xemnhieu" },
    { id: "#moinhat", text: "#moinhat" },
  ];

  // Khi component load, kiểm tra xem có bản nháp (draft) lưu ở localStorage hay không
  useEffect(() => {
    const draft = localStorage.getItem("draftPost");
    if (draft) {
      const data = JSON.parse(draft);
      setTitle(data.title || "");
      setContent(data.content || "");
      setTags(data.tags || []);
      setSelectedCategory(data.selectedCategory || "");
      setSelectedGeneric(data.selectedGeneric || "");
      setSelectedProduct(data.selectedProduct || "");
    }
  }, []);

  // Mỗi khi thay đổi các trường quan trọng, lưu bản nháp vào localStorage
  useEffect(() => {
    const draft = {
      title,
      content,
      tags,
      selectedCategory,
      selectedGeneric,
      selectedProduct,
    };
    localStorage.setItem("draftPost", JSON.stringify(draft));
  }, [
    title,
    content,
    tags,
    selectedCategory,
    selectedGeneric,
    selectedProduct,
  ]);

  // Lấy danh sách danh mục từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          // Giả sử mỗi sản phẩm có trường category với thuộc tính name
          const categorySet = new Set();
          data.products.forEach((product) => {
            if (product.category && product.category.name) {
              categorySet.add(product.category.name);
            }
          });
          setCategories(Array.from(categorySet));
        } else {
          console.error("Error fetching categories:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Khi chọn danh mục, lấy các loại (generic) của sản phẩm thuộc danh mục đó
  useEffect(() => {
    const fetchGenerics = async () => {
      if (!selectedCategory) return;
      try {
        const response = await fetch(
          `/api/products?categoryName=${selectedCategory}`
        );
        if (response.ok) {
          const data = await response.json();
          const genericSet = new Set();
          data.products.forEach((product) => {
            if (product.category && product.category.generic) {
              genericSet.add(product.category.generic);
            }
          });
          setGenericOptions(Array.from(genericSet));
        } else {
          console.error("Error fetching generics:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching generics:", error);
      }
    };

    fetchGenerics();
  }, [selectedCategory]);

  // Khi chọn loại (generic) sản phẩm, lấy danh sách sản phẩm phù hợp
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategory || !selectedGeneric) return;
      try {
        const response = await fetch(
          `/api/products?categoryName=${selectedCategory}&categoryGeneric=${selectedGeneric}`
        );
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        } else {
          console.error("Error fetching products:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedGeneric]);

  // Xử lý thay đổi nội dung Editor
  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  // Xử lý thay đổi tiêu đề
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Xử lý thay đổi thẻ (tags)
  const handleTagsDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };
  // Xử lý thêm thẻ mới
  const handleTagsAddition = (tag) => {
    // Nếu người dùng nhập thẻ mà không bắt đầu bằng dấu "#", tự động thêm vào
    let newTag = { ...tag };
    if (!newTag.text.startsWith("#")) {
      newTag.text = "#" + newTag.text;
      newTag.id = newTag.text; // Cập nhật id nếu cần
    }
    setTags([...tags, newTag]);
  };

  // Tạo options cho react-select dựa trên danh sách sản phẩm
  const productOptions = products.map((product) => ({
    value: product._id,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={product.images[0]}
          alt={product.name}
          style={{ width: "50px", height: "50px", marginRight: "10px" }}
        />
        {product.name}
      </div>
    ),
  }));

  // Xử lý submit bài viết
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload ảnh (ảnh chính của bài viết)
    let imageUrl = "";
    if (selectedImage) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      try {
        const uploadResponse = await fetch(`/api/upload`, {
          method: "POST",
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imageUrl;
        } else {
          console.error("Image upload failed:", uploadResponse.statusText);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    }

    // Nếu không có ảnh được chọn hoặc upload không thành công,
    // sử dụng ảnh mặc định
    if (!imageUrl) {
      imageUrl =
        "https://res.cloudinary.com/div27nz1j/image/upload/v1737451253/1_vmcjnj.png";
    }

    // Dữ liệu bài viết cần lưu lên backend
    const postData = {
      title,
      content,
      tags, // tags là mảng các object có id và text
      productId: selectedProduct, // Lưu ID sản phẩm được chọn
      imageUrl, // Ảnh chính của bài viết (hoặc ảnh mặc định nếu không có ảnh)
    };

    setLoading(true);
    try {
      const response = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Post created:", data);
        // Sau khi đăng bài thành công, xóa bản nháp
        localStorage.removeItem("draftPost");

        // Reset lại các state về giá trị ban đầu
        setTitle("");
        setContent("");
        setTags([]);
        setSelectedImage(null);
        setSelectedCategory("");
        setSelectedGeneric("");
        setSelectedProduct("");
        setProducts([]);

        // Reset Editor bằng cách thay đổi key
        setEditorKey((prev) => prev + 1);
      } else {
        console.error("Error creating post:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{title ? `${title} - My Blog` : "Create New Post"}</title>
        <meta name="description" content="Create a new blog post" />
        <meta
          name="keywords"
          content={tags.map((tag) => tag.text).join(", ")}
        />
      </Helmet>

      <div className="row">
        <h3 className="text-center my-3 py-4">Tạo Bài Viết Mới</h3>

        {/* Phần nhập nội dung bài viết */}
        <div className="col-md-9">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Tiêu Đề
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="content" className="form-label">
                Nội Dung
              </label>
              <Editor
                key={editorKey}
                apiKey="8t813kgqzmwjgis1zt15s0ez32c6qagtx9ikfwwfusk0nj9j"
                initialValue="<p>Viết nội dung của bạn ở đây</p>"
                init={{
                  height: 600,
                  menubar: false,
                  plugins:
                    "advlist autolink lists link image charmap anchor table emoticons wordcount media code",
                  toolbar:
                    "undo redo | formatselect | bold italic | bullist numlist outdent indent | link image table emoticons | wordcount | media code",
                }}
                onEditorChange={handleEditorChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="image" className="form-label">
                Chọn Ảnh
              </label>
              <input
                type="file"
                className="form-control"
                id="image"
                onChange={(e) => setSelectedImage(e.target.files[0])}
              />
            </div>

            <div className="col-md-12 mb-3">
              <label htmlFor="tags" className="form-label">
                Thẻ (Tags)
              </label>
              <ReactTags
                tags={tags}
                suggestions={tagSuggestions}
                handleDelete={handleTagsDelete}
                handleAddition={handleTagsAddition}
                placeholder="Nhập các thẻ phân loại (press Enter để thêm)"
              />
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{ backgroundColor: "#f1356d", color: "white" }}
            >
              {loading ? "Đang tải..." : "Đăng Bài"}
            </button>
          </form>
        </div>

        {/* Phần lựa chọn sản phẩm */}
        <div className="col-md-3">
          <div className="row">
            {/* Chọn danh mục */}
            <div className="col-md-12 mb-3">
              <label htmlFor="category" className="form-label">
                Chọn Danh Mục
              </label>
              <select
                id="category"
                className="form-control"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  // Reset lại các lựa chọn liên quan khi danh mục thay đổi
                  setSelectedGeneric("");
                  setSelectedProduct("");
                  setProducts([]);
                }}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn loại sản phẩm (generic) */}
            <div className="col-md-12 mb-3">
              <label htmlFor="generic" className="form-label">
                Chọn Loại Sản Phẩm
              </label>
              <select
                id="generic"
                className="form-control"
                value={selectedGeneric}
                onChange={(e) => {
                  setSelectedGeneric(e.target.value);
                  // Reset sản phẩm khi loại sản phẩm thay đổi
                  setSelectedProduct("");
                }}
                required
              >
                <option value="">Chọn loại sản phẩm</option>
                {genericOptions.map((gen, index) => (
                  <option key={index} value={gen}>
                    {gen}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn sản phẩm */}
            <div className="col-md-12 mb-3">
              <label htmlFor="product" className="form-label">
                Chọn Sản Phẩm
              </label>
              <Select
                id="product"
                options={productOptions}
                value={
                  productOptions.find(
                    (option) => option.value === selectedProduct
                  ) || null
                }
                onChange={(selectedOption) =>
                  setSelectedProduct(selectedOption.value)
                }
                placeholder="Chọn sản phẩm"
                isClearable
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEditor;
