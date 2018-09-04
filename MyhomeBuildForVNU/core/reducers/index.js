import { combineReducers } from "redux";

export const accountActionTypes = {
  APP_SIGN_IN: "APP.AppSignIn",
  APP_USER_INFO: "APP.UserInfo",
  APP_SIGN_OUT: "APP.SignOut",
  APP_SIGN_OUT_CONFIG: "APP.SignOutConfig"
};

export const accountReducer = (state = null, action) => {
  switch (action.type) {
    case accountActionTypes.APP_SIGN_IN:
    case accountActionTypes.APP_USER_INFO:
      return action.payload;
    case accountActionTypes.APP_SIGN_OUT:
      return null;
    default:
      return state;
  }
};

export default combineReducers({
  accountReducer
});
