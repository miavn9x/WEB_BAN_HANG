// actions/userActions.js;
import axios from "axios";

// Action để lấy thông tin profile người dùng
export const fetchUserProfile = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Không tìm thấy token");
    }

    const response = await axios.get("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: "SET_USER_PROFILE",
      payload: response.data.user,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    dispatch({
      type: "SET_USER_ERROR",
      payload: error.message,
    });
  }
};
