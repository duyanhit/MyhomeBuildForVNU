import React from "react";
import { connect } from "react-redux";
import {
  Alert,
  AsyncStorage,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { ActionSheet, Icon, Spinner, Text } from "native-base";
import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons
} from "@expo/vector-icons";

import AppComponent from "../../../core/components/AppComponent";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import storage from "../../config/storage";
import string from "../../config/string";
import { screenNames } from "../../config/screen";
import { assets } from "../../../assets";
import colors from "../../config/colors";
import { validateEmail } from "../../../core/helpers/stringHelper";
import { actionTypes } from "../../reducers";
import { dispatchParams } from "../../../core/actions";
import ModalDoiMatKhau from "../Modal/ModalDoiMatKhau";
import { GenerateMD5FromString } from "../../../core/helpers/MD5HashGenerator";

class CaNhan extends AppComponent {
  constructor(props) {
    super(props);
    const { accountInfo } = this.props;
    const { email, fullname, avatar } = accountInfo || {};
    this.state = {
      ...super.state,
      name: fullname || "",
      email: email || "",
      avatar: avatar || "",
      nameMsg: "",
      emailMsg: "",
      msg: " ",
      msgColor: "#f00",
      showDoiMatKhau: false,
      curPass: "",
      newPass: "",
      renewPass: "",
      msgCurPassError: "",
      msgNewPassError: "",
      msgRenewPassError: "",
      msgPass: " ",
      showPassCur: false,
      showPassNew: false,
      showAlert: true
    };
  }

  componentWillMount = () => {
    this.checkHasEmail();
  };

  componentWillReceiveProps = () => {
    this.setState(
      {
        isLoading: false,
        msg: string.capNhatThongTinThanhCong,
        msgColor: colors.brandPrimary,
        image: null
        // showAlert: false
      },
      () => {
        this.checkHasEmail();
      }
    );
  };

  checkHasEmail = async () => {
    const { accountInfo } = this.props;
    if (accountInfo && accountInfo.email === null) {
      try {
        const value = await AsyncStorage.getItem(storage.hasEmail);
        if (value === "1") {
          // người dùng tắt thông báo đi dù có email hay không
          this.setState({
            showAlert: false
          });
        } else {
          this.setState({
            showAlert: true
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      this.setState({
        showAlert: false
      });
    }
  };

  submitForm = async () => {
    const { name, email, image } = this.state;
    this.setState({ isLoading: true, msg: " " });
    if (!email) {
      await AsyncStorage.setItem(storage.hasEmail, "0");
    }
    const deviceToken = await this.registerForPushNotificationsAsync();
    this.postToServerWithAccount(
      getApiUrl(API.LAY_THONG_TIN_TAI_KHOAN),
      {
        fullname: name.replace(/ + /g, " ").trim(),
        email,
        device_token: deviceToken
      },
      image ? [{ ...image, key: "image" }] : null
    ).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        this.props.dispatchParams(
          {
            ...propsData.data,
            device_token: this.props.accountInfo.device_token
          },
          actionTypes.APP_USER_INFO
        );
        this.setState({
          name: name.replace(/ + /g, " ").trim(),
          email: email.replace(/ + /g, " ").trim()
        });
      } else {
        this.setState({
          isLoading: false,
          msg: propsData.message,
          msgColor: "#f00"
        });
      }
    });
  };

  changeAlias = alias => {
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
    const { name, email } = this.state;
    if (!name) {
      this.setState({ msg: string.chuaNhapHoVaTen, msgColor: "#f00" });
      return;
    }
    if (name.length < 3) {
      this.setState({ msg: string.hoVaTenQuaNgan, msgColor: "#f00" });
      return;
    }
    if (name.length > 30) {
      this.setState({ msg: string.hoVaTenQuaDai, msgColor: "#f00" });
      return;
    }
    if (!/^[a-z ]+$/.test(this.changeAlias(name))) {
      this.setState({ msg: string.hoTenKhongDuocChuaKyTuDacBiet });
      return;
    }
    if (email) {
      if (email.length < 4) {
        this.setState({ msg: string.emailQuaNgan, msgColor: "#f00" });
        return;
      }
      if (email.length > 100) {
        this.setState({ msg: string.emailQuaDai, msgColor: "#f00" });
        return;
      }
      if (!validateEmail(email)) {
        this.setState({ msg: string.emailKhongHopLe, msgColor: "#f00" });
        return;
      }
    }
    this.submitForm();
  };

  doiMatKhau = () => {
    this.setState({
      showDoiMatKhau: true,
      curPass: "",
      newPass: "",
      renewPass: "",
      msgCurPassError: "",
      msgNewPassError: "",
      msgRenewPassError: "",
      msgPass: " ",
      showPassCur: false,
      showPassNew: false
    });
  };

  checkVali = (text, type) => {
    if (type === "name") {
      if (!text) {
        this.setState({ nameMsg: string.chuaNhap });
      } else if (text.length < 4) {
        this.setState({ nameMsg: string.quaNgan });
      } else if (text.length > 50) {
        this.setState({ nameMsg: string.quaDai });
      }
    } else if (type === "email") {
      if (text) {
        if (text.length < 4) {
          this.setState({ emailMsg: string.quaNgan });
        } else if (text.length > 100) {
          this.setState({ emailMsg: string.quaDai });
        }
      }
    } else if (type === "curPass") {
      if (!text) {
        this.setState({ msgCurPassError: string.chuaNhap });
      } else if (text.length < 6) {
        this.setState({ msgCurPassError: string.quaNgan });
      } else if (text.length > 32) {
        this.setState({ msgCurPassError: string.quaDai });
      }
    } else if (type === "newPass") {
      if (!text) {
        this.setState({ msgNewPassError: string.chuaNhap });
      } else if (text.length < 6) {
        this.setState({ msgNewPassError: string.quaNgan });
      } else if (text.length > 32) {
        this.setState({ msgNewPassError: string.quaDai });
      }
    } else if (type === "renewPass") {
      if (!text) {
        this.setState({ msgRenewPassError: string.chuaNhap });
      } else if (text.length < 6) {
        this.setState({ msgRenewPassError: string.quaNgan });
      } else if (text.length > 32) {
        this.setState({ msgRenewPassError: string.quaDai });
      }
    }
  };

  callBack = image => {
    let data = { isLoading: false };
    if (image) data = { ...data, image, avatar: image.uri, msg: " " };
    this.setState(data);
  };

  chonImage = async index => {
    this.setState({ isLoading: true });
    let image = null;
    if (index === 0) {
      image = await this.launchCameraAsync();
    } else if (index === 1) {
      image = await this.launchImageLibraryAsync();
    }
    if (image) image = await this.resizeImage(image);
    if (image) {
      this.navigateToScreen(screenNames.CropImage, {
        image,
        ratio: [1, 1],
        reSize: { width: 200, height: 200 },
        callBack: this.callBack
      })();
      // this.refs.CropImage.openCropImage(image, this.callBack);
    } else this.setState({ isLoading: false, msg: " " });
  };

  submitDoiMatKhau = async () => {
    const { curPass, newPass } = this.state;
    // const passMD5Curr = GenerateMD5FromString(curPass);
    // const passMD5New = GenerateMD5FromString(newPass);
    this.setState({ isLoading: true, msgPass: " ", showDoiMatKhau: false });
    const deviceToken = await this.registerForPushNotificationsAsync();
    this.postToServerWithAccount(getApiUrl(API.DOI_MAT_KHAU), {
      password_current: curPass,
      password: newPass,
      device_token: deviceToken
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        setTimeout(() => {
          Alert.alert(string.thongBao, string.doiMatKhauThanhCong);
          this.setState({
            isLoading: false,
            msgPass: " ",
            curPass: "",
            newPass: "",
            renewPass: ""
          });
        }, 500);
      } else {
        this.setState(
          {
            showDoiMatKhau: true,
            msgPass: propsData.message
          },
          () => {
            setTimeout(() => this.setState({ isLoading: false }), 500);
          }
        );
      }
    });
  };

  onConfirmPress = () => {
    const { curPass, newPass, renewPass } = this.state;
    if (!curPass) {
      this.setState({ msgPass: string.chuaNhapMatKhauHienTai });
      return;
    }
    if (curPass.length < 6 || curPass.length > 32) {
      this.setState({ msgPass: string.matKhauHienTaiPhaiTu6Den32KyTu });
      return;
    }
    if (!newPass) {
      this.setState({ msgPass: string.chuaNhapMatKhauMoi });
      return;
    }
    if (newPass.length < 6 || newPass.length > 32) {
      this.setState({ msgPass: string.matKhauMoiPhaiTu6Den32KyTu });
      return;
    }
    if (newPass === curPass) {
      this.setState({ msgPass: string.matKhauMoiPhaiKhacMatKhauHienTai });
      return;
    }
    // if (!renewPass) {
    //   this.setState({ msgPass: "Chưa nhập lại mật khẩu mới" });
    //   return;
    // }
    // if (renewPass.length < 6 || renewPass.length > 32) {
    //   this.setState({
    //     msgPass: "Nhập lại mật khẩu mới phải từ 6 đến 32 ký tự"
    //   });
    //   return;
    // }
    // if (newPass !== renewPass) {
    //   this.setState({
    //     msgPass: "Mật khẩu mới và nhập lại mật khẩu mới phải giống nhau"
    //   });
    //   return;
    // }
    this.submitDoiMatKhau();
  };

  onCancelPress = () => {
    this.setState({ showDoiMatKhau: false });
  };

  hideAlert = async () => {
    try {
      await AsyncStorage.setItem(storage.hasEmail, "1");
      this.setState({
        showAlert: false
      });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { accountInfo } = this.props;
    const { phone } = accountInfo || {};
    const {
      name,
      email,
      nameMsg,
      emailMsg,
      avatar,
      msg,
      isLoading,
      msgColor,
      showDoiMatKhau,
      curPass,
      newPass,
      renewPass,
      msgCurPassError,
      msgNewPassError,
      msgRenewPassError,
      msgPass,
      showPassCur,
      showPassNew,
      showAlert
    } = this.state;

    let viewNoEmail = null;

    if (showAlert) {
      viewNoEmail = (
        <View style={styles.viewUpdateEmail}>
          <View style={styles.viewClose}>
            <TouchableOpacity
              onPress={() => this.hideAlert()}
              hitSlop={{ bottom: 10, top: 10, left: 10, right: 10 }}
            >
              <Icon name="md-close" style={styles.iconClose} />
            </TouchableOpacity>
          </View>
          <View style={styles.updateEmail}>
            <Text style={styles.textUpdate}>{string.thongBaoNhapEmail}</Text>
          </View>
        </View>
      );
    }

    let view = (
      <View style={styles.container}>
        {viewNoEmail}

        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              ActionSheet.show(
                {
                  options: [string.mayAnh, string.thuVien, string.dong],
                  cancelButtonIndex: 2,
                  title: string.chonAnh
                },
                this.chonImage
              );
            }}
          >
            <View>
              <Image
                source={assets.avatarDefault}
                style={[styles.avatar, { position: "absolute" }]}
              />
              <Image
                source={avatar ? { uri: avatar } : assets.avatarDefault}
                style={styles.avatar}
              />
              <View style={styles.viewIconCamera}>
                <FontAwesome name="camera" style={styles.iconCamera} />
              </View>
            </View>
          </TouchableWithoutFeedback>
          <Text style={{ marginBottom: 10 }}>{phone || string.chuaCoSdt}</Text>
          <View style={{ width: "100%" }}>
            <Text style={[styles.message, { color: msgColor }]}>{msg}</Text>
            <View
              style={[
                styles.viewIconTextInput,
                {
                  marginBottom: 10,
                  borderColor: !nameMsg ? undefined : "#f00"
                }
              ]}
            >
              <Feather
                name="user"
                style={{
                  fontSize: 20,
                  color: !nameMsg ? colors.brandPrimary : "#f00"
                }}
              />
              <TextInput
                underlineColorAndroid="transparent"
                style={styles.textInput}
                placeholder={string.hoVaTen}
                value={name}
                onChangeText={text =>
                  this.setState({ name: text, nameMsg: "", msg: " " })
                }
                onEndEditing={event =>
                  this.checkVali(event.nativeEvent.text, "name")
                }
                onSubmitEditing={() => this.refs.inputEmail.focus()}
              />
              {!!nameMsg && <Text style={styles.messageInput}>{nameMsg}</Text>}
            </View>
            <View
              style={[
                styles.viewIconTextInput,
                {
                  marginBottom: 30,
                  borderColor: !emailMsg ? undefined : "#f00"
                }
              ]}
            >
              <MaterialCommunityIcons
                name="email-outline"
                style={{
                  fontSize: 20,
                  color: !emailMsg ? colors.brandPrimary : "#f00"
                }}
              />
              <TextInput
                ref="inputEmail"
                underlineColorAndroid="transparent"
                style={styles.textInput}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={text =>
                  this.setState({ email: text, emailMsg: "", msg: " " })
                }
                onEndEditing={event =>
                  this.checkVali(event.nativeEvent.text, "email")
                }
                onSubmitEditing={this.submit}
              />
              {!!emailMsg && (
                <Text style={styles.messageInput}>{emailMsg}</Text>
              )}
            </View>
            <TouchableWithoutFeedback onPress={this.submit}>
              <View style={[styles.button, { marginBottom: 10 }]}>
                <Text style={styles.textButton}>{string.luuThongTin}</Text>
              </View>
            </TouchableWithoutFeedback>
            {accountInfo.has_password === 1 && (
              <TouchableWithoutFeedback onPress={this.doiMatKhau}>
                <View style={styles.button}>
                  <Text style={styles.textButton}>{string.doiMatKhau}</Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </ScrollView>
      </View>
    );

    if (isLoading) view = <Spinner />;

    return (
      <KeyboardAvoidingView
        style={{ backgroundColor: colors.windowBackground }}
        enabled={Platform.OS === "ios"}
        // behavior="padding"
        flex={1}
      >
        {view}
        <ModalDoiMatKhau
          visible={showDoiMatKhau}
          onConfirmPress={this.onConfirmPress}
          onCancelPress={this.onCancelPress}
          onChangetext={(text, pass, typeError) =>
            this.setState({ [pass]: text, [typeError]: "", msgPass: " " })
          }
          onEndEditing={(text, pass) => this.checkVali(text, pass)}
          onSubmitEditing={self => {
            if (self) self.focus();
            else this.onConfirmPress();
          }}
          curPassValue={curPass}
          newPassValue={newPass}
          renewPassValue={renewPass}
          msgCurPassError={msgCurPassError}
          msgNewPassError={msgNewPassError}
          msgRenewPassError={msgRenewPassError}
          msgPass={msgPass}
          setShowPass={pass => this.setState({ [pass]: !this.state[pass] })}
          showPassCur={showPassCur}
          showPassNew={showPassNew}
        />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  scrollView: {
    alignItems: "center",
    width: "80%",
    alignSelf: "center"
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.brandPrimary,
    marginVertical: 10,
    marginTop: 25
  },
  viewIconCamera: {
    position: "absolute",
    bottom: 10,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.brandPrimary,
    padding: 3
  },
  iconCamera: {
    fontSize: 15,
    color: colors.brandPrimary
  },
  message: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: "center"
  },
  viewIconTextInput: {
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 0.7,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10
  },
  messageInput: {
    marginHorizontal: 10,
    color: "#f00",
    fontSize: 12
  },
  button: {
    width: "100%",
    height: 42,
    borderRadius: 5,
    backgroundColor: colors.brandPrimary,
    justifyContent: "center",
    alignItems: "center"
  },
  textButton: {
    color: "#fff",
    fontSize: 15
  },
  textUpdate: {
    fontSize: 13,
    color: "gray",
    textAlign: "center"
  },
  viewUpdateEmail: {
    backgroundColor: "#F0E68C",
    borderColor: "#FDD835",
    borderWidth: 1
  },
  updateEmail: {
    alignItems: "center",
    paddingBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 20
  },
  iconClose: {
    fontSize: 17,
    color: "gray"
  },
  viewClose: {
    zIndex: 1,
    position: "absolute",
    alignSelf: "flex-end",
    paddingVertical: 5,
    paddingHorizontal: 10
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  { dispatchParams },
  null,
  { withRef: true }
)(CaNhan);
