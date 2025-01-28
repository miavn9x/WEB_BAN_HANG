import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./reducers/userReducer";
import { cartReducer } from "./reducers/cartReducer"; // Import named export


const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
});

const middleware = [thunk];

const store = createStore(rootReducer, applyMiddleware(...middleware));

export default store;
