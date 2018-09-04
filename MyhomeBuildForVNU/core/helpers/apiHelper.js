/**
 * parse du lieu tu json
 *
 * @param {*} responseJson
 */
import strings from "../../core/config/strings";

export const parseJsonFromApi = responseJson => {
  const response = {
    data: null,
    status: undefined,
    empty: false,
    error: false,
    networkError: false,
    message: null
  };

  if (responseJson) {
    if (
      responseJson.networkError ||
      responseJson.status === undefined ||
      responseJson.status === null
    ) {
      //network error: not connected||no wifi||
      response.networkError = true;
      response.message = strings.networkError;
    } else if (responseJson.status === 0) {
      //empty data
      response.empty = true;
      response.status = 0;
      response.message = responseJson.data.userMessage;
    } else if (responseJson.status < 0) {
      //error response
      response.status = responseJson.status;
      response.error = true;
      response.message = responseJson.data.userMessage;
    } else {
      //success||has data
      response.status = responseJson.status;
      response.data = responseJson.data;
      if (responseJson.data.userMessage) {
        response.message = responseJson.data.userMessage;
      }
    }
  }
  return response;
};
