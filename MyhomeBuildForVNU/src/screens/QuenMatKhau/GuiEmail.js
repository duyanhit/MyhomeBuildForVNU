import React from "react";
import { View, StyleSheet, Modal, TextInput } from "react-native";
import { Button, Text } from "native-base";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppComponent from "../../../core/components/AppComponent";
import ProgressDialog from "../../../core/components/ProgressDialog";
import string from "../../config/string";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import colors from "../../config/colors";
import XacThuc from "./XacThuc";

class GuiEmail extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      loadingDialogVisible: false,
      showModalXacThuc: false,
      accountId: undefined,
      email: "",
      emailMsg: "",
      msg: "",
      disabledButton: false
    };
  }

  /**
   *
   * @param mEmail
   * @returns {Promise<void>}
   */
  submitForm = async mEmail => {
    let { email } = this.state;
    email = mEmail || email;
    this.setState({ loadingDialogVisible: true, msg: "" });
    this.postToServer(getApiUrl(API.QUEN_MK_GUI_EMAIL), {
      email
    }).then(response => {
      this.setState({ loadingDialogVisible: false });
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        setTimeout(() => {
          this.onCloseModal();
          setTimeout(() => {
            this.setState({
              accountId: propsData.data.account_id,
              showModalXacThuc: true,
              email: "",
              msg: "",
              disabledButton: false
            });
          }, 100);
        }, 1000);
      } else {
        this.setState({
          msg: propsData.message,
          disabledButton: false
        });
      }
    });
  };

  checkVali = text => {
    if (!text) {
      this.setState({ emailMsg: string.chuaNhap });
    }
  };

  /**
   *
   */
  submit = () => {
    const { email, emailMsg } = this.state;
    this.checkVali(email);
    if (!email) {
      this.setState({ msg: string.chuaNhapEmail, disabledButton: false });
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      this.setState({ msg: string.emailKhongHopLe, disabledButton: false });
      return;
    }
    if (emailMsg) {
      return;
    }
    this.submitForm();
  };

  onCloseModal = () => {
    this.setState(
      {
        email: "",
        msg: "",
        emailMsg: ""
      },
      () => this.props.onClose()
    );
  };

  onCloseModalXacThuc = () => {
    this.setState({
      showModalXacThuc: false
    });
  };

  render() {
    const { email, msg, disabledButton, emailMsg } = this.state;
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
              <Text style={{ marginVertical: 10 }}>
                {string.nhapEmailXacThuc}
              </Text>

              <Text style={styles.message}>{msg}</Text>

              <View
                style={[
                  styles.viewInput,
                  { borderColor: !emailMsg ? undefined : "#f00" }
                ]}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  style={[
                    styles.iconPass,
                    { color: !emailMsg ? colors.brandPrimary : "#f00" }
                  ]}
                />
                <TextInput
                  keyboardType={"email-address"}
                  underlineColorAndroid="transparent"
                  style={styles.textInput}
                  placeholder={"Email"}
                  value={email}
                  onChangeText={text =>
                    this.setState({ email: text, emailMsg: "", msg: "" })
                  }
                  onEndEditing={event => this.checkVali(event.nativeEvent.text)}
                  onSubmitEditing={() => {
                    if (!disabledButton) {
                      this.setState({ disabledButton: true }, () => {
                        this.submit();
                      });
                    }
                  }}
                />
                {!!emailMsg && (
                  <Text style={styles.valiMessage}>{emailMsg}</Text>
                )}
              </View>

              <View style={styles.viewButton}>
                <Button
                  small
                  onPress={this.onCloseModal}
                  style={[styles.button, { backgroundColor: "gray" }]}
                >
                  <Text uppercase={false}>{string.huy}</Text>
                </Button>
                <Button
                  small
                  onPress={() => {
                    if (!disabledButton) {
                      this.setState({ disabledButton: true }, () => {
                        this.submit();
                      });
                    }
                  }}
                  style={styles.button}
                  disabled={disabledButton}
                >
                  <Text uppercase={false}>{string.xacNhan}</Text>
                </Button>
              </View>
            </View>
            <ProgressDialog
              message={string.vuiLongCho}
              visible={this.state.loadingDialogVisible}
              transparent={false}
            />
          </View>
        </Modal>
        <XacThuc
          accountId={this.state.accountId}
          visible={this.state.showModalXacThuc}
          onClose={this.onCloseModalXacThuc}
        />
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
    borderRadius: 5,
    marginHorizontal: 15,
    flex: 1,
    alignSelf: "center",
    justifyContent: "center"
  },
  message: {
    color: "#f00",
    fontSize: 12,
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

export default GuiEmail;
