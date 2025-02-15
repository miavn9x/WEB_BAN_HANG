import React, { useEffect, useState } from "react";

const RecommendationTest = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    fetch("http://localhost:5001/api/recommendations", {
      // 📌 Đảm bảo backend đang chạy
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data.recommendations || []);
        setDebugInfo(data.debugInfo || {});
      })
      .catch((err) => console.error("❌ Lỗi khi lấy đề xuất:", err));
  }, []);

  return (
    <div>
      <h2>🛠 Kiểm tra API Đề Xuất Sản Phẩm</h2>

      {/* 🔍 Debugging Thông tin */}
      <div
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      >
        <h3>🧐 Debug Info</h3>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      {/* 📌 Hiển thị danh sách sản phẩm đề xuất */}
      <h3>📌 Sản phẩm đề xuất ({recommendations.length})</h3>
      <div className="product-list">
        {recommendations.length === 0 ? (
          <p>Không có sản phẩm gợi ý.</p>
        ) : (
          recommendations.map((product) => (
            <div key={product._id} className="product-card">
              <img src={product.images[0]} alt={product.name} width={100} />
              <h4>{product.name}</h4>
              <p>Loại: {product.category.generic}</p>
              <p>Giá: {product.priceAfterDiscount}₫</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendationTest;
