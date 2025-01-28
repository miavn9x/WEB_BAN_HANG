import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { Button, Checkbox } from "@mui/material";
import {
  removeFromCart,
  updateCartQuantity,
  fetchCart,
  clearCartFromAPI, // Lấy giỏ hàng từ server
} from "../../redux/actions/cartActions";
import { formatter } from "../../../utils/fomater";
import QuantityBox from "../../components/Product/QuantityBox";
;

// Selector để lấy danh sách sản phẩm trong giỏ
const selectCartItems = createSelector(
  (state) => state.cart.items,
  (cartItems) => (Array.isArray(cartItems) ? cartItems : [])
);

const Cart = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();

  // Lấy thông tin tài khoản người dùng từ Redux, với giá trị mặc định là {} nếu chưa có
  const accountInfo = useSelector((state) => state.user.info) || {};

  const [editableUserInfo, setEditableUserInfo] = useState({
    fullName: accountInfo.fullName || "",
    email: accountInfo.email || "",
    phone: accountInfo.phone || "",
    address: accountInfo.address || "",
  });

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    dispatch(fetchCart()); // Lấy giỏ hàng từ server khi component mount
  }, [dispatch]);

  // Tính tổng tiền của giỏ hàng
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item?.product?.priceAfterDiscount) return total;
      return (
        total +
        (Number(item.quantity) || 0) * Number(item.product.priceAfterDiscount)
      );
    }, 0);
  };

  // Xử lý khi xóa sản phẩm khỏi giỏ
  const handleRemoveFromCart = (productId) => {
    if (productId) {
      dispatch(removeFromCart(productId)); // Gửi action xóa sản phẩm
    }
  };

//   // Xử lý khi thay đổi số lượng sản phẩm



  // Cập nhật thông tin người dùng khi chỉnh sửa
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Xử lý thanh toán

  const handleCheckout = () => {
    // Kiểm tra xem có sản phẩm nào được chọn không
    if (!selectedItems.length) {
      alert("Bạn chưa chọn sản phẩm để thanh toán.");
      return;
    }

    // Kiểm tra các sản phẩm hợp lệ
    const validSelectedItems = selectedItems.filter(
      (item) => item.product && item.product._id
    );

    if (validSelectedItems.length === 0) {
      alert("Không có sản phẩm hợp lệ để thanh toán.");
      return;
    }

    console.log("Sản phẩm hợp lệ:", validSelectedItems);

    // Tiến hành thanh toán
    const orderData = {
      user: editableUserInfo,
      items: validSelectedItems.map((item) => ({
        ...item,
        quantity: item.quantity,
      })),
      totalAmount: validSelectedItems.reduce((total, item) => {
        if (!item.product || !item.product.priceAfterDiscount) return total;
        return total + (item.quantity * item.product.priceAfterDiscount || 0);
      }, 0),
    };

    console.log("Thông tin người dùng khi thanh toán:", editableUserInfo);
    console.log("Thông tin đơn hàng:", orderData);

    // Gọi action xóa sản phẩm từ giỏ hàng qua API và tiến hành thanh toán
    dispatch(
      clearCartFromAPI(validSelectedItems.map((item) => item.product._id))
    );

    alert("Đặt hàng thành công!");
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

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Giỏ Hàng</h2>

      <div className="row">
        {/* Phần giỏ hàng */}
        <div className="col-md-8">
          {!cartItems.length ? (
            <p className="text-center">Giỏ hàng của bạn đang trống.</p>
          ) : (
            <ul className="list-group">
              {cartItems.map((item) =>
                item?.product ? (
                  <li
                    key={item.product._id}
                    className="list-group-item d-flex align-items-center mb-3"
                  >
                    <div className="col-1">
                      <Checkbox
                        checked={selectedItems.includes(item.product._id)}
                        onChange={(e) =>
                          handleSelectItem(item.product._id, e.target.checked)
                        }
                      />
                    </div>

                    <div className="col-3">
                      <img
                        src={
                          item.product.images?.[0] ||
                          "https://via.placeholder.com/150"
                        }
                        alt={item.product.name || "Sản phẩm"}
                        className="img-fluid rounded"
                        style={{ maxHeight: "100px", objectFit: "cover" }}
                      />
                    </div>

                    <div className="col-5">
                      <h5>{item.product.name || "Sản phẩm không tên"}</h5>
                      <p>
                        {formatter(
                          Number(item.product.priceAfterDiscount) || 0
                        )}
                      </p>
                    </div>
                    <div className="col-2 d-flex flex-column align-items-center justify-content-between">
                      {/* Phần số lượng */}
                      <div className="quantity-controls mb-2 w-100">
                        <QuantityBox
                          maxQuantity={item.product.remainingStock}
                          quantity={Number(item.quantity)}
                          setQuantity={(newQuantity) =>
                            dispatch(
                              updateCartQuantity(item.product._id, newQuantity)
                            )
                          }
                        />
                      </div>

                      {/* Nút xóa */}
                      <button
                        className="btn btn-outline-danger btn-sm w-100 mt-2"
                        onClick={() => handleRemoveFromCart(item.product._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>

        {/* Phần thông tin người dùng */}
        <div className="col-md-4">
          <div className="mb-4">
            <h4>Thông tin người dùng</h4>
            <div>
              <label>
                Họ và tên:
                <input
                  type="text"
                  name="fullName"
                  value={editableUserInfo.fullName}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </label>
            </div>
            <div>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={editableUserInfo.email}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </label>
            </div>
            <div>
              <label>
                Số điện thoại:
                <input
                  type="text"
                  name="phone"
                  value={editableUserInfo.phone}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </label>
            </div>
            <div>
              <label>
                Địa chỉ:
                <input
                  type="text"
                  name="address"
                  value={editableUserInfo.address}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </label>
            </div>
          </div>

          <div className="border p-3 rounded">
            <h4>Tổng cộng</h4>
            <div className="d-flex justify-content-between">
              <p>Subtotal:</p>
              <p>{formatter(calculateSubtotal())}</p>
            </div>
            <div className="d-flex justify-content-between">
              <p>Phí vận chuyển:</p>
              <p>Miễn phí</p>
            </div>
            <div className="d-flex justify-content-between">
              <p>Thành tiền:</p>
              <p>{formatter(calculateSubtotal())}</p>
            </div>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCheckout}
              disabled={!selectedItems.length}
            >
              Mua hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
