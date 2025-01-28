import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Test.css"; // Add this line for custom CSS
import Slider from "react-slick";
import InnerImageZoom from "react-inner-image-zoom";

const Test = (props) => {
  const [showMore, setShowMore] = useState(false); // State to toggle description
  const zoomSliderBig = useRef();
  var settings = {
    dots: false,
    infinite: false,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const zoomSlider = useRef();
  var settings1 = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    false: false,
    arrows: true,
  };

  const goTo = (index) => {
    zoomSlider.current.slickGoTo(index);
    zoomSliderBig.current.slickGoTo(index);
  };
  return (
    <div className="container mt-4">
      <div className="row">
        {/* Main Product Details */}
        <div className="col-lg-9 col-md-8">
          <div className="card mb-4">
            <div className="card-body ">
              <div className="row product__modal__content">
                {/* Product Image */}
                <div className="col-lg-5 col-md-12 col-12 mb-3 mb-md-0">
                  <div className="product__modal__zoom position-relative">
                    <div className="badge badge-primary bg-primary">20%</div>
                    <Slider
                      {...settings}
                      className="zoomSliderBig"
                      ref={zoomSliderBig}
                    >
                      <div className="item">
                        <InnerImageZoom
                          zoomType="hover"
                          zoomScale={1}
                          src={`https://cdnv2.tgdd.vn/bhx-static/bhx/Products/Images/3357/332549/bhx/bs9a9244-1_202412100924093485.jpg`}
                        />
                      </div>
                      <div className="item">
                        <InnerImageZoom
                          zoomType="hover"
                          zoomScale={1}
                          src={`https://cdnv2.tgdd.vn/bhx-static/bhx/Products/Images/3357/332549/bhx/bs9a9251-1_202412100924084560.jpg`}
                        />
                      </div>
                      <div className="item">
                        <InnerImageZoom
                          zoomType="hover"
                          zoomScale={1}
                          src={`https://cdnv2.tgdd.vn/bhx-static/bhx/Products/Images/3357/332549/bhx/bs9a9247-1_202412100924089042.jpg`}
                        />
                      </div>
                    </Slider>
                  </div>
                  {/* Thumbnails */}
                  <div className="thumbnail-container ">
                    <Slider
                      {...settings1}
                      className="zoomSlider"
                      ref={zoomSlider}
                    >
                      <div className="item">
                        <img
                          src={`https://cdnv2.tgdd.vn/bhx-static/bhx/Products/Images/3357/332549/bhx/bs9a9244-1_202412100924093485.jpg`}
                          className="w-100"
                          alt="zoom"
                          onClick={() => goTo(0)}
                        />
                      </div>
                      <div className="item">
                        <img
                          src={`https://cdnv2.tgdd.vn/bhx-static/bhx/Products/Images/3357/332549/bhx/bs9a9251-1_202412100924084560.jpg`}
                          className="w-100"
                          onClick={() => goTo(1)}
                          alt="zoom"
                        />
                      </div>
                      <div className="item">
                        <img
                          src={`https://cdnv2.tgdd.vn/bhx-static/bhx/Products/Images/3357/332549/bhx/bs9a9247-1_202412100924089042.jpg`}
                          className="w-100"
                          alt="zoom"
                          onClick={() => goTo(2)}
                        />
                      </div>
                    </Slider>
                  </div>
                </div>

                {/* Product Details */}
                <div className="col-lg-7 col-md-12 d-flex flex-column product_name">
                  <h1 className="product-title">
                    Sữa Aptamil Profutura Úc lon bột 900g
                  </h1>
                  <p className="text-muted ">
                    Đánh giá:
                    <i className="fas fa-star text-warning"></i>
                    <i className="fas fa-star text-warning"></i>
                    <i className="fas fa-star text-warning"></i>
                    <i className="fas fa-star text-warning"></i>
                    <i className="fas fa-star-half-alt text-warning"></i> | 100
                    đánh giá
                  </p>

                  <span
                    className="text-muted"
                    style={{ fontSize: "14px", height: "140px", overflow: "hidden" }}
                  ></span>

                  <div className="product__price w-100">
                    <div className="quantity-wrapper mb-2">
                      <div className="d-flex align-items-center">
                        <label htmlFor="quantity" className="me-2">
                          Số lượng:
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          className="form-control w-25"
                          defaultValue={1}
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Giá */}
                    <div className="price-wrapper">
                      <div className="d-flex mx-5 justify-content-center ">
                        <p className="price me-5 text-muted mb-0">
                          <del>1,000,00000đ</del>
                        </p>
                        <p className="price text-danger mb-0 fs-3">750,000đ</p>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-danger btn-lg mt-auto mb-3 w-100">
                    MUA NGAY
                  </button>
                  <button className="btn btn-outline-secondary btn-lg w-100">
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="product-description">
            <h2>Mô tả sản phẩm</h2>

            {showMore && (
              <div>
                {/*  description: { type: String, required: true }, // Mô tả chi tiết
                 */}
              </div>
            )}
            <button
              className="btn btn-danger"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-3 col-md-4 mt-4 mt-md-0">
          <div className="sidebar bg-white p-4 rounded shadow">
            <h5 className="fw-bold mb-3">Đang giảm giá</h5>
            <ul className="list-group">
              <li className="list-group-item d-flex align-items-center border-0">
                <img
                  src="https://placehold.co/50x50"
                  alt="Sản phẩm 1"
                  className="rounded"
                />
                <div className="ms-3">
                  <p className="mb-0">Sản phẩm 1</p>
                  <p className="text-danger mb-0">500,000đ</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
