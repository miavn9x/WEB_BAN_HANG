import React from "react";
import useRecommendations from "../../hooks/useRecommendations";

const RecommendationList = () => {
  const recommendationsData = useRecommendations();
  // Giả sử bạn muốn hiển thị mảng tổng hợp allProducts
  const allProducts = recommendationsData.allProducts || [];

  return (
    <div>
      <h2>Sản phẩm đề xuất cho bạn</h2>
      <div className="product-list">
        {allProducts.length === 0 ? (
          <p>Không có gợi ý nào</p>
        ) : (
          allProducts.map((product) => (
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
