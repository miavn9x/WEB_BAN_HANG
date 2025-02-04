import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const events = [
  {
    img: "https://placehold.co/300x200",
    title: "ĐẠI TIỆC BLACKFRIDAY SHOP KHANG BABY",
    subtitle: "Shop Khang Baby | Th 4 27/11/2024",
    text: "ĐẠI TIỆC BLACK FRIDAY CHÍNH THỨC BẮT ĐẦU! Hứa hẹn mang tới cho ba mẹ nhiều...",
  },
  {
    img: "https://placehold.co/300x200",
    title: "NGÀY HỘI MẸ BẦU 2024 CỦA SHOP KHANG CÓ GÌ",
    subtitle: "Shop Khang Baby | Th 4 6/11/2024",
    text: "SỰ KIỆN NGÀY HỘI MẸ BẦU LỚN NHẤT BẮC GIANG CÓ GÌ? Chỉ có để 'Hành trang đi sinh và thiên chức làm mẹ'...",
  },
  {
    img: "https://placehold.co/300x200",
    title: "Tưng bừng mừng Quốc Khánh - Khang Baby Sale không phanh",
    subtitle: "Shop Khang Baby | Th 7 31/08/2024",
    text: "Chào mừng Quốc Khánh 2/9, Khang Baby hân hạnh mang tới chương trình giảm giá đặc biệt...",
  },
];

const highlights = [
  {
    img: "https://placehold.co/300x200",
    text: "Lịch làm việc của một số đơn vị vận chuyển sẽ có sự thay đổi trong dịp Lễ Quốc Khánh 2/9/2024",
  },
  {
    img: "https://placehold.co/300x200",
    text: "Sữa phát triển trí não toàn diện nhất 2023 hiện nay",
  },
  {
    img: "https://placehold.co/300x200",
    text: "COMBO TRỌN BỘ VITAMIN BẦU CHUẨN ÚC ĐƯỢC CÁC BÀ MẸ TIN DÙNG 2023",
  },
];

// EventCard component
const EventCard = ({ img, title, subtitle, text }) => (
  <Col xs={12} sm={6} md={6} lg={4} className="mb-4">
    <Card>
      <Card.Img variant="top" src={img} />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{subtitle}</Card.Subtitle>
        <Card.Text>{text}</Card.Text>
        <Button variant="primary" href="#">
          Đọc tiếp
        </Button>
      </Card.Body>
    </Card>
  </Col>
);

// SidebarItem component
const SidebarItem = ({ img, text }) => (
  <Col xs={12} sm={6} lg={12} className="mb-4">
    <div className="sidebar-item">
      <img src={img} alt={text} className="img-fluid" />
      <div>{text}</div>
    </div>
  </Col>
);

const EventsPage = () => {
  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h2>Sự kiện</h2>
        </Col>
      </Row>

      <Row>
        <Col xs={12} lg={9}>
          <Row>
            {events.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </Row>
        </Col>

        <Col xs={12} lg={3}>
          <h4>TIN NỔI BẬT</h4>
          <Row>
            {highlights.map((item, index) => (
              <SidebarItem key={index} {...item} />
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default EventsPage;
