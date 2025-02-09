import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductItem from "../Product/ProductItem";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css"; // file CSS chính (sẽ bao gồm cả custom CSS ở dưới)

const HomeProduct = () => {
  // --- Phần bộ đếm và flash sale (không thay đổi) ---
  const [timeState, setTimeState] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    currentPhase: "loading",
    targetTime: null,
    serverTimeOffset: 0,
  });
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const navigate = useNavigate();

  const fetchDiscountedProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        "/api/products?randomDiscount=true&limit=12"
      );
      const filteredProducts = response.data.products.filter(
        (product) => product.discountPercentage > 6 // % giảm giá
      );
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

  const handleViewAll = () => {
    navigate("/products", { state: { showDiscount: true } });
  };
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

  

  return (
    <>
      {/* Phần Flash sale – không thay đổi */}
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
                  ? "Giảm giá cực sốc"
                  : "Đang cập nhật..."}
              </p>
            </div>
            <div className="col-12 col-md-6 col-lg-4 text-center">
              <div className="countdown__home d-flex justify-content-center">
                <div className="countdown-wrap">
                  <div className="countdown d-flex justify-content-center">
                    <div className="bloc-time hours mx-3">
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
                    <div className="bloc-time min mx-3">
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
                    <div className="bloc-time sec mx-3">
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
          <div className="row  ">
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
                    Đợt khuyến mãi mới sẽ bắt đầu sau...{" "}
                  </p>
                </div>
              </div>
            )}
          </div>
          {timeState.currentPhase === "main" && (
            <div className="footer text-center mt-4">
              <button className="btn btn-lg" onClick={handleViewAll}>
                Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Phần hiển thị sản phẩm danh mục cải tiến --- */}
      <div className="custom__cat__container py-2 my-4 container">
        {loading ? (
          <div className="custom__cat__loading text-center py-4">
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : products.length > 0 ? (
          (() => {
            const displayedProducts = products.slice(0, 10);
            return (
              <>
                {/* Hàng đầu tiên - chứa banner và sản phẩm */}
                <div className="custom__cat__row">
                  <div className="custom__cat__banner">
                    <img
                      src="https://theme.hstatic.net/200000381339/1001207774/14/cart_empty_background.png?v=164"
                      alt="Giỏ hàng trống"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  {displayedProducts.map((product) => (
                    <div key={product._id} className="custom__cat__item">
                      <ProductItem product={product} />
                    </div>
                  ))}
                </div>
              </>
            );
          })()
        ) : (
          <div className="custom__cat__empty text-center py-4">
            <p>Không có sản phẩm nào.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default HomeProduct;
