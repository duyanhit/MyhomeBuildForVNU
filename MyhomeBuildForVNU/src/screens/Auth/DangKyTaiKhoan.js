import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Spinner } from "native-base";

import AppSignIn from "../../../core/components/Auth/AppSignIn";
import string from "../../config/string";
import colors from "../../config/colors";
import { API, getApiUrl } from "../../config/server";
import { postToServer } from "../../../core/actions";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { GenerateMD5FromString } from "../../../core/helpers/MD5HashGenerator";
import AppHeader from "../../../core/components/AppHeader";
import { screenNames } from "../../config/screen";

class DangKyTaiKhoan extends AppSignIn {
  state = {
    ...super.state,
    isLoading: false,
    showPass: false,
    username: "",
    password: "",
    fullname: "",
    usernameMsg: "",
    passwordMsg: "",
    fullnameMsg: "",
    msg: " "
  };

  submitForm = async (name, user, pass) => {
    let { fullname, username, password } = this.state;
    fullname = name || fullname;
    username = user || username;
    password = pass || password;
    // const passMD5 = GenerateMD5FromString(password);
    fullname = fullname.trim();
    username = username.trim();
    this.setState({ isLoading: true, msg: " " });
    const deviceToken = await this.registerForPushNotificationsAsync();
    postToServer(getApiUrl(API.DANG_KY_SDT), {
      fullname,
      phone: username,
      password,
      device_token: deviceToken,
      platform: Platform.OS === "ios" ? 1 : 2
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        this.setState({ isLoading: false });
        Alert.alert(
          string.thongBao,
          string.dangKyThanhCong,
          [
            {
              text: string.dongY,
              onPress: () => {
                this.props.navigation.state.params.onGoBack(username, password);
                this.props.navigation.goBack();
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        this.setState({ isLoading: false, msg: propsData.message });
        Alert.alert(string.thongBao, propsData.message);
      }
    });
  };

  change_alias = alias => {
    let str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/ + /g, " ");
    str = str.trim();
    return str;
  };

  submit = () => {
    const { password, fullname } = this.state;
    let { username } = this.state;
    username = username.replace(/ + /g, " ").trim();
    this.checkVali(fullname, "fullname");
    this.checkVali(username, "username");
    this.checkVali(password, "password");
    if (!fullname) {
      this.setState({ msg: string.chuaNhapHoTen });
      return;
    }
    if (fullname.length < 3 || fullname.length > 30) {
      this.setState({ msg: string.hoTenPhaiTu3Den30KyTu });
      return;
    }
    if (!/^[a-z ]+$/.test(this.change_alias(fullname.trim()))) {
      this.setState({ msg: string.hoTenKhongDuocChuaKyTuDacBiet });
      return;
    }
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
    if (type === "fullname") {
      if (!text) {
        this.setState({ fullnameMsg: string.chuaNhap });
      } else if (text.length < 3) {
        this.setState({ fullnameMsg: string.quaNgan });
      } else if (text.length > 30) {
        this.setState({ fullnameMsg: string.quaDai });
      }
    } else if (type === "username") {
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

  render() {
    const {
      username,
      usernameMsg,
      password,
      passwordMsg,
      fullname,
      fullnameMsg,
      showPass,
      msg,
      isLoading
    } = this.state;

    let view = (
      <View style={{ alignItems: "center" }}>
        <Text style={styles.message}>{msg}</Text>

        <View
          style={[
            styles.viewInput,
            {
              marginBottom: 15,
              borderColor: !fullnameMsg ? undefined : "#f00"
            }
          ]}
        >
          <Feather
            name="user"
            style={{
              fontSize: 20,
              color: !fullnameMsg ? colors.brandPrimary : "#f00"
            }}
          />
          <TextInput
            ref="inputFullname"
            underlineColorAndroid="transparent"
            style={styles.textInput}
            placeholder={string.hoVaTen}
            value={fullname}
            onChangeText={text =>
              this.setState({
                fullname: text,
                fullnameMsg: "",
                msg: " "
              })
            }
            onEndEditing={event =>
              this.checkVali(event.nativeEvent.text, "fullname")
            }
            onSubmitEditing={() => this.refs.inputUsername.focus()}
          />
          {!!fullnameMsg && (
            <Text style={{ marginLeft: 10, color: "#f00", fontSize: 12 }}>
              {fullnameMsg}
            </Text>
          )}
        </View>
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
                username: text.trim(),
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

        <View style={{ marginBottom: 25 }}>
          <Text style={{ color: "gray" }}>{string.dongYVoi}</Text>
          <Text
            style={styles.dieuKhoan}
            onPress={() =>
              this.props.navigation.navigate(screenNames.ThongTinUngDung, {})
            }
          >
            {string.dieuKhoanVaChinhSach}
          </Text>
        </View>

        <TouchableWithoutFeedback onPress={this.submit}>
          <View style={styles.viewBtnAuth}>
            <Text style={styles.btnAuth}>{string.dangKy}</Text>
          </View>
        </TouchableWithoutFeedback>

        <View style={{ marginTop: 25 }}>
          <Text style={{ color: "gray" }}>
            {string.daCoTaiKhoan}?
            <Text
              style={{ color: colors.brandPrimary, fontWeight: "bold" }}
              onPress={() => this.props.navigation.goBack()}
            >
              {" "}
              {string.dangNhap}
            </Text>
          </Text>
        </View>
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
        <AppHeader
          left
          title={string.dangKyTaiKhoan}
          navigation={this.props.navigation}
        />
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.viewLogo}>{view}</View>
        </ScrollView>
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
    marginTop: 20
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
  message: {
    color: "#f00",
    fontSize: 12,
    marginBottom: 10,
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
    backgroundColor: colors.brandPrimary,
    justifyContent: "center",
    alignItems: "center"
  },
  btnAuth: {
    color: "#fff",
    fontSize: 15
  },
  dieuKhoan: {
    color: colors.brandPrimary,
    fontWeight: "bold",
    textDecorationLine: "underline",
    textAlign: "center"
  }
});

export default DangKyTaiKhoan;
