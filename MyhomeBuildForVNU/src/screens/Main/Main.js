import React from "react";
import { connect } from "react-redux";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { Header, Tab, Tabs, Text } from "native-base";
import strings from "../../config/string";
import AppComponent from "../../../core/components/AppComponent";
import colors from "../../config/colors";

import DichVu from "./DichVu";
import CuDan from "./CuDan";
import TaiKhoan from "./TaiKhoan";
import { screenNames } from "../../config/screen";
import { dispatchParams } from "../../actions";
import { actionTypes } from "../../reducers";

class Main extends AppComponent {
  state = {
    countNotification: this.props.accountInfo
      ? this.props.accountInfo.total_notify
      : 0
  };

  componentWillMount = () => {
    this.props.dispatchParams(
      Number(this.state.countNotification),
      actionTypes.NOTIFICATION_CHANGE
    );
  };

  goToDanhSachNotification = () => {
    const { dispatchParams } = this.props;
    dispatchParams(0, actionTypes.NOTIFICATION_CHANGE);
    this.navigateToScreen(screenNames.DanhSachNotification, {})();
  };

  render() {
    let { countNotification } = this.props;
    countNotification =
      countNotification && Number(countNotification) > 99
        ? 99
        : countNotification;

    return (
      <View style={{ flex: 1 }}>
        <Header style={styles.header}>
          <TouchableOpacity
            style={styles.btnSearch}
            onPress={this.navigateToScreen(
              screenNames.TimKiemSanPham,
              {},
              true
            )}
          >
            <EvilIcons name="search" style={{ fontSize: 25 }} />
            <Text style={styles.textSearch}>{strings.timKiemSanPham}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.goToDanhSachNotification}>
            <View>
              <Ionicons
                name="ios-notifications-outline"
                style={styles.iconNotification}
              />
              {Number(countNotification) > 0 && (
                <View style={styles.viewBadge}>
                  <Text style={styles.badge}>{countNotification}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Header>
        <Tabs
          locked={true}
          tabBarUnderlineStyle={styles.underlineTabs}
          tabContainerStyle={styles.containerTabs}
        >
          <Tab
            heading={strings.cuDan}
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: colors.tabTextDefault }}
            activeTextStyle={{ color: colors.brandPrimary }}
          >
            <CuDan navigation={this.props.navigation} />
          </Tab>
          <Tab
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: colors.tabTextDefault }}
            activeTextStyle={{ color: colors.brandPrimary }}
            heading={strings.dichVu}
          >
            <DichVu navigation={this.props.navigation} />
          </Tab>
          <Tab
            heading={strings.taiKhoan}
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: colors.tabTextDefault }}
            activeTextStyle={{ color: colors.brandPrimary }}
          >
            <TaiKhoan navigation={this.props.navigation} />
          </Tab>
        </Tabs>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 0
  },
  btnSearch: {
    backgroundColor: colors.windowBackground,
    flex: 1,
    marginVertical: 5,
    marginRight: 10,
    padding: 5,
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row"
  },
  textSearch: {
    flex: 1,
    marginLeft: 5,
    color: "#c9c9c9"
  },
  iconNotification: {
    fontSize: 25,
    color: colors.textHeader,
    paddingHorizontal: 5
  },
  viewBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f00"
  },
  badge: {
    fontSize: 9,
    color: "#fff"
  },
  underlineTabs: {
    backgroundColor: colors.brandPrimary,
    height: 1
  },
  containerTabs: {
    height: 40,
    elevation: 0,
    borderBottomWidth: 0.8,
    borderBottomColor: colors.windowBackground
  }
});

export default connect(
  state => ({
    accountInfo: state.accountReducer,
    countNotification: state.countNotificationReducer
  }),
  { dispatchParams },
  null,
  { withRef: true }
)(Main);
