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
import Filter from "../../components/Filter/Filter"; // Adjust import path if necessary
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ProductPage.css";
import axios from "axios";
import ProductItem from "./ProductItem";

const ProductPage = ({ category, limit }) => {
  const [showFilter, setShowFilter] = useState(false); // Show/hide filter modal
  const [filters, setFilters] = useState({
    price: null,
    categories: new Set(),
  });
  const [sortBy, setSortBy] = useState("default"); // State for sorting
  const [products, setProducts] = useState([]); // State to hold product list
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState(null); // Error handling state

  // Open and close filter modal (mobile)
  const handleCloseFilter = () => setShowFilter(false);
  const handleShowFilter = () => setShowFilter(true);

  // Update filter state when user applies filters
  const handleFilterChange = (filterData) => {
    const { filterId, isChecked, filterType, filterName } = filterData;

    setFilters((prevFilters) => {
      if (filterType === "radio") {
        return {
          ...prevFilters,
          [filterName]: isChecked ? filterId : null,
        };
      }

      if (filterType === "checkbox") {
        const newCategories = new Set(prevFilters.categories);
        if (isChecked) {
          newCategories.add(filterId);
        } else {
          newCategories.delete(filterId);
        }
        return {
          ...prevFilters,
          categories: newCategories,
        };
      }

      return prevFilters;
    });
  };

  // Fetch product data with applied filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Start loading products
      setError(null); // Reset error state
      try {
        let url = `/api/products`; // Base URL to fetch products
        const params = [];

        if (category) {
          params.push(`categoryName=${category}`); // Filter by category if provided
        }

        // Add price filter if present
        if (filters.price) {
          params.push(`price=${filters.price}`);
        }

        // Add category filters if any
        if (filters.categories.size > 0) {
          const categoryFilter = Array.from(filters.categories).join(",");
          params.push(`categories=${categoryFilter}`);
        }

        // Add sorting if needed
        if (sortBy !== "default") {
          params.push(`sortBy=${sortBy}`);
        }

        // Append all parameters to the URL
        if (params.length > 0) {
          url = `${url}?${params.join("&")}`;
        }

        const response = await axios.get(url);
        let fetchedProducts = response.data.products;

        // Sort products based on sortBy state
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

        // Limit products if limit is provided
        if (limit) {
          fetchedProducts = fetchedProducts.slice(0, limit);
        }

        setProducts(fetchedProducts); // Update product list
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Có lỗi khi tải sản phẩm. Vui lòng thử lại.");
        setLoading(false); // Stop loading even on error
      }
    };

    fetchProducts();
  }, [category, sortBy, limit, filters]); // Re-fetch products when filters or sorting change

  // Clear all filters
const clearFilters = () => {
  setFilters({
    price: null,
    categories: new Set(),
  });
  setSortBy("default");
};

  return (
    <Container>
      <Row>
        {/* Sidebar Filter (Desktop Only) */}
        <Col xl={3} className="sidebar-wrapper d-none d-xl-block">
          <div className="sidebar p-3 rounded mb-3">
            <Filter onFilterChange={handleFilterChange} filters={filters} />
            <Button
              className="btn-clear-filters mt-3"
              variant="outline-secondary"
              onClick={clearFilters}
            >
              Làm mới bộ lọc
            </Button>
          </div>
        </Col>

        {/* Product List */}
        <Col xl={9} lg={12}>
          <Row className="product-row">
            {/* Filter and Sort Controls */}
            <div className="filter-header">
              <div className="product-title-wrapper mb-3 mb-lg-0">
                <h4 className="product-title">Tất cả sản phẩm</h4>
              </div>

              <div className="filter-controls">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-block d-lg-none">
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

          {/* Product Grid */}
          <Row>
            <div className="products__container">
              {/* Hiển thị vòng tròn xoay khi đang tải */}
              {loading && (
                <div className="loading-container text-center">
                  <Spinner
                    animation="border"
                    variant="success" // Vòng xoay màu xanh
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

      {/* Filter Modal (Mobile Only) */}
      <Modal
        show={showFilter}
        onHide={handleCloseFilter}
        className="filter-modal d-lg-none"
      >
        <Modal.Header className="border-0">
          <Modal.Title>Bộ lọc</Modal.Title>
          <button
            onClick={handleCloseFilter}
            className="custom-close"
            aria-label="Close"
          >
            ×
          </button>
        </Modal.Header>
        <Modal.Body>
          <Filter onFilterChange={handleFilterChange} filters={filters} />
          <Button
            className="btn-clear-filters mt-3"
            variant="outline-secondary"
            onClick={clearFilters}
          >
            Làm mới bộ lọc
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductPage;
