import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";
import ProductItem from "../Product/ProductItem"; 
import axios from "axios"; 

const HomeProduct = () => {
  // Đặt thời gian theo đơn vị (giờ, phút, giây, ngày)
  const COUNTDOWN_DURATION = "1m"; // Thay đổi giá trị ở đây: "72h", "3d", "120m", "1800s", "5m"
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [discountedProducts, setDiscountedProducts] = useState([]);

  // Fetch sản phẩm giảm giá khi component mount
  const fetchDiscountedProducts = async () => {
    try {
      const response = await axios.get(
        "/api/products?randomDiscount=true&limit=10"
      );
      const filteredProducts = response.data.products.filter(
        (product) => product.discountPercentage > 0
      );
      setDiscountedProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching discounted products:", error);
    }
  };

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);
  const parseCountdownDuration = (duration) => {
    const unit = duration.slice(-1); 
    let timeInMs = 0;

    if (unit === "h") {
      timeInMs = parseInt(duration) * 60 * 60 * 1000;
    } else if (unit === "m") {
      timeInMs = parseInt(duration) * 60 * 1000;
    } else if (unit === "s") {
      timeInMs = parseInt(duration) * 1000;
    } else if (unit === "d") {
      timeInMs = parseInt(duration) * 24 * 60 * 60 * 1000;
    }
    return timeInMs;
  };

  useEffect(() => {
    const getCurrentTimeInVN = () => {
      const now = new Date();
      return new Date(now.getTime() + 7 * 60 * 60 * 1000);
    };

    const savedDuration = localStorage.getItem("countdownDuration");
    if (savedDuration !== COUNTDOWN_DURATION) {
      localStorage.removeItem("countdown");
      localStorage.setItem("countdownDuration", COUNTDOWN_DURATION);
    }

    let targetTime = localStorage.getItem("countdown");

    if (!targetTime) {
      const currentTimeVN = getCurrentTimeInVN();
      targetTime =
        currentTimeVN.getTime() + parseCountdownDuration(COUNTDOWN_DURATION);
      localStorage.setItem("countdown", targetTime);
    } else {
      targetTime = parseInt(targetTime, 10);
    }

    const countdownInterval = setInterval(() => {
      const currentTimeVN = getCurrentTimeInVN().getTime();
      const remainingTime = targetTime - currentTimeVN;

      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        localStorage.removeItem("countdown");
        fetchDiscountedProducts();
        const currentTimeVN = getCurrentTimeInVN();
        targetTime = currentTimeVN.getTime() + parseCountdownDuration("1h");
        localStorage.setItem("countdown", targetTime);

        setTimeout(() => {
          startCountdown(targetTime);
        }, 1000);
      } else {
        const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingTime / (1000 * 60)) % 60);
        const remainingSeconds = Math.floor((remainingTime / 1000) % 60);

        setHours(remainingHours);
        setMinutes(remainingMinutes);
        setSeconds(remainingSeconds);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [COUNTDOWN_DURATION]);

  const formatTime = (time) => String(time).padStart(2, "0");

  // Hàm để bắt đầu lại bộ đếm thời gian
  const startCountdown = (targetTime) => {
    const countdownInterval = setInterval(() => {
      const currentTimeVN = new Date().getTime();
      const remainingTime = targetTime - currentTimeVN;

      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
      }
      const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      const remainingSeconds = Math.floor((remainingTime / 1000) % 60);

      setHours(remainingHours);
      setMinutes(remainingMinutes);
      setSeconds(remainingSeconds);
    }, 1000);
  };

  return (
    <div className="home__product bg-pink py-5 d-flex justify-content-center">
      <div className="container content__wrapper">
        <div className="row mb-3">
          {/* Title - Flash sale */}
          <div className="col-12 col-md-6 col-lg-4 text-center text-md-start">
            <h4 className="Flash__sale">Giá Flash sale mỗi ngày</h4>
            <p className="lead__sale mx-5">Giảm giá cục sốc</p>
          </div>

          {/* Countdown Timer */}
          <div className="col-12 col-md-6 col-lg-4 text-center">
            <div className="countdown__home d-flex justify-content-center">
              <div className="countdown-wrap">
                <div className="countdown d-flex justify-content-center">
                  <div className="bloc-time hours mx-3">
                    <div className="figure">
                      <span className="top">{formatTime(hours)[0]}</span>
                      <span className="bottom">{formatTime(hours)[1]}</span>
                    </div>
                    <div className="mt-2">
                      <span className="count__title">Hours</span>
                    </div>
                  </div>

                  <div className="bloc-time min mx-3">
                    <div className="figure">
                      <span className="top">{formatTime(minutes)[0]}</span>
                      <span className="bottom">{formatTime(minutes)[1]}</span>
                    </div>
                    <div className="mt-2">
                      <span className="count__title">Minutes</span>
                    </div>
                  </div>

                  <div className="bloc-time sec mx-3">
                    <div className="figure">
                      <span className="top">{formatTime(seconds)[0]}</span>
                      <span className="bottom">{formatTime(seconds)[1]}</span>
                    </div>
                    <div className="mt-2">
                      <span className="count__title">Seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product */}
        {/* Hiển thị sản phẩm giảm giá */}
        <div className="row">
          {discountedProducts && discountedProducts.length > 0 ? (
            discountedProducts.map((product) => (
              <div key={product._id} className="col-12 col-md-2 col-lg-2 py-2">
                <ProductItem product={product} />
              </div>
            ))
          ) : (
            <div className="col-12">Không có sản phẩm giảm giá</div>
          )}
        </div>

        <div className="footer text-center mt-4">
          <button className="btn btn-lg">Xem tất cả &gt;</button>
        </div>
      </div>
    </div>
  );
};

export default HomeProduct;
