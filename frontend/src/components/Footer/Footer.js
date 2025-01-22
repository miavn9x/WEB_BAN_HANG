import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { IoLogoTiktok } from "react-icons/io5";
import "../../styles/Footer.css";

const Footer = () => {
  return (
    <div style={{ background: "#FFB6C1", color: "#323d42", width: "100%" }}>
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
            <div className="logo">
              <img
                src="https://res.cloudinary.com/div27nz1j/image/upload/v1737451253/1_vmcjnj.png"
                alt="Baby Mart Logo"
                width="60"
                height="auto"
              />
              <span className="logo-text">
                <span className="text-danger fw-bold">Baby</span>
                <span className="text-primary fw-bold">Mart</span>
              </span>
            </div>
            <p>
              Siêu thị Baby Mart <br /> Thương hiệu mẹ và bé uy tín và chất
              lượng, cam kết mang đến những trải nghiệm mua sắm tiện lợi, hiện
              đại và phong phú
            </p>
            <p>Mã số thuế: 12345678999</p>
            <div className="contact-info">
              <p>
                <i className="fas fa-map-marker-alt"></i> Địa chỉ: 12 Trịnh Đình Thảo,
                Q. Tân Phú, Ho Chi Minh City
              </p>
              <p>
                <i className="fas fa-phone"></i> Hotline:
                <button className="btn text-primary p-0">19006750</button>
              </p>
              <p>
                <i className="fas fa-envelope"></i> Email:
                <button className="btn text-primary p-0">
                  support@sapo.vn
                </button>
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
            <h5>Hỗ trợ khách hàng</h5>
            <div className="list-unstyled">
              <div className="section-item">Tra cứu hoá đơn</div>
              <div className="section-item">Mua & Giao nhận Online</div>
              <div className="section-item">Tin Khuyến Mãi</div>
              <div className="section-item">
                Qui định & hình thức thanh toán
              </div>
              <div className="section-item">Bảo hành & Bảo trì</div>
              <div className="section-item">Đổi trả & Hoàn tiền</div>
            </div>
            <h5>
              <br />
              Chính sách
            </h5>
            <div className="list-unstyled">
              <div className="btn text-primary p-0">Chính sách đổi trả</div>
              <br />
              <div className="btn text-primary p-0">Chính sách bảo mật</div>
              <br />
              <div className="btn text-primary p-0">Điều khoản dịch vụ</div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
            <h5>Tổng đài hỗ trợ</h5>
            <p>
              Gọi mua hàng:
              <button className="btn text-primary p-0">19006750</button>
              (8h-20h)
            </p>
            <p>
              Gọi bảo hành:
              <button className="btn text-primary p-0">19006750</button>
              (8h-20h)
            </p>
            <div className="footer__social ">
              <h5>Theo dõi chúng tôi</h5>
              <ul className="footer__social-icons ">
                <li>
                  <Link to="https://www.facebook.com/tungmia9x">
                    <FaFacebookF />
                  </Link>
                </li>
                <li>
                  <Link to="/">
                    <FaInstagram />
                  </Link>
                </li>
                <li>
                  <Link to="/">
                    <FaTwitter />
                  </Link>
                </li>
                <li>
                  <Link to="https://www.tiktok.com/@miavn9x?is_from_webapp=1&sender_device=pc">
                    <IoLogoTiktok />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
            <h5>Đăng ký nhận ưu đãi</h5>
            <p>
              Bạn muốn nhận khuyến mãi đặc biệt? Đăng kí tham gia ngay cộng đồng
              hơn 68.000+ người theo dõi của chúng tôi để cập nhật khuyến mãi
              ngay lập tức
            </p>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email của bạn..."
              />
              <button
                className="btn"
                style={{
                  backgroundColor: "#FF6F91",
                  borderColor: "#FFF",
                  color: "#fff",
                }}
              >
                Đăng ký
              </button>
            </div>

            <h5>
              <br />
              PHƯƠNG THỨC THANH TOÁN
            </h5>
            <div className="payment-methods">
              <img
                src="https://res.cloudinary.com/div27nz1j/image/upload/v1737449082/hinh-thuc-thanh-toan_uzsvsc.png"
                alt="Visa Icon"
                width="100%"
                height="auto"
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <p className="copyright text-center">
              © Bản quyền thuộc về Mía VN | Bài thi Design web
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
