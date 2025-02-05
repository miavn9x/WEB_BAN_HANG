// pages/ProductPage.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Dropdown,
  Modal,
  Button,
  Spinner,
} from "react-bootstrap";
import { CiFilter } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import Filter from "../../components/Filter/Filter"; // Import Filter component
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ProductPage.css";
import axios from "axios";
import ProductItem from "./ProductItem"; // Giả sử bạn có component ProductItem để hiển thị sản phẩm

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get("categoryName");
  const genericFromURL = queryParams.get("generic");

  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    price: null, // Lưu đối tượng { filterId, maxPrice, minPrice } nếu được chọn
    categories: {}, // Lưu dạng object: { [categoryName]: filterId }
  });
  const [sortBy, setSortBy] = useState("default");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mở/đóng modal bộ lọc (cho mobile & màn hình nhỏ hơn xl)
  const handleCloseFilter = () => setShowFilter(false);
  const handleShowFilter = () => setShowFilter(true);

  // Cập nhật state filters khi có thay đổi từ Filter component
  const handleFilterChange = (filterData) => {
    const { filterId, isChecked, filterType, filterName, categoryName } =
      filterData;
    setFilters((prevFilters) => {
      if (filterType === "radio") {
        return {
          ...prevFilters,
          [filterName]: filterData, // Lưu đối tượng giá
        };
      }
      if (filterType === "categoryExclusive") {
        // Nếu được check: gán mới; nếu bỏ check: xóa key đó.
        const newCategories = { ...prevFilters.categories };
        if (isChecked) {
          newCategories[categoryName] = filterId;
        } else {
          delete newCategories[categoryName];
        }
        return {
          ...prevFilters,
          categories: newCategories,
        };
      }
      return prevFilters;
    });
  };

  // Hàm làm mới bộ lọc: reset state và xóa query param trong URL
  const clearFilters = () => {
    setFilters({
      price: null,
      categories: {},
    });
    setSortBy("default");
    // Chuyển hướng về URL không có query param (hiển thị tất cả sản phẩm)
    navigate("/products");
  };

  // Fetch sản phẩm dựa vào các tham số lọc và sắp xếp
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `/api/products`;
        const params = [];

        // Nếu người dùng CHƯA chọn bộ lọc từ Filter (state filters rỗng)
        if (Object.keys(filters.categories).length === 0 && !filters.price) {
          if (genericFromURL) {
            params.push(
              `categoryGeneric=${encodeURIComponent(genericFromURL)}`
            );
          } else if (categoryFromURL) {
            params.push(`categoryName=${encodeURIComponent(categoryFromURL)}`);
          }
        } else {
          // Nếu người dùng đã chọn bộ lọc từ Filter thì ưu tiên dùng dữ liệu đó
          const categoryKeys = Object.keys(filters.categories);
          if (categoryKeys.length > 0) {
            // Tách filterId dạng "categoryName|categoryGeneric" để lấy phần generic
            const categoryGenerics = categoryKeys
              .map((catName) => {
                const filterId = filters.categories[catName];
                const parts = filterId.split("|");
                return parts[1];
              })
              .join(",");
            params.push(
              `categoryGeneric=${encodeURIComponent(categoryGenerics)}`
            );
          }
        }

        // Xử lý bộ lọc giá (nếu có)
        if (filters.price) {
          if (filters.price.maxPrice) {
            params.push(
              `maxPrice=${encodeURIComponent(filters.price.maxPrice)}`
            );
          }
          if (filters.price.minPrice) {
            params.push(
              `minPrice=${encodeURIComponent(filters.price.minPrice)}`
            );
          }
        }

        if (sortBy !== "default") {
          params.push(`sortBy=${encodeURIComponent(sortBy)}`);
        }

        if (params.length > 0) {
          url = `${url}?${params.join("&")}`;
        }

        const response = await axios.get(url);
        let fetchedProducts = response.data.products;

        // Sắp xếp lại nếu cần (nếu API chưa xử lý sắp xếp)
        if (sortBy === "discountPercentage") {
          fetchedProducts = fetchedProducts.sort(
            (a, b) => b.discountPercentage - a.discountPercentage
          );
        } else if (sortBy === "priceAsc") {
          fetchedProducts = fetchedProducts.sort(
            (a, b) => a.priceAfterDiscount - b.priceAfterDiscount
          );
        } else if (sortBy === "priceDesc") {
          fetchedProducts = fetchedProducts.sort(
            (a, b) => b.priceAfterDiscount - a.priceAfterDiscount
          );
        } else if (sortBy === "random") {
          fetchedProducts = fetchedProducts.sort(() => Math.random() - 0.5);
        }

        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Có lỗi khi tải sản phẩm. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    fetchProducts();
    // Dependencies: categoryFromURL, genericFromURL, sortBy, filters
  }, [categoryFromURL, genericFromURL, sortBy, filters]);

  return (
    <Container>
      <Row>
        {/* Sidebar bộ lọc cho Desktop (màn hình ≥1200px) */}
        <Col xl={3} className="sidebar-wrapper d-none d-xl-block">
          <div className="sidebar p-3 rounded mb-3">
            <Button
              className="btn-clear-filters mb-3"
              variant="outline-secondary"
              onClick={clearFilters}
            >
              Làm mới bộ lọc
            </Button>
            <Filter onFilterChange={handleFilterChange} filters={filters} />
          </div>
        </Col>

        {/* Danh sách sản phẩm */}
        <Col xl={9} lg={12}>
          <Row className="product-row">
            <div className="filter-header">
              <div className="product-title-wrapper mb-3 mb-lg-0">
                <h4 className="product-title">Tất cả sản phẩm</h4>
              </div>
              <div className="filter-controls">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-block d-xl-none">
                    <button
                      onClick={handleShowFilter}
                      className="filter-button d-flex align-items-center"
                    >
                      <CiFilter className="me-1" />
                      Bộ Lọc
                    </button>
                  </div>
                  <div className="sort-wrapper d-flex align-items-center">
                    <span className="sort-label me-2 d-none d-lg-block">
                      Sắp xếp theo:
                    </span>
                    <Dropdown align={{ lg: "start" }}>
                      <Dropdown.Toggle
                        variant="light"
                        className="text-start sort-dropdown"
                      >
                        {sortBy === "default"
                          ? "Mặc định"
                          : sortBy === "priceAsc"
                          ? "Giá tăng dần"
                          : sortBy === "priceDesc"
                          ? "Giá giảm dần"
                          : sortBy === "discountPercentage"
                          ? "% Giảm giá"
                          : "Ngẫu nhiên"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setSortBy("priceAsc")}>
                          Giá tăng dần
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setSortBy("priceDesc")}>
                          Giá giảm dần
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setSortBy("discountPercentage")}
                        >
                          % Giảm giá
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setSortBy("random")}>
                          Ngẫu nhiên
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </Row>

          <Row>
            <div className="products__container">
              {loading && (
                <div className="loading-container text-center">
                  <Spinner
                    animation="border"
                    variant="success"
                    className="loading-spinner"
                  />
                  <div>Đang tải sản phẩm...</div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              {products && products.length > 0 ? (
                products.map((product) => (
                  <ProductItem key={product._id} product={product} />
                ))
              ) : !loading && !error ? (
                <div>Không có sản phẩm nào</div>
              ) : null}
            </div>
          </Row>
        </Col>
      </Row>

      {/* Modal bộ lọc cho mobile & màn hình dưới xl */}
      <Modal
        show={showFilter}
        onHide={handleCloseFilter}
        className="filter-modal d-xl-none"
      >
        <Modal.Header className="border-0">
          <Modal.Title>Bộ Lọc</Modal.Title>
          <button
            onClick={handleCloseFilter}
            className="custom-close"
            aria-label="Close"
          >
            ×
          </button>
        </Modal.Header>
        <Modal.Body>
          <Button
            className="btn-clear-filters mb-3"
            variant="outline-secondary"
            onClick={clearFilters}
          >
            Làm mới bộ lọc
          </Button>
          <Filter onFilterChange={handleFilterChange} filters={filters} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductPage;
