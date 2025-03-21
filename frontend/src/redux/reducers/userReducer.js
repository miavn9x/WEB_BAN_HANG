// src/redux/reducers/userReducer.js
const initialState = {
  info: null,
  loading: false,
  error: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER_PROFILE":
      return {
        ...state,
        info: action.payload,
        loading: false,
        error: null,
      };
    case "SET_USER_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return { ...initialState }; // Reset state khi logout
    default:
      return state;
  }
};

export default userReducer;
