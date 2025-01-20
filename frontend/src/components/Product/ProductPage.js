import React from "react";
import { Container, Row, Col, Form, Button, Dropdown } from "react-bootstrap";
import { FaStar, FaStarHalfAlt, FaShoppingCart } from "react-icons/fa";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ProductPage.css";

const ProductPage = () => {
  return (
    <Container>
      <Row>
        <Col md={3}>
          <div className="sidebar p-3 rounded mb-3">
            <h5>Giá</h5>
            <Form>
              <Form.Check
                type="radio"
                label="Giá dưới 1.000.000đ"
                name="price"
                id="price1"
              />
              <Form.Check
                type="radio"
                label="1.000.000đ - 2.000.000đ"
                name="price"
                id="price2"
              />
              <Form.Check
                type="radio"
                label="2.000.000đ - 3.000.000đ"
                name="price"
                id="price3"
              />
              <Form.Check
                type="radio"
                label="3.000.000đ - 5.000.000đ"
                name="price"
                id="price4"
              />
              <Form.Check
                type="radio"
                label="5.000.000đ - 7.000.000đ"
                name="price"
                id="price5"
              />
              <Form.Check
                type="radio"
                label="7.000.000đ - 10.000.000đ"
                name="price"
                id="price6"
              />
              <Form.Check
                type="radio"
                label="Trên 10.000.000đ"
                name="price"
                id="price7"
              />
            </Form>

            <h5>Hãng sản xuất</h5>
            <Form>
              <Form.Check type="checkbox" label="Agudha" id="brand1" />
              <Form.Check type="checkbox" label="Aptamil" id="brand2" />
              <Form.Check type="checkbox" label="Biminu" id="brand3" />
              <Form.Check type="checkbox" label="Bobby" id="brand4" />
              <Form.Check type="checkbox" label="CHREE" id="brand5" />
            </Form>
            {/* <a href="#">Xem thêm ></a> */}

            <h5>Loại sản phẩm</h5>
            <Form>
              <Form.Check type="checkbox" label="1.Đồ ăn uống" id="type1" />
              <Form.Check type="checkbox" label="10.Hàng ký gửi" id="type2" />
              <Form.Check type="checkbox" label="5.Hoa mỹ phẩm" id="type3" />
              <Form.Check type="checkbox" label="6.Sữa" id="type4" />
              <Form.Check type="checkbox" label="BE.TPCN Cho Bé" id="type5" />
            </Form>
            {/* <a href="#">Xem thêm ></a> */}

            <h5>Tags</h5>
            <Form>
              <Form.Check type="checkbox" label="Flash Sale" id="tag1" />
              <Form.Check type="checkbox" label="Giao Nhanh 2h" id="tag2" />
              <Form.Check type="checkbox" label="Chính hãng" id="tag3" />
              <Form.Check type="checkbox" label="Ngại nhập" id="tag4" />
              <Form.Check type="checkbox" label="Xả kho" id="tag5" />
            </Form>
          </div>
        </Col>
        <Col md={9}>
          <Row className="product-row">
            <div className="d-flex justify-content-between mb-3">
              <h2 className="my-4">Tất cả sản phẩm</h2>
              <Dropdown>
                <Dropdown.Toggle variant="light">Mặc định</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#">Giá tăng dần</Dropdown.Item>
                  <Dropdown.Item href="#">Giá giảm dần</Dropdown.Item>
                  <Dropdown.Item href="#">Mới nhất</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Sản phẩm */}

            <div
              className="product-container d-flex"
              style={{ flexWrap: "wrap" }}
            >
              <div
                className="product-card border rounded p-3"
                style={{ flex: "0 0 20%" }}
              >
                <img
                  alt="Tã dán Merries size L 54 miếng (9-14kg)"
                  className="w-100"
                  src="https://storage.googleapis.com/a1aa/image/6DYfwxao46zlYiXLTgxo9PAgZaThyw3u5wf7iFVJIq17MeNoA.jpg"
                  style={{ maxHeight: "200px" }}
                />
                <p>Tã dán Merries size L 54 miếng (9-14kg)</p>
                <div className="rating">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStarHalfAlt />
                </div>
                <p className="price text-danger font-weight-bold">421.000đ</p>
                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" className="w-48">
                    <FaShoppingCart />
                  </Button>
                  <Button variant="danger" className="w-48">
                    Mua ngay
                  </Button>
                </div>
              </div>

              <div
                className="product-card border rounded p-3"
                style={{ flex: "0 0 20%" }}
              >
                <img
                  alt="Tã dán Merries size L 54 miếng (9-14kg)"
                  className="w-100"
                  src="https://storage.googleapis.com/a1aa/image/6DYfwxao46zlYiXLTgxo9PAgZaThyw3u5wf7iFVJIq17MeNoA.jpg"
                  style={{ maxHeight: "200px" }}
                />
                <p>Tã dán Merries size L 54 miếng (9-14kg)</p>
                <div className="rating">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStarHalfAlt />
                </div>
                <p className="price text-danger font-weight-bold">421.000đ</p>
                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" className="w-48">
                    <FaShoppingCart />
                  </Button>
                  <Button variant="danger" className="w-48">
                    Mua ngay
                  </Button>
                </div>
              </div>

              <div
                className="product-card border rounded p-3"
                style={{ flex: "0 0 20%" }}
              >
                <img
                  alt="Tã dán Merries size L 54 miếng (9-14kg)"
                  className="w-100"
                  src="https://storage.googleapis.com/a1aa/image/6DYfwxao46zlYiXLTgxo9PAgZaThyw3u5wf7iFVJIq17MeNoA.jpg"
                  style={{ maxHeight: "200px" }}
                />
                <p>Tã dán Merries size L 54 miếng (9-14kg)</p>
                <div className="rating">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStarHalfAlt />
                </div>
                <p className="price text-danger font-weight-bold">421.000đ</p>
                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" className="w-48">
                    <FaShoppingCart />
                  </Button>
                  <Button variant="danger" className="w-48">
                    Mua ngay
                  </Button>
                </div>
              </div>

              <div
                className="product-card border rounded p-3"
                style={{ flex: "0 0 20%" }}
              >
                <img
                  alt="Tã dán Merries size L 54 miếng (9-14kg)"
                  className="w-100"
                  src="https://storage.googleapis.com/a1aa/image/6DYfwxao46zlYiXLTgxo9PAgZaThyw3u5wf7iFVJIq17MeNoA.jpg"
                  style={{ maxHeight: "200px" }}
                />
                <p>Tã dán Merries size L 54 miếng (9-14kg)</p>
                <div className="rating">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStarHalfAlt />
                </div>
                <p className="price text-danger font-weight-bold">421.000đ</p>
                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" className="w-48">
                    <FaShoppingCart />
                  </Button>
                  <Button variant="danger" className="w-48">
                    Mua ngay
                  </Button>
                </div>
              </div>

              <div
                className="product-card border rounded p-3"
                style={{ flex: "0 0 20%" }}
              >
                <img
                  alt="Tã dán Merries size L 54 miếng (9-14kg)"
                  className="w-100"
                  src="https://storage.googleapis.com/a1aa/image/6DYfwxao46zlYiXLTgxo9PAgZaThyw3u5wf7iFVJIq17MeNoA.jpg"
                  style={{ maxHeight: "200px" }}
                />
                <p>Tã dán Merries size L 54 miếng (9-14kg)</p>
                <div className="rating">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStarHalfAlt />
                </div>
                <p className="price text-danger font-weight-bold">421.000đ</p>
                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" className="w-48">
                    <FaShoppingCart />
                  </Button>
                  <Button variant="danger" className="w-48">
                    Mua ngay
                  </Button>
                </div>
              </div>
            </div>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;
