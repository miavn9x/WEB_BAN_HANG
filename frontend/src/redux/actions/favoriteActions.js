// src/ redux1/actions/favoriteActions.js
import { FAVORITE_ACTIONS } from "../constants/actionTypes";
import axios from "axios";

export const addToFavorites = (product) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `/api/favorites`,
      { productId: product._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({
      type: FAVORITE_ACTIONS.ADD_TO_FAVORITES,
      payload: product,
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
  }
};

export const removeFromFavorites = (productId) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/api/favorites/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({
      type: FAVORITE_ACTIONS.REMOVE_FROM_FAVORITES,
      payload: productId,
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
  }
};

export const fetchFavorites = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`/api/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({
      type: FAVORITE_ACTIONS.SET_FAVORITES,
      payload: response.data.favorites,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
};
