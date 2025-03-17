import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Carousel,
} from "react-bootstrap";
import {
  FaBookOpen,
  FaMoneyBillWave,
  FaBrain,
  FaChild,
  FaPaintBrush,
  FaHistory,
  FaSchool,
  FaLanguage,
  FaShippingFast,
  FaUndo,
  FaHeadset,
  FaBolt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/Carouselandmenu.css";
import HomeProduct from "../header/HomeProduct";
import Salecart from "../Product/Salecart";

// Component danh mục sản phẩm (hỗ trợ menu con)
const CategoryMenu = ({ categories }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  // Xử lý khi click vào danh mục chính (chỉ lọc theo tên danh mục)
  const handleCategoryClick = (categoryName) => {
    navigate(`/products?categoryName=${encodeURIComponent(categoryName)}`);
  };

  const handleSubcategoryClick = (categoryName, subcategory) => {
    navigate(
      `/products?categoryName=${encodeURIComponent(
        categoryName
      )}&generic=${encodeURIComponent(subcategory)}`
    );
  };

  return (
    <Card className="category-list">
      <Card.Header className="text-center pb-1">
        <span className="text-uppercase fw-bold" style={{ fontSize: "16px" }}>
          Danh mục sản phẩm
        </span>
      </Card.Header>
      <ListGroup variant="flush">
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-item position-relative"
            onMouseEnter={() => setActiveCategory(index)}
            onMouseLeave={() => setActiveCategory(null)}
            style={{ cursor: "pointer" }}
          >
            <ListGroup.Item
              onClick={() => handleCategoryClick(category.name)}
              className="d-flex align-items-center"
            >
              {category.icon} <span className="ms-3">{category.name}</span>
            </ListGroup.Item>
            {/* Nếu có danh mục con thì hiển thị menu con */}
            {activeCategory === index && category.subcategories && (
              <div className="subcategory-menu position-absolute">
                {category.subcategories.map((subcategory, subIndex) => (
                  <div
                    key={subIndex}
                    className="subcategory-item"
                    onClick={(e) => {
                      // Ngăn sự kiện click lan lên danh mục cha
                      e.stopPropagation();
                      handleSubcategoryClick(category.name, subcategory);
                    }}
                  >
                    {subcategory}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </ListGroup>
    </Card>
  );
};

// Component InfoCard tái sử dụng
const InfoCard = ({ icon, title, description }) => (
  <Card className="info-item">
    <Card.Body>
      {icon && React.cloneElement(icon, { className: "me-2" })}
      <span>
        {title}
        <br />
        {description}
      </span>
    </Card.Body>
  </Card>
);

const CarouselAndMenu = () => {
 const categories = [
   {
     icon: <FaBookOpen />,
     name: "Văn Học",
     subcategories: [
       "Tiểu Thuyết",
       "Truyện Ngắn - Tản Văn",
       "Light Novel",
       "Ngôn Tình",
       "Tác Phẩm Kinh Điển",
       "Thơ",
     ],
   },
   {
     icon: <FaMoneyBillWave />,
     name: "Kinh Tế",
     subcategories: [
       "Nhân Vật - Bài Học Kinh Doanh",
       "Quản Trị - Lãnh Đạo",
       "Marketing - Bán Hàng",
       "Phân Tích Kinh Tế",
       "Đầu Tư Tài Chính",
       "Khởi Nghiệp",
     ],
   },
   {
     icon: <FaBrain />,
     name: "Tâm Lý - Kỹ Năng Sống",
     subcategories: [
       "Kỹ Năng Sống",
       "Rèn Luyện Nhân Cách",
       "Tâm Lý",
       "Sách Cho Tuổi Mới Lớn",
       "Hôn Nhân - Gia Đình",
       "Sách Self-Help",
     ],
   },
   {
     icon: <FaChild />,
     name: "Nuôi Dạy Con",
     subcategories: [
       "Cẩm Nang Làm Cha Mẹ",
       "Phương Pháp Giáo Dục Trẻ",
       "Phát Triển Trí Tuệ Cho Trẻ",
       "Phát Triển Kỹ Năng Cho Trẻ",
       "Thai Giáo",
       "Sức Khỏe Trẻ Em",
     ],
   },
   {
     icon: <FaPaintBrush />,
     name: "Sách Thiếu Nhi",
     subcategories: [
       "Manga - Comic",
       "Kiến Thức Bách Khoa",
       "Sách Tranh Kỹ Năng Sống",
       "Vừa Học - Vừa Chơi",
       "Truyện Cổ Tích",
       "Truyện Tranh",
     ],
   },
   {
     icon: <FaHistory />,
     name: "Tiểu Sử - Hồi Ký",
     subcategories: [
       "Câu Chuyện Cuộc Đời",
       "Chính Trị",
       "Kinh Tế",
       "Nghệ Thuật - Giải Trí",
       "Tự Truyện",
       "Nhân Vật Lịch Sử",
     ],
   },
   {
     icon: <FaSchool />,
     name: "Giáo Khoa - Tham Khảo",
     subcategories: [
       "Sách Giáo Khoa",
       "Sách Tham Khảo",
       "Luyện Thi THPT Quốc Gia",
       "Mẫu Giáo",
       "Sách Ôn Thi Đại Học",
       "Sách Bài Tập",
     ],
   },
   {
     icon: <FaLanguage />,
     name: "Sách Học Ngoại Ngữ",
     subcategories: [
       "Tiếng Anh",
       "Tiếng Nhật",
       "Tiếng Hoa",
       "Tiếng Hàn",
       "Tiếng Pháp",
       "Tiếng Đức",
     ],
   },
 ];
  return (
    <>
      <Container fluid className="mt-3 container_custom">
        <Row>
          {/* Sidebar danh mục (chỉ hiển thị ở màn hình lớn) */}
          <Col xs={12} lg={2} className="d-none d-lg-block">
            <CategoryMenu categories={categories} />
          </Col>

          {/* Nội dung chính */}
          <Col xs={12} lg={10}>
            <Carousel
              id="carouselExampleIndicators"
              className="carousel-custom"
            >
              <Carousel.Item>
                <img
                  src="https://cdn1.fahasa.com/media/magentothem/banner7/Mainbanner_1503_840x320.png"
                  className="d-block w-100"
                  alt="Banner 1"
                />
              </Carousel.Item>
              <Carousel.Item>
                <img
                  src="https://cdn1.fahasa.com/media/magentothem/banner7/MCBooksT3_KC_840x320.png"
                  className="d-block w-100"
                  alt="Banner 2"
                />
              </Carousel.Item>
              <Carousel.Item>
                <img
                  src="https://cdn1.fahasa.com/media/magentothem/banner7/saigonbooks_bac_840x320_1.png"
                  className="d-block w-100"
                  alt="Banner 3"
                />
              </Carousel.Item>
              <Carousel.Item>
                <img
                  src="https://cdn1.fahasa.com/media/magentothem/banner7/hoisacht3_840x320_2.jpg"
                  className="d-block w-100"
                  alt="Banner 4"
                />
              </Carousel.Item>
            </Carousel>

            {/* Info Section */}
            <Row className="info-section mt-4 d-none d-md-flex">
              <Col xs={12} sm={6} md={3} className="mb-4">
                <InfoCard
                  icon={<FaShippingFast />}
                  title="Giao hoả tốc"
                  description="Nội thành TP. HCM trong 4h"
                />
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-4">
                <InfoCard
                  icon={<FaUndo />}
                  title="Đổi trả miễn phí"
                  description="Trong vòng 30 ngày miễn phí"
                />
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-4">
                <InfoCard
                  icon={<FaHeadset />}
                  title="Hỗ trợ 24/7"
                  description="Hỗ trợ khách hàng 24/7"
                />
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-4">
                <InfoCard
                  icon={<FaBolt />}
                  title="Hot bùng nổ"
                  description="Flash sale giảm giá cực sốc"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <Salecart />

      <div >
        <HomeProduct />
      </div>
    </>
  );
};

export default CarouselAndMenu;