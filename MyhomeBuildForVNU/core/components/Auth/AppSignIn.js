import React from "react";
import {
  AsyncStorage,
  Image,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import { Field } from "redux-form";
import { Constants, Notifications, Permissions } from "expo";
import {
  Button,
  Container,
  Content,
  Form,
  Spinner,
  Text,
  View
} from "native-base";

import { accountActionTypes } from "../../reducers/index";
import { assets } from "../../../assets/index";
import AppInput from "../AppInput";
import strings from "../../config/strings";
import storage from "../../../src/config/storage";
import colors from "../../../src/config/colors";

export default class AppSignIn extends React.Component {
  state = {
    isLoading: false,
    errorMessage: undefined
  };

  userInfoType = accountActionTypes.APP_USER_INFO;

  registerForPushNotificationsAsync = async () => {
    try {
      let permission = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      if (permission.status !== "granted") {
        permission = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      }
      if (Constants.isDevice && permission.status === "granted") {
        const deviceToken = await Notifications.getExpoPushTokenAsync();
        return deviceToken;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  checkAccountStorage = callback => {
    AsyncStorage.getItem(storage.accountInfo, (err, accountInfo) => {
      if (!err) {
        callback(JSON.parse(accountInfo));
      } else callback();
    });
  };

  submit = values => {};

  renderView(type) {
    let view;
    switch (type) {
      case "loading":
        view = <Spinner />;
        break;
      case "login":
        view = this.renderLoginFormWithReduxForm();
        break;
      default:
        break;
    }
    return (
      <Container>
        <Content scrollEnabled={false} style={styles.content}>
          <View style={styles.loginView}>
            <View style={styles.viewLogo}>
              <Image
                resizeMode="contain"
                style={{
                  borderRadius: 15,
                  marginBottom: 20,
                  width: 100,
                  height: 100
                }}
                source={assets.logo}
              />
              <Image
                style={styles.txtLogo}
                resizeMode="contain"
                source={assets.imTextMyHome}
              />
            </View>
            {view}
          </View>
        </Content>
      </Container>
    );
  }

  renderLoginFormWithReduxForm() {
    const { errorMessage } = this.state;
    if (this.state.isLoading) {
      return <Spinner />;
    }
    return (
      <Form>
        {errorMessage && <Text style={styles.fieldError}>{errorMessage}</Text>}
        <Field
          withRef
          name="username"
          ref={ref => (this.usernameInputRef = ref)}
          returnKeyType="next"
          returnKeyLabel={strings.next}
          refInput={"usernameInputRef"}
          component={AppInput}
          onEnter={() =>
            this.passwordInputRef
              .getRenderedComponent()
              .refs.passwordInputRef._root.focus()
          }
          icon={"ios-contact-outline"}
          rounded
          formError={errorMessage !== undefined}
          styleItem={styles.itemInput}
          label={strings.username}
        />
        <Field
          withRef
          ref={ref => (this.passwordInputRef = ref)}
          refInput={"passwordInputRef"}
          name="password"
          component={AppInput}
          label={strings.password}
          returnKeyLabel={strings.ok}
          returnKeyType="done"
          onEnter={this.props.handleSubmit(this.submit)}
          secureTextEntry
          rounded
          icon={"ios-lock-outline"}
          formError={errorMessage !== undefined}
          styleItem={styles.itemInput}
        />
        <View animation={"bounceIn"} style={styles.btnSubmit}>
          <Button block rounded onPress={this.props.handleSubmit(this.submit)}>
            <Text>{strings.login}</Text>
          </Button>
          <TouchableWithoutFeedback onPress={() => console.log(this)}>
            <Text style={{ marginTop: 15 }}>
              <Text>Đăng ký tài khoản </Text>
              <Text style={{ color: colors.brandPrimary }}>tại đây</Text>
            </Text>
          </TouchableWithoutFeedback>
        </View>
      </Form>
    );
  }
}

const styles = StyleSheet.create({
  switchView: {
    marginTop: 15,
    marginRight: 30,
    alignItems: "flex-end"
  },
  loginView: {
    marginHorizontal: 30,
    marginTop: 60
  },
  content: {
    backgroundColor: "white"
  },
  viewLogo: {
    marginBottom: 30,
    alignItems: "center"
  },
  logo: {
    borderRadius: 10,
    width: 100,
    height: 100
  },
  txtLogo: {
    height: 50
  },
  fieldError: {
    fontSize: 13,
    color: "red",
    textAlign: "center",
    marginBottom: 10
  },
  textError: { fontSize: 13, color: "red" },
  itemInput: {
    paddingLeft: 10,
    paddingRight: 15,
    marginBottom: 15
  },
  btnSubmit: { marginTop: 15, alignItems: "center", justifyContent: "center" }
});
