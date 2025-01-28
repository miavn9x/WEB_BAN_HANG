import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Test.css"; // Add this line for custom CSS
import Slider from "react-slick";
import InnerImageZoom from "react-inner-image-zoom";
import QuantityBox from "./QuantityBox";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { formatter } from "../../utils/fomater";
import { useDispatch } from "react-redux"; // Import useDispatch
import { addToCart } from "../../redux/actions/cartActions"; // Import addToCart action
import "../../styles/ProductModals.css";

const Test = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1); // State for quantity

  const dispatch = useDispatch(); // Use dispatch to update the Redux store

  const zoomSliderBig = useRef();
  const zoomSlider = useRef();

  // Fetch dữ liệu sản phẩm khi component mount
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data.product);
        setError(null);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    const fetchDiscountedProducts = async () => {
      try {
        const response = await axios.get(
          `/api/products?randomDiscount=true&limit=6`
        );
        setDiscountedProducts(response.data.products);
      } catch (err) {
        console.error("Error fetching discounted products:", err);
      }
    };

    if (id) {
      fetchProductDetails();
    }
    fetchDiscountedProducts();
  }, [id]);

  // Settings cho slider
  const settings = {
    dots: false,
    infinite: false,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const settings1 = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
  };

  const goTo = (index) => {
    zoomSlider.current.slickGoTo(index);
    zoomSliderBig.current.slickGoTo(index);
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="loading-container text-center">
        <Spinner animation="border" variant="primary" />
        <div>Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Kiểm tra nếu không có sản phẩm
  if (!product) {
    return <div>Không tìm thấy sản phẩm</div>;
  }

  // Handle Add to Cart
const handleAddToCart = async () => {
  try {
    // Kiểm tra số lượng có vượt quá số lượng tồn kho hay không
    if (quantity > product.remainingStock) {
      alert("Số lượng vượt quá hàng còn trong kho!");
      return;
    }

    console.log(`Số lượng thêm vào giỏ hàng: ${quantity}`); // Kiểm tra số lượng trong console
    await dispatch(addToCart(product, Number(quantity))); // Gửi số lượng đúng vào giỏ hàng
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
  }
};


  return (
    <div className="container mt-4">
      <div className="row">
        {/* Chi tiết sản phẩm chính */}
        <div className="col-lg-9 col-md-8">
          <div className="card mb-4" style={{ maxHeight: "100%" }}>
            <div className="card-body ">
              <div className="row product__modal__content">
                {/* Hình ảnh sản phẩm */}
                <div className="col-lg-5 col-md-12 col-12 mb-3 mb-md-0">
                  <div className="product__modal__zoom position-relative">
                    {product.discountPercentage && (
                      <div className="badge badge-primary p-2 fs-6 product__discount">
                        {product.discountPercentage}%
                      </div>
                    )}

                    <Slider
                      {...settings}
                      className="zoomSliderBig"
                      ref={zoomSliderBig}
                    >
                      {product.images.map((image, index) => (
                        <div className="item" key={index}>
                          <InnerImageZoom
                            zoomType="hover"
                            zoomScale={1}
                            src={image}
                          />
                        </div>
                      ))}
                    </Slider>
                  </div>
                  {/* Thumbnails */}
                  <div className="thumbnail-container ">
                    <Slider
                      {...settings1}
                      className="zoomSlider"
                      ref={zoomSlider}
                    >
                      {product.images.map((image, index) => (
                        <div className="item" key={index}>
                          <img
                            src={image}
                            className="w-100"
                            alt="zoom"
                            onClick={() => goTo(index)}
                          />
                        </div>
                      ))}
                    </Slider>
                  </div>
                </div>

                {/* Chi tiết sản phẩm */}
                <div className="col-lg-7 col-md-12 d-flex flex-column product_name">
                  <h1 className="product-title">{product.name}</h1>
                  <div className="d-flex align-items-center">
                    <label htmlFor="quantity" className="me-2">
                      Tên Thương Hiệu:
                    </label>
                    <span>{product.brand}</span> {/* Thương hiệu */}
                  </div>

                  <p className="text-muted ">
                    Đánh giá:
                    {[...Array(Math.floor(product.rating))].map((_, i) => (
                      <i key={i} className="fas fa-star text-warning"></i>
                    ))}
                    {product.rating % 1 !== 0 && (
                      <i className="fas fa-star-half-alt text-warning"></i>
                    )}{" "}
                    | {product.reviews.length} đánh giá
                  </p>

                  <div
                    style={{
                      fontSize: "14px",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <p className="text-muted"> Chi Tiết Sản Phẩm: </p>
                    <span>{product.description}</span> {/* Mô tả sản phẩm */}
                  </div>

                  <div className="product__price w-100">
                    <div className="quantity-wrapper mb-2">
                      <div className="d-flex align-items-center">
                        <label htmlFor="quantity" className="me-2">
                          Số lượng:
                        </label>
                        <QuantityBox
                          maxQuantity={product?.remainingStock} // Truyền maxQuantity từ sản phẩm
                          quantity={quantity} // Truyền quantity từ state cha
                          setQuantity={setQuantity} // Cập nhật state của cha
                      
                        />
                        {/* Set quantity handler */}
                      </div>
                    </div>

                    {/* Giá */}
                    <div className="price-wrapper">
                      <div className="d-flex mx-5 justify-content-center ">
                        {product.originalPrice && (
                          <span className="price me-5 text-muted mb-0">
                            <del>{formatter(product.originalPrice)}</del>
                          </span>
                        )}
                        <span className="price text-danger mb-0 fs-3">
                          {formatter(product.priceAfterDiscount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-lg  mb-3 w-100"
                    onClick={handleAddToCart} // Add to Cart click handler
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    className="btn  btn-lg mt-auto w-100"
                    style={{ backgroundColor: "#FF6F91", color: "white" }}
                    // onClick={handleBuyNow}
                  >
                    MUA NGAY
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="product-description">
            <h2>Mô tả sản phẩm</h2>

            {showMore && <div></div>}
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
              {discountedProducts.map((product) => (
                <li
                  key={product._id}
                  className="list-group-item d-flex align-items-center border-0"
                >
                  <Link
                    to={`/product/${product._id}`} // Điều hướng đến trang chi tiết sản phẩm
                    className="d-flex align-items-center text-decoration-none w-100"
                  >
                    <img
                      src={product.images[0] || "https://placehold.co/50x50"}
                      alt={product.name}
                      className="rounded"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="ms-3">
                      <p className="mb-0 text-dark fw-bold">{product.name}</p>
                      <p className="text-danger mb-0">
                        {formatter(product.priceAfterDiscount)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              {discountedProducts.length === 0 && (
                <li className="list-group-item border-0 text-muted">
                  Không có sản phẩm nào đang giảm giá.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
