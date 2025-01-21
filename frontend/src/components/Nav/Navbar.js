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
  FaBabyCarriage,
  FaGlassWhiskey,
  FaTags,
  FaPuzzlePiece,
  FaHome,
  FaTshirt,
  FaCapsules,
  FaUtensils,
  FaBaby,
} from "react-icons/fa";
import "../../styles/Navbar.css";
import { useNavigate } from "react-router-dom";

const MyNavbar = () => {
  const navigate = useNavigate(); // Sử dụng hook useNavigate

  const handleLinkClick = (path) => {
    navigate(path); // Gọi navigate đúng cách
  };

  return (
    <>
      {/* Navbar chính */}
      <Navbar bg="light" expand="lg" className="py-2">
        <Container>
          <Row className="w-100 align-items-center">
            {/* Phần trái - Logo */}
            <Col
              xs={4}
              lg={3}
              className="pe-0"
              onClick={() => handleLinkClick("/")}
            >
              <Navbar.Brand
                className="d-flex align-items-center"
                style={{ cursor: "pointer" }}
              >
                <img
                  alt="Logo"
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1737451253/1_vmcjnj.png"
                  className="me-2"
                  height="60"
                />
                <span className="logo-text">
                  <span className="text-danger fw-bold">Baby</span>
                  <span className="text-primary fw-bold">Mart</span>
                </span>
              </Navbar.Brand>
            </Col>

            {/* Phần phải - Các biểu tượng (Chỉ hiển thị trên di động) */}
            <Col xs={7} className="d-lg-none text-end pe-3">
              <Nav className="justify-content-end">
                <div className="d-flex align-items-center ms-auto">
                  {/* Biểu tượng tài khoản người dùng */}
                  <Nav.Link
                    onClick={() => handleLinkClick("/tai-khoan")}
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
            <Col xs={1} className="d-lg-none px-0 text-center">
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
                        onClick={() => handleLinkClick("sua-bot-cao-cap")}
                      >
                        Sữa bột cao cấp
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleLinkClick("sua-tuoi")}
                      >
                        Sữa tươi dinh dưỡng
                      </Dropdown.Item>

                      <Dropdown.Item onClick={() => handleLinkClick("bim-ta")}>
                        Bỉm & tã em bé
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleLinkClick("do-choi-phat-trien")}
                      >
                        Đồ chơi phát triển
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleLinkClick("cham-soc-me-be")}
                      >
                        Chăm sóc mẹ và bé
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleLinkClick("thoi-trang-me-be")}
                      >
                        Thời trang mẹ và bé
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleLinkClick("dinh-duong-ba-bau")}
                      >
                        Dinh dưỡng bà bầu
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleLinkClick("an-dam-cho-be")}
                      >
                        Ăn dặm cho bé
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleLinkClick("dinh-duong-cho-be")}
                      >
                        Dinh dưỡng cho bé
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleLinkClick("do-dung-thiet-yeu")}
                      >
                        Đồ dùng thiết yếu
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
                          onClick={() => handleLinkClick("sua-bot-cao-cap")}
                        >
                          <FaBabyCarriage className="me-2" />
                          Sữa bột cao cấp
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("sua-tuoi")}
                        >
                          <FaGlassWhiskey className="me-2" />
                          Sữa tươi dinh dưỡng
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("bim-ta")}
                        >
                          <FaTags className="me-2" />
                          Bỉm & tã em bé
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("do-choi-phat-trien")}
                        >
                          <FaPuzzlePiece className="me-2" />
                          Đồ chơi phát triển
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("cham-soc-me-be")}
                        >
                          <FaHome className="me-2" />
                          Chăm sóc mẹ và bé
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("thoi-trang-me-be")}
                        >
                          <FaTshirt className="me-2" />
                          Thời trang mẹ và bé
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("dinh-duong-ba-bau")}
                        >
                          <FaCapsules className="me-2" />
                          Dinh dưỡng bà bầu
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("an-dam-cho-be")}
                        >
                          <FaUtensils className="me-2" />
                          Ăn dặm cho bé
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("dinh-duong-cho-be")}
                        >
                          <FaCapsules className="me-2" />
                          Dinh dưỡng cho bé
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleLinkClick("do-dung-thiet-yeu")}
                        >
                          <FaBaby className="me-2" />
                          Đồ dùng thiết yếu
                        </Dropdown.Item>

                        <Dropdown.Divider />

                        <Dropdown.Item
                          onClick={() => handleLinkClick("tat-ca-san-pham")}
                        >
                          Xem tất cả sản phẩm
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
                  <Nav.Link
                    onClick={() => handleLinkClick("/products")}
                    className="text-dark"
                  >
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
      <Navbar
        expand="lg"
        className=" text-white d-none d-lg-block"
        style={{ background: "#FFB6C1" }}
      >
        <Container>
          <Navbar.Brand
            onClick={() => handleLinkClick("/")}
            className="text-white me-4"
            style={{ cursor: "pointer" }}
          >
            TRANG CHỦ
          </Navbar.Brand>
          <Navbar.Collapse id="navbarNav">
            <Nav className="me-auto mb-2 mb-lg-0">
              <Nav.Link
                onClick={() => handleLinkClick("/products")}
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
              <Nav.Link
                onClick={() => handleLinkClick("Bài Viết")}
                className="text-white me-3"
                style={{ cursor: "pointer" }}
              >
                BÀI VIẾT
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
