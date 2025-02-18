import React, { useEffect, useRef, useState, useMemo } from "react";
import debounce from "lodash.debounce";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Slider from "react-slick";
import InnerImageZoom from "react-inner-image-zoom";
import QuantityBox from "./QuantityBox";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { formatter } from "../../utils/fomater";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/actions/cartActions";
import "../../styles/ProductModals.css";
import { Helmet } from "react-helmet";
import RatingDisplay from "./RatingDisplay";

// Hàm chuyển đổi tên sản phẩm thành slug chuyên nghiệp
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

const ProductModals = () => {
  // Lấy slug từ URL: định nghĩa route là /product/:slug
  const { slug } = useParams();
  const navigate = useNavigate();

  // Tách productId từ slug (chuỗi sau dấu gạch ngang cuối cùng)
  const productIdFromSlug = slug.substring(slug.lastIndexOf("-") + 1);

  const [product, setProduct] = useState(null);
  const [postContent, setPostContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const [filter, setFilter] = useState("latest");

  const dispatch = useDispatch();
  const zoomSliderBig = useRef();
  const zoomSlider = useRef();

  const cartItems = useSelector((state) => state.cart.items);
  const isProductInCart = product
    ? cartItems.some((item) => item.product._id === product._id)
    : false;

  // Fetch thông tin sản phẩm và danh sách sản phẩm giảm giá khi URL thay đổi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy chi tiết sản phẩm theo productId (từ slug)
        const productResponse = await axios.get(
          `/api/products/${productIdFromSlug}`
        );
        // Giả sử backend trả về { product: { ... } }
        setProduct(productResponse.data.product);

        // Lấy danh sách sản phẩm giảm giá
        const discountedResponse = await axios.get(
          "/api/products?randomDiscount=true&limit=16"
        );
        const validDiscountProducts = discountedResponse.data.products.filter(
          (prod) => prod.discountPercentage > 1
        );
        setDiscountedProducts(validDiscountProducts);

        setError(null);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (productIdFromSlug) {
      fetchData();
    }
  }, [productIdFromSlug]);

  // Fetch nội dung bài viết (nếu có) sau khi sản phẩm được load
  useEffect(() => {
    const fetchPostContent = async () => {
      if (!product) return;
      try {
        const response = await axios.get(`/api/posts/product/${product._id}`);
        if (response.data.posts && response.data.posts.length > 0) {
          setPostContent(response.data.posts[0]);
        } else {
          setPostContent(null);
        }
      } catch (err) {
        console.error("Error fetching post content:", err);
        setPostContent(null);
      }
    };

    fetchPostContent();
  }, [product]);

  // Sử dụng debounce để hạn chế gọi API lưu lịch sử xem quá nhiều lần
  const saveViewHistory = useMemo(
    () =>
      debounce(async (productId) => {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const res = await axios.post(
              "/api/view-history",
              { product: productId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Lịch sử xem được lưu:", res.data);
          } catch (err) {
            console.error("Lỗi khi lưu lịch sử xem:", err);
          }
        }
      }, 500),
    []
  );

  useEffect(() => {
    if (product && product._id) {
      saveViewHistory(product._id);
    }
    return () => {
      saveViewHistory.cancel();
    };
  }, [product, saveViewHistory]);

  // Cấu hình slider cho hình ảnh chính và thumbnails
const settingsMain = {
  dots: false,
  infinite: false,
  speed: 700,
  slidesToShow: 1,
  slidesToScroll: 1,
  initialSlide: 0, // Thêm dòng này để tránh nhảy trang
};

  const settingsThumb = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
  };

  const goTo = (index) => {
    if (zoomSlider.current && zoomSliderBig.current) {
      zoomSlider.current.slickGoTo(index);
      zoomSliderBig.current.slickGoTo(index);
    }
  };

  // Xử lý thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
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
    try {
      await dispatch(addToCart(product, Number(quantity)));
      setCartMessage("Đã thêm sản phẩm vào giỏ hàng!");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      setCartMessage("Có lỗi xảy ra khi thêm vào giỏ hàng!");
      setTimeout(() => setCartMessage(""), 3000);
    }
  };

  // Xử lý chức năng mua ngay
  const handleBuyNow = async () => {
    if (!isProductInCart) {
      if (quantity > product.remainingStock) {
        setCartMessage("Số lượng mặt hàng không đủ!");
        setTimeout(() => setCartMessage(""), 3000);
        return;
      }
      try {
        await dispatch(addToCart(product, Number(quantity)));
      } catch (error) {
        console.error("Lỗi khi mua ngay:", error);
        setCartMessage("Có lỗi xảy ra khi xử lý đơn hàng!");
        setTimeout(() => setCartMessage(""), 3000);
        return;
      }
    }
    window.location.href = "/gio-hang";
  };

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

  // Thiết lập meta SEO dựa trên thông tin sản phẩm
  const productUrl = window.location.href;
  const productTitle = product.name;
  const productDescription = product.description
    ? product.description.substring(0, 150) + "..."
    : "Thông tin sản phẩm của BabyMart.vn";
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/default-image.jpg";

  return (
    <>
      <Helmet>
        <title>{`${productTitle} - BabyMart.vn`}</title>
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
          {/* Phần chi tiết sản phẩm chính */}
          <div className="col-lg-9 col-md-8">
            <div className="card mb-4" style={{ maxHeight: "100%" }}>
              <div className="card-body">
                <div className="row product__modal__content">
                  {/* Hình ảnh sản phẩm và thumbnails */}
                  <div className="col-lg-5 col-md-12 col-12 mb-3 mb-md-0">
                    <div className="product__modal__zoom position-relative">
                      {product.discountPercentage > 0 && (
                        <div
                          className="badge badge-primary product__discount"
                          style={{ fontSize: "12px", padding: "8px 5px" }}
                        >
                          - {product.discountPercentage} %
                        </div>
                      )}
                      <Slider
                        {...settingsMain}
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
                    <div className="thumbnail-container">
                      <Slider
                        {...settingsThumb}
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

                  {/* Thông tin sản phẩm */}
                  <div className="col-lg-7 col-md-12 d-flex flex-column product_name">
                    <p
                      className="product-title fs-5"
                      style={{ color: "#333333" }}
                      onClick={() =>
                        navigate(
                          `/product/${slugify(product.name)}-${product._id}`
                        )
                      }
                    >
                      {product.name}
                    </p>
                    <div className="d-flex align-items-center pt-2">
                      <label className="me-2">Tên Thương Hiệu:</label>
                      <span>{product.brand}</span>
                    </div>
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
                    <div className="product_price w-100">
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
                        <div className="d-flex align-items-center justify-content-center">
                          <label className="me-2">Số lượng:</label>
                          <QuantityBox
                            maxQuantity={product.remainingStock}
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
                          <span className="price text-danger mb-0 fs-5">
                            {formatter(product.priceAfterDiscount)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      style={{ padding: "5px" }}
                      className={`btn btn-lg mb-2 w-50 ${
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
                      onClick={handleBuyNow}
                    >
                      MUA NGAY
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hiển thị đánh giá & trò chuyện sản phẩm */}
            <RatingDisplay
              product={product}
              filter={filter}
              setFilter={setFilter}
            />
          

            {/* Render Evaluate, truyền _id sản phẩm đã load từ backend */}
      

            {/* Phần mô tả sản phẩm (nội dung bài viết nếu có) */}
            <div className="product-description">
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
                <p></p>
              )}
            </div>
          </div>

          {/* Sidebar: Danh sách sản phẩm đang giảm giá */}
          <div className="col-lg-3 col-md-4 mt-4 mt-md-0">
            <div className="sidebar bg-white p-4 rounded shadow">
              <h5 className="text-center mb-3" style={{ color: "#339" }}>
                Đang giảm giá
              </h5>
              <ul className="list-group">
                {discountedProducts.length > 0 ? (
                  discountedProducts.map((prod) => (
                    <li
                      key={prod._id}
                      className="list-group-item d-flex align-items-center border-0"
                    >
                      <Link
                        to={`/product/${slugify(prod.name)}-${prod._id}`}
                        className="d-flex align-items-center text-decoration-none w-100"
                      >
                        <img
                          src={prod.images[0] || "https://placehold.co/50x50"}
                          alt={prod.name}
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
                            {prod.name}
                          </span>
                          <p className="text-danger mb-0">
                            {formatter(prod.priceAfterDiscount)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))
                ) : (
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

export default ProductModals;
