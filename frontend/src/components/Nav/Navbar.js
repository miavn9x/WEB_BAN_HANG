import React from "react";
import {
  Navbar,
  Nav,
  Button,
  Form,
  FormControl,
  Container,
  Row,
  Col,
  Dropdown,
  NavDropdown,
} from "react-bootstrap";
import {
  FaUser,
  FaBell,
  FaSearch,
  FaShoppingCart,
  FaStore,
  FaPhone,
} from "react-icons/fa";
import "../../styles/Navbar.css";

const MyNavbar = () => {
  const handleLinkClick = (page) => {
    console.log(`Navigating to ${page}`);
 
  };

  return (
    <>
      {/* Navbar chính */}
      <Navbar bg="light" expand="lg" className="py-2">
        <Container>
          <Row className="w-100 align-items-center">
            {/* Phần trái - Logo */}
            <Col xs={4} lg={3} className="pe-0">
              <Navbar.Brand
                onClick={() => handleLinkClick("Trang Chủ")}
                className="d-flex align-items-center"
                style={{ cursor: "pointer" }}
              >
                <img
                  alt="Logo của bé đội mũ"
                  src="https://storage.googleapis.com/a1aa/image/qzIhiJwb8PbmDVnu5zoheAQw6s01Y84KfJeEO7kL9oM2AvNoA.jpg"
                  className="me-2"
                  height="40"
                />
                <span className="logo-text">
                  <span className="text-danger fw-bold">Baby</span>
                  <span className="text-primary fw-bold">Mart</span>
                </span>
              </Navbar.Brand>
            </Col>

            {/* Phần phải - Các biểu tượng (Chỉ hiển thị trên di động) */}
            <Col xs={5} className="d-lg-none text-end pe-3">
              <Nav className="justify-content-end">
                <div className="d-flex align-items-center">
                  {/* Biểu tượng tài khoản người dùng */}
                  <Nav.Link
                    onClick={() => handleLinkClick("Tài Khoản")}
                    className="p-2 ms-2 icon-wrapper"
                    style={{ cursor: "pointer" }}
                  >
                    <FaUser className="text-dark" size={20} />
                  </Nav.Link>
                  {/* Biểu tượng thông báo */}
                  <Nav.Link
                    onClick={() => handleLinkClick("Thông Báo")}
                    className="p-2 ms-2 position-relative icon-wrapper"
                    style={{ cursor: "pointer" }}
                  >
                    <FaBell className="text-dark" size={20} />
                    <span className="notification-badge">0</span>
                  </Nav.Link>
                  {/* Biểu tượng giỏ hàng */}
                  <Nav.Link
                    onClick={() => handleLinkClick("Giỏ Hàng")}
                    className="p-2 ms-2 position-relative icon-wrapper"
                    style={{ cursor: "pointer" }}
                  >
                    <FaShoppingCart className="text-dark" size={20} />
                    <span className="cart-badge">2</span>
                  </Nav.Link>
                </div>
              </Nav>
            </Col>

            {/* Nút Toggle (Chỉ hiển thị trên di động) */}
            <Col xs={3} className="d-lg-none px-0 text-center">
              <Navbar.Toggle
                aria-controls="navbarSupportedContent"
                className="border-0"
              />
            </Col>

            {/* Phần giữa - Tìm kiếm và Danh mục */}
            <Col lg={6} xs={12} className="order-last order-lg-0">
              <Navbar.Collapse id="navbarSupportedContent">
                {/* Danh mục cho di động */}
                <div className="d-lg-none w-100 mb-3">
                  <Dropdown className="w-100">
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="w-100 text-start"
                    >
                      Danh mục sản phẩm
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      <Dropdown.Item
                        onClick={() => handleLinkClick("Đồ chơi trẻ em")}
                      >
                        Đồ chơi trẻ em
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleLinkClick("Quần áo trẻ em")}
                      >
                        Quần áo trẻ em
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleLinkClick("Đồ dùng cho mẹ")}
                      >
                        Đồ dùng cho mẹ
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleLinkClick("Sữa và thực phẩm")}
                      >
                        Sữa và thực phẩm
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* Form Tìm kiếm */}
                <Form className="d-flex w-100">
                  <div className="d-none d-lg-block me-2">
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary">
                        Danh mục sản phẩm
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => handleLinkClick("Đồ chơi trẻ em")}
                        >
                          Đồ chơi trẻ em
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleLinkClick("Quần áo trẻ em")}
                        >
                          Quần áo trẻ em
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleLinkClick("Đồ dùng cho mẹ")}
                        >
                          Đồ dùng cho mẹ
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleLinkClick("Sữa và thực phẩm")}
                        >
                          Sữa và thực phẩm
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  {/* Search Input */}
                  <div className="search-container flex-grow-1">
                    <FormControl
                      type="search"
                      placeholder="Tìm theo tên sản phẩm..."
                      aria-label="Search"
                    />
                    <Button
                      variant="danger"
                      type="submit"
                      className="search-button"
                    >
                      <FaSearch />
                    </Button>
                  </div>
                </Form>

                {/* Navigation Links (Only for Mobile) */}
                <Nav className="flex-column mt-3 d-lg-none">
                  <Nav.Link href="/" className="text-dark">
                    TRANG CHỦ
                  </Nav.Link>
                  <Nav.Link href="/products" className="text-dark">
                    TẤT CẢ SẢN PHẨM
                  </Nav.Link>
                  <Nav.Link href="/promotions" className="text-dark">
                    CHƯƠNG TRÌNH KHUYẾN MÃI
                  </Nav.Link>
                  <Nav.Link href="/setup" className="text-dark">
                    HƯỚNG DẪN THIẾT LẬP
                  </Nav.Link>
                  <Nav.Link href="/about" className="text-dark">
                    GIỚI THIỆU
                  </Nav.Link>
                  <Nav.Link href="/news" className="text-dark">
                    TIN TỨC
                  </Nav.Link>
                  <Nav.Link href="/contact" className="text-dark">
                    LIÊN HỆ
                  </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Col>

            {/* Phần phải - Các biểu tượng (Chỉ hiển thị trên máy tính để bàn) */}
            <Col lg={3} className="d-none d-lg-block">
              <Nav className="justify-content-end align-items-center">
                <Nav.Link
                  onClick={() => handleLinkClick("Tài Khoản")}
                  className="p-2 me-3"
                  style={{ cursor: "pointer" }}
                >
                  <FaUser size={20} />
                </Nav.Link>
                <Nav.Link
                  onClick={() => handleLinkClick("Thông Báo")}
                  className="p-2 me-3 position-relative"
                  style={{ cursor: "pointer" }}
                >
                  <FaBell size={20} />
                  <span className="notification-badge">0</span>
                </Nav.Link>
                <Nav.Link
                  onClick={() => handleLinkClick("Giỏ Hàng")}
                  className="p-2 position-relative"
                  style={{ cursor: "pointer" }}
                >
                  <FaShoppingCart size={20} />
                  <span className="cart-badge">2</span>
                </Nav.Link>
              </Nav>
            </Col>
          </Row>
        </Container>
      </Navbar>

      {/* Navbar bổ sung - Hiển thị trên màn hình lớn */}
      <Navbar expand="lg" className="bg-danger text-white d-none d-lg-block">
        <Container>
          <Navbar.Brand
            onClick={() => handleLinkClick("Trang Chủ")}
            className="text-white me-4"
            style={{ cursor: "pointer" }}
          >
            TRANG CHỦ
          </Navbar.Brand>
          <Navbar.Collapse id="navbarNav">
            <Nav className="me-auto mb-2 mb-lg-0">
              <Nav.Link
                onClick={() => handleLinkClick("Tất Cả Sản Phẩm")}
                className="text-white me-3"
                style={{ cursor: "pointer" }}
              >
                TẤT CẢ SẢN PHẨM
              </Nav.Link>
              <NavDropdown
                title="CHƯƠNG TRÌNH KHUYẾN MÃI"
                id="navbarDropdown"
                className="text-white me-3"
              >
                <NavDropdown.Item
                  onClick={() => handleLinkClick("Khuyến Mãi 1")}
                >
                  Khuyến mãi 1
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => handleLinkClick("Khuyến Mãi 2")}
                >
                  Khuyến mãi 2
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link
                onClick={() => handleLinkClick("Giới Thiệu")}
                className="text-white me-3"
                style={{ cursor: "pointer" }}
              >
                GIỚI THIỆU
              </Nav.Link>
            </Nav>
            {/* Phần thông tin hệ thống cửa hàng (Ẩn trên di động) */}
            <Navbar.Text className="text-white ms-auto">
              <FaStore /> Hệ thống cửa hàng &nbsp; | &nbsp; <FaPhone /> Hotline:
              099999998
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default MyNavbar;
