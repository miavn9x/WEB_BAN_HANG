import React from "react";
import useRecommendations from "../../hooks/useRecommendations";

const RecommendationList = () => {
  const recommendations = useRecommendations();

  return (
    <div>
      <h2>Sản phẩm đề xuất cho bạn</h2>
      <div className="product-list">
        {recommendations.length === 0 ? (
          <p>Không có gợi ý nào</p>
        ) : (
          recommendations.map((product) => (
            <div key={product._id} className="product-card">
              <img src={product.images[0]} alt={product.name} />
              <h3>{product.name}</h3>
              <p>Giá: {product.priceAfterDiscount}₫</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendationList;
