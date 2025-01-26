import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./reducers/userReducer"; // Import userReducer
import { cartReducer } from "./reducers/cartReducer"; // Nếu có cartReducer

const rootReducer = combineReducers({
  user: userReducer, 
  cart: cartReducer, 
});

const middleware = [thunk];

const store = createStore(rootReducer, applyMiddleware(...middleware));

export default store;
