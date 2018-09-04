import React from "react";
import { connect } from "react-redux";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Content, Icon, Text, Thumbnail } from "native-base";
import { NavigationActions } from "react-navigation";

import AppComponent from "../../../core/components/AppComponent";
import { screenNames } from "../../config/screen";
import string from "../../config/string";
import colors from "../../../core/config/colors";
import { assets } from "../../../assets";

class CuDan extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: true,
      refreshing: false,
      hasHome: true
    };
  }

  componentWillMount = () => {
    this.onRefresh(this.props.accountInfo.home);
  };

  componentWillReceiveProps = nextProps => {
    if (this.props.accountInfo.home !== nextProps.accountInfo.home) {
      this.onRefresh(nextProps.accountInfo.home);
    }
  };

  onRefresh = home => {
    this.setState({ showAlert: true });
    if (home) {
      if (home.length > 0) {
        this.setState({ hasHome: true });
      } else {
        this.setState({ hasHome: false });
      }
    } else {
      this.setState({ hasHome: false });
    }
  };

  /**
   * Chuyển đến tab cụ thể trong TabBar
   * @param name
   * @returns {*}
   */
  navigateAction = name =>
    NavigationActions.navigate({
      routeName: screenNames.TabScreens,
      params: { navigation: this.props.navigation },
      action: NavigationActions.navigate({
        routeName: name
      })
    });

  /**
   * Ẩn thông báo
   */
  hideAlert = () => {
    this.setState({ showAlert: false });
  };

  render() {
    const { showAlert, hasHome } = this.state;
    const countHome = this.countHome();

    return (
      <View style={{ flex: 1, backgroundColor: colors.windowBackground }}>
        <Content style={{ flex: 1, backgroundColor: "white" }}>
          {countHome === 0 &&
            showAlert && (
              <View style={styles.viewUpdateInfo}>
                <View style={styles.viewClose}>
                  <TouchableOpacity
                    onPress={this.hideAlert}
                    hitSlop={{ bottom: 10, top: 10, left: 10, right: 10 }}
                  >
                    <Icon name="md-close" style={styles.iconClose} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={this.navigateToScreen(screenNames.ThongTinTaiKhoan, {
                    initPage: 1
                  })}
                >
                  <View style={styles.updateInfo}>
                    <Text style={styles.textUpdate}>
                      {hasHome
                        ? string.canHoChuaDuocPheDuyetHome
                        : string.chamDeCapNhat}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

          <View style={styles.viewFlex}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this.props.navigation.dispatch(
                  this.navigateAction(screenNames.CongDong)
                )
              }
            >
              <Thumbnail source={assets.icCongDong} />
              {/*<Icon style={styles.icon} name="ios-people-outline" />*/}
              <Text style={styles.textIcon}>{string.congDong}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this.props.navigation.dispatch(
                  this.navigateAction(screenNames.ThongBao)
                )
              }
            >
              <Thumbnail source={assets.icThongBao} />
              {/*<Icon style={styles.icon} name="ios-mail-outline" />*/}
              <Text style={styles.textIcon}>{string.thongBao}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this.props.navigation.dispatch(
                  this.navigateAction(screenNames.KhaoSat)
                )
              }
            >
              <Thumbnail source={assets.icKhaoSat} />
              {/*<Icon style={styles.icon} name="ios-list-box-outline" />*/}
              <Text style={styles.textIcon}>{string.khaoSat}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewFlex}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this.props.navigation.dispatch(
                  this.navigateAction(screenNames.GopY)
                )
              }
            >
              <Thumbnail source={assets.icGopY} />
              {/*<Icon style={styles.icon} name="ios-chatboxes-outline" />*/}
              <Text style={styles.textIcon}>{string.gopY}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this.props.navigation.dispatch(
                  this.navigateAction(screenNames.SoTay)
                )
              }
            >
              <Thumbnail source={assets.icSoTay} />
              {/*<Icon style={styles.icon} name="ios-book-outline" />*/}
              <Text style={styles.textIcon}>{string.soTay}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => this.navigateToScreen(screenNames.Hotline, {})()}
            >
              <Thumbnail source={assets.icHotLine} />
              {/*<Icon style={styles.icon} name="ios-call-outline" />*/}
              <Text style={styles.textIcon}>{string.hotline}</Text>
            </TouchableOpacity>
          </View>
        </Content>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.windowBackground
  },
  textUpdate: {
    alignSelf: "center",
    fontSize: 13,
    color: "gray",
    textAlign: "center"
  },
  viewUpdateInfo: {
    backgroundColor: "#F0E68C",
    borderColor: "#FDD835",
    borderWidth: 1
  },
  updateInfo: {
    alignItems: "center",
    paddingBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 20
  },
  viewFlex: {
    flexDirection: "row",
    marginVertical: 10
  },
  button: {
    flex: 1,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    color: colors.brandPrimary
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
  },
  textIcon: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textHeader
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(CuDan);
