import React from "react";
import {
  Alert,
  AsyncStorage,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { connect } from "react-redux";
import { Spinner, Text } from "native-base";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Facebook, Fingerprint, Google } from "expo";
import axios from "axios";

import { API, getApiUrl } from "../../config/server";
import {
  dispatchParams,
  getFromServer,
  postToServer
} from "../../../core/actions";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { GenerateMD5FromString } from "../../../core/helpers/MD5HashGenerator";
import { screenNames } from "../../config/screen";
import storage, { saveAccountInfo } from "../../config/storage";

import AppSignIn from "../../../core/components/Auth/AppSignIn";
import { assets } from "../../../assets";
import colors from "../../config/colors";
import metrics from "../../../core/config/metrics";
import { actionTypes } from "../../reducers";
import string from "../../config/string";
import GuiEmail from "../QuenMatKhau/GuiEmail";

class Login extends AppSignIn {
  state = {
    ...super.state,
    isLoading: true,
    showPass: false,
    showVanTay: false,
    showQuetVanTay: false,
    username: "",
    password: "",
    usernameMsg: "",
    passwordMsg: "",
    msg: " ",
    showModalGuiEmail: false
  };

  componentWillMount = () => {
    const { navigation } = this.props;
    const { state } = navigation || {};
    const { params } = state || {};
    const { dangXuat } = params || {};
    this.checkFingerprint(() => {
      if (dangXuat) {
        setTimeout(() => {
          this.props.dispatchParams(null, actionTypes.APP_USER_INFO);
        }, 100);
      } else {
        this.checkAccountStorage(this.callback);
      }
    });
  };

  checkFingerprint = async cb => {
    const vanTay = await Fingerprint.hasHardwareAsync();
    let username = await AsyncStorage.getItem(storage.username);
    let password = await AsyncStorage.getItem(storage.password);
    username = username || "";
    password = password || "";
    this.username = username;
    this.password = password;
    this.setState({ username });
    this.setState({ showVanTay: vanTay, username }, cb);
  };

  componentWillReceiveProps = nextProps => {
    const { accountInfo } = nextProps;
    if (accountInfo) {
      this.props.navigation.navigate(screenNames.APP_STACK);
    }
    this.setState({ isLoading: false, msg: " " });
  };

  callback = async account => {
    let accountInfo = account;
    const deviceToken = await this.registerForPushNotificationsAsync();
    if (accountInfo) {
      getFromServer(getApiUrl(API.LAY_THONG_TIN_TAI_KHOAN), {
        account_id: accountInfo.id,
        access_token: accountInfo.access_token,
        device_token: deviceToken,
        platform: Platform.OS === "ios" ? 1 : 2,
        is_login: 1
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        const apiStatus = propsData.status;
        accountInfo = (apiStatus === 1 && propsData.data) || accountInfo;
        //response success or network error
        if (propsData.status === 1 || propsData.networkError) {
          //dispatch for redux
          this.props.dispatchParams(
            { ...accountInfo, device_token: deviceToken },
            actionTypes.APP_USER_INFO
          );
          //save account Storage
          saveAccountInfo(accountInfo);
        } else {
          this.setState({ isLoading: false });
        }
      });
    } else {
      this.setState({ isLoading: false });
    }
  };

  cleanFB = state => {
    AsyncStorage.removeItem(storage.password);
    if (state) {
      AsyncStorage.removeItem(storage.username);
    }
  };

  submitForm = async (user, pass) => {
    let { username, password } = this.state;
    username = user || username;
    password = pass || password;
    username = username.replace(/ + /g, " ").trim();
    // const passMD5 = pass || GenerateMD5FromString(password);
    this.setState({ isLoading: true, msg: " " });
    await AsyncStorage.setItem("username", username);
    const deviceToken = await this.registerForPushNotificationsAsync();
    postToServer(getApiUrl(API.DANG_NHAP), {
      username,
      password,
      device_token: deviceToken,
      platform: Platform.OS === "ios" ? 1 : 2
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        const accountInfo = propsData.data;
        if (username !== this.username) this.cleanFB(false);
        this.props.dispatchParams(
          { ...accountInfo, device_token: deviceToken },
          actionTypes.APP_USER_INFO
        );
        //save account Storage
        saveAccountInfo(accountInfo);
      } else {
        this.setState({ isLoading: false, msg: propsData.message });
      }
    });
  };

  submit = () => {
    const { password } = this.state;
    let { username } = this.state;
    username = username.replace(/ + /g, " ").trim();
    this.checkVali(username, "username");
    this.checkVali(password, "password");
    if (!username) {
      this.setState({ msg: string.chuaNhapSDT });
      return;
    }
    if (username.length < 10 || username.length > 11) {
      this.setState({ msg: string.sdtPhai10Hoac11So });
      return;
    }
    if (isNaN(Number(username))) {
      this.setState({ msg: string.khongPhaiSdt });
      return;
    }
    if (!/^0[0-9]{9,10}$/.test(username)) {
      this.setState({ msg: string.sdtKhongDung });
      return;
    }
    if (!password) {
      this.setState({ msg: string.chuaNhapMatKhau });
      return;
    }
    if (password.length < 6 || password.length > 32) {
      this.setState({ msg: string.matKhauPhaiTu6Den32KyTu });
      return;
    }
    this.submitForm();
  };

  checkVali = (text, type) => {
    if (type === "username") {
      if (!text.replace(/ + /g, " ").trim()) {
        this.setState({ usernameMsg: string.chuaNhap });
      } else if (text.replace(/ + /g, " ").trim().length < 4) {
        this.setState({ usernameMsg: string.quaNgan });
      } else if (text.replace(/ + /g, " ").trim().length > 11) {
        this.setState({ usernameMsg: string.quaDai });
      }
    } else if (type === "password") {
      if (!text) {
        this.setState({ passwordMsg: string.chuaNhap });
      } else if (text.length < 6) {
        this.setState({ passwordMsg: string.quaNgan });
      } else if (text.length > 32) {
        this.setState({ passwordMsg: string.quaDai });
      }
    }
  };

  dangNhapFBorGG = async type => {
    this.setState({ isLoading: true, msg: " " });
    let info = null;
    if (type === "FB") {
      const FB = await Facebook.logInWithReadPermissionsAsync(
        "1835837249798925",
        { permissions: ["public_profile", "email"] }
      );
      if (FB.type === "success") {
        const response = await axios.get("https://graph.facebook.com/me", {
          params: {
            access_token: FB.token,
            fields: "name,email,picture.width(200).height(200)"
          }
        });
        info = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          avatar: response.data.picture.data.url,
          login: 1
        };
      }
    } else if (type === "GG") {
      let GG = {};
      try {
        GG = await Google.logInAsync({
          androidStandaloneAppClientId:
            "1094106824242-an7sfgoflau1frns3hamde8111fpurti.apps.googleusercontent.com",
          androidClientId:
            "603386649315-9rbv8vmv2vvftetfbvlrbufcps1fajqf.apps.googleusercontent.com",
          iosStandaloneAppClientId:
            "1094106824242-97232i9vfaogo3au9960vivc5v2lm15u.apps.googleusercontent.com",
          iosClientId:
            "603386649315-vp4revvrcgrcjme51ebuhbkbspl048l9.apps.googleusercontent.com",
          scopes: ["profile", "email"]
        });
      } catch (e) {}
      if (GG.type === "success") {
        info = {
          id: GG.user.id,
          email: GG.user.email,
          name: GG.user.name,
          avatar: GG.user.photoUrl,
          login: 2
        };
      }
    }
    if (info) {
      const deviceToken = await this.registerForPushNotificationsAsync();
      postToServer(getApiUrl(API.DANG_NHAP_MXH), {
        social_id: info.id || "",
        social_type: info.login,
        device_token: deviceToken,
        platform: Platform.OS === "ios" ? 1 : 2,
        fullname: info.name || "",
        phone: info.phone || "",
        email: info.email || "",
        image: info.avatar || ""
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          const accountInfo = propsData.data;
          this.props.dispatchParams(
            { ...accountInfo, device_token: deviceToken },
            actionTypes.APP_USER_INFO
          );
          this.cleanFB(true);
          //save account Storage
          saveAccountInfo(accountInfo);
        } else if (propsData.status === -58) {
          this.props.navigation.navigate(screenNames.CapNhatSoDienThoai, {
            info
          });
          setTimeout(() => {
            this.setState({ isLoading: false });
          }, 100);
        } else {
          this.setState({ isLoading: false, msg: propsData.message });
          Alert.alert(string.thongBao, propsData.message);
        }
      });
    } else this.setState({ isLoading: false, msg: " " });
  };

  dangNhapFP = async () => {
    const { username } = this.state;
    let vanTay = await Fingerprint.isEnrolledAsync();
    if (!vanTay) {
      Alert.alert(string.thongBao, string.banChuaDangKyVanTayTrongCaiDat, [
        { text: string.dongY }
      ]);
      return;
    }
    if (!this.password || username !== this.username) {
      Alert.alert(string.thongBao, string.dangNhapTruocRoiDangKyVanTay, [
        { text: string.dongY }
      ]);
      return;
    }
    if (Platform.OS === "android") {
      this.setState({ showQuetVanTay: true });
    }
    vanTay = await Fingerprint.authenticateAsync(
      string.xinMoiQuetVanTayDeDangNhap
    );
    if (vanTay.success) {
      this.setState({ showQuetVanTay: false, isLoading: true, msg: " " });
      this.submitForm(this.username, this.password);
    }
  };

  onOpenModal = () => {
    this.setState({ showModalGuiEmail: true });
  };

  onCloseModal = () => {
    this.setState({ showModalGuiEmail: false });
  };

  // abc = new Animated.Value(0);

  /**
   * đăng nhập ngay sau khi đăng ký
   * @param user
   * @param pass
   */
  dangNhapSDT = (user, pass) => {
    this.submitForm(user, pass);
  };

  render() {
    const {
      username,
      usernameMsg,
      password,
      passwordMsg,
      showPass,
      msg,
      isLoading,
      showVanTay,
      showQuetVanTay
    } = this.state;

    let view = (
      <View style={{ alignItems: "center" }}>
        <Text style={styles.message}>{msg}</Text>

        <View
          style={[
            styles.viewInput,
            { marginBottom: 15, borderColor: !usernameMsg ? undefined : "#f00" }
          ]}
        >
          <Feather
            name="phone"
            style={{
              fontSize: 20,
              color: !usernameMsg ? colors.brandPrimary : "#f00"
            }}
          />
          <TextInput
            ref="inputUsername"
            underlineColorAndroid="transparent"
            style={styles.textInput}
            placeholder={string.soDienThoai}
            keyboardType="phone-pad"
            value={username}
            onChangeText={text =>
              this.setState({
                username: text,
                usernameMsg: "",
                msg: " "
              })
            }
            onEndEditing={event =>
              this.checkVali(event.nativeEvent.text, "username")
            }
            onSubmitEditing={() => this.refs.inputPassword.focus()}
          />
          {!!usernameMsg && (
            <Text style={{ marginLeft: 10, color: "#f00", fontSize: 12 }}>
              {usernameMsg}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.viewInput,
            { marginBottom: 25, borderColor: !passwordMsg ? undefined : "#f00" }
          ]}
        >
          <Feather
            name="unlock"
            style={{
              fontSize: 20,
              color: !passwordMsg ? colors.brandPrimary : "#f00"
            }}
          />
          <TextInput
            ref="inputPassword"
            underlineColorAndroid="transparent"
            style={styles.textInput}
            placeholder={string.matKhau}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={text =>
              this.setState({
                password: text,
                passwordMsg: "",
                msg: " "
              })
            }
            onEndEditing={event =>
              this.checkVali(event.nativeEvent.text, "password")
            }
            onSubmitEditing={this.submit}
          />
          {!!passwordMsg && (
            <Text
              style={{
                marginHorizontal: 10,
                color: "#f00",
                fontSize: 12
              }}
            >
              {passwordMsg}
            </Text>
          )}
          <TouchableWithoutFeedback
            onPress={() => this.setState({ showPass: !showPass })}
          >
            <Feather
              name={showPass ? "eye-off" : "eye"}
              style={{
                fontSize: 20,
                color: !passwordMsg ? colors.brandPrimary : "#f00"
              }}
            />
          </TouchableWithoutFeedback>
        </View>
        <TouchableWithoutFeedback onPress={this.submit}>
          <View style={styles.viewBtnAuth}>
            <Text style={styles.btnAuth}>{string.dangNhap}</Text>
          </View>
        </TouchableWithoutFeedback>
        {showVanTay && (
          <TouchableWithoutFeedback onPress={this.dangNhapFP}>
            <Ionicons
              name="ios-finger-print"
              style={{ fontSize: 40, color: colors.brandPrimary }}
            />
          </TouchableWithoutFeedback>
        )}
        {/*<View*/}
          {/*style={{*/}
            {/*flexDirection: "row",*/}
            {/*marginTop: 10,*/}
            {/*marginBottom: 15*/}
          {/*}}*/}
        {/*>*/}
          {/*<TouchableWithoutFeedback*/}
            {/*onPress={this.dangNhapFBorGG.bind(this, "FB")}*/}
          {/*>*/}
            {/*<Image*/}
              {/*resizeMode="contain"*/}
              {/*style={{*/}
                {/*borderRadius: 5,*/}
                {/*width: 40,*/}
                {/*height: 40,*/}
                {/*marginRight: 10*/}
              {/*}}*/}
              {/*source={assets.icFacebook}*/}
            {/*/>*/}
          {/*</TouchableWithoutFeedback>*/}
          {/*<TouchableWithoutFeedback*/}
            {/*onPress={this.dangNhapFBorGG.bind(this, "GG")}*/}
          {/*>*/}
            {/*<Image*/}
              {/*resizeMode="contain"*/}
              {/*style={{ borderRadius: 5, width: 40, height: 40 }}*/}
              {/*source={assets.icGoogle}*/}
            {/*/>*/}
          {/*</TouchableWithoutFeedback>*/}
        {/*</View>*/}

        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate(screenNames.DangKySDT, {
              onGoBack: this.dangNhapSDT
            })
          }
          style={{ marginTop: 50 }}
        >
          <Text style={styles.viewDangKy}>{string.dangKy}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onOpenModal}>
          <Text style={{ color: colors.brandPrimary, fontSize: 15 }}>
            {string.quenMatKhau}
          </Text>
        </TouchableOpacity>
      </View>
    );

    if (isLoading) view = <Spinner />;

    return (
      <KeyboardAvoidingView
        style={{ backgroundColor: colors.windowBackground }}
        enabled={Platform.OS === "ios"}
        behavior="padding"
        flex={1}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.viewLogo}>
            <View style={{ alignItems: "center" }}>
              <Image
                resizeMode="contain"
                style={styles.logo}
                source={assets.logo}
              />
              {/*<Image*/}
                {/*style={styles.textLogo}*/}
                {/*resizeMode="contain"*/}
                {/*source={assets.imTextMyHome}*/}
              {/*/>*/}
            </View>
            {view}
          </View>
        </ScrollView>
        <Modal
          transparent
          visible={showQuetVanTay}
          onRequestClose={() => {}}
          animationType="fade"
        >
          <View style={styles.modalQuetVanTay}>
            <View style={styles.viewQuetVanTay}>
              <Text style={styles.textXacThucVanTay}>
                {string.xacThucVanTay}
              </Text>
              <Text style={styles.textQuetVanTay}>
                {string.xinMoiQuetVanTayDeDangNhap}
              </Text>
              <Ionicons name="ios-finger-print" style={styles.iconVanTay} />
              <TouchableWithoutFeedback
                onPress={() => {
                  this.setState({ showQuetVanTay: false });
                  Fingerprint.cancelAuthenticate();
                }}
              >
                <View style={styles.viewHuy}>
                  <Text style={styles.textHuy}>{string.huy}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>

        <GuiEmail
          visible={this.state.showModalGuiEmail}
          onClose={this.onCloseModal}
        />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white"
  },
  viewLogo: {
    width: "80%",
    height: metrics.DEVICE_HEIGHT,
    justifyContent: "center"
  },
  logo: {
    marginBottom: 15,
    width: 80,
    height: 80
  },
  textLogo: {
    marginBottom: 25,
    height: 40
  },
  modalQuetVanTay: {
    flex: 1,
    backgroundColor: "#0004",
    justifyContent: "center",
    alignItems: "center"
  },
  viewQuetVanTay: {
    width: 300,
    padding: 10,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10
  },
  textXacThucVanTay: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 15
  },
  textQuetVanTay: {
    fontSize: 15,
    color: "gray",
    marginBottom: 10
  },
  iconVanTay: {
    fontSize: 50,
    color: colors.brandPrimary
  },
  viewHuy: {
    padding: 5,
    paddingHorizontal: 30
  },
  textHuy: {
    color: "#2598F3",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 15
  },
  message: {
    color: "#f00",
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center"
  },
  viewInput: {
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 0.7,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10
  },
  viewBtnAuth: {
    width: "100%",
    height: 42,
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: colors.brandPrimary,
    justifyContent: "center",
    alignItems: "center"
  },
  btnAuth: {
    color: "#fff",
    fontSize: 15
  },
  viewDangKy: {
    marginBottom: 10,
    color: colors.brandPrimary,
    fontSize: 15
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  {
    dispatchParams
  }
)(Login);
