import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  Keyboard,
  Platform
} from "react-native";
import { Button } from "native-base";
import Icon from "../../component/Icon";
import strings from "../../config/string";
import colors from "../../../core/config/colors";

const InputPassView = ({
  onChangetext,
  placeholder,
  returnKeyType,
  value,
  msg,
  onEndEditing,
  onSubmitEditing,
  self,
  showPass,
  setShowPass
}) => (
  <View style={styles.inputLayout}>
    <View
      style={{
        marginBottom: 15,
        flexDirection: "row",
        borderWidth: 0.7,
        borderColor: !msg ? "gray" : "red",
        borderRadius: 50,
        paddingHorizontal: 10,
        alignItems: "center"
      }}
    >
      <Icon
        iconType="Ionicons"
        name="ios-unlock-outline"
        style={[
          styles.iconInput,
          { color: !msg ? colors.brandPrimary : "red" }
        ]}
      />
      <TextInput
        ref={ref => self(ref)}
        secureTextEntry={!showPass}
        style={styles.textInput}
        returnKeyType={returnKeyType}
        underlineColorAndroid={"transparent"}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="gray"
        keyboardType={"default"}
        onChangeText={text => onChangetext(text)}
        onEndEditing={event => onEndEditing(event.nativeEvent.text)}
        onSubmitEditing={onSubmitEditing}
      />
      {!!msg && (
        <Text
          style={{
            marginHorizontal: 10,
            color: "#f00",
            fontSize: 12
          }}
        >
          {msg}
        </Text>
      )}
      <TouchableOpacity onPress={setShowPass}>
        <Icon
          iconType="Feather"
          name={showPass ? "eye-off" : "eye"}
          style={{
            fontSize: 20,
            color: !msg ? colors.brandPrimary : "#f00"
          }}
        />
      </TouchableOpacity>
    </View>
  </View>
);

const ModalDoiMatKhau = ({
  visible,

  onConfirmPress,
  onCancelPress,

  onEndEditing,
  onSubmitEditing,
  onChangetext,

  setShowPass,

  showPassCur,
  showPassNew,

  msgCurPassError,
  msgNewPassError,
  msgRenewPassError,

  curPassValue,
  newPassValue,
  renewPassValue,

  msgPass
}) => (
  <Modal
    animationType="fade"
    transparent
    visible={visible}
    onRequestClose={() => {}}
  >
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.title}>{strings.doiMatKhau}</Text>
          <Text
            style={{
              color: "#f00",
              fontSize: 12,
              marginBottom: 5,
              textAlign: "center"
            }}
          >
            {msgPass}
          </Text>
          <InputPassView
            placeholder={strings.matKhauHienTai}
            returnKeyType={"next"}
            value={curPassValue}
            onChangetext={text =>
              onChangetext(text, "curPass", "msgCurPassError")
            }
            onEndEditing={text => onEndEditing(text, "curPass")}
            onSubmitEditing={() => onSubmitEditing(this.inputNewPass)}
            self={self => (this.inputCurPass = self)}
            msg={msgCurPassError}
            showPass={showPassCur}
            setShowPass={() => setShowPass("showPassCur")}
          />
          <InputPassView
            placeholder={strings.matKhauMoi}
            returnKeyType={"next"}
            value={newPassValue}
            onChangetext={text =>
              onChangetext(text, "newPass", "msgNewPassError")
            }
            onEndEditing={text => onEndEditing(text, "newPass")}
            onSubmitEditing={() => onSubmitEditing(this.inputRenewPass)}
            self={self => (this.inputNewPass = self)}
            msg={msgNewPassError}
            showPass={showPassNew}
            setShowPass={() => setShowPass("showPassNew")}
          />
          {/* <InputPassView
            placeholder={strings.nhapLaiMatKhauMoi}
            returnKeyType={"next"}
            value={renewPassValue}
            onChangetext={text =>
              onChangetext(text, "renewPass", "msgRenewPassError")
            }
            onEndEditing={text => onEndEditing(text, "renewPass")}
            onSubmitEditing={() => onSubmitEditing()}
            self={self => (this.inputRenewPass = self)}
            msg={msgRenewPassError}
          /> */}
          <View style={styles.buttonLayout}>
            <Button
              style={styles.buttonCancel}
              block
              onPress={() => onCancelPress()}
            >
              <Text style={styles.btnText}>{strings.huy}</Text>
            </Button>
            <Button
              style={styles.buttonConfirm}
              block
              onPress={() => onConfirmPress()}
            >
              <Text style={styles.btnText}>{strings.dongY}</Text>
            </Button>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, .5)",
    alignItems: "center",
    justifyContent: "center"
  },
  loading: {
    minWidth: 250,
    maxWidth: 500,
    width: "80%",
    marginHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 5,
    paddingHorizontal: 20,
    backgroundColor: "white",
    flexDirection: "column",
    borderRadius: 5
  },
  inputLayout: {},
  textInput: {
    marginTop: Platform.OS === "android" ? 0 : 5,
    marginBottom: Platform.OS === "android" ? 0 : 5,
    flex: 1,
    fontSize: 14,
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  iconInput: {
    fontSize: 20,
    color: colors.brandPrimary,
    marginRight: 8,
    marginLeft: 3
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginBottom: 10
  },
  btnText: {
    color: "white",
    paddingHorizontal: 20
  },
  buttonCancel: {
    backgroundColor: "gray",
    width: 90,
    height: 30,
    marginRight: 5
  },
  buttonConfirm: {
    width: 90,
    height: 30,
    marginLeft: 5
  },
  buttonLayout: {
    marginTop: 10,
    marginBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default ModalDoiMatKhau;
