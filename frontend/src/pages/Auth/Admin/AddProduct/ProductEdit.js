import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../../../../styles/ProductEdit.css"; // Make sure this file exists for styling

const ProductEdit = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedType, setSelectedType] = useState("");

  const categoryOptions = {
    thịt: ["Bò", "Gà", "Lợn"],
    cá: ["Cá Basa", "Cá Hồi", "Cá Tầm"],
    rau: ["Cải Bó Xôi", "Cải Thảo", "Cà Chua"],
    giaVị: ["Muối", "Tiêu", "Ớt"],
    đồUống: ["Nước ngọt", "Nước ép", "Sữa"],
    gạo: ["Gạo ST25", "Gạo Japonica", "Gạo Bắc Hương"],
    mìĂnLiền: ["Mì tôm", "Mì Hảo Hảo", "Mì Omachi"],
    đồKhô: ["Cá khô", "Mực khô", "Thịt khô"],
    trứng: ["Trứng gà", "Trứng vịt", "Trứng cút"],
    đồĂnĐóngHộp: ["Cá hộp", "Thịt hộp", "Sữa hộp"],
    sữa: ["Sữa đặc", "Sữa tươi", "Sữa bột"],
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/products`, {
        params: {
          page: currentPage,
          search,
          category: categoryFilter,
          limit: 10,
        },
      });
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Lỗi khi lấy danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    setLoading(true);
    try {
      await axios.delete(`/api/products/${productId}`);
      fetchProducts();
    } catch (error) {
      setErrorMessage("Lỗi khi xóa sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditFormData({ ...product });
    setSelectedImages([]);
    setErrorMessage(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prev) => {
      const updatedFormData = { ...prev };

      if (name === "category.name") {
        updatedFormData.category.generic = "";
      }

      const numericValue = parseFloat(value);
      if (name === "stock") {
        const stockDifference = numericValue - parseFloat(prev.stock || 0);
        updatedFormData.stock = numericValue;
        updatedFormData.remainingStock =
          parseFloat(prev.remainingStock || 0) + stockDifference;
      } else if (name === "remainingStock") {
        updatedFormData.remainingStock = Math.min(numericValue, prev.stock);
      } else {
        updatedFormData[name] = value;
      }

      if (name === "originalPrice" || name === "discountPercentage") {
        const price = parseFloat(updatedFormData.originalPrice);
        const discount = parseFloat(updatedFormData.discountPercentage);
        if (!isNaN(price) && !isNaN(discount)) {
          updatedFormData.priceAfterDiscount = (
            price *
            (1 - discount / 100)
          ).toFixed();
        }
      }

      return updatedFormData;
    });
  };

  const handleImageChange = (e) => {
    setSelectedImages(e.target.files);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      for (const key in editFormData) {
        if (key !== "images" && key !== "_id" && key !== "__v") {
          formData.append(key, editFormData[key]);
        }
      }
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          formData.append("images", selectedImages[i]);
        }
      }

      await axios.put(`/api/products/${editingProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      setErrorMessage("Lỗi khi cập nhật sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setCategoryFilter(value);
      setSelectedType(""); // Reset product type when category changes
    } else if (name === "type") {
      setSelectedType(value);
    }

    setCurrentPage(1);
  };

  return (
    <div>
      <div className="product-management-wrapper">
        <h1 className="text-center">Quản lý sản phẩm</h1>
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}

        <input
          type="text"
          className="form-control product-search-input mb-3"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={handleSearchChange}
        />

        <div className="mb-3">
          <select
            className="form-control product-category-filter mb-2"
            value={categoryFilter}
            name="category"
            onChange={handleCategoryFilterChange}
          >
            <option value="">Chọn danh mục</option>
            {Object.keys(categoryOptions).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {categoryFilter && (
          <div className="mb-3">
            <select
              className="form-control product-type-filter mb-2"
              value={selectedType}
              name="type"
              onChange={handleCategoryFilterChange}
            >
              <option value="">Chọn loại sản phẩm</option>
              {categoryOptions[categoryFilter]?.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="product-management">
          <div className="table-responsive">
            <table className="table table-bordered product-table">
              <thead >
                <tr >
                  <th>STT</th>
                  <th>Tên</th>
                  <th>Danh mục</th>
                  <th>Loại sản phẩm</th>
                  <th>Thương hiệu</th>
                  <th>Mô tả</th>
                  <th>Giá gốc</th>
                  <th>% giảm</th>
                  <th>Giảm giá</th>
                  <th>SL Gốc</th>
                  <th>SL Còn</th>
                  <th>Hình ảnh</th>
                  <th  >Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id}>
                    {editingProduct?._id === product._id ? (
                      <td colSpan="12">
                        <form onSubmit={handleUpdateProduct}>
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name || ""}
                            onChange={handleEditFormChange}
                            className="form-control mb-2"
                            placeholder="Tên sản phẩm"
                          />
                          <select
                            name="category.name"
                            value={editFormData.category?.name || ""}
                            onChange={handleEditFormChange}
                            className="form-control mb-2"
                          >
                            <option value="">Chọn danh mục</option>
                            {Object.keys(categoryOptions).map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>

                          <select
                            name="category.generic"
                            value={editFormData.category?.generic || ""}
                            onChange={handleEditFormChange}
                            className="form-control mb-2"
                          >
                            <option value="">Chọn loại sản phẩm</option>
                            {categoryOptions[editFormData.category?.name]?.map(
                              (type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              )
                            )}
                          </select>

                          <textarea
                            name="description"
                            value={editFormData.description || ""}
                            onChange={handleEditFormChange}
                            className="form-control mb-2"
                            placeholder="Mô tả sản phẩm"
                            style={{ height: "100px" }}
                          />
                          <input
                            type="number"
                            name="originalPrice"
                            value={editFormData.originalPrice || ""}
                            onChange={handleEditFormChange}
                            className="form-control mb-2"
                            placeholder="Giá gốc"
                          />
                          <input
                            type="number"
                            name="discountPercentage"
                            value={editFormData.discountPercentage || ""}
                            onChange={handleEditFormChange}
                            className="form-control mb-2"
                            placeholder="Giảm giá (%)"
                          />
                          <input
                            type="number"
                            name="priceAfterDiscount"
                            value={editFormData.priceAfterDiscount || ""}
                            readOnly
                            className="form-control mb-2"
                            placeholder="Giá sau giảm"
                          />
                          <div className="form-group">
                            <label>Số lượng trong kho:</label>
                            <input
                              type="number"
                              name="stock"
                              value={editFormData.stock || ""}
                              onChange={handleEditFormChange}
                              className="form-control mb-2"
                              min="0"
                              placeholder="Số lượng trong kho"
                            />
                            <small className="text-muted ">
                              Số lượng hiện tại: {editFormData.stock}
                            </small>
                          </div>

                          <div className="form-group">
                            <label>Số lượng còn lại:</label>
                            <input
                              type="number"
                              name="remainingStock"
                              value={editFormData.remainingStock || ""}
                              onChange={handleEditFormChange}
                              className="form-control mb-2"
                              min="0"
                              max={editFormData.stock}
                              placeholder="Số lượng còn lại"
                            />
                            <small className="text-muted">
                              Không thể vượt quá số lượng trong kho (
                              {editFormData.stock})
                            </small>
                          </div>
                          <input
                            type="file"
                            name="images"
                            multiple
                            onChange={handleImageChange}
                            className="form-control mb-2"
                          />
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm mr-2"
                            disabled={loading}
                          >
                            {loading ? "Đang lưu..." : "Lưu"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleCancelEdit}
                          >
                            Hủy
                          </button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td>{index + 1}</td>
                        <td>{product.name}</td>
                        <td>{product.category.name}</td>
                        <td>{product.category.generic}</td>
                        <td>{product.brand}</td>
                        <td>{product.description}</td>
                        <td>{product.originalPrice}</td>
                        <td>{product.discountPercentage}%</td>
                        <td>{product.priceAfterDiscount}</td>
                        <td>{product.stock}</td>
                        <td>{product.remainingStock}</td>
                        <td>
                          {product.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={product.name}
                              width="50"
                              height="50"
                              className="mr-2"
                            />
                          ))}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-warning btn-sm mr-2"
                            onClick={() => handleEditProduct(product)}
                          >
                            sửa
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            Xóa
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            &laquo; Trước
          </button>
          <span>
            Trang {currentPage} của {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Sau &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
