import React, { useState } from "react";
import { Rating } from "@mui/material";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaCartPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Thêm useDispatch và useSelector
import { addToCart } from "../../redux/actions/cartActions";
import "../../styles/ProductItem.css";
import { formatter } from "../../utils/fomater";

const ProductItem = ({ product }) => {
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy danh sách giỏ hàng từ Redux store
  const cartItems = useSelector((state) => state.cart.items);

  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const isProductInCart = cartItems.some(
    (item) => item.product._id === product._id
  );

  const viewProductDetail = () => {
    navigate(`/product/${product._id}`);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa

    try {
      // Kiểm tra sản phẩm đã có trong giỏ hàng
      if (isProductInCart) {
        setNotification("Sản phẩm đã có trong giỏ hàng!");
        setTimeout(() => setNotification(""), 3000);
        return;
      }

      // Kiểm tra còn hàng không
      if (product.remainingStock <= 0) {
        setNotification("Sản phẩm đã hết hàng!");
        setTimeout(() => setNotification(""), 3000);
        return;
      }

      // Thêm vào giỏ hàng với số lượng mặc định là 1
      await dispatch(addToCart(product, 1));
      setNotification("Đã thêm sản phẩm vào giỏ hàng!");
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      setNotification("Có lỗi xảy ra khi thêm vào giỏ hàng!");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  if (!product) {
    return <div>Không có dữ liệu sản phẩm.</div>;
  }

  return (
    <div className="product__item">
      <div className="product__img" onClick={viewProductDetail}>
        <img
          src={product.images?.[0] || "https://via.placeholder.com/150"}
          alt={product.name}
        />

        <div className="action">
          <button
            className="action__btn"
            title="Xem chi tiết"
            onClick={viewProductDetail}
          >
            <MdOutlineZoomOutMap />
          </button>
          <button
            className={`action__btn ${isProductInCart ? "disabled" : ""}`}
            title={isProductInCart ? "Đã có trong giỏ" : "Thêm vào giỏ"}
            onClick={handleAddToCart}
            disabled={isProductInCart}
          >
            <FaCartPlus />
          </button>
        </div>

        {product.discountPercentage > 0 && (
          <span className="product__discount">
            -{product.discountPercentage}%
          </span>
        )}
      </div>

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
              {product.remainingStock > 0 ? "Còn hàng" : "Hết hàng"}
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

      {notification && (
        <div
          className={`notification-message ${
            notification.includes("lỗi") || notification.includes("đã có")
              ? "error"
              : "success"
          }`}
        >
          {notification}
        </div>
      )}
    </div>
  );
};

export default ProductItem;
