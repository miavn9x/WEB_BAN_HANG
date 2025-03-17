import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../styles/AddProduct.css";
import { ButtonBase } from "@mui/material";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    categoryName: "",
    categoryGeneric: "",
    brand: "",
    description: "",
    originalPrice: "",
    discountPercentage: "",
    priceAfterDiscount: "",
    discountCode: "",
    stock: "",
    // Đã loại bỏ trường tags
    salesCount: 0, // Mặc định 0
    viewCount: 0, // Mặc định 0
  });

  // Lưu trữ các ảnh được chọn dưới dạng object chứa file và URL để hiển thị preview
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // Các tùy chọn danh mục sản phẩm
  const categoryOptions = {
    "Văn Học": [
      "Tiểu Thuyết",
      "Truyện Ngắn - Tản Văn",
      "Light Novel",
      "Ngôn Tình",
      "Tác Phẩm Kinh Điển",
      "Thơ",
    ],
    "Kinh Tế": [
      "Nhân Vật - Bài Học Kinh Doanh",
      "Quản Trị - Lãnh Đạo",
      "Marketing - Bán Hàng",
      "Phân Tích Kinh Tế",
      "Đầu Tư Tài Chính",
      "Khởi Nghiệp",
    ],
    "Tâm Lý - Kỹ Năng Sống": [
      "Kỹ Năng Sống",
      "Rèn Luyện Nhân Cách",
      "Tâm Lý",
      "Sách Cho Tuổi Mới Lớn",
      "Hôn Nhân - Gia Đình",
      "Sách Self-Help",
    ],
    "Nuôi Dạy Con": [
      "Cẩm Nang Làm Cha Mẹ",
      "Phương Pháp Giáo Dục Trẻ",
      "Phát Triển Trí Tuệ Cho Trẻ",
      "Phát Triển Kỹ Năng Cho Trẻ",
      "Thai Giáo",
      "Sức Khỏe Trẻ Em",
    ],
    "Sách Thiếu Nhi": [
      "Manga - Comic",
      "Kiến Thức Bách Khoa",
      "Sách Tranh Kỹ Năng Sống",
      "Vừa Học - Vừa Chơi",
      "Truyện Cổ Tích",
      "Truyện Tranh",
    ],
    "Tiểu Sử - Hồi Ký": [
      "Câu Chuyện Cuộc Đời",
      "Chính Trị",
      "Kinh Tế",
      "Nghệ Thuật - Giải Trí",
      "Tự Truyện",
      "Nhân Vật Lịch Sử",
    ],
    "Giáo Khoa - Tham Khảo": [
      "Sách Giáo Khoa",
      "Sách Tham Khảo",
      "Luyện Thi THPT Quốc Gia",
      "Mẫu Giáo",
      "Sách Ôn Thi Đại Học",
      "Sách Bài Tập",
    ],
    "Sách Học Ngoại Ngữ": [
      "Tiếng Anh",
      "Tiếng Nhật",
      "Tiếng Hoa",
      "Tiếng Hàn",
      "Tiếng Pháp",
      "Tiếng Đức",
    ],
  };


  // Mảng Nhà xuất bản được phân nhóm theo danh mục
const predefinedBrandsByCategory = {
  "Văn Học": ["NXB Trẻ", "NXB Hội Nhà Văn", "NXB Văn Hóa", "NXB Phụ Nữ"],
  "Kinh Tế": [
    "NXB Tài Chính",
    "NXB Kinh Tế & Quản Trị",
    "NXB Lao Động",
    "NXB Tri thức",
  ],
  "Tâm Lý - Kỹ Năng Sống": ["NXB Đời Sống", "NXB Tâm Lý", "NXB Phát Triển"],
  "Nuôi Dạy Con": ["NXB Gia Đình", "NXB Mẹ và Bé"],
  "Sách Thiếu Nhi": ["NXB Kim Đồng", "NXB Trẻ Em", "NXB Thiếu Nhi"],
  "Tiểu Sử - Hồi Ký": ["NXB Lịch Sử", "NXB Tiểu Sử", "NXB Sự Thật"],
  "Giáo Khoa - Tham Khảo": ["NXB Giáo Dục", "NXB Giáo Khoa", "NXB Tham Khảo"],
  "Sách Học Ngoại Ngữ": [
    "NXB Ngoại Ngữ",
    "NXB Quốc Tế",
    "NXB Đại Học Ngoại Ngữ",
  ],
};


  // Xử lý nhập dữ liệu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevState) => {
      const updatedProduct = { ...prevState, [name]: value };

      if (name === "originalPrice" || name === "discountPercentage") {
        let discountPercentage = Number(updatedProduct.discountPercentage) || 0;
        if (discountPercentage < 0 || discountPercentage >= 100)
          discountPercentage = 0;
        const originalPrice = Number(updatedProduct.originalPrice) || 0;
        const priceAfterDiscount =
          originalPrice - (originalPrice * discountPercentage) / 100;
        updatedProduct.priceAfterDiscount =
          priceAfterDiscount > 0 ? priceAfterDiscount.toFixed() : "";
      }
      return updatedProduct;
    });
  };

  // Chọn danh mục sản phẩm
  const handleCategoryChange = (e) => {
    setProduct((prevState) => ({
      ...prevState,
      categoryName: e.target.value,
      categoryGeneric: "",
    }));
  };

  // Chọn loại sản phẩm
  const handleGenericChange = (e) => {
    setProduct((prevState) => ({
      ...prevState,
      categoryGeneric: e.target.value,
    }));
  };

  // Chọn Nhà xuất bản
  const handleBrandSelectChange = (e) => {
    const value = e.target.value;
    setSelectedBrand(value);
    setProduct((prevState) => ({
      ...prevState,
      brand: value === "other" ? "" : value,
    }));
  };

  // Kiểm tra dữ liệu trước khi gửi
  const validateForm = () => {
    if (
      !product.name ||
      !product.categoryName ||
      !product.categoryGeneric ||
      !product.stock
    ) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return false;
    }
    if (Number(product.stock) <= 0) {
      setError("Số lượng phải lớn hơn 0!");
      return false;
    }
    if (Number(product.originalPrice) <= 0) {
      setError("Giá gốc phải lớn hơn 0!");
      return false;
    }
    return true;
  };

  // Xử lý tải ảnh lên
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setSelectedImages((prevImages) => [...prevImages, ...files]);
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = (index) => {
    setSelectedImages((prevImages) => {
      URL.revokeObjectURL(prevImages[index].url);
      return prevImages.filter((_, i) => i !== index);
    });
  };

  // Gửi dữ liệu lên server
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    selectedImages.forEach((imageObj) => {
      formData.append("images", imageObj.file);
    });

    Object.keys(product).forEach((key) => {
      formData.append(key, product[key]);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`/api/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        setMessage("Sản phẩm đã được thêm thành công!");
        setError("");
        setProduct({
          name: "",
          categoryName: "",
          categoryGeneric: "",
          brand: "",
          description: "",
          originalPrice: "",
          discountPercentage: "",
          priceAfterDiscount: "",
          discountCode: "",
          stock: "",
          // Đã loại bỏ trường tags
          salesCount: 0,
          viewCount: 0,
        });
        setSelectedImages([]);
        setSelectedBrand("");
      }
    } catch (error) {
      setMessage("");
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm."
      );
    }
  };

  // Tự động xóa thông báo sau 2 giây
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  return (
    <div className="container add-product-container">
      <div className="row">
        <div className="col-sm-12">
   <ButtonBase href="/admin/order_Dashboard" className="mt-2" style={{ color: "#323d42" }}>
             Quay lại:  trang quản lý
           </ButtonBase>

          <h4 className="text-center mb-4 text-uppercase mt-5">
            Thêm Sản Phẩm Mới
          </h4>

          {/* Success and error messages */}
          <div className="text-center pb-3">
            {message && <div className="text-success">{message}</div>}
            {error && <div className="text-danger">{error}</div>}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Các trường thông tin cơ bản */}
              <div className="col-md-6">
                <div className="form-group">
                  <label>Tên sản phẩm</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Tên sản phẩm"
                    value={product.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select
                    name="categoryName"
                    className="form-control"
                    value={product.categoryName}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {Object.keys(categoryOptions).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {product.categoryName && (
                  <div className="form-group">
                    <label>Loại sản phẩm</label>
                    <select
                      name="categoryGeneric"
                      className="form-control"
                      value={product.categoryGeneric}
                      onChange={handleGenericChange}
                      required
                    >
                      <option value="">Chọn loại sản phẩm</option>
                      {categoryOptions[product.categoryName]?.map((generic) => (
                        <option key={generic} value={generic}>
                          {generic}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Mô tả chi tiết</label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="Mô tả chi tiết"
                    value={product.description}
                    onChange={handleInputChange}
                    required
                    style={{ height: "200px" }}
                  />
                </div>
              </div>
              {/* Các trường giá, số lượng, hình ảnh và Nhà xuất bản */}
              <div className="col-md-6">
                <div className="form-group">
                  <label>Nhà xuất bản</label>
                  <select
                    name="brandSelect"
                    className="form-control"
                    value={selectedBrand}
                    onChange={handleBrandSelectChange}
                    required
                  >
                    <option value="">Chọn Nhà xuất bản</option>
                    {Object.entries(predefinedBrandsByCategory).map(
                      ([group, brands]) => (
                        <optgroup key={group} label={group}>
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )}
                    <option value="other">Nhập Nhà xuất bản</option>
                  </select>
                  {selectedBrand === "other" && (
                    <input
                      type="text"
                      name="brand"
                      className="form-control mt-2"
                      placeholder="Nhập Nhà xuất bản"
                      value={product.brand}
                      onChange={handleInputChange}
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Giá gốc</label>
                  <input
                    type="number"
                    name="originalPrice"
                    className="form-control"
                    placeholder="Giá gốc"
                    value={product.originalPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giảm giá (%)</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    className="form-control"
                    placeholder="Giảm giá (%)"
                    value={product.discountPercentage}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Giá sau khi giảm</label>
                  <input
                    type="number"
                    name="priceAfterDiscount"
                    className="form-control"
                    placeholder="Giá sau khi giảm"
                    value={product.priceAfterDiscount}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Số lượng trong kho</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control"
                    placeholder="Số lượng trong kho"
                    value={product.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {/* Đã loại bỏ phần nhập Tags */}

                {/* Phần preview hình ảnh được chọn */}
                {selectedImages.length > 0 && (
                  <div
                    className="image-preview-container"
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      flexWrap: "wrap",
                    }}
                  >
                    {selectedImages.map((imageObj, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          margin: "05px",
                        }}
                      >
                        <img
                          src={imageObj.url}
                          alt={`Preview ${index}`}
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                            borderRadius: "2px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            background: "red",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="form-group">
                  <label>Chọn ảnh sản phẩm</label>
                  <input
                    type="file"
                    multiple
                    className="form-control-file"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-secondary btn-block mt-4"
              >
                Thêm sản phẩm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
