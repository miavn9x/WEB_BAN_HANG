// pages/ProductPage.jsx
import React, { useState } from "react";
import { Container, Row, Col, Dropdown, Modal } from "react-bootstrap";
import { CiFilter } from "react-icons/ci";
import Filter from "../../components/Filter/Filter"; // Sửa đường dẫn import
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ProductPage.css";
import Listing from "./listing";

const ProductPage  = () => {
   const [showFilter, setShowFilter] = useState(false);
   const [setFilters] = useState({
     price: null,
     categories: new Set(),
   });

   const handleCloseFilter = () => setShowFilter(false);
   const handleShowFilter = () => setShowFilter(true);

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
  return (
    <Container>
      <Row>
        <Col xl={3} className="sidebar-wrapper d-none d-xl-block">
          <div className="sidebar p-3 rounded mb-3">
            <Filter onFilterChange={handleFilterChange} />
          </div>
        </Col>

        <Col xl={9} lg={12}>
          <Row className="product-row">
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
                        Mặc định
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item href="#">Giá tăng dần</Dropdown.Item>
                        <Dropdown.Item href="#">Giá giảm dần</Dropdown.Item>
                        <Dropdown.Item href="#">Mới nhất</Dropdown.Item>
                        <Dropdown.Item href="#">A đến Z</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </Row>

          <Row>
            {/* Product list will go here */}
            <Listing />
          </Row>
        </Col>
      </Row>

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
          <Filter onFilterChange={handleFilterChange} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductPage;
