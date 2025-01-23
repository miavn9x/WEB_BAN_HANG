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
const categories = [
  {
    path: "sua-bot-cao-cap",
    label: "Sữa bột cao cấp",
    icon: <FaBabyCarriage />,
  },
  { path: "sua-tuoi", label: "Sữa tươi dinh dưỡng", icon: <FaGlassWhiskey /> },
  { path: "bim-ta", label: "Bỉm & tã em bé", icon: <FaTags /> },
  {
    path: "do-choi-phat-trien",
    label: "Đồ chơi phát triển",
    icon: <FaPuzzlePiece />,
  },
  { path: "cham-soc-me-be", label: "Chăm sóc mẹ và bé", icon: <FaHome /> },
  {
    path: "thoi-trang-me-be",
    label: "Thời trang mẹ và bé",
    icon: <FaTshirt />,
  },
  {
    path: "dinh-duong-ba-bau",
    label: "Dinh dưỡng bà bầu",
    icon: <FaCapsules />,
  },
  { path: "an-dam-cho-be", label: "Ăn dặm cho bé", icon: <FaUtensils /> },
  {
    path: "dinh-duong-cho-be",
    label: "Dinh dưỡng cho bé",
    icon: <FaCapsules />,
  },
  { path: "do-dung-thiet-yeu", label: "Đồ dùng thiết yếu", icon: <FaBaby /> },
];

const NavMenu = [
  { path: "/", label: "TRANG CHỦ" },
  { path: "/products", label: "TẤT CẢ SẢN PHẨM" }, 
  { path: "Giới Thiệu", label: "GIỚI THIỆU" },
  { path: "Bài Viết", label: "BÀI VIẾT" },
];

const systemInfo = [
  { icon: <FaStore />, text: "Hệ thống cửa hàng" },
  { icon: <FaPhone />, text: "Hotline: 099999998" },
];

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
            <Col xs={7} className="d-lg-none text-end pe-2">
              <Nav className="justify-content-end">
                <div className="d-flex align-items-center ms-auto">
                  {/* Biểu tượng tài khoản người dùng */}
                  <Nav.Link
                    onClick={() => handleLinkClick("/login")}
                    className="p-1 pb-2 ms-2 icon-wrapper"
                    style={{ cursor: "pointer" }}
                  >
                    <FaUser className="text-dark" size={20} />
                  </Nav.Link>
                  {/* Biểu tượng thông báo */}
                  <Nav.Link
                    onClick={() => handleLinkClick("/dang-xuat")}
                    className="p-1 ms-2 position-relative icon-wrapper"
                    style={{ cursor: "pointer" }}
                  >
                    <FaBell className="text-dark" size={20} />
                    <span className="notification-badge">0</span>
                  </Nav.Link>
                  {/* Biểu tượng giỏ hàng */}
                  <Nav.Link
                    onClick={() => handleLinkClick("Giỏ Hàng")}
                    className="p-1 ms-2 position-relative icon-wrapper"
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
            <Col lg={7} xs={12} className="order-last order-lg-0">
              <Navbar.Collapse id="navbarSupportedContent">
                {/* Danh mục cho di động */}

                <div className="d-lg-none w-100 mb-3">
                  <Dropdown className="w-100">
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="w-100 text-start "
                    >
                      Danh mục sản phẩm
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="w-100">
                      {categories.map((category) => (
                        <Dropdown.Item
                          key={category.path}
                          onClick={() => handleLinkClick(category.path)}
                        >
                          {/* Hiển thị biểu tượng (icon) nếu có */}
                          {category.icon && (
                            <span className="me-2">{category.icon}</span>
                          )}
                          {category.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* Form Tìm kiếm */}
                <Form className="d-flex w-100">
                  <div className="d-none d-lg-block me-2 ">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        style={{ width: "210px" }}
                      >
                        Danh mục sản phẩm
                      </Dropdown.Toggle>
                      <Dropdown.Menu style={{ width: "210px" }}>
                        {categories.map((category) => (
                          <Dropdown.Item
                            key={category.path}
                            onClick={() => handleLinkClick(category.path)}
                          >
                            {category.icon && (
                              <span className="me-2">{category.icon}</span>
                            )}
                            {category.label}
                          </Dropdown.Item>
                        ))}
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
                  {NavMenu.map((link, index) => (
                    <button
                      key={index}
                      className="btn btn-link text-dark" // Giữ kiểu dáng giống như Nav.Link
                      onClick={() => handleLinkClick(link.path)}
                      style={{ textDecoration: "none" }} // Xóa gạch chân nếu có
                    >
                      {link.label}
                    </button>
                  ))}
                </Nav>
              </Navbar.Collapse>
            </Col>

            {/* Phần này - Các biểu tượng Chỉ hiển thị trên máy tính để bàn không hiện thị di động */}
            <Col lg={2} className="d-none d-lg-block">
              <Nav className="justify-content-end align-items-end">
                <Nav.Link
                  onClick={() => handleLinkClick("/login")}
                  className="pb-2 me-3 icon_user"
                  style={{ cursor: "pointer" }}
                >
                  <FaUser size={20} />
                </Nav.Link>
                <Nav.Link
                  onClick={() => handleLinkClick("/dang-xuat")}
                  className=" me-3 position-relative"
                  style={{ cursor: "pointer" }}
                >
                  <FaBell size={20} />
                  <span className="notification-badge">0</span>
                </Nav.Link>
                <Nav.Link
                  onClick={() => handleLinkClick("Giỏ Hàng")}
                  className=" position-relative"
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
          {NavMenu.map((link, index) =>
            link.items ? (
              <NavDropdown
                key={index}
                title={link.title}
                id={`navbarDropdown-${index}`}
                className="text-white me-5 text-center text-uppercase"
              >
                {link.items.map((item, subIndex) => (
                  <NavDropdown.Item
                    key={subIndex}
                    onClick={() => handleLinkClick(item.path)}
                    className="nav-dropdown-item"
                    style={{ width: "240px", textAlign: "center" }}
                  >
                    <div className="nav_item">{item.label}</div>
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            ) : (
              <Nav.Link
                key={index}
                onClick={() => handleLinkClick(link.path)}
                className="text-white me-4 nav-link"
                style={{ cursor: "pointer" }}
              >
                {link.label}
              </Nav.Link>
            )
          )}

          {/* Chương trình khuyến mãi - Viết riêng ngoài mảng */}
          <div className="d-flex align-items-center Nav__sale">
            <NavDropdown
              title="KHUYẾN MÃI"
              id="navbarDropdown-promotion"
              className="promotion-dropdown text-white"
            >
              <NavDropdown.Item
                onClick={() => handleLinkClick("Khuyến Mãi 1")}
                className="promotion-dropdown-item"
              >
                Khuyến mãi 1
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => handleLinkClick("Khuyến Mãi 2")}
                className="promotion-dropdown-item"
              >
                Khuyến mãi 2
              </NavDropdown.Item>
            </NavDropdown>
          </div>
          <Navbar.Collapse id="navbarNav">
            <Nav className="me-auto mb-2 mb-lg-0">
              {/* Các mục điều hướng khác */}
            </Nav>
            <Navbar.Text className="text-white ms-auto text-end">
              {systemInfo.map((info, idx) => (
                <span key={idx}>
                  {info.icon} {info.text} &nbsp; | &nbsp;
                </span>
              ))}
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default MyNavbar;
