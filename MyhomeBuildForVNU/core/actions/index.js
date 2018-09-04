import axios from "axios";
import { consoleLog } from "core/components/AppLog";

/**
 * response from api
 * @param {*} data
 * @param {*} type
 */
export const responseFromApi = (data, type) => ({ type, payload: data });

/**
 * error network
 * @param {*} type
 */
export const responseNetworkError = type => ({
  type,
  payload: { networkError: true }
});

/**
 * dispatch response from api GET
 * @param {*} apiURL
 * @param {*} data
 */
export const dispatchDataFromApiGet = (apiURL, data, type) => dispatch => {
  axios
    .get(apiURL, { params: data })
    .then(response => {
      if (type) dispatch(responseFromApi(response.data, type));
    })
    .catch(error => {
      if (type) dispatch(responseNetworkError(type));
    });
};

/**
 * dispatch response from api POST
 * @param {*} apiURL
 * @param {*} data
 * @param {*} type
 */
export const dispatchDataFromApiPost = (apiURL, data, type) => dispatch => {
  axios
    .post(apiURL, data)
    .then(response => {
      if (type) dispatch(responseFromApi(response.data, type));
    })
    .catch(error => {
      if (type) dispatch(responseNetworkError(type));
    });
};

export const dispatchParams = (data, type) => dispatch => {
  dispatch(responseFromApi(data, type));
};

/**
 *
 * @param apiURL
 * @param data
 * @returns {Promise<AxiosResponse<any> | {networkError: boolean}>}
 */
export const postToServer = (apiURL, data) => {
  consoleLog(data, apiURL);
  return axios
    .post(apiURL, data)
    .then(response => {
      // consoleLog(response);
      return response.data;
    })
    .catch(error => {
      consoleLog(error);
      return { networkError: true };
    });
};

/**
 *
 * @param apiURL
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getFromServer = (apiURL, data) => {
  consoleLog(data, apiURL);
  let getParams = { pakage: "app.package" };
  if (data) {
    getParams = { ...getParams, ...data };
  }
  return axios
    .get(apiURL, { params: getParams })
    .then(response => {
      // consoleLog(response);
      return response.data;
    })
    .catch(error => {
      consoleLog(error);
      return { networkError: true };
    });
};
