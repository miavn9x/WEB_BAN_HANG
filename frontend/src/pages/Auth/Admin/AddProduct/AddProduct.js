import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../styles/AddProduct.css";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    categoryName: "", // Adjusted to separate category name
    categoryGeneric: "", // Adjusted to hold generic type
    brand: "",
    description: "",
    originalPrice: "",
    discountPercentage: "",
    priceAfterDiscount: "",
    discountCode: "",
    stock: "",
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

const categoryOptions = {
  "Sữa bột cao cấp": [
    "Từ 0-6 tháng",
    "Từ 6-12 tháng",
    "Từ 1-3 tuổi",
    "Từ 3-5 tuổi",
    "Sữa bột organic",
    "Tăng đề kháng",
  ],
  "Sữa dinh dưỡng": [
    "Cho mẹ bầu",
    "Tăng canxi cho bà bầu",
    "Cho mẹ sau sinh",
    "Cho bé từ 1 tuổi",
    "Tăng chiều cao cho bé 3-5 tuổi",
  ],
  "Bỉm & Tã em bé": [
    "NB < 5 Kg",
    "S 4-8 Kg",
    "M 5-11 Kg",
    "L 9-14 Kg",
    "XL 12-18 Kg",
    "XXL 13-25 Kg",
  ],
  "Đồ chơi em bé": [
    "Đồ chơi bé gái",
    "Đồ chơi bé trai",
    "Sách, học tập",
    "Đồ chơi sơ sinh",
    "Scooter, vận động",
  ],
  "Chăm sóc gia đình": [
    "Chăm sóc da bầu (chống rạn)",
    "Dầu massage bầu",
    "Kem dưỡng da cho bé",
    "Dầu tắm gội cho bé",
    "Phấn rôm chống hăm",
    "Nhiệt kế & Máy hút mũi",
  ],
  "Thời trang mẹ và bé": [
    "Đồ bầu theo tháng (1-8 tháng)",
    "Váy bầu công sở",
    "Đồ sau sinh",
    "Quần áo sơ sinh (0-12 tháng)",
    "Quần áo bé 1-3 tuổi",
    "Quần áo bé 3-5 tuổi",
  ],
  "Dinh dưỡng bà bầu": [
    "Vitamin tổng hợp cho bà bầu",
    "Sắt và axit folic",
    "Canxi và Vitamin D3",
    "Omega 3 và DHA",
    "Sữa bầu công thức đặc biệt",
  ],
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevState) => {
      const updatedProduct = { ...prevState, [name]: value };

      if (name === "originalPrice" || name === "discountPercentage") {
        let discountPercentage = Number(updatedProduct.discountPercentage) || 0;
        if (discountPercentage < 0 || discountPercentage >= 100) {
          discountPercentage = 0;
        }

        const originalPrice = Number(updatedProduct.originalPrice) || 0;
        const priceAfterDiscount =
          originalPrice - (originalPrice * discountPercentage) / 100;

        updatedProduct.discountPercentage = discountPercentage.toString();
        updatedProduct.priceAfterDiscount =
          priceAfterDiscount > 0 ? priceAfterDiscount.toFixed() : "";
      }

      return updatedProduct;
    });
  };

  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    setProduct((prevState) => ({
      ...prevState,
      categoryName,
      categoryGeneric: "", // Reset generic type when category changes
    }));
  };

  const handleGenericChange = (e) => {
    const categoryGeneric = e.target.value;
    setProduct((prevState) => ({
      ...prevState,
      categoryGeneric,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prevImages) => [...prevImages, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    selectedImages.forEach((image) => {
      formData.append("images", image);
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

      if (response.status === 200 || response.status === 201) {
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
        });
        setSelectedImages([]);
      }
    } catch (error) {
      console.error("Error submitting form", error);
      setMessage("");
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm."
      );
    }
  };

  // Clear success and error messages after 2 seconds
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
              <div className="col-md-6">
                <div className="form-group">
                  <label>Thương hiệu</label>
                  <input
                    type="text"
                    name="brand"
                    className="form-control"
                    placeholder="Thương hiệu"
                    value={product.brand}
                    onChange={handleInputChange}
                    required
                  />
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
              <button type="submit" className="btn btn-success btn-block mt-4">
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
