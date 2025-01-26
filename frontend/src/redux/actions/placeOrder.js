export const placeOrder = (orderData) => async (dispatch) => {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      dispatch({
        type: "PLACE_ORDER_SUCCESS",
        payload: data,
      });
      return { success: true };
    } else {
      dispatch({
        type: "PLACE_ORDER_FAILURE",
        payload: data,
      });
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Đặt hàng thất bại. Vui lòng thử lại." };
  }
};
