// rEGISTER USER
import axios from "axios";
import { GET_ERRORS, SET_CURRENT_USER } from "./types";
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(res => history.push("/login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Login - Get user token
export const registerUser = (userData) => dispatch => {
    axios
      .post("/api/users/login", userData)
      .then(res =>{
            // Save to local storage
            const {token} = res.data;
            localStorage.setItem("jwtToken", token);
            
            // Set token to Auth header
            setAuthToken(token);

            // Decode Token to get user data
            const decoded = jwt_decode(token);

            // Set current user
            dispatch(setCurrentUser(decoded));
        })
      .catch(err =>
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
      );
  };

  // Set logged in user using a redux dispatch
  export const setCurrentUser = (decoded) => {
      return {
        type: SET_CURRENT_USER,
        payload: decoded
      }
  }
