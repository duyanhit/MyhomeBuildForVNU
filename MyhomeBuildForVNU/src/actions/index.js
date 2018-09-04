import { dispatchParams as dispatchParam } from "../../core/actions";

export const dispatchParams = dispatchParam;

export const dispatchBadgeNumber = (type, payload) => dispatch => {
  dispatch({ type, payload });
};
