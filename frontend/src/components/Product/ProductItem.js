import React, { useState } from "react";
import { Rating } from "@mui/material";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaRegHeart, FaCartPlus } from "react-icons/fa"; // Gộp import từ react-icons/fa
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/ProductItem.css";
import ProductModal from "./ProductModals";
import { formatter } from "../../utils/fomater";

const ProductItem = ({ product }) => {
  const [isOpenProductModal, setIsOpenProductModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [notification, setNotification] = useState(""); // Dùng cho thông báo
  const navigate = useNavigate();

  // Mở modal chi tiết sản phẩm
  const viewProductDetail = () => {
    setIsOpenProductModal(true);
  };

  // Đóng modal chi tiết sản phẩm
  const closeProductModal = () => {
    setIsOpenProductModal(false);
  };

  // Thêm sản phẩm vào danh sách yêu thích
  const handleAddToFavorites = async () => {
    const token = localStorage.getItem("token");

    // Kiểm tra nếu người dùng chưa đăng nhập
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "/api/favorites",
        { productId: product._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFavorited(true); // Đánh dấu sản phẩm đã được yêu thích
      setNotification("Sản phẩm đã được thêm vào mục yêu thích.");
      setTimeout(() => setNotification(""), 5000); // Xóa thông báo sau 5 giây
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào yêu thích:", error);
      setNotification(
        "Không thể thêm sản phẩm vào yêu thích. Vui lòng thử lại."
      );
    }
  };

  // Kiểm tra nếu dữ liệu sản phẩm không tồn tại
  if (!product) {
    return <div>Không có dữ liệu sản phẩm.</div>;
  }

  return (
    <div className="product__item">
      {/* Hình ảnh sản phẩm */}
      <div className="product__img" onClick={viewProductDetail}>
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <img
            src="https://via.placeholder.com/150"
            alt="Hình ảnh không khả dụng"
          />
        )}

        {/* Các nút hành động */}
        <div className="action">
          <button className="action__btn" title="Xem chi tiết">
            <MdOutlineZoomOutMap />
          </button>
          <button
            className="action__btn"
            title="Thêm vào yêu thích"
            onClick={handleAddToFavorites}
          >
            <FaRegHeart color={isFavorited ? "red" : "gray"} />
          </button>
          <button className="action__btn" title="Thêm vào giỏ">
            <FaCartPlus />
          </button>
        </div>

        {/* Biểu tượng giảm giá */}
        {product.discountPercentage > 0 && (
          <span className="product__discount">
            -{product.discountPercentage}%
          </span>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="product__details px-2">
        <h6 className="product__name" onClick={viewProductDetail}>
          {product.name}
        </h6>
        <div className="product__bottom">
          <div className="rating-status-container">
            <Rating
              name="read-only"
              value={product.rating || 0}
              readOnly
              size="small"
              precision={0.5}
            />
            <span className="stock-status">
              {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
            </span>
          </div>
          <div className="product__price">
            {product.originalPrice && (
              <span className="product__price__reduce">
                {formatter(product.originalPrice)}
              </span>
            )}
            <span className="product__price__increase">
              {formatter(product.priceAfterDiscount)}
            </span>
          </div>
        </div>
      </div>

      {/* Hiển thị thông báo */}
      {notification && (
        <div className="notification-message">{notification}</div>
      )}

      {/* Modal chi tiết sản phẩm */}
      {isOpenProductModal && (
        <ProductModal closeProductModal={closeProductModal} product={product} />
      )}
    </div>
  );
};

export default ProductItem;
