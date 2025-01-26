import { CART_ACTIONS } from "../constants/actionTypes";
import axios from "axios";

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (product, quantity) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token không hợp lệ");

    const response = await axios.post(
      `/api/cart`,
      { productId: product._id, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { product, quantity },
    });
    console.log("Thêm vào giỏ hàng thành công:", response.data);
  } catch (error) {
    console.error(
      "Lỗi khi thêm sản phẩm vào giỏ hàng:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = (productId) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token không hợp lệ");

    await axios.delete(`/api/cart/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: productId,
    });
    console.log("Xóa sản phẩm khỏi giỏ hàng thành công");
  } catch (error) {
    console.error(
      "Lỗi khi xóa sản phẩm khỏi giỏ hàng:",
      error.response ? error.response.data : error.message
    );
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartQuantity = (productId, quantity) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token không hợp lệ");

    await axios.put(
      `api/cart/${productId}`,
      { quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    dispatch({
      type: CART_ACTIONS.UPDATE_CART_QUANTITY,
      payload: { productId, quantity },
    });
    console.log("Cập nhật số lượng sản phẩm thành công");
  } catch (error) {
    console.error(
      "Lỗi khi cập nhật số lượng sản phẩm:",
      error.response ? error.response.data : error.message
    );
  }
};

// Lấy thông tin giỏ hàng
export const fetchCart = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token không hợp lệ");

    const response = await axios.get("http://localhost:5000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Đảm bảo kiểm tra dữ liệu trả về
    const cartItems = response.data.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: item.product.images || ["https://via.placeholder.com/150"], // Hình ảnh mặc định nếu không có
      },
    }));

    dispatch({
      type: CART_ACTIONS.SET_CART,
      payload: cartItems,
    });
    console.log("Lấy giỏ hàng thành công:", cartItems);
  } catch (error) {
    console.error(
      "Lỗi khi lấy giỏ hàng:",
      error.response ? error.response.data : error.message
    );
  }
};


// Tạo một đối tượng API để thực hiện các yêu cầu HTTP
const api = axios.create({
  baseURL: "https://your-api-url.com", // Đổi thành URL của API bạn sử dụng
  headers: {
    "Content-Type": "application/json",
  },
});

export const clearCartFromAPI = (selectedItemIds) => {
  return async (dispatch) => {
    try {
      // Gọi API xóa sản phẩm khỏi giỏ hàng
      await api.delete("/cart", { data: { productIds: selectedItemIds } });

      // Fetch lại giỏ hàng mới sau khi xóa
      const response = await api.get("/cart");

      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response.data.items,
      });
    } catch (error) {
      console.error("Xóa sản phẩm thất bại", error);
      alert("Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.");
    }
  };
};
