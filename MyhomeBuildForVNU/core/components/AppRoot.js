import React from "react";
import { Platform, View, StatusBar } from "react-native";
import { StyleProvider, Root } from "native-base";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Font, AppLoading } from "expo";

import getTheme from "../theme/components";
import commonColor from "../theme/variables/commonColor";
import allReducers from "../reducers";
import config from "../config";

import Notification from "./Notification";

export default class AppRoot extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true };
    if (props.reducers) {
      this.store = createStore(props.reducers, applyMiddleware(thunk));
    } else this.store = createStore(allReducers, applyMiddleware(thunk));
    this.notification = props.notification || Notification;
  }

  componentWillMount = async () => {
    //load fonts
    // await  Font.loadAsync({Ionicons: config.fonts.Ionicons});
    if (Platform.OS === "android") {
      await Font.loadAsync({
        Roboto: config.fonts.Roboto,
        Roboto_medium: config.fonts.RobotoMedium
      });
    }
    this.setState({ isLoading: false });
  };

  render = () => {
    //show app loading
    if (this.state.isLoading) return <AppLoading />;
    return (
      <Provider store={this.store}>
        <StyleProvider style={getTheme(commonColor)}>
          <Root>
            {Platform.OS === "android" &&
              Platform.Version <= 19 && (
                <View
                  style={{
                    backgroundColor: config.colors.androidStatusBar,
                    height: StatusBar.currentHeight
                  }}
                />
              )}
            <this.props.router
              ref={router => {
                if (!this.state.router) this.setState({ router });
              }}
            />
            <this.notification router={this.state.router} />
          </Root>
        </StyleProvider>
      </Provider>
    );
  };
}
