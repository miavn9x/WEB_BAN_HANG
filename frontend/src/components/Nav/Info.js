import React from "react";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, ListGroup, Card } from "react-bootstrap";
import "../../styles/Info.css"; // Thêm tệp CSS riêng biệt

const Info = () => {
  const pageTitle = "Giới thiệu về Baby Mart - Cửa hàng mẹ và bé uy tín";
  const pageDescription =
    "Baby Mart là cửa hàng chuyên cung cấp sản phẩm an toàn, chất lượng cao cho mẹ và bé. Sữa, bỉm, đồ chơi giáo dục, chăm sóc sức khỏe - tất cả đều có tại Baby Mart!";
  const pageUrl = "https://babymart.com/gioi-thieu";
  const logoUrl = "https://babymart.com/logo.png"; // Cập nhật link logo thật của bạn

  return (
    <Container className="baby-mart-container my-5">
      {/* 🛠 SEO Optimization */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={logoUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={logoUrl} />
        <meta name="twitter:card" content="summary_large_image" />

        {/* 🔍 Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Baby Mart",
            url: pageUrl,
            logo: logoUrl,
            description: pageDescription,
            address: {
              "@type": "PostalAddress",
              streetAddress: "Số 123, Đường ABC, Quận 1, TP.HCM",
              addressLocality: "Hồ Chí Minh",
              addressCountry: "VN",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+84-99999998",
              contactType: "customer service",
            },
          })}
        </script>
      </Helmet>

      {/* 🏪 Header Section */}
      <header className="text-center mb-5 baby-mart-header">
        <h1 className="display-4 text-primary">Chào mừng đến với Baby Mart</h1>
        <p className="lead text-muted">
          Điểm đến tin cậy cho mẹ và bé - Sản phẩm chất lượng cao, an toàn và
          tiện lợi.
        </p>
      </header>

      {/* 📌 Giới thiệu */}
      <section className="mb-5 baby-mart-about">
        <h2 className="text-center mb-4">Giới thiệu về Baby Mart</h2>
        <p className="text-justify">
          Baby Mart chuyên cung cấp các sản phẩm cao cấp cho mẹ và bé từ sơ sinh
          đến trưởng thành. Tất cả sản phẩm đều được chọn lọc kỹ lưỡng từ các
          thương hiệu uy tín.
        </p>
      </section>

      {/* ⭐ Lý do chọn Baby Mart */}
      <section className="mb-5 baby-mart-reasons">
        <h2 className="text-center mb-4">Lý do chọn Baby Mart</h2>
        <Row>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>✅ Sản phẩm chất lượng:</strong> Được kiểm định nghiêm
                ngặt, an toàn cho bé.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>👩‍⚕️ Đội ngũ tư vấn:</strong> Luôn hỗ trợ cha mẹ chọn sản
                phẩm tốt nhất.
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>🏆 Thương hiệu uy tín:</strong> Hợp tác với nhiều nhãn
                hàng lớn.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>🛍️ Không gian mua sắm thân thiện:</strong> Trải nghiệm
                thoải mái, an toàn.
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </section>

      {/* 🛒 Sản phẩm tại Baby Mart */}
      <section className="mb-5 baby-mart-products">
        <h2 className="text-center mb-4">Sản phẩm tại Baby Mart</h2>
        <Row>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>👶 Đồ dùng sơ sinh:</strong> Bỉm, tã, bình sữa, yếm,
                chăn, áo khoác.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>🌿 Chăm sóc sức khỏe:</strong> Kem dưỡng da, sữa tắm,
                dầu massage.
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>📚 Đồ chơi giáo dục:</strong> Đồ chơi trí tuệ, đồ chơi
                phát triển thể chất.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>🥛 Thực phẩm & sữa:</strong> Sữa bột, thức ăn dặm, thực
                phẩm dinh dưỡng.
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </section>

      {/* 📞 Thông tin liên hệ */}
      <section className="mb-5 baby-mart-contact">
        <h2 className="text-center mb-4">Liên hệ Baby Mart</h2>
        <ListGroup className="text-center">
          <ListGroup.Item>
            <strong>📍 Địa chỉ:</strong>{" "}
            <a href="/shop-map">Xem bản đồ cửa hàng</a>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>📞 Hotline:</strong>{" "}
            <a href="tel:+8499999998">+84-99999998</a>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>📧 Email:</strong>{" "}
            <a href="mailto:support@babymart.com">support@babymart.com</a>
          </ListGroup.Item>
        </ListGroup>
      </section>

      {/* 📌 Footer */}
      <footer className="text-center py-4 baby-mart-footer">
        <Card className="text-muted">
          <Card.Body>
            &copy; 2025 Baby Mart. Tất cả quyền được bảo lưu.
          </Card.Body>
        </Card>
      </footer>
    </Container>
  );
};

export default Info;
