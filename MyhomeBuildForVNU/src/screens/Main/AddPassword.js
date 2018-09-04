import React from "react";
import {
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  View,
  StyleSheet
} from "react-native";
import { Button, Content, Text } from "native-base";
import { Feather } from "@expo/vector-icons";
import { connect } from "react-redux";

import AppComponent from "../../../core/components/AppComponent";
import string from "../../config/string";
import colors from "../../../core/config/colors";
import { GenerateMD5FromString } from "../../../core/helpers/MD5HashGenerator";
import ProgressDialog from "../../../core/components/ProgressDialog";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { actionTypes } from "../../reducers";
import { dispatchParams } from "../../../core/actions";

class AddPassword extends AppComponent {
  state = {
    newPassword0: "",
    newPassword1: "",
    msg: "",
    newPass0Msg: "",
    newPass1Msg: "",
    showPass0: false,
    showPass1: false,
    loadingDialogVisible: false
  };

  submitForm = async newPass0 => {
    const { accountInfo } = this.props;
    let { newPassword0 } = this.state;
    newPassword0 = newPass0 || newPassword0;
    // const passMD5 = GenerateMD5FromString(newPassword0);
    if (accountInfo) {
      this.setState({ loadingDialogVisible: true });
      this.postToServerWithAccount(getApiUrl(API.THEM_MAT_KHAU), {
        password: newPassword0
      }).then(response => {
        this.setState({ loadingDialogVisible: false });
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          this.showAlertDialog(string.themMatKhauThanhCong, () => {
            this.onCloseModal();
            this.props.dispatchParams(
              {
                ...accountInfo,
                has_password: 1,
                device_token: accountInfo.device_token
              },
              actionTypes.APP_USER_INFO
            );
          });
        } else {
          this.showAlertDialog(propsData.message);
        }
      });
    }
  };

  checkVali = (text, type) => {
    if (type === "newPass0") {
      if (!text) {
        this.setState({ newPass0Msg: string.chuaNhap });
      } else if (text.length < 6) {
        this.setState({ newPass0Msg: string.quaNgan });
      } else if (text.length > 32) {
        this.setState({ newPass0Msg: string.quaDai });
      }
    } else if (type === "newPass1") {
      if (!text) {
        this.setState({ newPass1Msg: string.chuaNhap });
      } else if (text.length < 6) {
        this.setState({ newPass1Msg: string.quaNgan });
      } else if (text.length > 32) {
        this.setState({ newPass1Msg: string.quaDai });
      }
    }
  };

  submit = () => {
    const { newPassword0, newPassword1, newPass0Msg, newPass1Msg } = this.state;
    this.checkVali(newPassword0, "newPass0");
    this.checkVali(newPassword1, "newPass1");
    if (!newPassword0) {
      this.setState({ msg: string.chuaNhapMatKhauMoi });
      return;
    }
    if (!newPassword1) {
      this.setState({ msg: string.chuaNhapLaiMatKhauMoi });
      return;
    }
    if (newPassword0 !== newPassword1) {
      this.setState({ msg: string.matKhauKhongKhop });
      return;
    }
    if (newPass0Msg || newPass1Msg) {
      return;
    }
    this.submitForm();
  };

  onCloseModal = () => {
    this.setState(
      {
        msg: "",
        newPassword0: "",
        newPassword1: "",
        newPass0Msg: "",
        newPass1Msg: "",
        showPass0: false,
        showPass1: false
      },
      () => this.props.onClose()
    );
  };

  render() {
    const {
      newPassword0,
      newPassword1,
      msg,
      newPass0Msg,
      newPass1Msg,
      showPass0,
      showPass1,
      loadingDialogVisible
    } = this.state;

    return (
      <View style={styles.container}>
        <ProgressDialog
          message={string.vuiLongCho}
          visible={loadingDialogVisible}
          transparent={false}
        />

        <Modal
          visible={this.props.visible}
          transparent
          onRequestClose={this.onCloseModal}
          animationType="fade"
        >
          <View style={styles.contentRoot}>
            <View style={styles.viewRoot}>
              <Text style={styles.titleModal}>{string.capNhatMatKhau}</Text>

              <Text style={styles.message}>{msg}</Text>

              <View
                style={[
                  styles.viewInput,
                  {
                    marginBottom: 10,
                    borderColor: !newPass0Msg ? undefined : "#f00"
                  }
                ]}
              >
                <Feather
                  name="unlock"
                  style={[
                    styles.iconPass,
                    { color: !newPass0Msg ? colors.brandPrimary : "#f00" }
                  ]}
                />
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.textInput}
                  placeholder={string.matKhauMoi}
                  value={newPassword0}
                  secureTextEntry={!showPass0}
                  onChangeText={text =>
                    this.setState({
                      newPassword0: text,
                      msg: "",
                      newPass0Msg: ""
                    })
                  }
                  onEndEditing={event =>
                    this.checkVali(event.nativeEvent.text, "newPass0")
                  }
                  onSubmitEditing={() => this.refs.newPass1.focus()}
                />
                {!!newPass0Msg && (
                  <Text style={styles.valiMessage}>{newPass0Msg}</Text>
                )}
                <TouchableWithoutFeedback
                  onPress={() => this.setState({ showPass0: !showPass0 })}
                >
                  <Feather
                    name={showPass0 ? "eye-off" : "eye"}
                    style={[
                      styles.iconPass,
                      { color: !newPass0Msg ? colors.brandPrimary : "#f00" }
                    ]}
                  />
                </TouchableWithoutFeedback>
              </View>

              <View
                style={[
                  styles.viewInput,
                  { borderColor: !newPass1Msg ? undefined : "#f00" }
                ]}
              >
                <Feather
                  name="unlock"
                  style={[
                    styles.iconPass,
                    { color: !newPass1Msg ? colors.brandPrimary : "#f00" }
                  ]}
                />
                <TextInput
                  ref="newPass1"
                  underlineColorAndroid="transparent"
                  style={styles.textInput}
                  placeholder={string.nhapLaiMatKhauMoi}
                  value={newPassword1}
                  secureTextEntry={!showPass1}
                  onChangeText={text =>
                    this.setState({
                      newPassword1: text,
                      msg: "",
                      newPass1Msg: ""
                    })
                  }
                  onEndEditing={event =>
                    this.checkVali(event.nativeEvent.text, "newPass1")
                  }
                  onSubmitEditing={this.submit}
                />
                {!!newPass1Msg && (
                  <Text style={styles.valiMessage}>{newPass1Msg}</Text>
                )}
                <TouchableWithoutFeedback
                  onPress={() => this.setState({ showPass1: !showPass1 })}
                >
                  <Feather
                    name={showPass1 ? "eye-off" : "eye"}
                    style={[
                      styles.iconPass,
                      { color: !newPass1Msg ? colors.brandPrimary : "#f00" }
                    ]}
                  />
                </TouchableWithoutFeedback>
              </View>

              <View style={styles.viewButton}>
                <Button
                  rounded
                  onPress={this.onCloseModal}
                  style={[styles.button, { backgroundColor: "gray" }]}
                >
                  <Text>{string.huy}</Text>
                </Button>
                <Button rounded onPress={this.submit} style={styles.button}>
                  <Text>{string.xacNhan}</Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentRoot: {
    backgroundColor: "#0004",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  viewRoot: {
    width: 300,
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  titleModal: {
    color: colors.brandPrimary,
    fontWeight: "bold"
  },
  message: {
    color: "#f00",
    fontSize: 14,
    marginTop: 10,
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
  iconPass: {
    fontSize: 20,
    color: colors.brandPrimary
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10
  },
  viewButton: {
    flexDirection: "row",
    marginTop: 15
  },
  button: {
    height: 40,
    marginHorizontal: 15,
    flex: 1,
    alignSelf: "center",
    justifyContent: "center"
  },
  valiMessage: {
    marginHorizontal: 10,
    color: "#f00",
    fontSize: 12
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  { dispatchParams }
)(AddPassword);
