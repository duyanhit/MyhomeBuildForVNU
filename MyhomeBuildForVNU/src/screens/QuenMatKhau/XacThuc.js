import React from "react";
import { Modal, StyleSheet, TextInput } from "react-native";
import { Button, Text, View } from "native-base";

import AppComponent from "../../../core/components/AppComponent";
import string from "../../config/string";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import ProgressDialog from "../../../core/components/ProgressDialog";
import DoiMatKhau from "./DoiMatKhau";
import colors from "../../config/colors";

class XacThuc extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      loadingDialogVisible: false,
      showModalDoiMatKhau: false,
      forwardCode: "",
      msg: "",
      code: "",
      codeMsg: "",
      checkEmail: true
    };
  }

  /**
   *
   * @param mCode
   * @returns {Promise<void>}
   */
  submitForm = async mCode => {
    let { code } = this.state;
    code = mCode || code;
    const forwardCode = code;
    this.setState({ loadingDialogVisible: true });
    this.postToServer(getApiUrl(API.QUEN_MK_XAC_THUC), {
      account_id: this.props.accountId,
      code
    }).then(response => {
      this.setState({ loadingDialogVisible: false });
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        setTimeout(() => {
          this.onCloseModal();
          setTimeout(() => {
            this.setState({
              forwardCode,
              showModalDoiMatKhau: true,
              code: "",
              msg: ""
            });
          }, 100);
        }, 1000);
      } else {
        this.setState({ msg: propsData.message, checkEmail: false });
      }
    });
  };

  checkVali = text => {
    if (!text) {
      this.setState({ codeMsg: string.chuaNhap });
    }
  };

  /**
   *
   */
  submit = () => {
    const { code, codeMsg } = this.state;
    this.checkVali(code);
    if (!code) {
      this.setState({ msg: string.chuaNhapMaXacThuc, checkEmail: false });
      return;
    }
    if (codeMsg) {
      return;
    }
    this.submitForm();
  };

  onCloseModal = () => {
    this.setState({ code: "", msg: "", codeMsg: "" }, () =>
      this.props.onClose()
    );
  };

  onCloseModalDoiMatKhau = () => {
    this.setState({ showModalDoiMatKhau: false });
  };

  render() {
    const { code, msg, checkEmail, codeMsg } = this.state;
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
              <Text style={{ marginVertical: 10 }}>{string.nhapMaXacThuc}</Text>

              {checkEmail ? (
                <Text style={styles.guiEmailThanhCong}>
                  {string.maXacThucDaGuiDenEmail}
                </Text>
              ) : (
                <Text style={styles.message}>{msg}</Text>
              )}

              <View
                style={[
                  styles.viewInput,
                  { borderColor: !codeMsg ? undefined : "#f00" }
                ]}
              >
                <TextInput
                  underlineColorAndroid="transparent"
                  style={styles.textInput}
                  placeholder={string.maXacThuc}
                  value={code}
                  onChangeText={text =>
                    this.setState({ code: text, codeMsg: "", msg: "" })
                  }
                  onEndEditing={event => this.checkVali(event.nativeEvent.text)}
                  onSubmitEditing={this.submit}
                  keyboardType="numeric"
                />
                {!!codeMsg && <Text style={styles.valiMessage}>{codeMsg}</Text>}
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
            <ProgressDialog
              message={string.vuiLongCho}
              visible={this.state.loadingDialogVisible}
              transparent={false}
            />
          </View>
        </Modal>
        <DoiMatKhau
          accountId={this.props.accountId}
          code={this.state.forwardCode}
          visible={this.state.showModalDoiMatKhau}
          onClose={this.onCloseModalDoiMatKhau}
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
    marginHorizontal: 15,
    borderRadius: 5,
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
  guiEmailThanhCong: {
    color: "green",
    fontSize: 12,
    marginBottom: 5,
    textAlign: "center"
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

export default XacThuc;
