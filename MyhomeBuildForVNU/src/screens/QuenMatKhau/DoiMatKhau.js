import React from "react";
import {
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  TouchableWithoutFeedback
} from "react-native";
import { View, Text, Button } from "native-base";
import { Feather } from "@expo/vector-icons";

import AppComponent from "../../../core/components/AppComponent";
import string from "../../config/string";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import colors from "../../config/colors";
import { GenerateMD5FromString } from "../../../core/helpers/MD5HashGenerator";

class DoiMatKhau extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      loadingDialogVisible: false,
      msg: "",
      newPassword0: "",
      newPassword1: "",
      newPass0Msg: "",
      newPass1Msg: "",
      showPass0: false,
      showPass1: false
    };
  }

  /**
   *
   * @param newPass0
   * @param newPass1
   * @returns {Promise<void>}
   */
  submitForm = async (newPass0, newPass1) => {
    const { accountId, code } = this.props;
    let { newPassword0 } = this.state;
    newPassword0 = newPass0 || newPassword0;
    // const passMD5 = GenerateMD5FromString(newPassword0);
    this.setState({ loadingDialogVisible: true });
    this.postToServer(getApiUrl(API.QUEN_MK_DOI_MAT_KHAU), {
      account_id: accountId,
      code,
      password: newPassword0
    }).then(response => {
      this.setState({ loadingDialogVisible: false });
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        Alert.alert(
          string.thongBao,
          string.doiMatKhauThanhCong,
          [
            {
              text: string.dongY,
              onPress: () => {
                this.setState({
                  newPassword0: "",
                  newPassword1: "",
                  msg: ""
                });
                this.onCloseModal();
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        this.setState({ msg: propsData.message });
      }
    });
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

  /**
   *
   */
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
      msg,
      newPassword0,
      newPassword1,
      newPass0Msg,
      newPass1Msg,
      showPass0,
      showPass1
    } = this.state;
    return (
      <View>
        <Modal
          transparent
          animationType="fade"
          visible={this.props.visible}
          onRequestClose={this.onCloseModal}
        >
          <View style={styles.contentRoot}>
            <View style={styles.viewRoot}>
              <Text style={styles.quenMatKhau}>{string.quenMatKhau}</Text>
              <Text style={{ marginVertical: 10 }}>{string.doiMatKhau}</Text>

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
                  small
                  onPress={this.onCloseModal}
                  style={[styles.button, { backgroundColor: "gray" }]}
                >
                  <Text uppercase={false}>{string.huy}</Text>
                </Button>
                <Button small onPress={this.submit} style={styles.button}>
                  <Text uppercase={false}>{string.xacNhan}</Text>
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
  viewButton: {
    flexDirection: "row",
    marginTop: 20
  },
  button: {
    height: 40,
    marginHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    alignSelf: "center",
    justifyContent: "center"
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
  iconPass: {
    fontSize: 20,
    color: colors.brandPrimary
  },
  quenMatKhau: {
    fontWeight: "bold",
    color: colors.brandPrimary
  },
  valiMessage: {
    marginHorizontal: 10,
    color: "#f00",
    fontSize: 12
  }
});

export default DoiMatKhau;
