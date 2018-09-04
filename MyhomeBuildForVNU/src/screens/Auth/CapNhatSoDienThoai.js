import React from "react";
import {
  TouchableWithoutFeedback,
  Platform,
  View,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Image,
  AsyncStorage,
  Modal,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { Text, Spinner } from "native-base";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Notifications, Permissions, Constants } from "expo";

import { API, getApiUrl } from "../../config/server";
import { actionTypes } from "../../reducers";
import AppHeader from "../../../core/components/AppHeader";
import { postToServer, dispatchParams } from "../../../core/actions";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import storage, { saveAccountInfo } from "../../config/storage";

import { assets } from "../../../assets";
import colors from "../../config/colors";
import metrics from "../../../core/config/metrics";
import config from "../../../core/config";
import string from "../../config/string";
import { GenerateMD5FromString } from "../../../core/helpers/MD5HashGenerator";

class CapNhatSoDienThoai extends React.Component {
  state = {
    isLoading: false,
    soDT: "",
    SoDTMsg: "",
    msg: " ",
    info: this.props.navigation.state.params.info,
    email: this.props.navigation.state.params.info.email,
    visibleModalSyncPhone: false,
    visibleModalSyncEmail: false,
    visibleModalPassword: false,
    msgPassword: "",
    msgPass: "",
    showPassword: false,
    password: "",
    msgEmail1: "",
    msgEmail2: "",
    visibleModalEmail: false,
    response: undefined,
    accountSyncId: "",
    accountSyncUpdate: "",
    visibleModalOverwrite: false
  };

  cleanFB = state => {
    AsyncStorage.removeItem(storage.password);
    if (state) {
      AsyncStorage.removeItem(storage.username);
    }
  };

  registerForPushNotificationsAsync = async () => {
    let permission = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }
    if (Constants.isDevice && permission.status === "granted") {
      const deviceToken = await Notifications.getExpoPushTokenAsync();
      return deviceToken;
    }
    return null;
  };

  submitForm = async () => {
    this.setState({
      isLoading: true,
      msg: "",
      visibleModalPassword: false,
      msgPassword: "",
      msgPass: "",
      showPassword: false,
      visibleModalEmail: false,
      msgEmail1: "",
      msgEmail2: ""
    });
    const {
      info,
      soDT,
      password,
      email,
      accountSyncId,
      accountSyncUpdate
    } = this.state;
    const deviceToken = await this.registerForPushNotificationsAsync();
    postToServer(getApiUrl(API.DANG_NHAP_MXH), {
      social_id: info.id || "",
      social_type: info.login,
      device_token: deviceToken,
      platform: Platform.OS === "ios" ? 1 : 2,
      fullname: info.name || "",
      phone: soDT || "",
      email: email ? email.trim() : "",
      image: info.avatar || "",
      password: password ? password.trim() : "",
      account_sync_id: accountSyncId || "",
      account_sync_update: accountSyncUpdate || ""
    }).then(response => {
      this.setState({ response: response.data });
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
      } else if (propsData.status === -77) {
        // trùng số điện thoại
        this.openModalSyncPhone();
        this.setState({ isLoading: false, msg: string.sdtDaDuocSuDung });
      } else if (propsData.status === -2) {
        // trùng email
        this.openModalSyncEmail();
        this.setState({ isLoading: false, msg: string.emailDaDuocSuDung });
      } else if (propsData.status === -62) {
        // sai mật khẩu xác nhận
        this.openModalPassword();
        this.setState({
          isLoading: false,
          msgPassword: propsData.message,
          msg: propsData.message,
          password: ""
        });
      } else if (propsData.status === -80) {
        // chọn ghi đè thông tin hoặc không
        this.openModalOverwrite();
      } else {
        this.setState({
          isLoading: false,
          msg: propsData.message,
          password: "",
          soDT: "",
          accountSyncId: "",
          accountSyncUpdate: "",
          email: this.props.navigation.state.params.info.email,
          visibleModalPassword: false,
          visibleModalEmail: false,
          visibleModalSyncPhone: false,
          msgPassword: "",
          msgPass: "",
          showPassword: false,
          msgEmail1: "",
          msgEmail2: "",
          response: undefined
        });
      }

      this.setState({ isLoading: false });
    });
  };

  submit = () => {
    const { soDT } = this.state;
    if (!soDT) {
      this.setState({ msg: string.chuaNhapSDT });
      return;
    }
    if (soDT.length < 10 || soDT.length > 11) {
      this.setState({ msg: string.sdtPhai10Hoac11So });
      return;
    }
    if (soDT.charAt(0).toString() !== "0") {
      this.setState({ msg: string.sdtKhongHopLe });
      return;
    }
    if (isNaN(Number(soDT))) {
      this.setState({ msg: string.sdtKhongHopLe });
      return;
    }
    if (!/^0[0-9]{9,10}$/.test(soDT)) {
      this.setState({ msg: string.sdtKhongHopLe });
      return;
    }
    this.submitForm();
  };

  submitPassword = () => {
    const { password } = this.state;
    if (!password) {
      this.setState({ msgPassword: string.chuaNhapMatKhau });
      return;
    }
    this.submitForm();
  };

  submitEmail = () => {
    const { email } = this.state;
    this.checkVali(email);
    if (!email) {
      this.setState({ msgEmail1: string.chuaNhapEmail });
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      this.setState({ msgEmail1: string.emailKhongHopLe });
      return;
    }
    this.submitForm();
  };

  checkVali = (text, type) => {
    if (type === "soDT") {
      if (!text.replace(/ + /g, " ").trim()) {
        this.setState({ SoDTMsg: string.chuaNhap });
      } else if (text.replace(/ + /g, " ").trim().length < 4) {
        this.setState({ SoDTMsg: string.quaNgan });
      } else if (text.replace(/ + /g, " ").trim().length > 11) {
        this.setState({ SoDTMsg: string.quaDai });
      }
    } else if (type === "password") {
      if (!text) {
        this.setState({ msgPass: string.chuaNhap });
      } else if (text.length < 6) {
        this.setState({ msgPass: string.quaNgan });
      } else if (text.length > 32) {
        this.setState({ msgPass: string.quaDai });
      }
    } else if (type === "email") {
      if (!text) {
        this.setState({ msgEmail2: string.chuaNhap });
      }
    }
  };

  openModalSyncPhone = () => {
    this.setState({ visibleModalSyncPhone: true });
  };

  closeModalSyncPhone = () => {
    this.setState({ visibleModalSyncPhone: false });
  };

  openModalSyncEmail = () => {
    this.setState({ visibleModalSyncEmail: true });
  };

  closeModalSyncEmail = () => {
    this.setState({ visibleModalSyncEmail: false });
  };

  openModalPassword = () => {
    this.setState({ visibleModalPassword: true });
  };

  closeModalPassword = () => {
    this.setState({
      visibleModalPassword: false,
      msgPass: "",
      msgPassword: "",
      password: "",
      showPassword: false,
      accountSyncId: ""
    });
  };

  openModalEmail = () => {
    this.setState({ visibleModalEmail: true, email: "" });
  };

  closeModalEmail = () => {
    this.setState({
      visibleModalEmail: false,
      email: this.props.navigation.state.params.info.email,
      msgEmail1: "",
      msgEmail2: ""
    });
  };

  openModalOverwrite = () => {
    this.setState({ visibleModalOverwrite: true });
  };

  closeModalOverwrite = () => {
    this.setState({ visibleModalOverwrite: false });
  };

  render() {
    const {
      response,
      soDT,
      SoDTMsg,
      msg,
      isLoading,
      info,
      visibleModalSyncPhone,
      visibleModalSyncEmail,
      visibleModalPassword,
      msgPassword,
      msgPass,
      showPassword,
      password,
      visibleModalEmail,
      email,
      msgEmail1,
      msgEmail2,
      visibleModalOverwrite
    } = this.state;

    let view = (
      <View style={{ alignItems: "center", width: "100%" }}>
        <Text
          style={{
            color: "#f00",
            fontSize: 14,
            marginBottom: 5,
            textAlign: "center"
          }}
        >
          {msg}
        </Text>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            borderWidth: 0.7,
            borderRadius: 25,
            paddingVertical: 10,
            paddingHorizontal: 15,
            marginBottom: 25,
            borderColor: !SoDTMsg ? undefined : "#f00"
          }}
        >
          <Feather
            name="phone"
            style={{
              fontSize: 20,
              color: !SoDTMsg ? colors.brandPrimary : "#f00"
            }}
          />
          <TextInput
            keyboardType="phone-pad"
            underlineColorAndroid="transparent"
            style={{ flex: 1, fontSize: 15, marginLeft: 10 }}
            placeholder={string.nhapSdt}
            value={soDT}
            onChangeText={text =>
              this.setState({ soDT: text, SoDTMsg: "", msg: " " })
            }
            onEndEditing={event =>
              this.checkVali(event.nativeEvent.text, "soDT")
            }
            onSubmitEditing={this.submit}
          />
          {!!SoDTMsg && (
            <Text
              style={{
                marginHorizontal: 10,
                color: "#f00",
                fontSize: 12
              }}
            >
              {SoDTMsg}
            </Text>
          )}
        </View>
        <TouchableWithoutFeedback onPress={this.submit}>
          <View
            style={{
              width: "100%",
              height: 42,
              borderRadius: 25,
              marginBottom: 15,
              backgroundColor: colors.brandPrimary,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15 }}>
              {string.hoanThanh}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );

    if (isLoading) view = <Spinner />;

    return (
      <KeyboardAvoidingView
        enabled={Platform.OS === "ios"}
        behavior="padding"
        flex={1}
      >
        <AppHeader
          left
          navigation={this.props.navigation}
          title={string.hoanTatDangNhap}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Image
              resizeMode="contain"
              style={styles.avatar}
              source={info.avatar ? { uri: info.avatar } : assets.avatarDefault}
            />
            <Text>{info.name || string.chuaCoTen}</Text>
            <Text style={styles.textEmail}>
              {info.email || string.chuaCoEmail}
            </Text>
            {view}
          </View>
        </ScrollView>

        {response && (
          <Modal
            transparent
            animationType="fade"
            visible={visibleModalSyncPhone}
            onRequestClose={() => {}}
          >
            <View style={styles.viewModal}>
              <View style={styles.viewContentModal}>
                <Text style={styles.titleModal}>{string.sdtBiTrung}</Text>

                <Image
                  resizeMode="contain"
                  style={styles.avatar}
                  source={
                    response.avatar
                      ? { uri: response.avatar }
                      : assets.avatarDefault
                  }
                />

                <Text>
                  {response && response.fullname
                    ? response.fullname
                    : string.chuaCoTen}
                </Text>

                <Text style={styles.textEmail}>
                  {response && response.email
                    ? response.email
                    : string.chuaCoEmail}
                </Text>

                <View style={{ width: "100%" }}>
                  <Text>{string.banCoMuonDongBoTaiKhoan}</Text>
                </View>

                <View style={styles.viewButton}>
                  <TouchableOpacity
                    onPress={this.closeModalSyncPhone}
                    style={[config.styles.button.huy, styles.buttonLeft]}
                  >
                    <Text style={config.styles.text.btnCancelText}>
                      {string.huy}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ accountSyncId: response.id });
                      this.closeModalSyncPhone();
                      this.openModalPassword();
                    }}
                    style={[config.styles.button.xacNhan, styles.buttonRight]}
                  >
                    <Text style={config.styles.text.btnConfirmText}>
                      {string.dongBo}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {response && (
          <Modal
            transparent
            animationType="fade"
            visible={visibleModalSyncEmail}
            onRequestClose={() => {}}
          >
            <View style={styles.viewModal}>
              <View style={styles.viewContentModal}>
                <Text style={styles.titleModal}>{string.emailBiTrung}</Text>

                <Image
                  resizeMode="contain"
                  style={styles.avatar}
                  source={
                    response && response.avatar
                      ? { uri: response.avatar }
                      : assets.avatarDefault
                  }
                />

                <Text>
                  {response && response.fullname
                    ? response.fullname
                    : string.chuaCoTen}
                </Text>

                <Text style={styles.textEmail}>
                  {response && response.email
                    ? response.email
                    : string.chuaCoEmail}
                </Text>

                <View style={{ width: "100%" }}>
                  <Text>{string.banCoMuonThayDoiEmail}</Text>
                </View>

                <View style={styles.viewButton}>
                  <TouchableOpacity
                    onPress={() => {
                      this.closeModalSyncEmail();
                    }}
                    style={[config.styles.button.huy, styles.buttonLeft]}
                  >
                    <Text style={config.styles.text.btnCancelText}>
                      {string.huy}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.closeModalSyncEmail();
                      this.openModalEmail();
                    }}
                    style={[config.styles.button.xacNhan, styles.buttonRight]}
                  >
                    <Text style={config.styles.text.btnConfirmText}>
                      {string.thayDoiEmail}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        <Modal
          transparent
          animationType="fade"
          visible={visibleModalPassword}
          onRequestClose={() => {}}
        >
          <View style={styles.viewModal}>
            <View style={styles.viewContentModal}>
              <Text style={styles.titleXacNhan}>{string.xacNhanMatKhau}</Text>

              <Text style={styles.textMessage}>{msgPassword}</Text>

              <View
                style={[
                  styles.viewInput,
                  { borderColor: !msgPass ? undefined : "#f00" }
                ]}
              >
                <Feather
                  name="unlock"
                  style={{
                    color: !msgPass ? colors.brandPrimary : "#f00",
                    fontSize: 20
                  }}
                />
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  placeholder={string.matKhau}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={text =>
                    this.setState({
                      password: text,
                      msgPass: "",
                      msgPassword: ""
                    })
                  }
                  onEndEditing={event =>
                    this.checkVali(event.nativeEvent.text, "password")
                  }
                  onSubmitEditing={this.submitPassword}
                />
                {!!msgPass && <Text style={styles.message}>{msgPass}</Text>}
                <TouchableWithoutFeedback
                  onPress={() => this.setState({ showPassword: !showPassword })}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    style={{
                      color: !msgPass ? colors.brandPrimary : "#f00",
                      fontSize: 20
                    }}
                  />
                </TouchableWithoutFeedback>
              </View>

              <View style={styles.viewButton}>
                <TouchableOpacity
                  onPress={this.closeModalPassword}
                  style={[config.styles.button.huy, styles.buttonLeft]}
                >
                  <Text style={config.styles.text.btnCancelText}>
                    {string.huy}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.submitPassword}
                  style={[config.styles.button.xacNhan, styles.buttonRight]}
                >
                  <Text style={config.styles.text.btnConfirmText}>
                    {string.xacNhan}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={visibleModalEmail}
          onRequestClose={() => {}}
        >
          <View style={styles.viewModal}>
            <View style={styles.viewContentModal}>
              <Text style={styles.titleXacNhan}>{string.thayDoiEmail}</Text>

              <Text style={styles.textMessage}>{msgEmail1}</Text>

              <View
                style={[
                  styles.viewInput,
                  { borderColor: !msgPass ? undefined : "#f00" }
                ]}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  style={{
                    color: !msgEmail2 ? colors.brandPrimary : "#f00",
                    fontSize: 20
                  }}
                />
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  placeholder={"Email"}
                  value={email}
                  keyboardType="email-address"
                  onChangeText={text =>
                    this.setState({
                      email: text,
                      msgEmail1: "",
                      msgEmail2: ""
                    })
                  }
                  onEndEditing={event =>
                    this.checkVali(event.nativeEvent.text, "email")
                  }
                  onSubmitEditing={this.submitEmail}
                />
                {!!msgEmail2 && <Text style={styles.message}>{msgEmail2}</Text>}
              </View>

              <View style={styles.viewButton}>
                <TouchableOpacity
                  onPress={this.closeModalEmail}
                  style={[config.styles.button.huy, styles.buttonLeft]}
                >
                  <Text style={config.styles.text.btnCancelText}>
                    {string.huy}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.submitEmail}
                  style={[config.styles.button.xacNhan, styles.buttonRight]}
                >
                  <Text style={config.styles.text.btnConfirmText}>
                    {string.xacNhan}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={visibleModalOverwrite}
          onRequestClose={() => {}}
        >
          <View style={styles.viewModal}>
            <View style={styles.viewContentModal}>
              <Text style={styles.titleXacNhan}>{string.matKhauChinhXac}</Text>

              <Text>{string.banCoMuonGhiDeThongTinTaiKhoan}</Text>

              <View style={styles.viewButton}>
                <TouchableOpacity
                  onPress={() => {
                    this.closeModalOverwrite();
                    this.setState({ accountSyncUpdate: "1" }, this.submitForm);
                  }}
                  style={[config.styles.button.huy, styles.buttonLeft]}
                >
                  <Text style={config.styles.text.btnCancelText}>
                    {string.khongGhiDe}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.closeModalOverwrite();
                    this.setState({ accountSyncUpdate: "2" }, this.submitForm);
                  }}
                  style={[config.styles.button.xacNhan, styles.buttonRight]}
                >
                  <Text style={config.styles.text.btnConfirmText}>
                    {string.dongY}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    width: "80%",
    height: metrics.DEVICE_HEIGHT - 100,
    justifyContent: "center",
    alignItems: "center"
  },
  avatar: {
    marginBottom: 10,
    width: 80,
    height: 80,
    borderRadius: 40
  },
  textEmail: {
    marginBottom: 15,
    marginTop: 5
  },
  viewModal: {
    backgroundColor: "#0004",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  viewContentModal: {
    width: 300,
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  titleModal: {
    marginBottom: 10
  },
  viewButton: {
    flexDirection: "row",
    padding: 10
  },
  buttonLeft: {
    flex: 1,
    marginRight: 5
  },
  buttonRight: {
    flex: 1,
    marginLeft: 5
  },
  titleXacNhan: {
    fontWeight: "bold",
    color: colors.brandPrimary,
    marginBottom: 10
  },
  textMessage: {
    fontSize: 12,
    color: "#f00",
    marginBottom: 5,
    textAlign: "center"
  },
  viewInput: {
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 0.8,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10
  },
  message: {
    fontSize: 11,
    color: "#f00",
    marginRight: 5
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  {
    dispatchParams
  }
)(CapNhatSoDienThoai);
