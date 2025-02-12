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

// Selector để lấy danh sách sản phẩm trong giỏ
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

  // Khi component mount, lấy thông tin người dùng (nếu có token)
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Cập nhật thông tin người dùng khi userProfile thay đổi
  useEffect(() => {
    if (userProfile) {
      setEditableUserInfo({
        fullName: `${userProfile.firstName} ${userProfile.lastName}` || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      });
    } else {
      // Nếu userProfile null (đã logout) thì xoá thông tin giao diện của người dùng
      setEditableUserInfo({
        fullName: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [userProfile]);

  // Lấy lại giỏ hàng dựa trên token thay vì phụ thuộc vào userProfile
  useEffect(() => {
    const updateCart = async () => {
      setIsLoading(true); // Hiển thị loading khi đang fetch
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(fetchCart()); // Nếu có token (người dùng đã đăng nhập) thì lấy giỏ hàng từ API
      } else {
        // Nếu không có token (đăng xuất) thì xoá giỏ hàng trong Redux
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        localStorage.removeItem("cart"); // Xoá giỏ hàng trong localStorage
      }
      setIsLoading(false);
    };

    updateCart();
  }, [dispatch]); // Chỉ chạy 1 lần khi component mount

  // Mảng lưu các product _id của sản phẩm được chọn thanh toán
  const [selectedItems, setSelectedItems] = useState([]);

  // Hàm toggle chọn/hủy chọn tất cả các sản phẩm
  const toggleSelectAll = () => {
    // Lấy danh sách các product id từ cartItems (đảm bảo item.product tồn tại)
    const allProductIds = cartItems
      .filter((item) => item.product)
      .map((item) => item.product._id);
    if (selectedItems.length === allProductIds.length) {
      setSelectedItems([]); // Nếu đã chọn hết, thì hủy chọn tất cả
    } else {
      setSelectedItems(allProductIds); // Nếu chưa chọn hết, chọn tất cả
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

  // Khi người dùng tích checkbox, cập nhật mảng selectedItems
  const handleSelectItem = (productId, isSelected) => {
    setSelectedItems((prevSelectedItems) => {
      if (isSelected) {
        return [...prevSelectedItems, productId];
      } else {
        return prevSelectedItems.filter((id) => id !== productId);
      }
    });
  };

  // Khi bấm nút THANH TOÁN, kiểm tra và chuyển sang trang thanh toán
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

    // Tạo đối tượng orderData để truyền sang trang Checkout
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
      shippingFee: 25000,
      subtotal: calculateSubtotal(),
      totalAmount: calculateSubtotal() + 25000,
    };

    navigate("/thanh-toan", { state: { orderData } });
  };

  return (
    <div className="container">
      <div className="cart-title text-center my-4">
        {/* <h2>Giỏ Hàng</h2> */}
      </div>

      {/* Loading Spinner - Centered on Screen */}
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
              {/* Bao bọc danh sách sản phẩm trong container scroll */}
              <div
                style={{
                  maxHeight: cartItems.length > 10 ? "600px" : "auto",
                  overflowY: cartItems.length > 10 ? "auto" : "visible",
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
                          type="number"
                          className="form-control"
                          style={{ width: "50px" }}
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
                )}
              </div>
              {/* Container cho nút chọn tất cả/hủy chọn luôn nằm ở dưới cùng */}
              <div className="select-all-container text-end">
                {!isLoading && cartItems.length > 0 && (
                  <button
                    className="btn btn-secondary "
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
            <div>Tổng cộng: {formatter(calculateSubtotal())}</div>
            <div>
              Phí vận chuyển:
              <span style={{ color: "blue" }}> {formatter(25000)}</span>
            </div>
            <div className="total-price fw-bold">
              Thành tiền:{" "}
              <span className="text-danger">
                {formatter(calculateSubtotal() + 25000)}
              </span>
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
