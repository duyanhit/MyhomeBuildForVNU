import React from "react";
import {
  Alert,
  AsyncStorage,
  FlatList,
  Image,
  Platform,
  StyleSheet
} from "react-native";
import { Body, Container, Content, ListItem, Text, View } from "native-base";
import { connect } from "react-redux";

import { API, getApiUrl } from "../config/server";
import AppComponent from "../../core/components/AppComponent";
import { screenNames } from "../config/screen";
// import strings from "../../core/config/strings";
import { consoleLog } from "../../core/components/AppLog";
import { parseJsonFromApi } from "../../core/helpers/apiHelper";
import screens from "../../core/config/screens";
import colors from "../../core/config/colors";
import { assets } from "../../assets";
import strings from "../config/string";
import storage from "../config/storage";
import ModalDoiMatKhau from "../screens/Modal/ModalDoiMatKhau";
import ProgressDialog from "../../core/components/ProgressDialog";

class SideBar extends AppComponent {
  accSideArr = [
    {
      name: strings.thongBao,
      screen: screenNames.ThongBaoList,
      icon: "ios-person-outline",
      image: assets.icMail
    },
    {
      name: strings.duyetTaiKhoan,
      screen: screenNames.DuyetTkMain,
      icon: "ios-person-outline",
      image: assets.icDuyeTtaiKhoan,
      badge: 10
    },
    {
      name: strings.doiMatKhau,
      screen: "DoiMatKhau",
      icon: "ios-person-outline",
      image: assets.icLock
    },
    {
      name: strings.logout,
      screen: screenNames.SignOut,
      icon: "ios-log-out-outline",
      image: assets.icLogout
    }
  ];

  state = {
    badgeInfo: null,
    dialogVisible: false,
    loadingDialogVisible: false,
    currPass: "",
    newPass: "",
    renewPass: "",
    currPassError: false,
    newPassError: false,
    renewPassError: false
  };

  onConfirmPress = () => {
    if (this.state.currPass.length === 0) {
      this.setState(
        {
          dialogVisible: false,
          currPassError: true,
          newPassError: false,
          renewPassError: false
        },
        this.showAlertDialog(strings.passwordRequired, () => {
          this.setState({ dialogVisible: true });
        })
      );
    } else if (this.state.newPass.length < 6) {
      this.setState(
        {
          dialogVisible: false,
          currPassError: false,
          newPassError: true,
          renewPassError: false
        },
        this.showAlertDialog(strings.matKhauMoiMinError, () => {
          this.setState({ dialogVisible: true });
        })
      );
    } else if (this.state.newPass !== this.state.renewPass) {
      this.setState(
        {
          dialogVisible: false,
          currPassError: false,
          newPassError: false,
          renewPassError: true
        },
        this.showAlertDialog(strings.xacNhanMatKhauNotMatch, () => {
          this.setState({ dialogVisible: true });
        })
      );
    } else {
      this.setState(
        {
          currPassError: false,
          newPassError: false,
          renewPassError: false,
          dialogVisible: false
        },
        Alert.alert(
          strings.thongBao,
          `${strings.doiMatKhau}?`,
          [
            {
              text: strings.huy,
              onPress: () => {
                this.setState({ dialogVisible: true });
              }
            },
            {
              text: strings.dongY,
              onPress: () => {
                this.setState({ dialogVisible: false }, this.doiMatKhau());
              }
            }
          ],
          { cancelable: false }
        )
      );
    }
  };

  onCancelPress = () => {
    this.setState({ dialogVisible: false });
  };

  showAlertDialog = (message, onPress) => {
    Alert.alert(
      strings.thongBao,
      message,
      [{ text: strings.dongY, onPress: onPress }],
      { cancelable: false }
    );
  };

  doiMatKhau = () => {
    this.setState({ loadingDialogVisible: true });
    const accountInfo = this.props.accountInfo;

    this.postToServerWithAccount(getApiUrl(API.DOI_MAT_KHAU), {
      apartment: accountInfo.apartment_id,
      fullname: accountInfo.fullname,
      password: this.state.newPass,
      password_current: this.state.currPass,
      app_type: 2
    }).then(responseJson => {
      this.setState({ loadingDialogVisible: false });
      const result = parseJsonFromApi(responseJson);
      const mess =
        result.status === 1 ? strings.doiMatKhauThanhCong : result.message;
      this.showAlertDialog(mess, () => {
        if (result.status === 1) {
          this.setState({ dialogVisible: false });
        } else {
          this.setState({ dialogVisible: true });
        }
      });
    });
  };

  callSignOut = async navigation => {
    try {
      this.postToServerWithAccount(getApiUrl(API.DANG_XUAT), {
        device_token: "device_token",
        platform: Platform.OS === "ios" ? 1 : 2
        // apartment: this.props.accountInfo.apartment_id,
        // app_type: 2
      }).then(response => {
        const apiRes = parseJsonFromApi(response);
        // consoleLog(response, " logunt");
        if (apiRes.status.toString() === "1") {
          AsyncStorage.removeItem(storage.accountInfo);
        } else {
          Alert.alert(strings.titleError, apiRes.message);
        }
      });
      navigation.navigate(screens.APP_AUTH_SCREEN);
    } catch (error) {
      consoleLog(error, "appSignOut");
    }
  };

  renderItem = ({ item, index }) => {
    let onPress;
    if (item.screen === screenNames.SignOut) {
      onPress = () =>
        Alert.alert(strings.signOutTitlte, strings.signOutConfirmMessage, [
          {
            text: strings.signOutNavigate
          },
          {
            text: strings.signOutPostive,
            onPress: () => {
              this.callSignOut(this.props.navigation);
            }
          }
        ]);
    } else if (item.screen === "DoiMatKhau") {
      onPress = () => {
        this.setState({
          dialogVisible: true,
          currPass: "",
          newPass: "",
          renewPass: "",
          currPassError: false,
          newPassError: false,
          renewPassError: false
        });
      };
    } else {
      onPress = () => this.props.navigation.navigate(item.screen, {});
    }

    return (
      <ListItem
        button
        onPress={onPress}
        icon
        style={{ marginVertical: 5, marginTop: index === 0 ? 10 : undefined }}
      >
        <Image
          source={item.image}
          style={{ width: 30, height: 30, marginRight: 15 }}
        />
        <Body style={{ borderBottomWidth: 0 }}>
          <Text>{item.name}</Text>
        </Body>
        {item.badge ? (
          <View
            style={{
              borderRadius: 50,
              borderWidth: 1,
              borderColor: "#f00",
              paddingHorizontal: 5,
              paddingTop: 1,
              marginRight: 15
            }}
          >
            <Text style={{ color: "#f00", fontSize: 11 }}>{item.badge}</Text>
          </View>
        ) : null}
      </ListItem>
    );
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      badgeInfo: nextProps.badgeInfo
    });
  }

  render() {
    const menuArray = this.accSideArr.map(route => {
      if (route.screen === screenNames.DuyetTkMain) {
        route = {
          ...route,
          badge: this.state.badgeInfo ? this.state.badgeInfo.resident : null
        };
      }
      return route;
    });

    return (
      <Container>
        <Content>
          <ProgressDialog
            message={strings.vuiLongCho}
            visible={this.state.loadingDialogVisible}
          />
          <View
            style={{
              height: 200,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.brandPrimary
            }}
          >
            <Image
              style={{ position: "absolute", height: "100%", width: "100%" }}
              resizeMode="stretch"
              source={assets.imBackgroundMenu}
            />
            <Image
              style={{ position: "absolute", height: "100%", width: "100%" }}
              resizeMode="stretch"
              source={{
                uri: `${API.HOST}${
                  this.props.accountInfo
                    ? this.props.accountInfo.apartment_image
                    : ""
                }`
              }}
            />
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "#0004"
              }}
            />
            <Image
              style={{ height: 80, width: 80, marginBottom: 10 }}
              resizeMode="contain"
              source={assets.avatarDefault}
            />
            <Text style={{ color: "#fff" }}>
              {this.props.accountInfo ? this.props.accountInfo.fullname : ""}
            </Text>
            <Text style={{ color: "#fff" }}>
              {this.props.accountInfo
                ? this.props.accountInfo.apartment_name
                : ""}
            </Text>
          </View>
          <FlatList
            data={menuArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this.renderItem}
          />
          <ModalDoiMatKhau
            visible={this.state.dialogVisible}
            onConfirmPress={this.onConfirmPress}
            onCancelPress={this.onCancelPress}
            onChangetextCurPass={text => {
              this.setState({ currPass: text });
            }}
            onChangetextNewPass={text => {
              this.setState({ newPass: text });
            }}
            onChangetextRenewPass={text => {
              this.setState({ renewPass: text });
            }}
            curPassValue={this.state.currPass}
            newPassValue={this.state.newPass}
            renewPassValue={this.state.renewPass}
            curPassError={this.state.currPassError}
            newPassError={this.state.newPassError}
            renewPassError={this.state.renewPassError}
          />
        </Content>
      </Container>
    );
  }
}

export default connect(state => ({ accountInfo: state.accountReducer }))(
  SideBar
);
