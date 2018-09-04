import React from "react";
import { connect } from "react-redux";
import { Platform } from "react-native";

import { API, getApiUrl } from "../../config/server";
import AppSignIn from "../../../core/components/Auth/AppSignIn";
import { screenNames } from "../../config/screen";
import { saveAccountInfo } from "../../config/storage";
import { dispatchParams, getFromServer } from "../../../core/actions";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import screens from "../../../core/config/screens";

const platform = Platform.OS === "ios" ? 1 : 2;

const getUserInfoParams = accountInfo => ({
  account_id: accountInfo.id,
  access_token: accountInfo.access_token,
  device_token: accountInfo.device_token,
  platform
});

class AuthLoading extends AppSignIn {
  componentWillMount() {
    this.checkAccountStorage(this.callback);
  }

  callback = account => {
    let accountInfo = account;
    if (accountInfo) {
      getFromServer(
        getApiUrl(API.LAY_THONG_TIN_TAI_KHOAN),
        getUserInfoParams(accountInfo)
      ).then(response => {
        const apiRes = parseJsonFromApi(response);
        const apiStatus = apiRes.status;
        accountInfo = (apiStatus === 1 && apiRes.data) || accountInfo;
        //response success or network error
        if (apiRes.status === 1 || apiRes.networkError) {
          //dispatch for redux
          this.props.dispatchParams(accountInfo, this.userInfoType);

          //save account Storage
          saveAccountInfo(accountInfo);

          setTimeout(
            () => this.props.navigation.navigate(screenNames.APP_STACK),
            1000
          );
        } else {
          this.props.dispatchParams(accountInfo, this.userInfoType);

          //save account Storage
          saveAccountInfo(accountInfo);

          setTimeout(
            () => this.props.navigation.navigate(screenNames.APP_STACK),
            1000
          );
          //error
          // this.props.navigation.navigate(screens.APP_AUTH_SCREEN);
        }
      });
    } else {
      //go to login screen
      this.props.navigation.navigate(screens.APP_AUTH_SCREEN);
    }
  };

  render() {
    return this.renderView("loading");
  }
}

export default connect(
  null,
  { dispatchParams }
)(AuthLoading);
