import React from "react";
import { connect } from "react-redux";
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  BackHandler
} from "react-native";
import { Text } from "native-base";

import AppComponent from "../../../core/components/AppComponent";
import colors from "../../config/colors";
import string from "../../config/string";
import Icon from "../../component/Icon";
import { screenNames } from "../../config/screen";
import ItemCanHo from "./ItemCanHo";
import metrics from "../../../core/config/metrics";
import ProgressDialog from "../../../core/components/ProgressDialog";

class CanHo extends AppComponent {
  constructor(props) {
    super(props);
    const { accountInfo } = props;
    const { home } = accountInfo || {};
    let homes = home ? [...home] : [];
    homes = homes.map(v => ({
      ...v,
      expand: false,
      heightExpand: new Animated.Value(0)
    }));
    this.state = {
      ...this.state,
      homes,
      keyBoardShow: false,
      loadingDialogVisible: false
    };
    if (Platform.OS === "ios") {
      Keyboard.addListener(
        "keyboardWillShow",
        this.keyboardAction.bind(this, "keyboardWillShow")
      );
      Keyboard.addListener(
        "keyboardWillHide",
        this.keyboardAction.bind(this, "keyboardWillHide")
      );
    } else {
      Keyboard.addListener(
        "keyboardDidShow",
        this.keyboardAction.bind(this, "keyboardDidShow")
      );
      Keyboard.addListener(
        "keyboardDidHide",
        this.keyboardAction.bind(this, "keyboardDidHide")
      );
    }
  }

  keyboardAction = name => {
    this.setState({
      keyBoardShow:
        name ===
        (Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow")
    });
  };

  componentWillReceiveProps = nextProps => {
    const { homes } = this.state;
    if (!this.xoaCanHoState) {
      const { accountInfo } = nextProps;
      const { home } = accountInfo || {};
      let homes1 = home ? [...home] : [];
      homes1 = homes1.map(v => {
        let arrTemp = homes.filter(
          v1 => v1.resident_home_id === v.resident_home_id
        );
        arrTemp = arrTemp && arrTemp.length ? arrTemp[0] : {};
        return {
          ...arrTemp,
          ...v,
          expand: false,
          heightExpand: new Animated.Value(0)
        };
      });
      this.setState({ homes: homes1 }, () => {
        setTimeout(
          () =>
            this.state.homes.forEach((v, i) =>
              this.state.homes[i].self.setItem(v)
            ),
          500
        );
      });
    }
  };

  componentWillMount = () => {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  };

  componentWillUnmount = () => {
    Keyboard.removeAllListeners("keyboardWillShow");
    Keyboard.removeAllListeners("keyboardWillHide");
    Keyboard.removeAllListeners("keyboardDidShow");
    Keyboard.removeAllListeners("keyboardDidHide");

    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  };

  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  expandItem = index => {
    this.index = index;
    if (!this.onExpand) {
      this.onExpand = true;
      setTimeout(() => (this.onExpand = false), 500);
      const { homes } = this.state;
      homes.forEach((v, i) => {
        if (i === index) v.self.expandItem(true, this.refs.FlatList);
        else v.self.expandItem(false, this.refs.FlatList);
      });
    }
  };

  xoaCanHo = index => {
    // if (!this.xoaCanHoState) {
    //   this.xoaCanHoState = true;
    //   setTimeout(() => (this.xoaCanHoState = false), 500);
    const { homes } = this.state;
    this.setState({ isLoading: true, loadingDialogVisible: true });
    homes[index].self.deleteCanHo((state, msg) => {
      if (state) {
        Alert.alert(string.thongBao, string.xoaCanHoThanhCong, [
          {
            text: string.dongY,
            onPress: () =>
              this.setState({ isLoading: false, loadingDialogVisible: false })
          }
        ]);
      } else {
        Alert.alert(string.thongBao, msg, [
          {
            text: string.dongY,
            onPress: () =>
              this.setState({ isLoading: false, loadingDialogVisible: false })
          }
        ]);
      }
    });
    // }
  };

  renderItem = ({ item, index }) => {
    const { homes } = this.state;
    return (
      <ItemCanHo
        ref={ref => (ref ? (homes[index].self = ref.wrappedInstance) : null)}
        item={item}
        index={index}
        onSelectItem={this.expandItem}
        navigation={this.props.navigation}
        xoaCanHo={this.xoaCanHo}
      />
    );
  };

  actionFooter = () => {
    const { keyBoardShow, homes } = this.state;
    if (keyBoardShow) {
      homes[this.index].self.luuThongTin();
    } else {
      this.navigateToScreen(screenNames.ThemCanHo, { showThemAnh: true })();
    }
  };

  render() {
    const { homes, keyBoardShow, loadingDialogVisible } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: colors.windowBackground }}>
        <View style={{ flex: 1 }}>
          <FlatList
            ref="FlatList"
            data={homes}
            keyExtractor={(v, i) => i.toString()}
            renderItem={this.renderItem}
            extraData={homes}
          />
        </View>
        <View
          style={{
            paddingBottom: !keyBoardShow && metrics.IS_IPHONE_X ? 20 : 0,
            backgroundColor: keyBoardShow ? colors.brandPrimary : "#c9c9c9"
          }}
        >
          <TouchableOpacity onPress={this.actionFooter}>
            <View style={[styles.listItem, styles.listItemAdd]}>
              {keyBoardShow ? null : (
                <Icon
                  iconType="FontAwesome"
                  name="plus-circle"
                  style={styles.iconAdd}
                />
              )}
              <Text
                style={[
                  styles.textAdd,
                  { color: keyBoardShow ? "white" : "gray" }
                ]}
              >
                {keyBoardShow ? string.luuThongTin : string.themCanHo}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ProgressDialog
          visible={loadingDialogVisible}
          message={string.vuiLongCho}
        />
      </View>
    );
  }
}

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(CanHo);

const styles = StyleSheet.create({
  textAdd: { marginLeft: 5, color: "gray" },
  textTrangThai: { fontSize: 12 },
  viewTrangThai: {
    borderWidth: 1,
    padding: 3,
    borderRadius: 5,
    marginRight: 10
  },
  iconHome: { fontSize: 40, color: colors.brandPrimary, marginLeft: 10 },
  iconAdd: { fontSize: 30, color: "gray" },
  listItemAdd: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  listItem: {
    width: "100%",
    marginLeft: 0,
    paddingRight: 0,
    paddingTop: 10,
    paddingBottom: 10
  }
});
