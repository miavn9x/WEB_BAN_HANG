import React, { useState } from "react";
import { Rating } from "@mui/material";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import "../../styles/ProductItem.css";
import ProductModal from "./ProductModals";

const ProductItem = () => {
const [isOpenProductModal, setIsOpenProductModal] = useState(false);
const viewProductDetail = (id) => {
  setIsOpenProductModal(true);
};

const CloseProductModal = () => {
  setIsOpenProductModal(false);
};

  return (
    <div className="product__item">
      <div className="product__img w-100" onClick={() => viewProductDetail(1)}>
        <img
          src="https://bizweb.dktcdn.net/thumb/grande/100/531/894/products/l-56-1c4632cf6e2246acac0c61942679538d.jpg?v=1730192665683"
          alt="Product"
        />
        <div className="action">
          <button
            className="action__btn"
            title="Zoom"
            onClick={() => viewProductDetail(1)}
          >
            <MdOutlineZoomOutMap />
          </button>
          <button className="action__btn" title="Yêu thích">
            <FaRegHeart />
          </button>
          <button className="action__btn" title="Thêm vào giỏ">
            <FaCartPlus />
          </button>
        </div>
        <span className="product__discount">-20%</span>
      </div>
      <div className="product__details px-2">
        <h6 className="product__name" onClick={() => viewProductDetail(1)}>
          BIM Bỉm Huggies XL 60 miếng (cho bé 11 - 16kg) BIM Bỉm Huggies XL 60
          miếng (cho bé 11 - 16kg)
        </h6>
        <div className="rating-status-container">
          <Rating
            name="read-only"
            value={5}
            readOnly
            size="small"
            precision={0.5}
          />
          <span className="stock-status">Còn hàng</span>
        </div>
        <div className="product__price">
          <span className="product__price__reduce">1.598.000đ</span>
          <span className="product__price__increase">1.478.400đ</span>
        </div>
      </div>
      {/* <ProductModal /> */}
      {isOpenProductModal === true && (
        <ProductModal CloseProductModal={CloseProductModal} />
      )}
    </div>
  );
};

export default ProductItem;
