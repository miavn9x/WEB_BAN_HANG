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
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";

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
        (product) => product.discountPercentage > 5 // % giảm giá
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

  // --- Cập nhật hàm lọc sản phẩm theo danh mục ---
  const getCombinedProducts = useCallback(() => {
    return products.filter((product) => {
      if (!product.category || !product.category.name) return false;
      const name = product.category.name.trim().toLowerCase();
      return (
        name === "văn học" ||
        name === "kinh tế" ||
        name === "tâm lý - kỹ năng sống" ||
        name === "nuôi dạy con" ||
        name === "sách thiếu nhi" ||
        name === "tiểu sử - hồi ký" ||
        name === "sách học ngoại ngữ"
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

  // --- PHẦN TẢI BÀI VIẾT ---
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

  if (loading)
    return (
      <div className="loading-container-fluid text-center my-5">
        <Spinner
          animation="border"
          variant="success"
          className="loading-spinner"
        />
        <div>Đang tải bài viết...</div>
      </div>
    );
  if (error) return <p>{error}</p>;

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
    <Container>
      <div>
        {/* --- PHẦN FLASH SALE --- */}
        <div className="home__product bg-pink py-5 d-flex justify-content-center">
          <div className="container content__wrapper">
            <div className="row mb-3">
              <div className="col-12 col-md-6 col-lg-4 text-center text-md-start">
                <h4 className="Flash__sale">
                  {timeState.currentPhase === "main"
                    ? " Sách hay đang giảm giá"
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
              <div className="footer text-center  mt-4 pt-4">
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
              <div className="responsive-swiper-container">
                <Swiper
                  direction={"vertical"}
                  pagination={{ clickable: true }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  modules={[Pagination, Autoplay]}
                  className="mySwiper"
                >
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742042824/share_fb_home_bpahdp.webp"
                      alt="Brand 1"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742042825/cay-chuoi-non-di-giay-xanh_ovlp2r.png"
                      alt="Brand 2"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742042825/nhom-san-pham--qua-tang-cuoc-song_eedb8e4716cd458e814922e56bebfd89_xiccwp.webp"
                      alt="Brand 3"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742042826/100-dau-sach-noi-1068x559_kedc7x.jpg"
                      alt="Brand 4"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742042825/3_nj1kmq.jpg"
                      alt="Brand 5"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </SwiperSlide>
                </Swiper>
              </div>

              <div className="row  d-flex">
                <div className="col-lg-6 col-md-12 pt-4 d-flex justify-content-center align-items-center flex-column">
                  <h4
                    className="text-center Flash__sale"
                    style={{ color: "#555", padding: "0px" }}
                  >
                    Các Loại Sách:&nbsp;{" "}
                    <span className="animated-words mb-2">
                      <span>Văn Học</span>
                      <span>Kinh Tế</span>
                      <span>Tâm Lý - Kỹ Năng Sống</span>
                      <span>Nuôi Dạy Con</span>
                      <span>Sách Thiếu Nhi</span>
                      <span>Tiểu Sử - Hồi Ký</span>
                      <span>Sách Học Ngoại Ngữ</span>
                    </span>
                  </h4>
                </div>

                <div className="col-lg-3 mb-3 col-md-6 pt-4">
                  <Button
                    style={{ color: "#555", fontSize: "13px" }}
                    className="custom-category-button lead__sale px-3"
                    onClick={() =>
                      handleViewCategory("categoryName", "Văn Học")
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
                    Văn Học
                  </Button>
                </div>
                <div className="col-lg-3 mb-3 col-md-6 pt-4">
                  <Button
                    style={{ color: "#555", fontSize: "13px" }}
                    className="custom-category-button lead__sale px-3"
                    onClick={() =>
                      handleViewCategory("categoryName", "Kinh Tế")
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
                    Kinh Tế
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Hiển thị sản phẩm đã random theo API /timer/three-hour */}
          {loading ? (
            <div className="custom__cat__loading text-center py-4">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : randomizedCombinedProducts.length > 0 ? (
            <div className="custom__cat__row">
              <div className="custom__cat__banner justify-content-center ">
                <img
                  src="https://res.cloudinary.com/dhbyhp8nw/image/upload/v1742044098/MinhLong__310x210_upscayl_4x_digital-art-4x_tkcjvs.png"
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

        {/* --- PHẦN SẢN PHẨM THEO DANH MỤC "Giáo Khoa - Tham Khảo" --- */}
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
                <h4 className="Flash__sale fs-5">Giáo Khoa - Tham Khảo</h4>
              </div>
            </div>
            <div className="row">
              {products.filter((product) => {
                if (!product.category || !product.category.name) return false;
                return (
                  product.category.name.trim().toLowerCase() ===
                  "giáo khoa - tham khảo".toLowerCase()
                );
              }).length > 0 ? (
                products
                  .filter((product) => {
                    if (!product.category || !product.category.name)
                      return false;
                    return (
                      product.category.name.trim().toLowerCase() ===
                      "giáo khoa - tham khảo".toLowerCase()
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
            <div className="footer text-center  mt-4 pt-4">
              <Button
                className="common-view-all-btn"
                onClick={() =>
                  navigate("/products?categoryName=Bỉm%20%26%20tã%20em%20bé", {
                    state: { categoryName: "Giáo Khoa - Tham Khảo" },
                  })
                }
              >
                Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </div>
          </div>

          {/* --- NHÀ PHÂN PHỐI --- */}
          <div className="container py-4  my-4">
            <div>
              <span className="Flash__sale fs-5 py-2 text__box__border ">
                NHÀ PHÂN PHỐI
              </span>
            </div>
            <br />
            <Swiper
              spaceBetween={6}
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
                  src="https://cdn1.fahasa.com/media/wysiwyg/Hien_UI/LogoNCC/NCC_DinhTi_115x115.png"
                  alt="Brand 1"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("aptamil")}>
                <img
                  src="https://cdn1.fahasa.com/media/wysiwyg/Hien_UI/LogoNCC/5_NCC_McBook_115x115.png"
                  alt="Brand 6"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("arifood")}>
                <img
                  src="https://cdn1.fahasa.com/media/wysiwyg/Hien_UI/LogoNCC/NCC_SBooks_115x115.png"
                  alt="Brand 2"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("blackmores")}>
                <img
                  src="https://cdn1.fahasa.com/media/wysiwyg/Hien_UI/LogoNCC/3_NCC_TanViet_115x115.png"
                  alt="Brand 7"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("blackmores")}>
                <img
                  src="https://cdn1.fahasa.com/media/wysiwyg/Hien_UI/LogoNCC/9_NCC_MinhLong_115x115.png"
                  alt="Brand 3"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("hikid")}>
                <img
                  src="https://cdn1.fahasa.com/media/wysiwyg/Hien_UI/LogoNCC/10_NCC_ThaiHa_115x115.png"
                  alt="Brand 8"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("aribaly")}>
                <img
                  src="https://cdn1.fahasa.com/media/wysiwyg/Hien_UI/LogoNCC/7_NCC_SGBook_115x115.png"
                  alt="Brand 9"
                />
              </SwiperSlide>
              <SwiperSlide onClick={() => handleBrandClick("Pampers")}>
                <img
                  src="https://cdn1.fahasa.com/media/wysiwyg/Hien_UI/LogoNCC/8_NCC_ZenBooks_115x115.png"
                  alt="Brand 10"
                />
              </SwiperSlide>
            </Swiper>
          </div>

          {/* --- PHẦN BÀI VIẾT --- */}
          <div className="quick__post-container">
            <div className="container">
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
                      className="mb-3"
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
      </div>
    </Container>
  );
};

export default HomeProduct;
