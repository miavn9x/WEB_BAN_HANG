import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Test.css"; // custom CSS
import Slider from "react-slick";
import InnerImageZoom from "react-inner-image-zoom";
import QuantityBox from "./QuantityBox";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { formatter } from "../../utils/fomater";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/actions/cartActions";
import "../../styles/ProductModals.css";
import { Helmet } from "react-helmet";
import Evaluate from "./Evaluate";

const Test = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null);
  const [postContent, setPostContent] = useState(null); // State lưu bài viết của sản phẩm
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");

  const dispatch = useDispatch();

  const zoomSliderBig = useRef();
  const zoomSlider = useRef();

  const cartItems = useSelector((state) => state.cart.items);

  // Kiểm tra sản phẩm có trong giỏ hàng hay chưa
  const isProductInCart = product
    ? cartItems.some((item) => item.product._id === product._id)
    : false;

  useEffect(() => {
    // Hàm fetch thông tin sản phẩm
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

    // Hàm fetch bài viết liên quan đến sản phẩm
    const fetchPostContent = async (productId) => {
      try {
        const response = await axios.get(`/api/posts/product/${productId}`);
        // Giả sử bạn muốn hiển thị bài viết đầu tiên
        if (response.data.posts && response.data.posts.length > 0) {
          setPostContent(response.data.posts[0]);
        }
      } catch (err) {
        console.error("Error fetching post content:", err);
        // Nếu không tìm thấy bài viết thì có thể để null hoặc thông báo
        setPostContent(null);
      }
    };

    // Hàm fetch sản phẩm giảm giá (nếu có)
    const fetchDiscountedProducts = async () => {
      try {
        const response = await axios.get(
          "/api/products?randomDiscount=true&limit=6"
        );
        setDiscountedProducts(response.data.products);
      } catch (err) {
        console.error("Error fetching discounted products:", err);
      }
    };

    if (id) {
      fetchProductDetails().then(() => {
        // Sau khi lấy thông tin sản phẩm thành công, tiến hành gọi API bài viết
        if (product?._id) {
          fetchPostContent(product._id);
        } else {
          // Trong trường hợp fetchProductDetails chưa cập nhật product, sử dụng id từ URL
          fetchPostContent(id);
        }
      });
      fetchDiscountedProducts();
    }
  }, [id, product?._id]);

  // Cài đặt cho slider hình ảnh chính và thumbnails
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

  // Xử lý loading và lỗi
  if (loading) {
    return (
      <div className="loading-container text-center">
        <Spinner animation="border" variant="primary" />
        <div>Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!product) {
    return <div>Không tìm thấy sản phẩm</div>;
  }

  // Tạo các biến SEO dựa trên thông tin sản phẩm
  const productUrl = window.location.href; // URL hiện tại của sản phẩm
  const productTitle = product.name;
  const productDescription = product.description
    ? product.description.substring(0, 150) + "..."
    : "Thông tin sản phẩm của BabyMart.vn";
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/default-image.jpg";

  // Handle Add to Cart
  const handleAddToCart = async () => {
    try {
      if (isProductInCart) {
        setCartMessage("Sản phẩm đã có trong giỏ hàng!");
        setTimeout(() => setCartMessage(""), 3000);
        return;
      }

      if (quantity > product.remainingStock) {
        setCartMessage("Số lượng vượt quá hàng còn trong kho!");
        setTimeout(() => setCartMessage(""), 3000);
        return;
      }

      await dispatch(addToCart(product, Number(quantity)));
      setCartMessage("Đã thêm sản phẩm vào giỏ hàng!");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      setCartMessage("Có lỗi xảy ra khi thêm vào giỏ hàng!");
      setTimeout(() => setCartMessage(""), 3000);
    }
  };

  return (
    <>
      {/* Thẻ Helmet để tối ưu SEO */}
      <Helmet>
        <title>{productTitle} - BabyMart.vn</title>
        <meta name="description" content={productDescription} />
        <meta property="og:title" content={productTitle} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:image" content={productImage} />
        <meta property="og:url" content={productUrl} />
        <meta name="twitter:title" content={productTitle} />
        <meta name="twitter:description" content={productDescription} />
        <meta name="twitter:image" content={productImage} />
      </Helmet>

      <div className="container mt-4">
        <div className="row">
          {/* Chi tiết sản phẩm chính */}
          <div className="col-lg-9 col-md-8">
            <div className="card mb-4" style={{ maxHeight: "100%" }}>
              <div className="card-body">
                <div className="row product__modal__content">
                  {/* Hình ảnh sản phẩm */}
                  <div className="col-lg-5 col-md-12 col-12 mb-3 mb-md-0">
                    <div className="product__modal__zoom position-relative">
                      {product.discountPercentage && (
                        <div
                          className="badge badge-primary p-2  product__discount "
                          style={{ fontSize: "11px" }}
                        >
                          - {product.discountPercentage}%
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
                    <div className="thumbnail-container">
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
                    <p
                      className="product-title fs-5"
                      style={{ color: "#333333" }}
                    >
                      {product.name}
                    </p>
                    <div className="d-flex align-items-center pt-2">
                      <label htmlFor="quantity" className="me-2 ">
                        Tên Thương Hiệu:
                      </label>
                      <span>{product.brand}</span>
                    </div>

                    <p className="text-muted">
                      Đánh giá:{" "}
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
                      <p className="text-muted">Chi Tiết Sản Phẩm:</p>
                      <span>{product.description}</span>
                    </div>

                    <div className="product__price w-100">
                      {cartMessage && (
                        <div
                          className={`alert ${
                            cartMessage.includes("đã có") ||
                            cartMessage.includes("lỗi")
                              ? "alert-warning"
                              : "alert-success"
                          } mb-3`}
                        >
                          {cartMessage}
                        </div>
                      )}
                      <div className="quantity-wrapper mb-2">
                        <div className="d-flex align-items-center">
                          <label htmlFor="quantity" className="me-2">
                            Số lượng:
                          </label>
                          <QuantityBox
                            maxQuantity={product?.remainingStock}
                            quantity={quantity}
                            setQuantity={setQuantity}
                          />
                        </div>
                      </div>

                      <div className="price-wrapper">
                        <div className="d-flex mx-5 justify-content-center">
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
                      className={`btn btn-lg mb-3 w-50 ${
                        isProductInCart
                          ? "btn-secondary disabled"
                          : "btn-outline-danger"
                      }`}
                      onClick={handleAddToCart}
                      disabled={isProductInCart}
                    >
                      {isProductInCart ? "Đã có trong giỏ" : "Thêm vào giỏ"}
                    </button>
                    <button
                      className="btn btn-lg mt-auto w-50"
                      style={{ backgroundColor: "#FF6F91", color: "white" }}
                    >
                      MUA NGAY
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description – Hiển thị nội dung bài viết nếu có */}
            <div className="product-description">
              {/* <h2>Mô tả sản phẩm</h2> */}
              {postContent ? (
                <div>
                  <h4>{postContent.title}</h4>
                  <div className="post-content-wrapper">
                    <div
                      className={`post-content ${!showMore ? "truncated" : ""}`}
                      dangerouslySetInnerHTML={{ __html: postContent.content }}
                    />
                    <div className="toggle-button-wrapper">
                      <button
                        className="btn btn-danger"
                        onClick={() => setShowMore(!showMore)}
                      >
                        {showMore ? "Thu gọn" : "Xem thêm"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p>{""}</p>
              )}
            </div>
            <div>
              <Evaluate productId={id} />
            </div>
          </div>

          {/* Sidebar – Danh sách sản phẩm giảm giá */}
          <div className="col-lg-3 col-md-4 mt-4 mt-md-0">
            <div className="sidebar bg-white p-4 rounded shadow">
              <h5 className="text-center mb-3" style={{ color: "#339" }}>
                Đang giảm giá
              </h5>
              <ul className="list-group">
                {discountedProducts.map((product) => (
                  <li
                    key={product._id}
                    className="list-group-item d-flex align-items-center border-0"
                  >
                    <Link
                      to={`/product/${product._id}`}
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
                        <span
                          className="mb-0 text-start"
                          style={{ color: "#333333" }}
                        >
                          {product.name}
                        </span>
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
    </>
  );
};

export default Test;
