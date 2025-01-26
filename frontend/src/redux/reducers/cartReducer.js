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
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.payload.product,
            quantity: action.payload.quantity,
          },
        ],
        total: calculateTotal([
          ...state.items,
          {
            product: action.payload.product,
            quantity: action.payload.quantity,
          },
        ]),
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
      const updatedCart = state.items.map((item) =>
        item.product._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedCart,
        total: calculateTotal(updatedCart),
      };
    }

    case CART_ACTIONS.SET_CART: {
      return {
        ...state,
        items: action.payload.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        total: calculateTotal(action.payload),
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      // Chỉ xóa các sản phẩm đã chọn
      const remainingItems = state.items.filter(
        (item) => !action.payload.includes(item.product._id) // Giữ lại các sản phẩm chưa được chọn
      );
      return {
        ...state,
        items: remainingItems,
        total: calculateTotal(remainingItems),
      };
    }

    default:
      return state;
  }
};

