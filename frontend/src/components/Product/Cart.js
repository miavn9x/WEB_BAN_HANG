import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import {
  removeFromCart,
  updateCartQuantity,
  fetchCart,
} from "../../redux/actions/cartActions";
import "./Cart.css";
import { formatter } from "../../utils/fomater";
import { fetchUserProfile } from "../../redux/actions/userActions";
import { useNavigate } from "react-router-dom";
import { CART_ACTIONS } from "../../redux/constants/actionTypes";

const selectCartItems = createSelector(
  (state) => state.cart.items,
  (cartItems) => (Array.isArray(cartItems) ? cartItems : [])
);

const Cart = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.user.info);
  const navigate = useNavigate();

  const [editableUserInfo, setEditableUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // State cho coupon
  // selectedCoupon sẽ lưu cả đối tượng coupon (bao gồm couponCode, expiryDate,…)
  const [userCoupons, setUserCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Khi userProfile thay đổi, cập nhật thông tin người dùng và lọc các coupon chưa hết hạn (ví dụ: thời hạn > hiện tại)
  useEffect(() => {
    if (userProfile) {
      setEditableUserInfo({
        fullName: `${userProfile.firstName} ${userProfile.lastName}` || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      });
      if (userProfile.coupons && Array.isArray(userProfile.coupons)) {
        const validCoupons = userProfile.coupons.filter(
          (coupon) => new Date(coupon.expiryDate) >= new Date()
        );
        setUserCoupons(validCoupons);
      }
    } else {
      setEditableUserInfo({
        fullName: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [userProfile]);

  // Fetch giỏ hàng
  useEffect(() => {
    const updateCart = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(fetchCart());
      } else {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        localStorage.removeItem("cart");
      }
      setIsLoading(false);
    };
    updateCart();
  }, [dispatch]);

  // Mảng lưu các product _id được chọn thanh toán
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelectAll = () => {
    const allProductIds = cartItems
      .filter((item) => item.product)
      .map((item) => item.product._id);
    if (selectedItems.length === allProductIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allProductIds);
    }
  };

  // Tính tổng tạm (chỉ tính cho các sản phẩm được chọn)
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

  const effectiveSubtotal = calculateSubtotal();

  // Nếu coupon FREESHIP và tổng trên ngưỡng, phí ship = 0
  const getShippingFee = () => {
    if (effectiveSubtotal === 0) return 0;
    const couponCode = selectedCoupon?.couponCode || "";
    const hasFreeShipCoupon = couponCode && /FREESHIP/gi.test(couponCode);
    return hasFreeShipCoupon && effectiveSubtotal >= 1000000 ? 0 : 25000;
  };

  // Tính giảm giá dựa trên coupon được chọn
  const getDiscount = () => {
    if (effectiveSubtotal === 0) return 0;
    if (!selectedCoupon) return 0;
    // Nếu coupon đã hết hạn, không giảm giá
    if (new Date(selectedCoupon.expiryDate) < new Date()) return 0;
    const couponCode = selectedCoupon.couponCode;
    if (/FREESHIP/gi.test(couponCode)) return 0;
    if (/25K/gi.test(couponCode) && effectiveSubtotal >= 300000) {
      return 25000;
    } else if (/30K/gi.test(couponCode) && effectiveSubtotal >= 500000) {
      return 30000;
    } else if (/70K/gi.test(couponCode) && effectiveSubtotal >= 2000000) {
      return 70000;
    }
    return 0;
  };

  // Tổng tiền thanh toán
  const calculateTotalAmount = () => {
    if (effectiveSubtotal === 0) return 0;
    return effectiveSubtotal + getShippingFee() - getDiscount();
  };

  const handleRemoveFromCart = (productId) => {
    if (productId) {
      dispatch(removeFromCart(productId));
    }
  };

  const handleQuantityInputChange = (productId, newQuantity) => {
    const quantity = Math.max(Number(newQuantity), 1);
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

  // Khi checkbox của sản phẩm được thay đổi
  const handleSelectItem = (productId, isSelected) => {
    setSelectedItems((prevSelectedItems) => {
      if (isSelected) {
        return [...prevSelectedItems, productId];
      } else {
        return prevSelectedItems.filter((id) => id !== productId);
      }
    });
  };

  const handleProceedToCheckout = () => {
    if (!selectedItems.length) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }
    if (!editableUserInfo.address.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng để tiếp tục!");
      return;
    }
    // Lọc ra các sản phẩm được chọn
    const selectedProducts = cartItems.filter((item) =>
      selectedItems.includes(item.product._id)
    );
    const orderData = {
      userInfo: editableUserInfo,
      items: selectedProducts.map((item) => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          priceAfterDiscount: item.product.priceAfterDiscount,
          images: item.product.images,
        },
        quantity: item.quantity,
      })),
      shippingFee: getShippingFee(),
      subtotal: effectiveSubtotal,
      totalAmount: calculateTotalAmount(),
      coupon: selectedCoupon, // lưu cả coupon object
      note: orderNote,
    };
    navigate("/thanh-toan", { state: { orderData } });
  };

  return (
    <div className="container">
      <div className="cart-title text-center my-4"></div>
      {isLoading && (
        <div className="loading-overlay d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-md-8">
          {!isLoading && !cartItems.length ? (
            <p className="text-center">
              <div className="cart-empty-container">
                <img
                  className="cart-empty-image"
                  src="https://theme.hstatic.net/200000381339/1001207774/14/cart_empty_background.png?v=164"
                  alt="Giỏ hàng trống"
                />
                <i className="cart-empty-text my-4 mx-auto">Giỏ hàng trống</i>
              </div>
            </p>
          ) : (
            <>
              <div
                style={{
                  height: "50vh",
                  overflowY: "auto",
                  paddingRight: "15px",
                }}
              >
                {cartItems.map((item) =>
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
                          style={{ fontSize: "30px" }}
                        />
                        <img
                          src={
                            item.product.images?.[0] ||
                            "https://via.placeholder.com/150"
                          }
                          alt={item.product.name || "Sản phẩm"}
                          className="img-fluid"
                        />
                      </div>
                      <div className="item-details flex-grow-1 px-3">
                        <div className="item-details_name mx-auto">
                          {item.product.name || "Sản phẩm không tên"}
                        </div>
                        <div style={{ color: "red" }}>
                          {formatter(
                            Number(item.product.priceAfterDiscount) || 0
                          )}
                        </div>
                      </div>
                      <div className="item-actions d-flex gap-2 ms-auto">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            handleQuantityChange(item.product._id, "decrease")
                          }
                        >
                          -
                        </button>
                        <input
                          className="form-control"
                          style={{ width: "70px" }}
                          value={item.quantity}
                          min="0"
                          max="99"
                          onChange={(e) => {
                            let value = parseInt(e.target.value, 10);
                            if (isNaN(value)) value = 0;
                            if (value < 0) value = 0;
                            if (value > 99) value = 99;
                            handleQuantityInputChange(item.product._id, value);
                          }}
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
                )}
              </div>
              <div className="select-all-container text-end">
                {!isLoading && cartItems.length > 0 && (
                  <button
                    className="btn btn-secondary"
                    onClick={toggleSelectAll}
                  >
                    {selectedItems.length ===
                    cartItems.filter((item) => item.product).length
                      ? "Hủy chọn"
                      : "Chọn tất cả"}
                  </button>
                )}
              </div>
            </>
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
                placeholder="Nhập họ và tên"
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
                placeholder="Nhập email"
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
                placeholder="Nhập số điện thoại"
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
                placeholder="Nhập địa chỉ giao hàng"
              />
            </div>
          </div>
          <div className="total-info text-end mt-4">
            <div>Tổng cộng: {formatter(effectiveSubtotal)}</div>
            <div>
              Phí vận chuyển:{" "}
              <span style={{ color: "blue" }}>
                {formatter(getShippingFee())}
              </span>
            </div>
            <div className="discount-info text-danger mt-2">
              Đã giảm: {formatter(getDiscount())}
            </div>
            <div className="total-price fw-bold">
              Thành tiền:{" "}
              <span className="text-danger">
                {formatter(calculateTotalAmount())}
              </span>
            </div>
            <div className="coupon-code-section mt-2">
              <label style={{ fontWeight: "bold" }}>Mã giảm giá: </label>
              {selectedCoupon ? (
                <>
                  <span className="ms-2">{selectedCoupon.couponCode}</span>
                  <button
                    className="btn btn-link ms-2"
                    onClick={() => setShowCouponDropdown(true)}
                  >
                    Thay đổi
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => setShowCouponDropdown(true)}
                  disabled={userCoupons.length === 0}
                >
                  {userCoupons.length === 0 ? "Không có mã" : "Chọn mã"}
                </button>
              )}
            </div>
            {selectedCoupon && (
              <div className="coupon-conditions">
                {selectedCoupon.couponCode.includes("25K") &&
                  " (Áp dụng cho đơn từ 300,000đ)"}
                {selectedCoupon.couponCode.includes("30K") &&
                  " (Áp dụng cho đơn từ 500,000đ)"}
                {selectedCoupon.couponCode.includes("70K") &&
                  " (Áp dụng cho đơn từ 2,000,000đ)"}
                {selectedCoupon.couponCode.includes("FREESHIP") &&
                  " (Miễn phí vận chuyển đơn từ 1,000,000đ)"}
              </div>
            )}
            {showCouponDropdown && (
              <div className="coupon-dropdown mt-2">
                {userCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="coupon-option p-2 border mb-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedCoupon(coupon);
                      setShowCouponDropdown(false);
                    }}
                  >
                    <div>{coupon.couponCode}</div>
                    <div style={{ fontSize: "12px", color: "#555" }}>
                      HSD: {new Date(coupon.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ghi chú đơn hàng */}
            <div className="order-note mt-3">
              <label htmlFor="orderNote" className="form-label">
                Ghi chú đơn hàng:
              </label>
              <textarea
                id="orderNote"
                className="form-control"
                rows="3"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Nhập ghi chú đơn hàng (ví dụ: giao hàng giờ hành chính, để hàng ở cửa, v.v.)"
              ></textarea>
            </div>

            <button
              className="btn btn-secondary w-100 mt-3"
              onClick={handleProceedToCheckout}
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
