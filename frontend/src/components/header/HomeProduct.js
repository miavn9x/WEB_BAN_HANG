import React, { useEffect, useState, useCallback } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";
import ProductItem from "../Product/ProductItem";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomeProduct = () => {
  // Nhập: s = giây, m = phút, h = giờ
  const COUNTDOWN_DURATION = "2h"; // Thời gian của phase "main"
  const COUNTDOWN_RESET = "10m"; // Thời gian của phase "reset"

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [currentPhase, setCurrentPhase] = useState("main");
  const [timeOffset, setTimeOffset] = useState(0);
  const [phaseTargetTime, setPhaseTargetTime] = useState(null);
  const parseDurationToMs = (duration) => {
    const unit = duration.slice(-1);
    const value = parseInt(duration, 10);
    const units = {
      d: value * 24 * 60 * 60 * 1000,
      h: value * 60 * 60 * 1000,
      m: value * 60 * 1000,
      s: value * 1000,
    };
    return units[unit] || 0;
  };
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  const fetchDiscountedProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        "/api/products?randomDiscount=true&limit=10"
      );
      const filteredProducts = response.data.products.filter(
        (product) => product.discountPercentage > 0
      );
      const shuffledProducts = shuffleArray(filteredProducts);
      setDiscountedProducts(shuffledProducts);
    } catch (error) {
      console.error("Error fetching discounted products:", error);
    }
  }, []);
  const fetchServerTime = useCallback(async () => {
    try {
      const response = await axios.get("/api/time");
      const serverTime = response.data.serverTime;
      const localTime = new Date().getTime();
      const offset = serverTime - localTime;
      setTimeOffset(offset);
    } catch (error) {
      console.error("Error fetching server time:", error);
    }
  }, []);

  useEffect(() => {
    fetchServerTime();
  }, [fetchServerTime]);
  const getCurrentTime = useCallback(
    () => new Date().getTime() + timeOffset,
    [timeOffset]
  );
  useEffect(() => {
    const now = getCurrentTime();
    const mainDuration = parseDurationToMs(COUNTDOWN_DURATION);

    if (currentPhase === "main") {
      setPhaseTargetTime(now + mainDuration);
    } else {
      setPhaseTargetTime(now + parseDurationToMs(COUNTDOWN_RESET));
    }
  }, [getCurrentTime, currentPhase, COUNTDOWN_DURATION, COUNTDOWN_RESET]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!phaseTargetTime) return;
      const now = getCurrentTime();
      let remainingTime = phaseTargetTime - now;

      if (remainingTime <= 0) {
        if (currentPhase === "main") {
          setCurrentPhase("reset");
          setPhaseTargetTime(now + parseDurationToMs(COUNTDOWN_RESET));
          setDiscountedProducts([]);
        } else {
          setCurrentPhase("main");
          setPhaseTargetTime(now + parseDurationToMs(COUNTDOWN_DURATION));
          fetchDiscountedProducts();
        }
        return;
      }
      const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      const remainingSeconds = Math.floor((remainingTime / 1000) % 60);

      setHours(Math.max(0, remainingHours));
      setMinutes(Math.max(0, remainingMinutes));
      setSeconds(Math.max(0, remainingSeconds));
    }, 1000);

    return () => clearInterval(timer);
  }, [
    phaseTargetTime,
    getCurrentTime,
    currentPhase,
    COUNTDOWN_DURATION,
    COUNTDOWN_RESET,
    fetchDiscountedProducts,
  ]);
  useEffect(() => {
    if (currentPhase === "main") {
      fetchDiscountedProducts();
    }
  }, [currentPhase, fetchDiscountedProducts]);


    const navigate = useNavigate();

    const handleViewAll = () => {
      navigate("/products", { state: { showDiscount: true } });
    };
  return (
    <div className="home__product bg-pink py-5 d-flex justify-content-center">
      <div className="container content__wrapper">
        <div className="row mb-3">
          <div className="col-12 col-md-6 col-lg-4 text-center text-md-start">
            <h4 className="Flash__sale">
              {currentPhase === "main"
                ? "Giá Flash sale mỗi ngày"
                : "Chuẩn bị đợt mới"}
            </h4>
            <p className="lead__sale mx-5">
              {currentPhase === "main"
                ? "Giảm giá cục sốc"
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
                        {String(hours).padStart(2, "0")[0]}
                      </span>
                      <span className="bottom">
                        {String(hours).padStart(2, "0")[1]}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="count__title">Giờ</span>
                    </div>
                  </div>
                  <div className="bloc-time min mx-3">
                    <div className="figure">
                      <span className="top">
                        {String(minutes).padStart(2, "0")[0]}
                      </span>
                      <span className="bottom">
                        {String(minutes).padStart(2, "0")[1]}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="count__title">Phút</span>
                    </div>
                  </div>
                  <div className="bloc-time sec mx-3">
                    <div className="figure">
                      <span className="top">
                        {String(seconds).padStart(2, "0")[0]}
                      </span>
                      <span className="bottom">
                        {String(seconds).padStart(2, "0")[1]}
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
          {currentPhase === "main" ? (
            discountedProducts.length > 0 ? (
              discountedProducts.map((product) => (
                <div key={product._id} className="col-6 col-md-4 col-lg-2 py-2">
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
                <p className="text-muted">Đợt khuyến mãi mới sẽ bắt đầu sau</p>
              </div>
            </div>
          )}
        </div>
        <div className="footer text-center mt-4">
          <button className="btn btn-lg btn-primary" onClick={handleViewAll}>
            Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeProduct;
