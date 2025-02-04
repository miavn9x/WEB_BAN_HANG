import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Card,
} from "react-bootstrap";
import "../../styles/Info.css"; // Thêm tệp CSS riêng biệt

const Info = () => {
  return (
    <Container className="baby-mart-container my-5">
      {/* Header Section */}
      <header className="text-center mb-5 baby-mart-header">
        <h1 className="display-4 text-primary">Chào mừng đến với Baby Mart</h1>
        <p className="lead text-muted">
          Điểm đến tin cậy cho mẹ và bé - Sản phẩm chất lượng cao, an toàn và
          tiện lợi.
        </p>
      </header>

      {/* Giới thiệu về Baby Mart */}
      <section className="mb-5 baby-mart-about">
        <h2 className="text-center mb-4">Giới thiệu về Baby Mart</h2>
        <p className="lead text-justify">
          Baby Mart – Điểm đến tin cậy cho mẹ và bé. Chúng tôi tự hào là cửa
          hàng chuyên cung cấp các sản phẩm chất lượng cao, được chọn lọc kỹ
          lưỡng cho mẹ và bé từ sơ sinh đến khi trưởng thành. Từ các sản phẩm
          thiết yếu cho bé như đồ ăn dặm, sữa, bỉm, đồ chơi phát triển trí tuệ,
          đến các sản phẩm chăm sóc sức khỏe như sữa tắm, kem dưỡng da, tất cả
          đều được nhập khẩu từ những thương hiệu uy tín trong và ngoài nước.
        </p>
        <p className="lead text-justify">
          Với sứ mệnh mang lại sự an toàn, tiện lợi và chất lượng tối ưu cho mẹ
          và bé, Baby Mart cam kết đồng hành cùng các bậc phụ huynh trong hành
          trình nuôi dạy con yêu. Chúng tôi không chỉ cung cấp sản phẩm mà còn
          mang đến cho các gia đình những giải pháp chăm sóc toàn diện.
        </p>
      </section>

      {/* Lý do chọn Baby Mart */}
      <section className="mb-5 baby-mart-reasons">
        <h2 className="text-center mb-4">Lý do chọn Baby Mart:</h2>
        <Row>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>Sản phẩm chất lượng:</strong> Tất cả các sản phẩm tại
                Baby Mart đều được lựa chọn và kiểm tra nghiêm ngặt, đảm bảo an
                toàn cho bé và thân thiện với môi trường.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Đội ngũ nhân viên am hiểu:</strong> Nhân viên của chúng
                tôi không chỉ là những người bán hàng, mà là những người bạn
                đồng hành, luôn sẵn sàng tư vấn, hỗ trợ các bậc phụ huynh tìm
                kiếm những sản phẩm phù hợp nhất với nhu cầu và lứa tuổi của
                trẻ.
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>Thương hiệu uy tín:</strong> Chúng tôi hợp tác với những
                thương hiệu nổi tiếng và đảm bảo nguồn gốc xuất xứ rõ ràng, bảo
                vệ sức khỏe và sự phát triển của bé.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Không gian mua sắm thân thiện:</strong> Baby Mart mang
                đến một không gian thoải mái, dễ chịu, giúp các bậc phụ huynh dễ
                dàng lựa chọn sản phẩm trong một môi trường chuyên nghiệp và an
                toàn.
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </section>

      {/* Sản phẩm tại Baby Mart */}
      <section className="mb-5 baby-mart-products">
        <h2 className="text-center mb-4">Sản phẩm đa dạng tại Baby Mart:</h2>
        <Row>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>Đồ dùng cho bé sơ sinh:</strong> Bỉm, tã, bình sữa, núm
                vú, yếm, chăn, áo khoác,...
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Chăm sóc sức khỏe:</strong> Kem dưỡng da, sữa tắm, dầu
                massage, thuốc bổ cho bé.
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6} className="mb-4">
            <ListGroup>
              <ListGroup.Item>
                <strong>Đồ chơi giáo dục:</strong> Sách vải, đồ chơi trí tuệ, đồ
                chơi phát triển thể chất, đồ chơi âm nhạc.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Thực phẩm và sữa:</strong> Sữa bột, thức ăn dặm, thực
                phẩm chức năng bổ sung dinh dưỡng.
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </section>

      {/* Thông tin liên hệ */}
      <section className="mb-5 baby-mart-contact">
        <h2 className="text-center mb-4">Thông tin liên hệ:</h2>
        <ListGroup className="text-center">
          <ListGroup.Item>
            <strong>Địa chỉ:</strong>{" "}
            <a href="/shop-map">Xem bản đồ cửa hàng</a>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Hotline:</strong> [099999998]
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Email:</strong>{" "}
            <a href="mailto:miavn9x@gmail.com">support@babymart.com</a>
          </ListGroup.Item>
        </ListGroup>
      </section>

      {/* Footer Section */}
      <footer className="text-center py-4 baby-mart-footer">
        <Card className="text-muted">
          <Card.Body>
            &copy; 2025 Baby Mart. Tất cả các quyền được bảo lưu.
          </Card.Body>
        </Card>
      </footer>
    </Container>
  );
};

export default Info;
