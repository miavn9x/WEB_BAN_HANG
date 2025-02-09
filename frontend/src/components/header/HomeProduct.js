import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductItem from "../Product/ProductItem";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css"; // file CSS chính (sẽ bao gồm cả custom CSS ở dưới)
import { Button } from "@mui/material";

const CACHE_KEY = "randomizedCombinedProducts";
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 tiếng (tính bằng milliseconds)

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

  // Hàm fetch sản phẩm khuyến mãi
  const fetchDiscountedProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        "/api/products?randomDiscount=true&limit=12"
      );
      const filteredProducts = response.data.products.filter(
        (product) => product.discountPercentage > 6 // chỉ chọn sản phẩm giảm giá > 6%
      );
      // Sử dụng random cơ bản bằng sort (không hoàn toàn chuẩn)
      const shuffledProducts = filteredProducts.sort(() => Math.random() - 0.5);
      setDiscountedProducts(shuffledProducts);
    } catch (error) {
      console.error("Error fetching discounted products:", error);
    }
  }, []);

  // Hàm fetch trạng thái đồng hồ đếm ngược từ server
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

  // Hàm cập nhật đồng hồ đếm ngược
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

  // Cập nhật đồng hồ đếm ngược và đồng bộ định kỳ
  useEffect(() => {
    fetchTimerState();
    const timerInterval = setInterval(updateCountdown, 1000);
    const syncInterval = setInterval(fetchTimerState, 30000);
    return () => {
      clearInterval(timerInterval);
      clearInterval(syncInterval);
    };
  }, [fetchTimerState, updateCountdown]);

  // Khi phase chuyển sang "main", fetch sản phẩm khuyến mãi
  const prevPhase = useRef(timeState.currentPhase);
  useEffect(() => {
    if (timeState.currentPhase === "main" && prevPhase.current !== "main") {
      fetchDiscountedProducts();
    }
    prevPhase.current = timeState.currentPhase;
  }, [timeState.currentPhase, fetchDiscountedProducts]);

  // Nếu không ở phase "main" thì reset danh sách khuyến mãi
  useEffect(() => {
    if (timeState.currentPhase !== "main") {
      setDiscountedProducts([]);
    }
  }, [timeState.currentPhase]);

  // Hàm điều hướng đến trang danh sách sản phẩm theo danh mục riêng
const handleViewCategory = (categoryKey, categoryValue) => {
  navigate(`/products?${categoryKey}=${encodeURIComponent(categoryValue)}`, {
    state: { [categoryKey]: categoryValue },
  });
};

  // Hàm điều hướng đến trang ProductPage với cả 2 danh mục: Sữa bột cao cấp và Sữa dinh dưỡng
  const handleViewAllCategories = () => {
    navigate(
      `/products?categoryName=${encodeURIComponent(
        "Sữa bột cao cấp"
      )}&generic=${encodeURIComponent("Sữa dinh dưỡng")}`,
      {
        state: {
          categoryName: "Sữa bột cao cấp",
          generic: "Sữa dinh dưỡng",
        },
      }
    );
  };

  // --- Phần tải sản phẩm ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách sản phẩm từ API
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

  // --- Thuật toán Fisher–Yates để đảo trộn mảng ---
  // Mục đích: Đảo trộn thứ tự của các phần tử trong mảng một cách ngẫu nhiên mà không làm thay đổi mảng gốc.
  const shuffleArray = (array) => {
    const newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Hàm lấy thứ tự random từ localStorage hoặc tính mới nếu hết hạn
const getCachedRandomizedProducts = (filteredProducts) => {
  // Tạo key cache dựa trên số lượng sản phẩm (hoặc các thuộc tính khác)
  const dynamicCacheKey = CACHE_KEY + "_" + filteredProducts.length;
  try {
    const cache = localStorage.getItem(dynamicCacheKey);
    if (cache) {
      const { timestamp, data } = JSON.parse(cache);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error("Error reading cache", error);
  }
  const randomized = shuffleArray(filteredProducts);
  try {
    localStorage.setItem(
      dynamicCacheKey,
      JSON.stringify({ timestamp: Date.now(), data: randomized })
    );
  } catch (error) {
    console.error("Error saving to cache", error);
  }
  return randomized;
};


  return (
    <>
      {/* --- Phần Flash sale – không thay đổi --- */}
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
                className="btn btn-lg"
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

      {/* --- Phần hiển thị sản phẩm danh mục cải tiến --- */}
      <div className="custom__cat__container py-2 my-4 container">
        {/* Phần tiêu đề với các nút danh mục */}
        <div className="d-flex text-center">
          <div className="col-4">
            <h4 style={{ color: "#555" }}>Các Loại Sữa</h4>
          </div>
          <div className="col-4">
            <Button
              onClick={() => handleViewCategory("generic", "Sữa bột cao cấp")}
            >
              Sữa bột cao cấp
            </Button>
            <Button
              onClick={() => handleViewCategory("generic", "Sữa dinh dưỡng")}
            >
              Sữa dinh dưỡng
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="custom__cat__loading text-center py-4">
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : products.length > 0 ? (
          (() => {
            // Lọc các sản phẩm có danh mục là "Sữa bột cao cấp" hoặc "Sữa dinh dưỡng"
            const combinedProducts = products.filter((product) => {
              if (!product.category || !product.category.name) return false;
              const name = product.category.name.trim().toLowerCase();
              return (
                name === "sữa bột cao cấp".toLowerCase() ||
                name === "sữa dinh dưỡng".toLowerCase()
              );
            });

            const randomizedCombinedProducts =
              getCachedRandomizedProducts(combinedProducts);
            return (
              <>
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
                  {randomizedCombinedProducts.map((product) => (
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

        {/* Nút "xem thêm" để mở toàn bộ 2 danh mục */}
        <div className="text-center">
          <Button onClick={handleViewAllCategories}>xem thêm</Button>
        </div>
      </div>
    </>
  );
};

export default HomeProduct;
