import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ProductItem from "../Product/ProductItem";
import useRecommendations from "../../hooks/useRecommendations"; // Import hook gợi ý sản phẩm
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./HomeProduct.css";
import { Button } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Autoplay, Pagination } from "swiper/modules";
import { Card, Col, Row, Spinner } from "react-bootstrap";

// Hàm slugify để tạo url thân thiện
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Tách dấu khỏi ký tự
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu kết hợp
    .replace(/đ/g, "d") // Chuyển 'đ' thành 'd'
    .trim()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w-]+/g, "") // Loại bỏ ký tự không hợp lệ
    .replace(/--+/g, "-") // Loại bỏ dấu gạch ngang thừa
    .replace(/^-+/, "") // Loại bỏ dấu gạch ngang ở đầu chuỗi
    .replace(/-+$/, ""); // Loại bỏ dấu gạch ngang ở cuối chuỗi
}

const HomeProduct = () => {
  const navigate = useNavigate();

  // --- PHẦN GỢI Ý SẢN PHẨM ĐỀ XUẤT CHO BẠN ---
  const recommendationsData = useRecommendations();
  const recommendedProducts = recommendationsData?.allProducts || [];

  // --- PHẦN FLASH SALE & ĐỒNG HỒ ĐẾM NGƯỢC ---
  const [timeState, setTimeState] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    currentPhase: "loading",
    targetTime: null,
    serverTimeOffset: 0,
  });
  const [discountedProducts, setDiscountedProducts] = useState([]);

  const fetchDiscountedProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        "/api/products?randomDiscount=true&limit=12"
      );
      const filteredProducts = response.data.products.filter(
        (product) => product.discountPercentage > 14 // % giảm giá tối thiểu
      );
      // Random đơn giản:
      const shuffledProducts = filteredProducts.sort(() => Math.random() - 0.5);
      setDiscountedProducts(shuffledProducts);
    } catch (error) {
      console.error("Error fetching discounted products:", error);
    }
  }, []);

  const fetchTimerState = useCallback(async () => {
    try {
      const response = await axios.get("/api/timer");
      const { currentPhase, targetTime, serverTime } = response.data;
      const localTime = Date.now();
      const serverTimeOffset = serverTime - localTime;
      setTimeState((prev) => ({
        ...prev,
        currentPhase,
        targetTime,
        serverTimeOffset,
      }));
    } catch (error) {
      console.error("Error fetching timer state:", error);
    }
  }, []);

  const updateCountdown = useCallback(() => {
    if (!timeState.targetTime) return;
    const currentTime = Date.now() + timeState.serverTimeOffset;
    const remaining = timeState.targetTime - currentTime;
    if (remaining <= 0) {
      fetchTimerState();
      return;
    }
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    setTimeState((prev) => ({
      ...prev,
      hours,
      minutes,
      seconds,
    }));
  }, [timeState.targetTime, timeState.serverTimeOffset, fetchTimerState]);

  useEffect(() => {
    fetchTimerState();
    const timerInterval = setInterval(updateCountdown, 1000);
    const syncInterval = setInterval(fetchTimerState, 30000);
    return () => {
      clearInterval(timerInterval);
      clearInterval(syncInterval);
    };
  }, [fetchTimerState, updateCountdown]);

  const prevPhase = useRef(timeState.currentPhase);
  useEffect(() => {
    if (timeState.currentPhase === "main" && prevPhase.current !== "main") {
      fetchDiscountedProducts();
    }
    prevPhase.current = timeState.currentPhase;
  }, [timeState.currentPhase, fetchDiscountedProducts]);

  useEffect(() => {
    if (timeState.currentPhase !== "main") {
      setDiscountedProducts([]);
    }
  }, [timeState.currentPhase]);

  const handleViewCategory = (categoryKey, categoryValue) => {
    navigate(`/products?${categoryKey}=${encodeURIComponent(categoryValue)}`, {
      state: { [categoryKey]: categoryValue },
    });
  };

  // --- PHẦN TẢI SẢN PHẨM CHUNG ---
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products?limit=12");
        setProducts(response.data.products);
        setProductsLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setProductsError("Lỗi khi tải sản phẩm.");
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const shuffleArray = (array) => {
    const newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const [threeHourTargetTime, setThreeHourTargetTime] = useState(null);
  const [randomizedCombinedProducts, setRandomizedCombinedProducts] = useState(
    []
  );

  const getCombinedProducts = useCallback(() => {
    return products.filter((product) => {
      if (!product.category || !product.category.name) return false;
      const name = product.category.name.trim().toLowerCase();
      return (
        name === "sữa bột cao cấp".toLowerCase() ||
        name === "sữa dinh dưỡng".toLowerCase()
      );
    });
  }, [products]);

  const fetchThreeHourTimer = useCallback(async () => {
    try {
      const response = await axios.get("/api/timer/three-hour");
      const newTargetTime = response.data.targetTime;
      if (!threeHourTargetTime || newTargetTime !== threeHourTargetTime) {
        setThreeHourTargetTime(newTargetTime);
        const combined = getCombinedProducts();
        if (combined.length > 0) {
          setRandomizedCombinedProducts(shuffleArray(combined));
        }
      }
    } catch (error) {
      console.error("Error fetching three-hour timer:", error);
    }
  }, [threeHourTargetTime, getCombinedProducts]);

  useEffect(() => {
    fetchThreeHourTimer();
    const threeHourInterval = setInterval(fetchThreeHourTimer, 30000);
    return () => clearInterval(threeHourInterval);
  }, [fetchThreeHourTimer]);

  useEffect(() => {
    const combined = getCombinedProducts();
    if (combined.length > 0) {
      setRandomizedCombinedProducts(shuffleArray(combined));
    }
  }, [products, getCombinedProducts]);

  // --- PHẦN TẢI BÀI VIẾT ---
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setPostsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setPostsError("Có lỗi xảy ra khi tải bài viết.");
        setPostsLoading(false);
      });
  }, []);

  const limitedPosts = posts.slice(0, 12);

  const handleClick = () => {
    navigate("/posts-list");
  };

  // --- XỬ LÝ CLICK CHO THƯƠNG HIỆU ---
  const handleBrandClick = (brandName) => {
    const normalizedBrand = brandName.trim().toLowerCase();
    navigate(`/products?brand=${encodeURIComponent(normalizedBrand)}`, {
      state: { brand: normalizedBrand },
    });
  };

  return (
    <>
      <div>
        {/* --- PHẦN FLASH SALE --- */}
        <div className="home__product bg-pink py-5 d-flex justify-content-center">
          <div className="container content__wrapper">
            <div className="row mb-3">
              <div className="col-12 col-md-6 col-lg-4 text-center text-md-start">
                <h4 className="Flash__sale">
                  {timeState.currentPhase === "main"
                    ? " Flash sale mỗi ngày"
                    : "Chuẩn bị đợt sale mới"}
                </h4>
                <p className="lead__sale mx-5">
                  {timeState.currentPhase === "main"
                    ? "Siêu Giảm Giá"
                    : "Đang cập nhật..."}
                </p>
              </div>
              <div className="col-12 col-md-6 col-lg-4 text-center">
                <div className="countdown__home d-flex justify-content-center">
                  <div className="countdown-wrap">
                    <div className="countdown d-flex justify-content-center">
                      <div className="bloc-time hours mx-2">
                        <div className="figure">
                          <span className="top">
                            {String(timeState.hours).padStart(2, "0")[0]}
                          </span>
                          <span className="bottom">
                            {String(timeState.hours).padStart(2, "0")[1]}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="count__title">Giờ</span>
                        </div>
                      </div>
                      <div className="bloc-time min mx-2">
                        <div className="figure">
                          <span className="top">
                            {String(timeState.minutes).padStart(2, "0")[0]}
                          </span>
                          <span className="bottom">
                            {String(timeState.minutes).padStart(2, "0")[1]}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="count__title">Phút</span>
                        </div>
                      </div>
                      <div className="bloc-time sec mx-2">
                        <div className="figure">
                          <span className="top">
                            {String(timeState.seconds).padStart(2, "0")[0]}
                          </span>
                          <span className="bottom">
                            {String(timeState.seconds).padStart(2, "0")[1]}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="count__title">Giây</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              {timeState.currentPhase === "main" ? (
                discountedProducts.length > 0 ? (
                  discountedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="col-6 col-md-3 col-lg-2 py-2 g-2"
                    >
                      <ProductItem product={product} />
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-4">
                    <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <p className="text-muted">Đang tải sản phẩm...</p>
                  </div>
                )
              ) : (
                <div className="col-12 text-center py-4">
                  <div className="timeout-message">
                    <i className="fas fa-clock fa-3x text-danger mb-3"></i>
                    <h5 className="text-danger">HẾT THỜI GIAN KHUYẾN MÃI</h5>
                    <p className="text-muted">
                      Đợt khuyến mãi mới sẽ bắt đầu sau...
                    </p>
                  </div>
                </div>
              )}
            </div>
            {timeState.currentPhase === "main" && (
              <div className="footer text-center mt-4 pt-4">
                <Button
                  className="common-view-all-btn"
                  onClick={() =>
                    navigate("/products", { state: { showDiscount: true } })
                  }
                >
                  Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </div>
            )}
          </div>
        </div>

        {recommendedProducts.length >= 6 && (
          <div
            className="home__product bg-none py-5 d-flex justify-content-center"
            style={{
              backgroundColor: "transparent !important",
              background: "none !important",
            }}
          >
            <div className="container content__wrapper">
              <div className="row mb-3">
                <div className="col-12 text-center text-md-start">
                  <h4 className="Flash__sale fs-5">Sản phẩm đề xuất cho bạn</h4>
                </div>
              </div>
              <div className="row">
                {recommendedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="col-6 col-md-3 col-lg-2 py-2 g-2"
                  >
                    <ProductItem product={product} />
                  </div>
                ))}
              </div>
              <div className="footer text-center mt-4 pt-4">
                <Button
                  className="common-view-all-btn"
                  onClick={() => navigate("/products?recommended=true")}
                >
                  Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- PHẦN SẢN PHẨM THEO DANH MỤC "SỮA" --- */}
        <div className="custom__cat__container py-2 my-2 container">
          <div className="d-flex text-center">
            <div className="container">
              <div className="container" style={{ height: "200px" }}>
                <Swiper
                  direction={"vertical"}
                  pagination={{ clickable: true }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  modules={[Pagination, Autoplay]}
                  className="mySwiper"
                >
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739869250/Neocare_wz0hac.jpg"
                      alt="Brand 1"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739869251/1719561306_ifukka.png"
                      alt="Brand 2"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739869251/section_hot_banner_auqels.webp"
                      alt="Brand 3"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739869250/Neocare_wz0hac.jpg"
                      alt="Brand 4"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739869523/Delimax_vkt3gc.jpg"
                      alt="Brand 5"
                    />
                  </SwiperSlide>
                </Swiper>
              </div>
              <div className="row d-flex">
                <div className="col-lg-6 col-md-12 pt-4 d-flex justify-content-center align-items-center flex-column">
                  <h4
                    className="text-center Flash__sale"
                    style={{ color: "#555", padding: "0px" }}
                  >
                    Các Loại Sữa:&nbsp;{" "}
                    <span className="animated-words mb-2">
                      <span>cho bé 0-6 tháng</span>
                      <span>cho bé 6-12 tháng</span>
                      <span>cho bé 1-3 tuổi</span>
                      <span>Sữa dinh dưỡng</span>
                      <span>cho bé 0-6 tháng</span>
                    </span>
                  </h4>
                </div>

                <div className="col-lg-3 mb-3 col-md-6 pt-4">
                  <Button
                    style={{ color: "#555", fontSize: "13px" }}
                    className="custom-category-button lead__sale px-3"
                    onClick={() =>
                      handleViewCategory("categoryName", "Sữa bột cao cấp")
                    }
                    sx={{
                      border: "1px solid #ccc",
                      borderRadius: "15px",
                      "&:hover": {
                        backgroundColor: "#ffb6c1",
                        borderColor: "#FF6F91",
                      },
                    }}
                  >
                    Sữa bột cao cấp
                  </Button>
                </div>
                <div className="col-lg-3 mb-3 col-md-6 pt-4">
                  <Button
                    style={{ color: "#555", fontSize: "13px" }}
                    className="custom-category-button lead__sale px-3"
                    onClick={() =>
                      handleViewCategory("categoryName", "Sữa dinh dưỡng")
                    }
                    sx={{
                      border: "1px solid #ccc",
                      borderRadius: "15px",
                      "&:hover": {
                        backgroundColor: "#ffb6c1",
                        borderColor: "#FF6F91",
                      },
                    }}
                  >
                    Sữa dinh dưỡng
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Hiển thị sản phẩm đã random theo API /timer/three-hour */}
          {productsLoading ? (
            <div className="custom__cat__loading text-center py-4">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : randomizedCombinedProducts.length > 0 ? (
            <div className="custom__cat__row">
              <div className="custom__cat__banner">
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739557196/banner_coll_1_aoko1r.jpg"
                  alt="Giỏ hàng trống"
                  style={{ width: "100%" }}
                />
              </div>
              {randomizedCombinedProducts.map((product) => (
                <div key={product._id} className="custom__cat__item">
                  <ProductItem product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="custom__cat__empty text-center py-4">
              <p>Không có sản phẩm nào.</p>
            </div>
          )}
        </div>

        {/* --- PHẦN SẢN PHẨM THEO DANH MỤC "Bỉm & tã em bé" --- */}
        <div
          className="custom__cat__container py-2 my-2 container"
          style={{
            backgroundColor: "transparent !important",
            background: "none !important",
          }}
        >
          <div className="container content__wrapper">
            <div className="row mb-3">
              <div className="col-12 text-center text-md-start pt-4">
                <h4 className="Flash__sale fs-5">Bỉm & tã em bé</h4>
              </div>
            </div>
            <div className="row">
              {products.filter((product) => {
                if (!product.category || !product.category.name) return false;
                return (
                  product.category.name.trim().toLowerCase() ===
                  "bỉm & tã em bé".toLowerCase()
                );
              }).length > 0 ? (
                products
                  .filter((product) => {
                    if (!product.category || !product.category.name)
                      return false;
                    return (
                      product.category.name.trim().toLowerCase() ===
                      "bỉm & tã em bé".toLowerCase()
                    );
                  })
                  .map((product) => (
                    <div
                      key={product._id}
                      className="col-6 col-md-3 col-lg-2 py-2 g-2"
                    >
                      <ProductItem product={product} />
                    </div>
                  ))
              ) : (
                <div className="col-12 text-center py-4">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Đang tải sản phẩm...</p>
                </div>
              )}
            </div>
            <div className="footer text-center mt-4 pt-4">
              <Button
                className="common-view-all-btn"
                onClick={() =>
                  navigate("/products?categoryName=Bỉm%20%26%20tã%20em%20bé", {
                    state: { categoryName: "Bỉm & tã em bé" },
                  })
                }
              >
                Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </div>
          </div>

          {/* --- PHẦN THƯƠNG HIỆU NỔI BẬT --- */}
          <div className="container py-4 my-4">
            <div>
              <span className="Flash__sale fs-5 py-2 text__box__border ">
                THƯƠNG HIỆU NỔI BẬT{" "}
              </span>
            </div>
            <br />
            <Swiper
              spaceBetween={10}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              modules={[Pagination, Autoplay]}
              className="mySwiper"
              breakpoints={{
                320: { slidesPerView: 2 },
                480: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 5 },
                1200: { slidesPerView: 6 },
              }}
            >
              <SwiperSlide onClick={() => handleBrandClick("cosmic light")}>
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739172432/brand_1_gp8jdq.webp"
                  alt="Brand 1"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("aptamil")}>
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_6_unpnuu.webp"
                  alt="Brand 6"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("arifood")}>
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175174/brand_2_hayrt8.webp"
                  alt="Brand 2"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("blackmores")}>
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_7_rsbgoe.webp"
                  alt="Brand 7"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("blackmores")}>
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175174/brand_3_vsl8yu.webp"
                  alt="Brand 3"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("hikid")}>
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_8_bfeshq.webp"
                  alt="Brand 8"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("aribaly")}>
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_9_jczh9e.webp"
                  alt="Brand 9"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("Pampers")}>
                <img
                  src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_10_cfzlzm.webp"
                  alt="Brand 10"
                />
              </SwiperSlide>
            </Swiper>
          </div>

          {/* --- PHẦN BÀI VIẾT --- */}
          <div className="quick__post-container">
            <div className="container py-2 ">
              <Row>
                <div className="row mb-3">
                  <span className="Flash__sale mx-2 fs-5">Bài viết</span>
                </div>
                {postsLoading ? (
                  <Col className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Đang tải bài viết...</p>
                  </Col>
                ) : postsError ? (
                  <Col>
                    <p className="error-message">{postsError}</p>
                  </Col>
                ) : limitedPosts.length === 0 ? (
                  <Col>
                    <p>Không có bài viết nào.</p>
                  </Col>
                ) : (
                  limitedPosts.map((post) => (
                    <Col
                      xs={6}
                      sm={4}
                      md={3}
                      lg={3}
                      className="mb-4"
                      key={post._id}
                    >
                      <Link
                        to={`/posts/${slugify(post.title)}-${post._id}`}
                        className="quick__post-link"
                      >
                        <Card className="quick__post-card">
                          {post.imageUrl && (
                            <Card.Img
                              variant="top"
                              src={post.imageUrl}
                              className="quick__post-card-img"
                              loading="lazy"
                            />
                          )}
                          <Card.Body className="quick__post-card-body">
                            <Card.Title className="quick__post-card-title">
                              {post.title}
                            </Card.Title>
                          </Card.Body>
                        </Card>
                      </Link>
                    </Col>
                  ))
                )}
              </Row>
              <div className=" text-center mt-5">
                <Button className="common-view-all-btn" onClick={handleClick}>
                  Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- NEW SECTION: TẤT CẢ SẢN PHẨM --- */}
        <div className="products__container my-4">
          {productsLoading && (
            <div className="loading-container text-center">
              <Spinner
                animation="border"
                variant="success"
                className="loading-spinner"
              />
              <div>Đang tải sản phẩm...</div>
            </div>
          )}

          {productsError && (
            <div className="error-message">{productsError}</div>
          )}

          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))
          ) : !productsLoading && !productsError ? (
            <div className="text-center">Không có sản phẩm nào</div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default HomeProduct;
