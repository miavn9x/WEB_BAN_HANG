import React from "react";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../../styles/Salecart.css";

function Salecart() {
  // Dữ liệu cho các coupon
  const coupons = [
    {
      image:
        "https://res.cloudinary.com/div27nz1j/image/upload/v1739776309/coupon_1_img_medium_pmyslz.webp",
      code: "Giảm 25K",
      description: "Tất cả đơn hàng trên 300K",
    },
    {
      image:
        "https://res.cloudinary.com/div27nz1j/image/upload/v1739776309/coupon_1_img_medium_pmyslz.webp",
      code: "Giảm 30K",
      description: "Đơn hàng trên 500K",
    },
    {
      image:
        "https://res.cloudinary.com/div27nz1j/image/upload/v1739776309/coupon_1_img_medium_pmyslz.webp",
      code: "Giảm 70K",
      description: "Đơn hàng trên 1.000.000",
    },
    {
      image:
        "https://storage.googleapis.com/a1aa/image/J7KfN8TvAxO6yP4LVaLq8XWXh5s5RamXA-S86mOlsZ4.jpg",
      code: "FREESHIP",
      description: "Đơn online trên 1.000.000",
    },
  ];

  return (
    <Container className="py-5">
      <Row>
        {coupons.map((coupon, idx) => (
          <Col key={idx} xs={12} sm={6} md={6} lg={3}>
            {/* Áp dụng lớp CSS từ module */}
            <Card className={`${styles.couponCard} mb-4`}>
              {/* Sử dụng flex-row để hình ảnh luôn nằm bên trái */}
              <Card.Body className="d-flex flex-row align-items-center">
                <Image
                  src={coupon.image}
                  alt="Coupon"
                  roundedCircle
                  width={80}
                  height={80}
                  className="mb-0"
                />
                <div className="text-left ms-3">
                  <Card.Title className="text-danger">{coupon.code}</Card.Title>
                  <Card.Text>{coupon.description}</Card.Text>
                  {/* Chỉnh sửa nút "Nhận" luôn căn giữa */}
                  <div className="d-flex justify-content-center mt-3">
                    <Button variant="danger">Nhận</Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Salecart;
