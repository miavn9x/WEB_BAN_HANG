import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Helmet } from "react-helmet";
import { WithContext as ReactTags } from "react-tag-input";
import Select from "react-select";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../../../../styles/MyEditor.css"; // Import file CSS tùy chỉnh
import { ButtonBase } from "@mui/material";

const MyEditor = () => {
  // Các state quản lý dữ liệu bài viết
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // tags được lưu dưới dạng mảng các object { id, text }
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");

  // Các state liên quan đến sản phẩm và danh mục
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [genericOptions, setGenericOptions] = useState([]);
  const [selectedGeneric, setSelectedGeneric] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  // State để reset lại Editor (thay đổi key thì Editor được re-mount)
  const [editorKey, setEditorKey] = useState(0);

  // Lấy query param (nếu có id => đang chỉnh sửa)
const [searchParams] = useSearchParams();
const postId = searchParams.get("id");

  const navigate = useNavigate();
const fileInputRef = useRef(null);
  // Gợi ý cho thẻ tags
  const tagSuggestions = [
    { id: "#noibat", text: "#noibat" },
    { id: "#tinmoi", text: "#tinmoi" },
    { id: "#baimoi", text: "#baimoi" },
    { id: "#xemnhieu", text: "#xemnhieu" },
    { id: "#moinhat", text: "#moinhat" },
    { id: "#hot", text: "#hot" },
    { id: "#sale", text: "#sale" },
  ];

  // Nếu tạo bài viết mới, load bản nháp từ localStorage
  useEffect(() => {
    if (!postId) {
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
    }
  }, [postId]);

  // Nếu đang chỉnh sửa bài viết, load dữ liệu bài viết từ API
useEffect(() => {
  if (!postId) {
    setExistingImageUrl("");
  }
}, [postId]);

  useEffect(() => {
    if (postId) {
      
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/posts/${postId}`);
          if (response.ok) {
            const data = await response.json();
            setTitle(data.title);
            setContent(data.content); // Cập nhật nội dung cho Editor
            setTags(data.tags.map((tag) => ({ id: tag, text: tag })));
            setSelectedProduct(data.productId);
            setExistingImageUrl(data.imageUrl);
            // Lấy thông tin chi tiết của sản phẩm để lấy danh mục & loại
            const prodResponse = await fetch(`/api/products/${data.productId}`);
            if (prodResponse.ok) {
              const productData = await prodResponse.json();
              if (productData.product && productData.product.category) {
                setSelectedCategory(productData.product.category.name);
                setSelectedGeneric(productData.product.category.generic);
              }
            } else {
              console.error("Error fetching product details");
            }
          } else {
            console.error("Error fetching post for edit");
          }
        } catch (err) {
          console.error("Error:", err);
        }
      };
      fetchPost();
    }
  }, [postId]);

  // Lưu bản nháp vào localStorage (chỉ khi tạo bài viết mới)
  useEffect(() => {
    if (!postId) {
      const draft = {
        title,
        content,
        tags,
        selectedCategory,
        selectedGeneric,
        selectedProduct,
      };
      localStorage.setItem("draftPost", JSON.stringify(draft));
    }
  }, [
    title,
    content,
    tags,
    selectedCategory,
    selectedGeneric,
    selectedProduct,
    postId,
  ]);

  // Lấy danh sách danh mục từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
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
          let fetchedProducts = data.products;
          // Nếu đang chỉnh sửa và đã có sản phẩm được chọn, kiểm tra và bổ sung nếu cần
          if (postId && selectedProduct) {
            const exists = fetchedProducts.find(
              (product) => product._id === selectedProduct
            );
            if (!exists) {
              try {
                const prodResponse = await fetch(
                  `/api/products/${selectedProduct}`
                );
                if (prodResponse.ok) {
                  const prodData = await prodResponse.json();
                  if (prodData.product) {
                    fetchedProducts.unshift(prodData.product);
                  }
                } else {
                  console.error(
                    "Error fetching selected product details:",
                    prodResponse.statusText
                  );
                }
              } catch (error) {
                console.error(
                  "Error fetching selected product details:",
                  error
                );
              }
            }
          }
          setProducts(fetchedProducts);
        } else {
          console.error("Error fetching products:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedGeneric, postId, selectedProduct]);

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

  const handleTagsAddition = (tag) => {
    let newTag = { ...tag };
    if (!newTag.text.startsWith("#")) {
      newTag.text = "#" + newTag.text;
      newTag.id = newTag.text;
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

  

  // Xử lý submit bài viết (tạo mới hoặc cập nhật nếu đang chỉnh sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Vui lòng nhập đầy đủ: Tiêu đề và Nội dung.");
      return;
    }

    let finalImageUrl = "";
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
          finalImageUrl = uploadData.imageUrl;
        } else {
          console.error("Image upload failed:", uploadResponse.statusText);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    } else {
      finalImageUrl =
        existingImageUrl ||
        "https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742030869/logo_ch4fq2.png";
    }

    const postData = {
      title,
      content,
      tags, // mảng các object { id, text }
      imageUrl: finalImageUrl,
      ...(selectedProduct && { productId: selectedProduct }),
    };

    setLoading(true);
    try {
      const method = postId ? "PUT" : "POST";
      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(postId ? "Post updated:" : "Post created:", data);
        if (postId) {
          navigate("/posts/management");
        } else {
          localStorage.removeItem("draftPost");
          setTitle("");
          setContent("");
          setTags([]);
          setSelectedImage(null);
          setExistingImageUrl("");
          setSelectedCategory("");
          setSelectedGeneric("");
          setSelectedProduct("");
          setProducts([]);
          setEditorKey((prev) => prev + 1);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } else {
        console.error("Error creating/updating post:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-editor-container">
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
        <div className="mb-3">
          <ButtonBase
            href="/admin/order_Dashboard"
            className="mt-2"
            style={{ color: "#323d42" }}
          >
            Quay lại: trang quản lý
          </ButtonBase>
        </div>
        <h3 className="text-center my-3 py-4">
          {postId ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
        </h3>

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
                apiKey="process.env.REACT_APP_TINYMCE_API_KEY"
                value={content}
                init={{
                  height: 1200,
                  menubar: false,
                  plugins:
                    "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
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
                ref={fileInputRef}
                onChange={(e) => setSelectedImage(e.target.files[0])}
              />
              {!selectedImage && existingImageUrl && (
                <div className="mt-2">
                  <p>Ảnh đã đăng:</p>
                  <img
                    src={existingImageUrl}
                    alt="Existing"
                    style={{ width: "150px", height: "auto" }}
                  />
                </div>
              )}
            </div>

            {/* Phần nhập thẻ tags với giao diện đã được cải tiến */}
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
              {loading
                ? postId
                  ? "Đang cập nhật..."
                  : "Đang tải..."
                : postId
                ? "Cập nhật"
                : "Đăng Bài"}
            </button>
          </form>
        </div>

        {/* Phần lựa chọn sản phẩm */}
        <div className="col-md-3">
          <div className="row">
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
