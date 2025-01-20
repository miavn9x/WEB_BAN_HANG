import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Carousel,
} from "react-bootstrap";
import { FaBaby, FaBabyCarriage, FaBolt, FaCapsules, FaGlassWhiskey, FaHeadset, FaHome, FaPuzzlePiece, FaShippingFast, FaTags, FaTshirt, FaUndo, FaUtensils } from "react-icons/fa";
import "./style.css"

// Reusable InfoCard Component for info section
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

const ProductLayout = () => {
  const categories = [
    { icon: <FaBabyCarriage />, name: "Sữa bột cao cấp" },
    { icon: <FaGlassWhiskey />, name: "Sữa tươi các loại" },
    { icon: <FaTags />, name: "Bỉm tã khuyến mãi" },
    { icon: <FaUtensils />, name: "Ăn dặm, dinh dưỡng" },
    { icon: <FaCapsules />, name: "Sức khoẻ & Vitamin" },
    { icon: <FaBaby />, name: "Đồ dùng mẹ & bé" },
    { icon: <FaPuzzlePiece />, name: "Đồ chơi, học tập" },
    { icon: <FaHome />, name: "Chăm sóc gia đình" },
    { icon: <FaTshirt />, name: "Thời trang và phụ kiện" },
  ];

  return (
    <Container className="mt-4">
      <Row>
        {/* Left Sidebar */}
        <Col xs={12} md={3}>
          <Card className="category-list">
            <Card.Header>
              <h5>Danh mục sản phẩm</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {categories.map((category, index) => (
                <ListGroup.Item key={index}>
                  {category.icon} {category.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9}>
          <Carousel id="carouselExampleIndicators">
            <Carousel.Item>
              <img
                src="https://placehold.co/800x300?text=Banner+1"
                className="d-block w-100"
                alt="Banner showing a variety of baby products, promoting a 36% discount on selected items until 10/9/2024"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                src="https://placehold.co/800x300?text=Banner+2"
                className="d-block w-100"
                alt="Banner showing a variety of baby products, promoting a 36% discount on selected items until 10/9/2024"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                src="https://placehold.co/800x300?text=Banner+3"
                className="d-block w-100"
                alt="Banner showing a variety of baby products, promoting a 36% discount on selected items until 10/9/2024"
              />
            </Carousel.Item>
          </Carousel>

          <Row className="info-section mt-4 d-flex justify-content-between">
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
                title="Deal hot bùng nổ"
                description="Flash sale giảm giá cực sốc"
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductLayout;
