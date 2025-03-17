import React, { useEffect, useState, useRef } from "react";
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
} from "react-bootstrap";
import {
  FaUser,
  FaBell,
  FaSearch,
  FaShoppingCart,
  FaStore,
  FaPhone,
  FaBookOpen,
  FaMoneyBillWave,
  FaBrain,
  FaChild,
  FaPaintBrush,
  FaHistory,
  FaSchool,
  FaLanguage,
  FaExclamationCircle,
} from "react-icons/fa";
import "../../styles/Navbar.css";
import { useNavigate } from "react-router-dom";
import LoginMenu from "../../pages/Auth/Login/LoginMenu";
import { useSelector } from "react-redux";
import axios from "axios";
import Fuse from "fuse.js";
import NotificationModal from "./NotificationModal";

const categories = [
  {
    path: "van-hoc",
    label: "Văn Học",
    icon: <FaBookOpen />,
  },
  {
    path: "kinh-te",
    label: "Kinh Tế",
    icon: <FaMoneyBillWave />,
  },
  {
    path: "tam-ly-ky-nang-song",
    label: "Tâm Lý - Kỹ Năng Sống",
    icon: <FaBrain />,
  },
  {
    path: "nuoi-day-con",
    label: "Nuôi Dạy Con",
    icon: <FaChild />,
  },
  {
    path: "sach-thieu-nhi",
    label: "Sách Thiếu Nhi",
    icon: <FaPaintBrush />,
  },
  {
    path: "tieu-su-hoi-ky",
    label: "Tiểu Sử - Hồi Ký",
    icon: <FaHistory />,
  },
  {
    path: "giao-khoa-tham-khao",
    label: "Giáo Khoa - Tham Khảo",
    icon: <FaSchool />,
  },
  {
    path: "sach-hoc-ngoai-ngu",
    label: "Sách Học Ngoại Ngữ",
    icon: <FaLanguage />,
  },
];

const NavMenu = [
  { path: "/", label: "TRANG CHỦ" },
  { path: "/products", label: "TẤT CẢ SẢN PHẨM" },
  { path: "/gioi-thieu", label: "GIỚI THIỆU" },
  { path: "/posts-list", label: "BÀI VIẾT" },
  // Các link trong menu dành cho desktop sẽ không bao gồm Hệ thống cửa hàng hay Hotline
];

const systemInfo = [
  { icon: <FaStore />, text: "Hệ thống cửa hàng", path: "/shop-map" },
  { icon: <FaPhone />, text: "Hotline: 099999998" },
];

const MyNavbar = () => {
  const navigate = useNavigate();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const searchRef = useRef(null);

  // Quản lý số lượng thông báo và modal thông báo
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Quản lý trạng thái đăng nhập (dựa trên token)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Lắng nghe sự thay đổi của localStorage (hỗ trợ đăng xuất từ các tab khác)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Hàm lấy thông báo từ API (chỉ đếm những thông báo chưa đọc)
  const fetchNotifications = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotificationCount(0);
      setIsLoggedIn(false);
      return;
    } else {
      setIsLoggedIn(true);
    }
    axios
      .get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const notifications = res.data.notifications || [];
        const unreadNotifications = notifications.filter((noti) => !noti.read);
        setNotificationCount(unreadNotifications.length);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
        setNotificationCount(0);
      });
  };

  // Polling: cập nhật thông báo mỗi 1 giây
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý click vào icon thông báo (mở modal)
  const handleNotificationClick = () => {
    setShowNotificationModal(true);
    fetchNotifications();
  };

  // Lấy dữ liệu sản phẩm để hỗ trợ tìm kiếm
  useEffect(() => {
    axios
      .get("/api/products")
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  // Xử lý gợi ý tìm kiếm bằng Fuse.js
  useEffect(() => {
    if (searchTerm.trim() !== "" && products.length > 0) {
      const fuse = new Fuse(products, {
        keys: ["name", "category.name", "category.generic", "brand"],
        threshold: 0.1,
      });
      const result = fuse.search(searchTerm);
      const filteredSuggestions = result.map((item) => item.item).slice(0, 5);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, products]);

  const handleLinkClick = (path) => {
    navigate(path);
  };

  const handleCategoryClick = (categoryLabel) => {
    navigate(`/products?categoryName=${encodeURIComponent(categoryLabel)}`);
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
    </div>
  ));

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  // Lấy dữ liệu giỏ hàng từ Redux
  const cartItems = useSelector((state) => state.cart.items);
  const totalItemsInCart = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Xử lý submit form tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(false);
    axios
      .post("/api/search", {
        query: searchTerm,
        categoryName: "",
        categoryGeneric: "",
        minPrice: 0,
        maxPrice: 1000,
        sortBy: "default",
        limit: 10,
      })
      .then((res) => {
        setSuggestions(res.data.products);
        setShowSuggestions(true);
        const token = localStorage.getItem("token");
        if (token) {
          axios
            .post(
              "/api/searchtext",
              { query: searchTerm },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .catch((err) => console.error("Lỗi lưu lịch sử tìm kiếm:", err));
        }
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API tìm kiếm:", err);
      });
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        !event.target.closest(".suggestions-container")
      ) {
        setSearchTerm("");
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  return (
    <>
      {/* Navbar chính */}
      <Navbar
        expand="lg"
        className="py-2"
        style={{ background: "#fdf5e6", color: "#323d42", width: "100%" }}
      >
        <Container fluid>
          <Row className="w-100 align-items-center">
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
                  src="https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742030869/logo_ch4fq2.png"
                  className="Logo_image me-2"
                  height="60"
                />
                <span className="logo-text navbar-text">
                  <span className="text-danger fs-3 fw-bold me-1">Go</span>
                  <span className="text-primary fs-3 fw-bold">Book</span>
                </span>
              </Navbar.Brand>
            </Col>

            {/* Các biểu tượng trên di động */}
            <Col xs={7} className="d-lg-none text-end pe-2">
              <Nav className="justify-content-end">
                <div className="d-flex align-items-center ms-auto notification-modal">
                  <Nav.Link
                    className="pb-3 me-1 icon_user"
                    style={{ cursor: "pointer" }}
                  >
                    {isLoggedIn ? (
                      <Dropdown
                        show={isMenuVisible}
                        onToggle={(isOpen) => setIsMenuVisible(isOpen)}
                      >
                        <Dropdown.Toggle
                          as={CustomToggle}
                          id="dropdown-custom-components"
                        >
                          <FaUser size={20} className="user-icon logged-in" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          className="custom-dropdown-menu"
                          style={{ position: "absolute", zIndex: 1050 }}
                        >
                          <LoginMenu onClose={handleCloseMenu} />
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : (
                      <div onClick={() => navigate("/login")}>
                        <FaUser size={20} className="user-icon" />
                      </div>
                    )}
                  </Nav.Link>

                  <Nav.Link
                    onClick={handleNotificationClick}
                    className={`p-1 ms-2 position-relative ${
                      notificationCount > 0 ? "icon-active" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <FaBell size={20} />
                    {notificationCount > 0 && (
                      <span className="notification-badge">
                        {notificationCount}
                      </span>
                    )}
                  </Nav.Link>

                  <Nav.Link
                    onClick={() => handleLinkClick("/gio-hang")}
                    className="p-1 ms-2 position-relative icon-wrapper"
                    style={{ cursor: "pointer" }}
                  >
                    <FaShoppingCart
                      size={20}
                      style={{
                        color: totalItemsInCart > 0 ? "#ff69b4" : "#575757",
                      }}
                    />
                    {isLoggedIn && totalItemsInCart > 0 && (
                      <span className="cart-badge">{totalItemsInCart}</span>
                    )}
                  </Nav.Link>
                </div>
              </Nav>
            </Col>

            {/* Nút Toggle trên di động */}
            <Col xs={1} className="d-lg-none px-0 text-center">
              <Navbar.Toggle
                aria-controls="navbarSupportedContent"
                className="border-0"
              />
            </Col>

            {/* Phần giữa: Tìm kiếm và Danh mục (di động) */}
            <Col lg={7} xs={12} className="order-last order-lg-0">
              <Navbar.Collapse id="navbarSupportedContent">
                <div className="d-lg-none w-100 mb-3">
                  <Dropdown className="w-100">
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="w-100 text-start"
                    >
                      Danh mục sản phẩm
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      {categories.map((category) => (
                        <Dropdown.Item
                          key={category.path}
                          onClick={() => handleCategoryClick(category.label)}
                        >
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
                <Form
                  className="d-flex w-100 position-relative"
                  onSubmit={handleSearchSubmit}
                  role="search"
                  ref={searchRef}
                >
                  <div className="d-none d-lg-block me-2 p-0">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        style={{ width: "270px" }}
                      >
                        Danh mục sản phẩm
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        style={{ width: "270px", fontSize: "14px" }}
                      >
                        {categories.map((category) => (
                          <Dropdown.Item
                            key={category.path}
                            onClick={() => handleCategoryClick(category.label)}
                          >
                            {category.icon && (
                              <span className="me-3">{category.icon}</span>
                            )}
                            {category.label}
                          </Dropdown.Item>
                        ))}
                        <Dropdown.Divider
                          style={{ margin: "0", padding: "0" }}
                        />
                        <Dropdown.Item
                          onClick={() => handleLinkClick("/products")}
                        >
                          Xem tất cả sản phẩm
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <div
                    className="search-container flex-grow-1"
                    style={{ position: "relative" }}
                    onSubmit={handleSearchSubmit}
                    role="search"
                    ref={searchRef}
                  >
                    <FormControl
                      type="search"
                      placeholder="Tìm theo tên sản phẩm, tiêu đề bài viết..."
                      aria-label="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      ref={searchRef}
                    />
                    <Button
                      variant="danger"
                      type="submit"
                      className="search-button"
                    >
                      <FaSearch />
                    </Button>
                    {showSuggestions && (
                      <div className="suggestions-container">
                        {suggestions.length > 0 ? (
                          suggestions.map((product) => (
                            <div
                              key={product._id}
                              className="suggestion-item"
                              onClick={() => handleSuggestionClick(product._id)}
                            >
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="suggestion-item-img"
                              />
                              {product.name}
                            </div>
                          ))
                        ) : (
                          <div className="suggestion-item text-center">
                            <FaExclamationCircle className="me-1" />
                            Không tìm thấy sản phẩm
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Form>

                {/* Navigation Links dành cho Mobile */}
                <Nav className="flex-column mt-3 d-lg-none">
                  {NavMenu.map((link, index) => (
                    <button
                      key={index}
                      className="btn btn-link text-dark"
                      onClick={() => handleLinkClick(link.path)}
                      style={{ textDecoration: "none" }}
                    >
                      {link.label}
                    </button>
                  ))}
                </Nav>
              </Navbar.Collapse>
            </Col>

            {/* Phần biểu tượng trên Desktop */}
            <Col lg={2} className="d-none d-lg-block notification-modal">
              <Nav className="justify-content-end align-items-end">
                <Nav.Link
                  className="pb-2 me-2 icon_user"
                  style={{ cursor: "pointer" }}
                >
                  {isLoggedIn ? (
                    <Dropdown>
                      <Dropdown.Toggle as={CustomToggle}>
                        <FaUser size={20} className="user-icon logged-in" />
                      </Dropdown.Toggle>
                      <LoginMenu />
                    </Dropdown>
                  ) : (
                    <div onClick={() => navigate("/login")}>
                      <FaUser size={20} className="user-icon" />
                    </div>
                  )}
                </Nav.Link>
                <Nav.Link
                  onClick={handleNotificationClick}
                  className={`me-3 position-relative ${
                    notificationCount > 0 ? "icon-active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <FaBell size={20} />
                  {notificationCount > 0 && (
                    <span className="notification-badge">
                      {notificationCount}
                    </span>
                  )}
                </Nav.Link>
                <Nav.Link
                  onClick={() => handleLinkClick("/gio-hang")}
                  className="position-relative"
                  style={{ cursor: "pointer" }}
                >
                  <FaShoppingCart
                    size={20}
                    style={{
                      color: totalItemsInCart > 0 ? "#ff69b4" : "#575757",
                    }}
                  />
                  {isLoggedIn && totalItemsInCart > 0 && (
                    <span className="cart-badge">{totalItemsInCart}</span>
                  )}
                </Nav.Link>
              </Nav>
            </Col>
          </Row>
        </Container>
      </Navbar>

      {/* Navbar bổ sung dành cho Desktop */}
      <Navbar
        expand="lg"
        className="text-white d-none d-lg-block"
        style={{ background: "#8B4513", padding: "1px" }}
      >
        <Container fluid>
          <Row className="w-100 align-items-center">
            {/* Cột trái: Để trống với kích thước md=3 */}
            <Col md={2}></Col>
            {/* Cột giữa: Hiển thị menu */}
            <Col md={7} className="text-center">
              <Nav className="justify-content-center">
                {NavMenu.map((link, index) => (
                  <Nav.Link
                    key={index}
                    onClick={() => handleLinkClick(link.path)}
                    className="text-white mx-2 nav-link text-uppercase"
                    style={{ cursor: "pointer", display: "inline-block" }}
                  >
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>
            {/* Cột phải: Hiển thị Hệ thống cửa hàng | Hotline */}
            <Col md={3} className="text-end">
              {systemInfo.map((info, idx) => (
                <span key={idx} style={{ marginLeft: idx > 0 ? "10px" : "0" }}>
                  {info.path ? (
                    <span
                      onClick={() => navigate(info.path)}
                      style={{
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {info.icon} &nbsp; {info.text}
                    </span>
                  ) : (
                    <span
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      {info.icon} &nbsp; {info.text}
                    </span>
                  )}
                  {idx < systemInfo.length - 1 && <span> | </span>}
                </span>
              ))}
            </Col>
          </Row>
        </Container>
      </Navbar>

      {/* Modal thông báo */}
      <NotificationModal
        show={showNotificationModal}
        handleClose={() => setShowNotificationModal(false)}
      />
    </>
  );
};

export default MyNavbar;
