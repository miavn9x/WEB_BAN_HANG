import React, { useEffect, useState, useRef, useCallback } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";
import ProductItem from "../Product/ProductItem";
import axios from "axios";

const HomeProduct = () => {
  const COUNTDOWN_DURATION = "10s"; // Thời gian chính
  const COUNTDOWN_RESET = "5s"; // Thời gian reset

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [currentPhase, setCurrentPhase] = useState("main");
  const [timeOffset, setTimeOffset] = useState(0); // Hiệu số: serverTime - localTime

  // useRef để lưu targetTime và phase mà không cần re-render
  const targetTimeRef = useRef(0);
  const phaseRef = useRef("main");

  const parseDurationToMs = (duration) => {
    const unit = duration.slice(-1);
    const value = parseInt(duration);
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

  // Lấy thời gian hiện tại từ server và tính offset giữa server và client
  const fetchServerTime = useCallback(async () => {
    try {
      const response = await axios.get("/api/time"); // Endpoint trả về { serverTime: <timestamp in ms> }
      const serverTime = response.data.serverTime;
      const localTime = new Date().getTime();
      const offset = serverTime - localTime;
      setTimeOffset(offset);
    } catch (error) {
      console.error("Error fetching server time:", error);
    }
  }, []);

  // Lấy offset từ server một lần khi component mount
  useEffect(() => {
    fetchServerTime();
  }, [fetchServerTime]);

  // Sử dụng useCallback để định nghĩa getCurrentTime dựa trên timeOffset
  const getCurrentTime = useCallback(
    () => new Date().getTime() + timeOffset,
    [timeOffset]
  );

  useEffect(() => {
    const initializeCountdown = () => {
      const savedData = localStorage.getItem("countdownData");
      const now = getCurrentTime();

      if (savedData) {
        const { targetTime, phase } = JSON.parse(savedData);
        if (targetTime > now) {
          targetTimeRef.current = targetTime;
          phaseRef.current = phase;
          return;
        }
      }

      const initialDuration = parseDurationToMs(COUNTDOWN_DURATION);
      targetTimeRef.current = now + initialDuration;
      phaseRef.current = "main";

      localStorage.setItem(
        "countdownData",
        JSON.stringify({
          targetTime: targetTimeRef.current,
          phase: phaseRef.current,
        })
      );
    };

    let interval;
    initializeCountdown();
    setCurrentPhase(phaseRef.current);

    const updateCountdown = () => {
      const now = getCurrentTime();
      const remainingTime = targetTimeRef.current - now;

      if (remainingTime <= 0) {
        const nextPhase = phaseRef.current === "main" ? "reset" : "main";
        const nextDuration =
          nextPhase === "main"
            ? parseDurationToMs(COUNTDOWN_DURATION)
            : parseDurationToMs(COUNTDOWN_RESET);

        targetTimeRef.current = now + nextDuration;
        phaseRef.current = nextPhase;

        localStorage.setItem(
          "countdownData",
          JSON.stringify({
            targetTime: targetTimeRef.current,
            phase: phaseRef.current,
          })
        );

        setCurrentPhase(nextPhase);

        if (nextPhase === "main") {
          fetchDiscountedProducts();
        } else {
          setDiscountedProducts([]);
        }
      }

      const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      const remainingSeconds = Math.floor((remainingTime / 1000) % 60);

      setHours(Math.max(0, remainingHours));
      setMinutes(Math.max(0, remainingMinutes));
      setSeconds(Math.max(0, remainingSeconds));
    };

    interval = setInterval(updateCountdown, 1000);
    if (phaseRef.current === "main") fetchDiscountedProducts();

    return () => clearInterval(interval);
  }, [
    COUNTDOWN_DURATION,
    COUNTDOWN_RESET,
    fetchDiscountedProducts,
    getCurrentTime,
  ]);

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
          <button className="btn btn-lg btn-primary">
            Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeProduct;
