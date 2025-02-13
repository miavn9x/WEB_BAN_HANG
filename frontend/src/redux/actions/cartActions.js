import { CART_ACTIONS } from "../constants/actionTypes";
import axios from "axios";

const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// Helper: Chuyển đổi cart item thành dạng tối thiểu chỉ chứa productId và quantity
const toMinimalCartItem = (item) => ({
  productId: item.product._id,
  quantity: item.quantity,
});

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (product, quantity) => async (dispatch) => {
  try {
    if (!getToken()) throw new Error("Token không hợp lệ");

    await axios.post(
      "/api/cart",
      { productId: product._id, quantity: Number(quantity) },
      { headers: { ...authHeader(), "Content-Type": "application/json" } }
    );

    // Dispatch đầy đủ thông tin lên Redux để hiển thị UI
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { product, quantity: Number(quantity) },
    });

    // Lấy state giỏ hàng mới nhất và lưu minimal data vào localStorage
    // Giả sử bạn có thể lấy state hiện tại sau khi dispatch (hoặc bạn tính toán lại từ Redux store)
    // Ở đây, ta sẽ lấy lại cart từ localStorage của Redux (nếu đã được load)
    // Nếu bạn dùng Redux Persist, bạn có thể cấu hình transform thay vì làm thủ công.
    // Ví dụ đơn giản: Cập nhật localStorage ngay với item vừa thêm:
    const minimalItem = { productId: product._id, quantity: Number(quantity) };
    let storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    // Kiểm tra nếu sản phẩm đã có trong localStorage
    const idx = storedCart.findIndex((item) => item.productId === product._id);
    if (idx !== -1) {
      storedCart[idx].quantity += Number(quantity);
    } else {
      storedCart.push(minimalItem);
    }
    localStorage.setItem("cart", JSON.stringify(storedCart));
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

    // Cập nhật lại localStorage: lọc bỏ sản phẩm có productId này
    let storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    storedCart = storedCart.filter((item) => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(storedCart));
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

      // Cập nhật lại minimal data vào localStorage
      let storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      storedCart = storedCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(storedCart));
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật số lượng sản phẩm:",
        error.response?.data || error.message
      );
    }
  };

// Lấy thông tin giỏ hàng từ API và cập nhật Redux
export const fetchCart = () => async (dispatch) => {
  try {
    if (!getToken()) throw new Error("Token không hợp lệ");
    const response = await axios.get("/api/cart", { headers: authHeader() });

    // Giả sử API trả về items với đầy đủ thông tin sản phẩm
    const cartItems = response.data.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    dispatch({ type: CART_ACTIONS.SET_CART, payload: cartItems });

    // Lưu vào localStorage chỉ minimal thông tin: productId và quantity
    const minimalCartItems = cartItems.map(toMinimalCartItem);
    localStorage.setItem("cart", JSON.stringify(minimalCartItems));
  } catch (error) {
    console.error(
      "Lỗi khi lấy giỏ hàng:",
      error.response?.data || error.message
    );
  }
};

// Nếu giỏ hàng không có trong Redux, load từ localStorage minimal
export const loadCartFromLocalStorage = () => async (dispatch) => {
  const storedCart = JSON.parse(localStorage.getItem("cart"));
  if (storedCart) {
   
    try {
      const ids = storedCart.map((item) => item.productId);
      const response = await axios.get("/api/products", {
        params: { ids: ids.join(",") },
        headers: authHeader(),
      });
      // response.data.products chứa danh sách sản phẩm đầy đủ
      const productsMap = {};
      response.data.products.forEach((prod) => {
        productsMap[prod._id] = prod;
      });
      const fullCartItems = storedCart.map((item) => ({
        product: productsMap[item.productId] || {
          _id: item.productId,
          name: "Sản phẩm",
          priceAfterDiscount: 0,
          remainingStock: 0,
          images: ["https://via.placeholder.com/150"],
        },
        quantity: item.quantity,
      }));
      dispatch({ type: CART_ACTIONS.SET_CART, payload: fullCartItems });
    } catch (error) {
      console.error(
        "Lỗi khi load giỏ hàng từ API:",
        error.response?.data || error.message
      );
    }
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
    const cartItems = response.data.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
    dispatch({ type: CART_ACTIONS.SET_CART, payload: cartItems });
    const minimalCartItems = cartItems.map(toMinimalCartItem);
    localStorage.setItem("cart", JSON.stringify(minimalCartItems));
  } catch (error) {
    console.error(
      "Lỗi khi xóa sản phẩm:",
      error.response?.data || error.message
    );
    alert("Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.");
  }
};

// Đặt hàng (giữ nguyên)
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

// Lấy thông tin người dùng (giữ nguyên)
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
