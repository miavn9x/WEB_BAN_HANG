import React, { useState } from "react";
import { Container, Row, Col, Form, Dropdown, Modal,  } from "react-bootstrap";
import {
  FaCapsules,
  FaTshirt,
  FaHome,
  FaPuzzlePiece,
  FaTags,
  FaGlassWhiskey,
  FaBabyCarriage,
} from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ProductPage.css";


const ProductPage = () => {

 const [showFilter, setShowFilter] = useState(false);

  const handleCloseFilter = () => setShowFilter(false);
  const handleShowFilter = () => setShowFilter(true);

  const FilterContent = () => (
    <div className="filter-content">
      <div className="filter-section">
        <h6>Mức Giá</h6>
        <Form>
          <Form.Check
            type="radio"
            label="dưới 500.000đ"
            name="price"
            id="price2"
          />
          <Form.Check
            type="radio"
            label="dưới 1.000.000đ"
            name="price"
            id="price3"
          />

          <Form.Check
            type="radio"
            label="Trên 1.000.000đ"
            name="price"
            id="price7"
          />
        </Form>
        <h6>
          <br />
          Loại sản phẩm
        </h6>
        <Form>
          <Form.Label>
            <FaBabyCarriage /> Sữa bột cao cấp
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Sữa bột cho bé 0-6 tháng"
            id="type1"
          />
          <Form.Check
            type="checkbox"
            label="Sữa bột cho bé 6-12 tháng"
            id="type2"
          />
          <Form.Check
            type="checkbox"
            label="Sữa bột cho bé 1-3 tuổi"
            id="type3"
          />
          <Form.Check
            type="checkbox"
            label="Sữa bột cho bé 3-5 tuổi"
            id="type4"
          />
          <Form.Check type="checkbox" label="Sữa bột organic" id="type5" />
          <Form.Check
            type="checkbox"
            label="Sữa non tăng đề kháng"
            id="type6"
          />

          <Form.Label>
            <FaGlassWhiskey /> Sữa tươi dinh dưỡng
          </Form.Label>
          <Form.Check type="checkbox" label="Sữa tươi cho mẹ bầu" id="type7" />
          <Form.Check
            type="checkbox"
            label="Sữa tươi tăng canxi cho bà bầu"
            id="type8"
          />
          <Form.Check
            type="checkbox"
            label="Sữa tươi cho mẹ sau sinh"
            id="type9"
          />
          <Form.Check
            type="checkbox"
            label="Sữa tươi cho bé từ 1 tuổi"
            id="type10"
          />
          <Form.Check
            type="checkbox"
            label="Sữa tươi tăng chiều cao cho bé 3-5 tuổi"
            id="type11"
          />

          <Form.Label>
            <FaTags /> Bỉm & tã em bé
          </Form.Label>
          <Form.Check type="checkbox" label="Bỉm sơ sinh (< 5kg)" id="type12" />
          <Form.Check type="checkbox" label="Bỉm size S (4-8kg)" id="type13" />
          <Form.Check type="checkbox" label="Bỉm size M (6-11kg)" id="type14" />
          <Form.Check type="checkbox" label="Bỉm size L (9-14kg)" id="type15" />
          <Form.Check
            type="checkbox"
            label="Bỉm size XL (12-17kg)"
            id="type16"
          />
          <Form.Check
            type="checkbox"
            label="Bỉm quần cho bé tập đi"
            id="type17"
          />

          <Form.Label>
            <FaPuzzlePiece /> Đồ chơi phát triển
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Đồ chơi kích thích giác quan 0-12 tháng"
            id="type18"
          />
          <Form.Check
            type="checkbox"
            label="Đồ chơi vận động 1-3 tuổi"
            id="type19"
          />
          <Form.Check
            type="checkbox"
            label="Đồ chơi thông minh 3-5 tuổi"
            id="type20"
          />
          <Form.Check type="checkbox" label="Đồ chơi STEM" id="type21" />
          <Form.Check type="checkbox" label="Đồ chơi âm nhạc" id="type22" />
          <Form.Check type="checkbox" label="Đồ chơi ngoài trời" id="type23" />

          <Form.Label>
            <FaHome /> Chăm sóc mẹ và bé
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Chăm sóc da bầu (chống rạn)"
            id="type24"
          />
          <Form.Check type="checkbox" label="Dầu massage bầu" id="type25" />
          <Form.Check type="checkbox" label="Kem dưỡng da cho bé" id="type26" />
          <Form.Check type="checkbox" label="Dầu tắm gội cho bé" id="type27" />
          <Form.Check type="checkbox" label="Phấn rôm chống hăm" id="type28" />
          <Form.Check
            type="checkbox"
            label="Nhiệt kế & Máy hút mũi"
            id="type29"
          />

          <Form.Label>
            <FaTshirt /> Thời trang mẹ và bé
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Đồ bầu theo tháng (1-8 tháng)"
            id="type30"
          />
          <Form.Check type="checkbox" label="Váy bầu công sở" id="type31" />
          <Form.Check type="checkbox" label="Đồ sau sinh" id="type32" />
          <Form.Check
            type="checkbox"
            label="Quần áo sơ sinh (0-12 tháng)"
            id="type33"
          />
          <Form.Check type="checkbox" label="Quần áo bé 1-3 tuổi" id="type34" />
          <Form.Check type="checkbox" label="Quần áo bé 3-5 tuổi" id="type35" />

          <Form.Label>
            <FaCapsules /> Dinh dưỡng bà bầu
          </Form.Label>
          <Form.Check
            type="checkbox"
            label="Vitamin tổng hợp cho bà bầu"
            id="type36"
          />
          <Form.Check type="checkbox" label="Sắt và axit folic" id="type37" />
          <Form.Check type="checkbox" label="Canxi và Vitamin D3" id="type38" />
          <Form.Check type="checkbox" label="Omega 3 và DHA" id="type39" />
          <Form.Check
            type="checkbox"
            label="Sữa bầu công thức đặc biệt"
            id="type40"
          />
        </Form>
      </div>
    </div>
  );
  return (
    <Container>
      <Row>
        <Col lg={3} className="d-none d-lg-block d-md-none d-sm-none">
          <div className="sidebar p-3 rounded mb-3">
            <h6> Mức Giá</h6>
            <Form>
              <Form.Check
                type="radio"
                label="dưới 500.000đ"
                name="price"
                id="price2"
              />
              <Form.Check
                type="radio"
                label="dưới 1.000.000đ"
                name="price"
                id="price3"
              />

              <Form.Check
                type="radio"
                label="Trên 1.000.000đ"
                name="price"
                id="price7"
              />
            </Form>

            <h6>
              <br />
              Loại sản phẩm
            </h6>
            <Form>
              <Form.Label>
                <FaBabyCarriage /> Sữa bột cao cấp
              </Form.Label>
              <Form.Check
                type="checkbox"
                label="Sữa bột cho bé 0-6 tháng"
                id="type1"
              />
              <Form.Check
                type="checkbox"
                label="Sữa bột cho bé 6-12 tháng"
                id="type2"
              />
              <Form.Check
                type="checkbox"
                label="Sữa bột cho bé 1-3 tuổi"
                id="type3"
              />
              <Form.Check
                type="checkbox"
                label="Sữa bột cho bé 3-5 tuổi"
                id="type4"
              />
              <Form.Check type="checkbox" label="Sữa bột organic" id="type5" />
              <Form.Check
                type="checkbox"
                label="Sữa non tăng đề kháng"
                id="type6"
              />

              <Form.Label>
                <FaGlassWhiskey /> Sữa tươi dinh dưỡng
              </Form.Label>
              <Form.Check
                type="checkbox"
                label="Sữa tươi cho mẹ bầu"
                id="type7"
              />
              <Form.Check
                type="checkbox"
                label="Sữa tươi tăng canxi cho bà bầu"
                id="type8"
              />
              <Form.Check
                type="checkbox"
                label="Sữa tươi cho mẹ sau sinh"
                id="type9"
              />
              <Form.Check
                type="checkbox"
                label="Sữa tươi cho bé từ 1 tuổi"
                id="type10"
              />
              <Form.Check
                type="checkbox"
                label="Sữa tươi tăng chiều cao cho bé 3-5 tuổi"
                id="type11"
              />

              <Form.Label>
                <FaTags /> Bỉm & tã em bé
              </Form.Label>
              <Form.Check
                type="checkbox"
                label="Bỉm sơ sinh (< 5kg)"
                id="type12"
              />
              <Form.Check
                type="checkbox"
                label="Bỉm size S (4-8kg)"
                id="type13"
              />
              <Form.Check
                type="checkbox"
                label="Bỉm size M (6-11kg)"
                id="type14"
              />
              <Form.Check
                type="checkbox"
                label="Bỉm size L (9-14kg)"
                id="type15"
              />
              <Form.Check
                type="checkbox"
                label="Bỉm size XL (12-17kg)"
                id="type16"
              />
              <Form.Check
                type="checkbox"
                label="Bỉm quần cho bé tập đi"
                id="type17"
              />

              <Form.Label>
                <FaPuzzlePiece /> Đồ chơi phát triển
              </Form.Label>
              <Form.Check
                type="checkbox"
                label="Đồ chơi kích thích giác quan 0-12 tháng"
                id="type18"
              />
              <Form.Check
                type="checkbox"
                label="Đồ chơi vận động 1-3 tuổi"
                id="type19"
              />
              <Form.Check
                type="checkbox"
                label="Đồ chơi thông minh 3-5 tuổi"
                id="type20"
              />
              <Form.Check type="checkbox" label="Đồ chơi STEM" id="type21" />
              <Form.Check type="checkbox" label="Đồ chơi âm nhạc" id="type22" />
              <Form.Check
                type="checkbox"
                label="Đồ chơi ngoài trời"
                id="type23"
              />

              <Form.Label>
                <FaHome /> Chăm sóc mẹ và bé
              </Form.Label>
              <Form.Check
                type="checkbox"
                label="Chăm sóc da bầu (chống rạn)"
                id="type24"
              />
              <Form.Check type="checkbox" label="Dầu massage bầu" id="type25" />
              <Form.Check
                type="checkbox"
                label="Kem dưỡng da cho bé"
                id="type26"
              />
              <Form.Check
                type="checkbox"
                label="Dầu tắm gội cho bé"
                id="type27"
              />
              <Form.Check
                type="checkbox"
                label="Phấn rôm chống hăm"
                id="type28"
              />
              <Form.Check
                type="checkbox"
                label="Nhiệt kế & Máy hút mũi"
                id="type29"
              />

              <Form.Label>
                <FaTshirt /> Thời trang mẹ và bé
              </Form.Label>
              <Form.Check
                type="checkbox"
                label="Đồ bầu theo tháng (1-8 tháng)"
                id="type30"
              />
              <Form.Check type="checkbox" label="Váy bầu công sở" id="type31" />
              <Form.Check type="checkbox" label="Đồ sau sinh" id="type32" />
              <Form.Check
                type="checkbox"
                label="Quần áo sơ sinh (0-12 tháng)"
                id="type33"
              />
              <Form.Check
                type="checkbox"
                label="Quần áo bé 1-3 tuổi"
                id="type34"
              />
              <Form.Check
                type="checkbox"
                label="Quần áo bé 3-5 tuổi"
                id="type35"
              />

              <Form.Label>
                <FaCapsules /> Dinh dưỡng bà bầu
              </Form.Label>
              <Form.Check
                type="checkbox"
                label="Vitamin tổng hợp cho bà bầu"
                id="type36"
              />
              <Form.Check
                type="checkbox"
                label="Sắt và axit folic"
                id="type37"
              />
              <Form.Check
                type="checkbox"
                label="Canxi và Vitamin D3"
                id="type38"
              />
              <Form.Check type="checkbox" label="Omega 3 và DHA" id="type39" />
              <Form.Check
                type="checkbox"
                label="Sữa bầu công thức đặc biệt"
                id="type40"
              />
            </Form>
          </div>
        </Col>
        <Col lg={9} md={12} ms={12}>
          <Row className="product-row">
            <div className="filter-header">
              {/* Tiêu đề sản phẩm */}
              <div className="product-title-wrapper mb-3 mb-lg-0">
                <h4 className="product-title">Tất cả sản phẩm</h4>
              </div>

              {/* Filter Controls */}
              <div className="filter-controls">
                <div className="d-flex justify-content-between align-items-center">
                  {/* Nút Bộ lọc */}
                  <div className="d-block d-lg-none">
                    <button
                      onClick={handleShowFilter}
                      className="filter-button d-flex align-items-center"
                    >
                      <CiFilter className="me-1" />
                      Bộ Lọc
                    </button>
                  </div>

                  {/* Dropdown Sắp xếp */}
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
          <Row></Row>
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
          <FilterContent />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductPage;
