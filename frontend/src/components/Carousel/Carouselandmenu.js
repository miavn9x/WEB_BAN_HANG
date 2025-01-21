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
  FaBaby,
  FaBabyCarriage,
  FaBolt,
  FaCapsules,
  FaGlassWhiskey,
  FaHeadset,
  FaHome,
  FaPuzzlePiece,
  FaShippingFast,
  FaTags,
  FaTshirt,
  FaUndo,
  FaUtensils,
} from "react-icons/fa";
import "../../styles/Carouselandmenu.css";

// Component danh mục sản phẩm (có hỗ trợ menu con)
const CategoryMenu = ({ categories }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <Card className="category-list">
      <Card.Header
        className="text-center pb-1 "
        style={{ backgroundColor: "#FFB6C1", color:"#fff" }}>
        <h5 className="text-uppercase">Danh mục sản phẩm</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-item position-relative"
            onMouseEnter={() => setActiveCategory(index)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <ListGroup.Item className="d-flex align-items-center">
              {category.icon} <span className="ms-3">{category.name}</span>
            </ListGroup.Item>
            {/* Hiển thị danh mục con */}
            {activeCategory === index && category.subcategories && (
              <div className="subcategory-menu position-absolute">
                {category.subcategories.map((subcategory, subIndex) => (
                  <div key={subIndex} className="subcategory-item">
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
  <Card className="info-item  ">
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
      icon: <FaBabyCarriage />,
      name: "Sữa bột cao cấp",
      subcategories: [
        "Sữa bột cho bé 0-6 tháng",
        "Sữa bột cho bé 6-12 tháng",
        "Sữa bột cho bé 1-3 tuổi",
        "Sữa bột cho bé 3-5 tuổi",
        "Sữa bột organic",
        "Sữa non tăng đề kháng",
      ],
    },
    {
      icon: <FaGlassWhiskey />,
      name: "Sữa tươi dinh dưỡng",
      subcategories: [
        "Sữa tươi cho mẹ bầu",
        "Sữa tươi tăng canxi cho bà bầu",
        "Sữa tươi cho mẹ sau sinh",
        "Sữa tươi cho bé từ 1 tuổi",
        "Sữa tươi tăng chiều cao cho bé 3-5 tuổi",
      ],
    },
    {
      icon: <FaTags />,
      name: "Bỉm & tã em bé",
      subcategories: [
        "Bỉm sơ sinh (< 5kg)",
        "Bỉm size S (4-8kg)",
        "Bỉm size M (6-11kg)",
        "Bỉm size L (9-14kg)",
        "Bỉm size XL (12-17kg)",
        "Bỉm quần cho bé tập đi",
      ],
    },
    {
      icon: <FaPuzzlePiece />,
      name: "Đồ chơi phát triển",
      subcategories: [
        "Đồ chơi kích thích giác quan 0-12 tháng",
        "Đồ chơi vận động 1-3 tuổi",
        "Đồ chơi thông minh 3-5 tuổi",
        "Đồ chơi STEM",
        "Đồ chơi âm nhạc",
        "Đồ chơi ngoài trời",
      ],
    },
    {
      icon: <FaHome />,
      name: "Chăm sóc mẹ và bé",
      subcategories: [
        "Chăm sóc da bầu (chống rạn)",
        "Dầu massage bầu",
        "Kem dưỡng da cho bé",
        "Dầu tắm gội cho bé",
        "Phấn rôm chống hăm",
        "Nhiệt kế & Máy hút mũi",
      ],
    },
    {
      icon: <FaTshirt />,
      name: "Thời trang mẹ và bé",
      subcategories: [
        "Đồ bầu theo tháng (1-8 tháng)",
        "Váy bầu công sở",
        "Đồ sau sinh",
        "Quần áo sơ sinh (0-12 tháng)",
        "Quần áo bé 1-3 tuổi",
        "Quần áo bé 3-5 tuổi",
      ],
    },
    {
      icon: <FaCapsules />,
      name: "Dinh dưỡng bà bầu",
      subcategories: [
        "Vitamin tổng hợp cho bà bầu",
        "Sắt & Acid folic",
        "DHA cho bà bầu",
        "Canxi cho bà bầu",
        "Vitamin D3K2",
        "Thực phẩm bổ sung cho bà bầu",
      ],
    },
    {
      icon: <FaUtensils />,
      name: "Ăn dặm cho bé",
      subcategories: [
        "Bột ăn dặm 6-8 tháng",
        "Bột ăn dặm 8-12 tháng",
        "Cháo ăn dặm 12-24 tháng",
        "Bánh ăn dặm",
        "Vitamin & Khoáng chất ăn dặm",
        "Dụng cụ ăn dặm",
      ],
    },
    {
      icon: <FaCapsules />,
      name: "Dinh dưỡng cho bé",
      subcategories: [
        "Vitamin tổng hợp cho bé 0-12 tháng",
        "Vitamin cho bé 1-3 tuổi",
        "Vitamin cho bé 3-5 tuổi",
        "Men vi sinh cho bé",
        "Kẽm & Sắt cho bé",
        "DHA cho bé",
      ],
    },
    {
      icon: <FaBaby />,
      name: "Đồ dùng thiết yếu",
      subcategories: [
        "Máy hút sữa & Phụ kiện",
        "Bình sữa & Núm ti",
        "Máy tiệt trùng & Hâm sữa",
        "Nôi & Cũi cho bé",
        "Xe đẩy & Địu",
        "Ghế ăn & Ghế rung",
      ],
    },
  ];

  return (
    <Container className=" mt-1 mt-sm-1 mt-md-1 mt-lg-3 mt-xl-3  container_custom">
      <Row>
        {/* Sidebar */}
        <Col xs={12} lg={3} className="d-none d-lg-block ">
          <CategoryMenu categories={categories} className="" />
        </Col>

        {/* Main Content */}
        <Col xs={12} lg={9}>
          <Carousel id="carouselExampleIndicators" className="carousel-custom">
            <Carousel.Item>
              <img
                src="https://bizweb.dktcdn.net/100/531/894/themes/976680/assets/home_slider_2.jpg"
                className="d-block w-100"
                alt="Banner 1"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                src="https://bizweb.dktcdn.net/100/531/894/themes/976680/assets/home_slider_1.jpg"
                className="d-block w-100"
                alt="Banner 2"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                src="https://cdn1.concung.com/themes/images/2025/01/5/1736149668_image_title_pc.png"
                className="d-block w-100"
                alt="Banner 3"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                src="https://cdn1.concung.com/img/adds/2025/01/1736402117-banner-2400x906-1-.png"
                className="d-block w-100"
                alt="Banner 3"
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
  );
};

export default CarouselAndMenu;
