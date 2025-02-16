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
import Filter from "../Filter/Filter"; // Component bộ lọc
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ProductPage.css";
import axios from "axios";
import ProductItem from "./ProductItem"; // Component hiển thị sản phẩm
import Fuse from "fuse.js";

const ProductPage = () => {
  // Khi trang load, cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  // Lấy tham số từ URL
  const urlParams = new URLSearchParams(location.search);
  const discountParam = urlParams.get("showDiscount");
  const showDiscount = location.state?.showDiscount || discountParam === "true";

  const [sortBy, setSortBy] = useState(
    showDiscount ? "discountPercentage" : "default"
  );

  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get("categoryName");
  const genericFromURL = queryParams.get("generic");
  const searchFromURL = queryParams.get("search");
  const brandFromURL = queryParams.get("brand");

  // State cho modal bộ lọc và các bộ lọc
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    price: null,
    categories: {},
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Các hàm xử lý modal và bộ lọc
  const handleCloseFilter = () => setShowFilter(false);
  const handleShowFilter = () => setShowFilter(true);
  const handleFilterChange = (filterData) => {
    const { filterId, isChecked, filterType, filterName, categoryName } =
      filterData;
    setFilters((prevFilters) => {
      if (filterType === "radio") {
        return { ...prevFilters, [filterName]: filterData };
      }
      if (filterType === "categoryExclusive") {
        const newCategories = { ...prevFilters.categories };
        if (isChecked) {
          newCategories[categoryName] = filterId;
        } else {
          delete newCategories[categoryName];
        }
        return { ...prevFilters, categories: newCategories };
      }
      return prevFilters;
    });
    // Reset trang và load lại sản phẩm
    navigate("/products");
  };

  const clearFilters = () => {
    setFilters({
      price: null,
      categories: {},
    });
    setSortBy(showDiscount ? "discountPercentage" : "default");
    navigate("/products");
  };

  // Hàm normalize chuỗi để hỗ trợ tìm kiếm không dấu
  const normalizeString = (str) => {
    return str
      ? str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
      : "";
  };

  // Fetch sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `/api/products`;
        const params = [];

        // Xử lý các tham số truy vấn từ URL
        if (searchFromURL) {
          params.push(`search=${encodeURIComponent(searchFromURL)}`);
        }
        if (categoryFromURL) {
          params.push(`categoryName=${encodeURIComponent(categoryFromURL)}`);
        }
        if (genericFromURL) {
          params.push(`categoryGeneric=${encodeURIComponent(genericFromURL)}`);
        }
        if (brandFromURL) {
          params.push(`brand=${encodeURIComponent(brandFromURL)}`);
        }
        if (params.length > 0) {
          url = `${url}?${params.join("&")}`;
        }

        const response = await axios.get(url);
        let fetchedProducts = response.data.products;

        // Nếu có tìm kiếm, sử dụng Fuse.js để lọc thêm
        if (searchFromURL && fetchedProducts.length > 0) {
          const normalizedQuery = normalizeString(searchFromURL);
          const fuse = new Fuse(fetchedProducts, {
            keys: [
              {
                name: "name",
                getFn: (obj) => normalizeString(obj.name),
              },
              {
                name: "category.name",
                getFn: (obj) => normalizeString(obj.category?.name),
              },
              {
                name: "category.generic",
                getFn: (obj) => normalizeString(obj.category?.generic),
              },
              {
                name: "brand",
                getFn: (obj) => normalizeString(obj.brand),
              },
            ],
            threshold: 0.3,
          });
          const fuseResult = fuse.search(normalizedQuery);
          fetchedProducts = fuseResult.map((result) => result.item);
        }

        // Lọc theo brand (nếu có)
        if (brandFromURL && fetchedProducts.length > 0) {
          const normalizedBrand = normalizeString(brandFromURL);
          fetchedProducts = fetchedProducts.filter(
            (product) => normalizeString(product.brand) === normalizedBrand
          );
        }

        // Áp dụng bộ lọc từ state filters
        if (filters.price) {
          const { maxPrice, minPrice } = filters.price;
          if (maxPrice) {
            fetchedProducts = fetchedProducts.filter(
              (product) => product.priceAfterDiscount <= maxPrice
            );
          }
          if (minPrice) {
            fetchedProducts = fetchedProducts.filter(
              (product) => product.priceAfterDiscount >= minPrice
            );
          }
        }

        const categoryFilterKeys = Object.keys(filters.categories);
        if (categoryFilterKeys.length > 0) {
          fetchedProducts = fetchedProducts.filter((product) => {
            if (!product.category) return false;
            return categoryFilterKeys.some((categoryName) => {
              const filterId = filters.categories[categoryName];
              const parts = filterId.split("|");
              if (parts.length !== 2) return false;
              const [filterCategory, filterOption] = parts;
              return (
                product.category.name === filterCategory &&
                product.category.generic === filterOption
              );
            });
          });
        }

        // Xử lý sắp xếp
        if (sortBy === "discountPercentage") {
          fetchedProducts = fetchedProducts.filter(
            (product) => product.discountPercentage > 0
          );
          fetchedProducts = fetchedProducts.sort(
            (a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0)
          );
        } else if (sortBy === "priceAsc") {
          fetchedProducts = fetchedProducts.sort(
            (a, b) => a.priceAfterDiscount - b.priceAfterDiscount
          );
        } else if (sortBy === "priceDesc") {
          fetchedProducts = fetchedProducts.sort(
            (a, b) => b.priceAfterDiscount - a.priceAfterDiscount
          );
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
  }, [
    categoryFromURL,
    genericFromURL,
    brandFromURL,
    sortBy,
    filters,
    searchFromURL,
    location.search,
  ]);

  return (
    <Container>
      <Row>
        <Col xl={3} className="sidebar-wrapper d-none d-xl-block">
          <div className="sidebar p-3 rounded mb-3">
            <Button
              className="btn-clear-filters mb-3"
              variant="outline-secondary"
              onClick={clearFilters}
            >
              Làm mới lựa chọn
            </Button>
            <Filter onFilterChange={handleFilterChange} filters={filters} />
          </div>
        </Col>

        {/* Danh sách sản phẩm */}
        <Col xl={9} lg={12}>
          <Row className="product-row">
            <div className="filter-header">
              <div className="filter-controls">
                <div className="d-flex justify-content-between">
                  {/* Nút Bộ Lọc (chỉ hiển thị trên mobile) */}
                  <div className="d-block d-xl-none mx-3">
                    <span className="loc">
                      <button
                        onClick={handleShowFilter}
                        className="filter-button d-flex"
                      >
                        <CiFilter className="me-1" />
                        Tìm kiếm nhanh
                      </button>
                    </span>
                  </div>
                  <div className="sort-wrapper d-flex align-items-center ms-auto mx-3">
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
                        <Dropdown.Item onClick={() => setSortBy("default")}>
                          Mặc định
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
            Làm mới lựa chọn
          </Button>
          <Filter onFilterChange={handleFilterChange} filters={filters} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductPage;
