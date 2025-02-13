import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ProductItem from "../Product/ProductItem";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./HomeProduct.css";
import { Button } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Autoplay, Pagination } from "swiper/modules";
import { Card, Col, Row } from "react-bootstrap";


const HomeProduct = () => {
  const navigate = useNavigate();

  // --- Phần đồng hồ đếm ngược và flash sale ---
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
        (product) => product.discountPercentage > 6
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

  // --- Phần tải sản phẩm chung ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products?limit=12");
        setProducts(response.data.products);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setLoading(false);
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

  // Gọi API /timer/three-hour ngay khi mount và định kỳ (mỗi 30 giây)
  useEffect(() => {
    fetchThreeHourTimer();
    const threeHourInterval = setInterval(fetchThreeHourTimer, 30000);
    return () => clearInterval(threeHourInterval);
  }, [fetchThreeHourTimer]);

  // Cập nhật randomizedCombinedProducts ngay khi danh sách products thay đổi (nếu cần)
  useEffect(() => {
    const combined = getCombinedProducts();
    if (combined.length > 0) {
      setRandomizedCombinedProducts(shuffleArray(combined));
    }
  }, [products, getCombinedProducts]);

  // --- Phần tải bài viết ---
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setError("Có lỗi xảy ra khi tải bài viết.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p>{error}</p>;

  const limitedPosts = posts.slice(0, 12);

  const handleClick = () => {
    navigate("/PostsList");
  };

  // --- Xử lý click cho thương hiệu ---
  const handleBrandClick = (brandName) => {
    const normalizedBrand = brandName.trim().toLowerCase();
    navigate(`/products?brand=${encodeURIComponent(normalizedBrand)}`, {
      state: { brand: normalizedBrand },
    });
  };

  return (
    <>
      <div>
        {/* --- Phần Flash sale --- */}
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
              <div className="footer text-center mt-4">
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

        {/* --- Phần sản phẩm theo danh mục Sữa --- */}
        <div className="custom__cat__container py-2 my-4 container">
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
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739172432/brand_1_gp8jdq.webp"
                      alt="Brand 1"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_6_unpnuu.webp"
                      alt="Brand 6"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175174/brand_2_hayrt8.webp"
                      alt="Brand 2"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_7_rsbgoe.webp"
                      alt="Brand 7"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175174/brand_3_vsl8yu.webp"
                      alt="Brand 3"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_8_bfeshq.webp"
                      alt="Brand 8"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_9_jczh9e.webp"
                      alt="Brand 9"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/div27nz1j/image/upload/v1739175175/brand_10_cfzlzm.webp"
                      alt="Brand 10"
                    />
                  </SwiperSlide>
                </Swiper>
              </div>
              <div className="row align-items-center text-center d-flex">
                <div className="col-lg-4 col-md-12 mb-3">
                  <h4 className="Flash__sale" style={{ color: "#555" }}>
                    Các Loại Sữa
                  </h4>
                </div>
                <div className="col-lg-4 mb-3 col-md-6">
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
                <div className="col-lg-4 mb-3 col-md-6">
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

          {/* Hiển thị sản phẩm đã random dựa theo API /timer/three-hour */}
          {loading ? (
            <div className="custom__cat__loading text-center py-4">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : randomizedCombinedProducts.length > 0 ? (
            <div className="custom__cat__row">
              <div className="custom__cat__banner">
                <img
                  src="https://theme.hstatic.net/200000381339/1001207774/14/cart_empty_background.png?v=164"
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

        {/* --- Sản phẩm cho danh mục "Bỉm & tã em bé" --- */}
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
            <div className="footer text-center mt-4">
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
        </div>

        {/* --- Phần thương hiệu nổi bật --- */}
        <div className="container py-2 my-4">
          <span className="Flash__sale fs-5">THƯƠNG HIỆU NỔI BẬT </span>
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

        {/* --- Phần bài viết --- */}
        <div className="quick__post-container">
          <div className="container py-2 my-4">
            <Row>
              <div className="row mb-3">
                <span className="Flash__sale mx-2 fs-5">Bài viết</span>
              </div>
              {limitedPosts.length === 0 ? (
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
                      to={`/posts/${post._id}`}
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
            <div className="footer text-center mt-4">
              <Button className="common-view-all-btn" onClick={handleClick}>
                Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeProduct;
