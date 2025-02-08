import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";
import ProductItem from "../Product/ProductItem"; // Component hiển thị sản phẩm
import axios from "axios"; // Để fetch sản phẩm giảm giá
const HomeProduct = () => {
  const COUNTDOWN_DURATION_HOURS = "p"; // 👈 Thay đổi giá trị ở đây
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [discountedProducts, setDiscountedProducts] = useState([]); // State lưu sản phẩm giảm giá

  // Fetch sản phẩm giảm giá khi component mount
useEffect(() => {
  const fetchDiscountedProducts = async () => {
    try {
      const response = await axios.get(
        "/api/products?randomDiscount=true&limit=10"
      );
      // Lọc các sản phẩm có discountPercentage > 0
      const filteredProducts = response.data.products.filter(
        (product) => product.discountPercentage > 0
      );
      setDiscountedProducts(filteredProducts); // Lưu sản phẩm đã lọc vào state
    } catch (error) {
      console.error("Error fetching discounted products:", error);
    }
  };

  fetchDiscountedProducts();
}, []);


  // Countdown
  useEffect(() => {
    const getCurrentTimeInVN = () => {
      const now = new Date();
      return new Date(now.getTime() + 7 * 60 * 60 * 1000);
    };

    const savedDuration = localStorage.getItem("countdownDuration");
    if (savedDuration !== String(COUNTDOWN_DURATION_HOURS)) {
      localStorage.removeItem("countdown");
      localStorage.setItem("countdownDuration", COUNTDOWN_DURATION_HOURS);
    }

    let targetTime = localStorage.getItem("countdown");

    if (!targetTime) {
      const currentTimeVN = getCurrentTimeInVN();
      targetTime =
        currentTimeVN.getTime() + COUNTDOWN_DURATION_HOURS * 60 * 60 * 1000;
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
  }, [COUNTDOWN_DURATION_HOURS]);

  const formatTime = (time) => String(time).padStart(2, "0");

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
        <div className="row ">
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
