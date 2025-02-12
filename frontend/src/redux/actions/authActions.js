import { clearCart } from "./cartActions";

// Action đăng xuất
export const logoutUser = () => (dispatch) => {
  // Xóa token và cart khỏi localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("cart");

  // Dispatch các action clear state
  dispatch({ type: "LOGOUT" });
  dispatch(clearCart());
  dispatch({ type: "CLEAR_USER" });
};
