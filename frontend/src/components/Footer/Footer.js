import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { IoLogoTiktok } from "react-icons/io5";
import "../../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div
        className="footer-container"
        style={{ background: "#FFB6C1", color: "#323d42", width: "100%" }}
      >
        <div className="container py-4">
          <div className="row">
            {/* Thông tin công ty */}
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
              <div className="logo d-flex align-items-center">
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1737451253/1_vmcjnj.png"
                  alt="Logo của Baby Mart"
                  width="60"
                  height="auto"
                />
                <span className="logo-text ms-2" style={{ fontSize: "16px" }}>
                  <span className="text-danger fw-bold"> Baby </span>

                  <span className=" text-primary fw-bold "> Mart </span>
                </span>
              </div>
              <p className="pt-1">
                Siêu thị Baby Mart <br /> Thương hiệu mẹ và bé uy tín và chất
                lượng, cam kết mang đến trải nghiệm mua sắm tiện lợi, hiện đại
                và phong phú.
              </p>
              <p>Mã số thuế: 12345678999</p>
              <address className="contact-info">
                <p>
                  <i className="fas fa-map-marker-alt"></i> Địa chỉ: 12 Trịnh
                  Đình Thảo, Q. Tân Phú, TP. Hồ Chí Minh
                </p>
                <p>
                  <i className="fas fa-phone"></i> Hotline:
                  <a href="tel:19006750" className=" ms-1">
                    19006750
                  </a>
                </p>
                <p>
                  <i className="fas fa-envelope"></i> Email:
                  <a href="mailto:support.babymart@gmail.com" className=" ms-1">
                    support.babymart@gmail.com
                  </a>
                </p>
              </address>
            </div>

            {/* Hỗ trợ khách hàng và Chính sách */}
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
              <h5>Hỗ trợ khách hàng</h5>
              <nav className="footer-nav">
                <ul className="list-unstyled">
                  <li>
                    <Link to="/tin-khuyen-mai" className="text-decoration-none">
                      Tin Khuyến Mãi
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="http://localhost:3000/posts/67a4709e8cb516e37058c69a"
                      className="text-decoration-none"
                    >
                      Quy định & hình thức thanh toán
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="http://localhost:3000/posts/67a4709e8cb516e37058c69a"
                      className="text-decoration-none"
                    >
                      Bảo hành & Bảo trì
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="http://localhost:3000/posts/67a4709e8cb516e37058c69a"
                      className="text-decoration-none"
                    >
                      Đổi trả & Hoàn tiền
                    </Link>
                  </li>
                </ul>
              </nav>
              <h5 className="mt-3">Chính sách</h5>
              <ul className="list-unstyled ">
                <li>
                  <Link
                    to="http://localhost:3000/posts/67a4709e8cb516e37058c69a"
                    className=" text-decoration-none"
                  >
                    Chính sách đổi trả
                  </Link>
                </li>
                <li>
                  <Link
                    to="http://localhost:3000/posts/67a4709e8cb516e37058c69a"
                    className=" text-decoration-none"
                    
                  >
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link
                    to="http://localhost:3000/posts/67a4709e8cb516e37058c69a"
                    className=" text-decoration-none"
                  >
                    Điều khoản dịch vụ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Tổng đài hỗ trợ và Mạng xã hội */}
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
              <h5>Tổng đài hỗ trợ</h5>
              <p>
                Gọi mua hàng:{" "}
                <a href="tel:19006750" className="text-decoration-none">
                  19006750
                </a>{" "}
                (8h-20h)
              </p>
              <p>
                Gọi bảo hành:{" "}
                <a href="tel:19006750" className="text-decoration-none">
                  19006750
                </a>{" "}
                (8h-20h)
              </p>
              <div className="footer__social mt-3">
                <h5>Theo dõi chúng tôi</h5>
                <ul className="footer__social-icons d-flex list-unstyled">
                  <li>
                    <Link
                      to="https://www.facebook.com/tungmia9x"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <FaFacebookF />
                    </Link>
                  </li>
                  <li>
                    <Link to="/" aria-label="Instagram">
                      <FaInstagram />
                    </Link>
                  </li>
                  <li>
                    <Link to="/" aria-label="Twitter">
                      <FaTwitter />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="https://www.tiktok.com/@miavn9x?is_from_webapp=1&sender_device=pc"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                    >
                      <IoLogoTiktok />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Đăng ký nhận ưu đãi và Phương thức thanh toán */}
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
              <h5>Đăng ký nhận ưu đãi</h5>
              <p>
                Bạn muốn nhận khuyến mãi đặc biệt? Đăng kí tham gia ngay cộng
                đồng hơn 68.000+ người theo dõi để cập nhật khuyến mãi ngay lập
                tức.
              </p>
              <form className="mb-3" action="/subscribe" method="post">
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email của bạn..."
                    aria-label="Email của bạn"
                    required
                  />
                  <button
                    className="btn"
                    type="submit"
                    style={{
                      backgroundColor: "#FF6F91",
                      borderColor: "#FFF",
                      color: "#fff",
                    }}
                  >
                    Đăng ký
                  </button>
                </div>
              </form>
              <h5 className="mt-3">PHƯƠNG THỨC THANH TOÁN</h5>
              <div className="payment-methods">
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1737449082/hinh-thuc-thanh-toan_uzsvsc.png"
                  alt="Các phương thức thanh toán"
                  width="100%"
                  height="auto"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <p className="copyright text-center mb-0">
                © Bản quyền thuộc về Mía VN | Bài thi Design web
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
