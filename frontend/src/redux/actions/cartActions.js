import { CART_ACTIONS } from "../constants/actionTypes";
import axios from "axios";

const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (product, quantity) => async (dispatch) => {
  try {
    if (!getToken()) throw new Error("Token không hợp lệ");

    await axios.post(
      "/api/cart",
      { productId: product._id, quantity: Number(quantity) },
      { headers: { ...authHeader(), "Content-Type": "application/json" } }
    );

    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { product, quantity: Number(quantity) },
    });
  } catch (error) {
    console.error(
      "Lỗi khi thêm vào giỏ hàng:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = (productId) => async (dispatch) => {
  try {
    if (!getToken()) throw new Error("Token không hợp lệ");
    await axios.delete(`/api/cart/${productId}`, { headers: authHeader() });
    dispatch({ type: CART_ACTIONS.REMOVE_FROM_CART, payload: productId });
  } catch (error) {
    console.error(
      "Lỗi khi xóa sản phẩm khỏi giỏ hàng:",
      error.response?.data || error.message
    );
  }
};

// Cập nhật số lượng sản phẩm
export const updateCartQuantity =
  (productId, quantity) => async (dispatch, getState) => {
    try {
      const state = getState();
      const cartItem = state.cart.items.find(
        (item) => item.product._id === productId
      );
      if (!cartItem) throw new Error("Sản phẩm không tồn tại trong giỏ hàng.");
      if (quantity > cartItem.product.remainingStock) {
        alert(`Chỉ còn lại ${cartItem.product.remainingStock} sản phẩm.`);
        return;
      }

      if (!getToken()) throw new Error("Token không hợp lệ");
      await axios.put(
        `/api/cart/${productId}`,
        { quantity },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );

      dispatch({
        type: CART_ACTIONS.UPDATE_CART_QUANTITY,
        payload: { productId, quantity },
      });
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật số lượng sản phẩm:",
        error.response?.data || error.message
      );
    }
  };

// Lấy thông tin giỏ hàng
export const fetchCart = () => async (dispatch) => {
  try {
    if (!getToken()) throw new Error("Token không hợp lệ");
    const response = await axios.get("/api/cart", { headers: authHeader() });

    const cartItems = response.data.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: item.product.images || ["https://via.placeholder.com/150"],
      },
    }));

    dispatch({ type: CART_ACTIONS.SET_CART, payload: cartItems });
    localStorage.setItem("cart", JSON.stringify(cartItems));
  } catch (error) {
    console.error(
      "Lỗi khi lấy giỏ hàng:",
      error.response?.data || error.message
    );
  }
};

// Nếu giỏ hàng không có trong Redux, kiểm tra và lấy từ localStorage
export const loadCartFromLocalStorage = () => (dispatch) => {
  const cartFromLocalStorage = JSON.parse(localStorage.getItem("cart"));
  if (cartFromLocalStorage) {
    dispatch({ type: CART_ACTIONS.SET_CART, payload: cartFromLocalStorage });
  }
};

// Xóa nhiều sản phẩm khỏi giỏ hàng
export const clearCartFromAPI = (selectedItemIds) => async (dispatch) => {
  try {
    if (!getToken()) throw new Error("Token không hợp lệ");
    await axios({
      method: "DELETE",
      url: "/api/cart",
      data: { productIds: selectedItemIds },
      headers: authHeader(),
    });
    const response = await axios.get("/api/cart", { headers: authHeader() });
    dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data.items });
  } catch (error) {
    console.error(
      "Lỗi khi xóa sản phẩm:",
      error.response?.data || error.message
    );
    alert("Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.");
  }
};

// Đặt hàng
export const placeOrder = (orderData) => async (dispatch) => {
  try {
    if (!getToken()) return { success: false, message: "Token không hợp lệ" };
    const response = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    dispatch({
      type: response.ok ? "PLACE_ORDER_SUCCESS" : "PLACE_ORDER_FAILURE",
      payload: data,
    });
    return response.ok
      ? { success: true }
      : { success: false, message: data.message || "Đặt hàng thất bại" };
  } catch (error) {
    console.error("Lỗi đặt hàng:", error.message);
    return { success: false, message: "Đặt hàng thất bại. Vui lòng thử lại." };
  }
};

// Lấy thông tin người dùng
export const fetchUserProfile = () => async (dispatch) => {
  try {
    if (!getToken()) throw new Error("Token không hợp lệ");
    const response = await axios.get("/api/profile", { headers: authHeader() });
    dispatch({
      type: "FETCH_USER_PROFILE_SUCCESS",
      payload: response.data.user,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error.message);
    dispatch({ type: "FETCH_USER_PROFILE_FAILURE", payload: error.message });
  }
};

// Action xóa giỏ hàng trong Redux và localStorage (cho trường hợp logout)
export const clearCart = () => (dispatch) => {
  dispatch({
    type: CART_ACTIONS.CLEAR_CART,
  });
  localStorage.removeItem("cart");
};
