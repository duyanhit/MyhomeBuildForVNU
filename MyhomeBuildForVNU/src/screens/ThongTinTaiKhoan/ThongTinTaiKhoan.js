import React from "react";
import { connect } from "react-redux";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Tab, Tabs } from "native-base";

import string from "../../config/string";
import colors from "../../config/colors";
import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import CanHo from "./CanHo";
import CaNhan from "./CaNhan";

class ThongTinTaiKhoan extends AppComponent {
  state = { ...this.state };

  render() {
    let onGoBack = null;
    if (this.props.onGoBack) onGoBack = this.props.onGoBack();
    if (this.pageTab === undefined) {
      this.pageTab =
        this.props.navigation.state.params &&
        this.props.navigation.state.params.initPage
          ? this.props.navigation.state.params.initPage
          : 0;
    }

    return (
      <KeyboardAvoidingView
        style={{ backgroundColor: colors.windowBackground }}
        enabled={Platform.OS === "ios"}
        behavior="padding"
        flex={1}
      >
        <AppHeader
          style={{ borderBottomWidth: 0 }}
          title={string.thongTinTaiKhoan}
          left
          onClose={onGoBack}
          navigation={this.props.navigation}
        />
        <Tabs
          locked
          ref={ref => {
            setTimeout(() => {
              if (ref) ref.goToPage(this.pageTab);
            }, 100);
          }}
          onChangeTab={({ i }) => (this.pageTab = i)}
          tabBarUnderlineStyle={{
            backgroundColor: colors.brandPrimary,
            height: 1
          }}
          tabContainerStyle={{
            height: 40,
            elevation: 0,
            borderBottomWidth: 0.8,
            borderBottomColor: colors.windowBackground
          }}
        >
          <Tab
            heading={string.caNhan}
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: "#c9c9c9" }}
            activeTextStyle={{ color: colors.brandPrimary }}
          >
            <CaNhan navigation={this.props.navigation} />
          </Tab>
          <Tab
            heading={string.canHo}
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: "#c9c9c9" }}
            activeTextStyle={{ color: colors.brandPrimary }}
          >
            <CanHo navigation={this.props.navigation} />
          </Tab>
        </Tabs>
      </KeyboardAvoidingView>
    );
  }
}

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(ThongTinTaiKhoan);
