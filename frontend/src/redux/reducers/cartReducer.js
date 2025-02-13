import { CART_ACTIONS } from "../constants/actionTypes";

const initialState = {
  items: [],
  total: 0,
};

// Hàm phụ để tính tổng giỏ hàng
const calculateTotal = (items) => {
  return items.reduce(
    (acc, item) => acc + (item.product.priceAfterDiscount || 0) * item.quantity,
    0
  );
};

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product._id === action.payload.product._id
      );

      if (existingItemIndex !== -1) {
        // Cập nhật số lượng nếu sản phẩm đã có trong giỏ hàng
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity = Math.min(
          updatedItems[existingItemIndex].quantity + action.payload.quantity,
          updatedItems[existingItemIndex].product.remainingStock
        );
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      }

      // Thêm sản phẩm mới vào giỏ hàng
      const newItems = [
        ...state.items,
        {
          product: action.payload.product,
          quantity: Math.min(
            action.payload.quantity,
            action.payload.product.remainingStock
          ),
        },
      ];

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case CART_ACTIONS.REMOVE_FROM_CART: {
      const newItems = state.items.filter(
        (item) => item.product._id !== action.payload
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case CART_ACTIONS.UPDATE_CART_QUANTITY: {
      const updatedCart = state.items.map((item) => {
        if (item.product._id === action.payload.productId) {
          const newQuantity = Math.max(
            1,
            Math.min(action.payload.quantity, item.product.remainingStock)
          );
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      return {
        ...state,
        items: updatedCart,
        total: calculateTotal(updatedCart),
      };
    }

    case CART_ACTIONS.SET_CART: {
      // Ở đây payload đã chứa các thông tin minimal cần thiết
      const newItems = action.payload.map((item) => ({
        product: item.product,
        quantity: Math.min(item.quantity, item.product.remainingStock),
      }));
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: [],
        total: 0,
      };
    }

    default:
      return state;
  }
};
