import React from "react";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, ListGroup, Card } from "react-bootstrap";
import "../../styles/Info.css"; // Thêm tệp CSS riêng biệt

const Info = () => {
  const pageTitle = "Giới thiệu về Go Book - Cửa hàng sách uy tín";
  const pageDescription =
    "Go Book là cửa hàng chuyên cung cấp sản phẩm sách chất lượng cao cho độc giả. Sách văn học, kinh tế, tâm lý và nhiều thể loại khác đều có tại Go Book!";
  const pageUrl = "https://gobook.com/gioi-thieu";
  const logoUrl = "https://gobook.com/logo.png"; // Cập nhật link logo thật của bạn

  return (
    <Container className="go-book-container my-5">
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
            name: "Go Book",
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
      <header className="text-center mb-5 go-book-header">
        <h1 className="display-4 text-primary">Chào mừng đến với Go Book</h1>
        <p className="lead text-muted">
          Điểm đến tin cậy cho độc giả - Sách chất lượng cao, đa dạng thể loại.
        </p>
      </header>

      {/* 📌 Giới thiệu */}
      <section className="mb-5 go-book-about">
        <h2 className="text-center mb-4">Giới thiệu về Go Book</h2>
        <p className="text-justify">
          Go Book chuyên cung cấp các sản phẩm sách cao cấp cho độc giả từ nhiều
          thể loại như văn học, kinh tế, tâm lý, kỹ năng sống và nhiều thể loại
          khác. Tất cả sách đều được chọn lọc kỹ lưỡng từ các nhà xuất bản uy
          tín.
        </p>
      </section>

      {/* ⭐ Lý do chọn Go Book */}
      <section className="mb-5 go-book-reasons">
        <h2 className="text-center mb-4">Lý do chọn Go Book</h2>
        <Row>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>✅ Sản phẩm chất lượng:</strong> Sách được biên tập và
                in ấn đạt tiêu chuẩn cao.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>👩‍⚕️ Đội ngũ tư vấn:</strong> Luôn hỗ trợ độc giả chọn lựa
                những tựa sách phù hợp.
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>🏆 Thương hiệu uy tín:</strong> Hợp tác với nhiều nhà
                xuất bản hàng đầu.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>🛍️ Không gian mua sắm thân thiện:</strong> Trải nghiệm
                mua sắm dễ chịu, hiện đại.
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </section>

      {/* 🛒 Sản phẩm tại Go Book */}
      <section className="mb-5 go-book-products">
        <h2 className="text-center mb-4">Sản phẩm tại Go Book</h2>
        <Row>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>📚 Văn học:</strong> Tiểu thuyết, truyện ngắn, thơ, và
                nhiều tác phẩm kinh điển.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>💼 Kinh tế & quản trị:</strong> Sách kinh tế, quản trị,
                marketing và đầu tư.
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>🧠 Tâm lý & kỹ năng sống:</strong> Sách hướng dẫn phát
                triển bản thân, tâm lý, và kỹ năng sống.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>🔖 Sách tham khảo:</strong> Tài liệu học thuật, sách học
                ngoại ngữ và nhiều tựa sách đa dạng.
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </section>

      {/* 📞 Thông tin liên hệ */}
      <section className="mb-5 go-book-contact">
        <h2 className="text-center mb-4">Liên hệ Go Book</h2>
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
            <a href="mailto:support@gobook.com">support@gobook.com</a>
          </ListGroup.Item>
        </ListGroup>
      </section>

      {/* 📌 Footer */}
      <footer className="text-center py-4 go-book-footer">
        <Card className="text-muted">
          <Card.Body>&copy; 2025 Go Book. Tất cả quyền được bảo lưu.</Card.Body>
        </Card>
      </footer>
    </Container>
  );
};

export default Info;
