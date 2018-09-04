import { combineReducers } from "redux";
import { reducer as form } from "redux-form";

import { accountReducer, accountActionTypes } from "../../core/reducers";

export const actionTypes = {
  ...accountActionTypes,
  BADGE_CHANGE: "BadgeChange",
  NOTIFICATION_CHANGE: "NotificationChange"
};

const countBadgeReducer = (state = null, action) => {
  switch (action.type) {
    case actionTypes.BADGE_CHANGE:
      return action.payload;
    default:
      return state;
  }
};

const countNotificationReducer = (state = null, action) => {
  switch (action.type) {
    case actionTypes.NOTIFICATION_CHANGE:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  form,
  accountReducer,
  countBadgeReducer,
  countNotificationReducer
});
