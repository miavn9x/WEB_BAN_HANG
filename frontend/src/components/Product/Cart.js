import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import {
  removeFromCart,
  updateCartQuantity,
  fetchCart,
  placeOrder, // Thêm action placeOrder để gửi thông tin đặt hàng
} from "../../redux/actions/cartActions";

import { formatter } from "../../utils/fomater";
import { fetchUserProfile } from "../../redux/actions/userActions";
// Selector để lấy danh sách sản phẩm trong giỏ
const selectCartItems = createSelector(
  (state) => state.cart.items,
  (cartItems) => (Array.isArray(cartItems) ? cartItems : [])
);

const Cart = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
const userProfile = useSelector((state) => state.user.info);

// State cho form
const [editableUserInfo, setEditableUserInfo] = useState({
  fullName: "",
  email: "",
  phone: "",
  address: "",
});

// Lấy thông tin người dùng khi component mount
useEffect(() => {
  dispatch(fetchUserProfile());
}, [dispatch]);

// Cập nhật form khi có dữ liệu từ API
useEffect(() => {
  if (userProfile) {
    setEditableUserInfo({
      fullName: `${userProfile.firstName} ${userProfile.lastName}` || "",
      email: userProfile.email || "",
      phone: userProfile.phone || "",
      address: userProfile.address || "",
    });
  }
}, [userProfile]);

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    dispatch(fetchCart()); // Lấy giỏ hàng từ server khi component mount
  }, [dispatch]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (
        selectedItems.includes(item.product._id) &&
        item?.product?.priceAfterDiscount
      ) {
        return (
          total +
          (Number(item.quantity) || 0) * Number(item.product.priceAfterDiscount)
        );
      }
      return total;
    }, 0);
  };

  const handleRemoveFromCart = (productId) => {
    if (productId) {
      dispatch(removeFromCart(productId)); // Gửi action xóa sản phẩm
    }
  };

  const handleQuantityInputChange = (productId, newQuantity) => {
    const quantity = Math.max(Number(newQuantity), 1); // Đảm bảo số lượng >= 1
    dispatch(updateCartQuantity(productId, quantity));
  };

  const handleQuantityChange = (productId, action) => {
    const item = cartItems.find((item) => item?.product?._id === productId);
    if (!item) return;

    const currentQuantity = Number(item.quantity) || 0;
    if (action === "increase") {
      dispatch(updateCartQuantity(productId, currentQuantity + 1));
    } else if (action === "decrease" && currentQuantity > 1) {
      dispatch(updateCartQuantity(productId, currentQuantity - 1));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectItem = (productId, isSelected) => {
    setSelectedItems((prevSelectedItems) => {
      if (isSelected) {
        return [...prevSelectedItems, productId];
      } else {
        return prevSelectedItems.filter((id) => id !== productId);
      }
    });
  };

  // Xử lý đặt hàng, gửi thông tin người dùng và giỏ hàng
  const handlePlaceOrder = () => {
    const orderData = {
      userInfo: editableUserInfo, // Thông tin người dùng chỉnh sửa
      items: cartItems.filter((item) =>
        selectedItems.includes(item.product._id)
      ),
      totalAmount: calculateSubtotal(),
    };

    // Gửi thông tin đặt hàng tới server
    dispatch(placeOrder(orderData));
  };

  return (
    <div className="container">
      <div className="cart-title text-center my-4">
        <h2>Giỏ Hàng</h2>
      </div>

      <div className="row">
        <div className="col-md-8">
          {!cartItems.length ? (
            <p className="text-center">Giỏ hàng của bạn đang trống.</p>
          ) : (
            cartItems.map((item) =>
              item?.product ? (
                <div
                  key={item.product._id}
                  className="cart-item border p-3 rounded mb-3 d-flex flex-wrap align-items-center"
                >
                  <div className="d-flex align-items-center mb-3 mb-md-0">
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      checked={selectedItems.includes(item.product._id)}
                      onChange={(e) =>
                        handleSelectItem(item.product._id, e.target.checked)
                      }
                    />
                    <img
                      src={
                        item.product.images?.[0] ||
                        "https://via.placeholder.com/150"
                      }
                      alt={item.product.name || "Sản phẩm"}
                      className="img-fluid"
                      style={{ maxHeight: "100px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="item-details flex-grow-1 px-3">
                    <div>{item.product.name || "Sản phẩm không tên"}</div>
                    <div>
                      {formatter(Number(item.product.priceAfterDiscount) || 0)}
                    </div>
                  </div>
                  <div className="item-actions d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        handleQuantityChange(item.product._id, "decrease")
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: "70px" }}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityInputChange(
                          item.product._id,
                          e.target.value
                        )
                      }
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        handleQuantityChange(item.product._id, "increase")
                      }
                    >
                      +
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleRemoveFromCart(item.product._id)}
                    >
                      XÓA
                    </button>
                  </div>
                </div>
              ) : null
            )
          )}
        </div>

        <div className="col-md-4">
          <div className="user-info border p-4 rounded">
            <div className="mb-3">
              <label className="form-label" htmlFor="name">
                Họ và tên:
              </label>
              <input
                className="form-control"
                id="name"
                type="text"
                name="fullName"
                value={editableUserInfo.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                Email:
              </label>
              <input
                className="form-control"
                id="email"
                type="email"
                name="email"
                value={editableUserInfo.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="phone">
                Số điện thoại:
              </label>
              <input
                className="form-control"
                id="phone"
                type="text"
                name="phone"
                value={editableUserInfo.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="address">
                Địa chỉ:
              </label>
              <input
                className="form-control"
                id="address"
                type="text"
                name="address"
                value={editableUserInfo.address}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="total-info text-end mt-4">
            <div>Subtotal: {formatter(calculateSubtotal())}</div>
            <div>Phí vận chuyển: Miễn phí</div>
            <div className="total-price fw-bold">
              Thành tiền: {formatter(calculateSubtotal())}
            </div>
            <button
              className="btn btn-secondary btn-purchase w-100 mt-3"
              onClick={handlePlaceOrder} // Gửi yêu cầu đặt hàng
              disabled={!selectedItems.length}
            >
              MUA HÀNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;