import React from "react";
import { connect } from "react-redux";
import { Alert, StyleSheet, View, TouchableOpacity } from "react-native";
import { Body, ListItem, Text, ActionSheet } from "native-base";

import AppComponent from "../../../core/components/AppComponent";
import colors from "../../config/colors";
import ChiTietXeCo, { startAnimatedTo } from "./ChiTietXeCo";
import Icon from "../../component/Icon";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import metrics from "../../../core/config/metrics";
import { screenNames } from "../../config/screen";
import { actionTypes } from "../../reducers";
import { dispatchParams } from "../../../core/actions";
import string from "../../config/string";

class ItemCanHo extends AppComponent {
  constructor(props) {
    super(props);
    const { item, index } = props;
    this.heightView = 0;
    this.state = {
      ...this.state,
      item,
      index,
      loading: 0,
      data: null,
      msg: "",
      isDelete: false
    };
  }

  expandItem = (stateExpand, Flist) => {
    const { index } = this.state;
    this.ChiTietXeCo.expand(stateExpand, Flist, index);
  };

  luuThongTin = () => {
    this.ChiTietXeCo.luuThongTin();
  };

  setItem = item => {
    const { resident_home_id: id } = item || {};
    this.ChiTietXeCo.setId(id);
    this.setState({ item });
  };

  deleteCanHo = async callBack => {
    const { item } = this.state;
    let { resident_home_id: id } = item || {};
    id = id || "";

    let { accountInfo } = this.props;
    accountInfo = accountInfo || {};
    let { home } = accountInfo;
    this.postToServerWithAccount(getApiUrl(API.XOA_CAN_HO), {
      id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        callBack(true);
        this.setState({ isDelete: false });
        home = home.filter(v => v.resident_home_id !== item.resident_home_id);
        this.props.dispatchParams(
          {
            ...accountInfo,
            home: [...home],
            device_token: accountInfo.device_token
          },
          actionTypes.APP_USER_INFO
        );
      } else callBack(false, propsData.message);
    });
  };

  sua = () => {
    const { item } = this.state;
    let { active_app: activeApp } = item || {};
    activeApp = activeApp && activeApp.toString();
    this.navigateToScreen(screenNames.ThemCanHo, {
      selectedData: item,
      showThemAnh: activeApp === "1"
    })();
  };

  xoa = () => {
    const { index } = this.state;
    Alert.alert(string.thongBao, string.xoaCanHo, [
      { text: string.huy },
      { text: string.xoa, onPress: this.props.xoaCanHo.bind(this, index) }
    ]);
  };

  showMore = () => {
    ActionSheet.show(
      {
        options: [string.sua, string.xoa, string.dong],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 1,
        title: string.chucNang
      },
      i => {
        if (i === 0) this.sua();
        else if (i === 1) this.xoa();
      }
    );
  };

  render() {
    const { item, index, isDelete } = this.state;
    if (isDelete) return null;
    const {
      home_name: homeName,
      floor,
      apartment_building_name: apartmentBuildingName,
      apartment_name: apartmentName,
      valid,
      active_app: activeApp,
      resident_home_id: id
    } =
      item || {};

    const textHomeName = homeName
      ? `Phòng ${homeName}`
      : "(Phòng chưa cập nhật)";
    const textFloor = floor ? `Tầng ${floor}` : "(Tầng chưa cập nhật)";
    const textApartmentBuildingName = apartmentBuildingName
      ? `Tòa ${apartmentBuildingName}`
      : "(Tòa chưa cập nhật)";
    const textApartmentName = `Chung cư ${apartmentName}`;

    let txt = "";
    let colorTxt = "gray";
    const acApp = activeApp && activeApp.toString();
    if (acApp === "1") {
      txt = "Chưa duyệt";
      colorTxt = "#FF7F24";
    } else if (acApp === "2") {
      if (valid && valid.toString() === "1") {
        txt = "Đã duyệt";
        colorTxt = colors.brandPrimary;
      } else {
        txt = "Đã khóa";
        colorTxt = "gray";
      }
    } else if (acApp === "3") {
      txt = "Không duyệt";
      colorTxt = "red";
    }

    return (
      <View style={[styles.viewItem]}>
        <ListItem
          onPress={this.props.onSelectItem.bind(this, index)}
          style={[styles.listItem, styles.listItem1, { zIndex: 1 }]}
          button
        >
          {/* <Icon
            iconType="FontAwesome"
            name="home"
            style={[styles.iconHome, { color: colorTxt }]}
          /> */}
          <View style={[styles.viewTrangThai, { borderColor: colorTxt }]}>
            <Text style={[styles.textTrangThai, { color: colorTxt }]}>
              {txt}
            </Text>
          </View>
          <Body>
            <View style={{ flex: 1, width: metrics.DEVICE_WIDTH - 150 }}>
              <Text note={!homeName}>{textHomeName}</Text>
              <Text style={styles.textCenter}>
                <Text note={!floor}>{textFloor}</Text>
                <Text> - </Text>
                <Text note={!apartmentBuildingName}>
                  {textApartmentBuildingName}
                </Text>
              </Text>
              <Text>{textApartmentName}</Text>
            </View>
          </Body>
          <TouchableOpacity onPress={this.showMore.bind(this)}>
            <View hitSlop={{ bottom: 15, left: 15, right: 15, top: 15 }}>
              <Icon
                iconType="MaterialIcons"
                name="more-horiz"
                style={{ fontSize: 30, color: "gray", marginRight: 15 }}
              />
            </View>
          </TouchableOpacity>
          {/* <View style={[styles.viewTrangThai, { borderColor: colorTxt }]}>
            <Text style={[styles.textTrangThai, { color: colorTxt }]}>
              {txt}
            </Text>
          </View> */}
        </ListItem>
        <ChiTietXeCo
          ref={ref => (ref ? (this.ChiTietXeCo = ref.wrappedInstance) : null)}
          id={id}
          sua={this.sua}
          xoa={this.xoa}
        />
      </View>
    );
  }
}

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  { dispatchParams },
  null,
  { withRef: true }
)(ItemCanHo);

const styles = StyleSheet.create({
  viewAbsoluteContent: { position: "absolute", width: "100%", top: 0 },
  viewContent: { zIndex: 100, width: "100%" },
  viewAnimation: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#c9c9c9",
    overflow: "hidden"
  },
  textCenter: { marginVertical: 4 },
  viewItem: { width: "100%", borderWidth: 0, backgroundColor: "white" },
  viewBorderExpand: { borderTopWidth: 0.5, borderTopColor: "#c9c9c9" },
  textAdd: { marginLeft: 5, color: "gray" },
  textTrangThai: { fontSize: 12, textAlign: "center" },
  viewTrangThai: {
    borderWidth: 1,
    padding: 3,
    borderRadius: 5,
    marginHorizontal: 10,
    width: 45
  },
  iconHome: { fontSize: 40, color: colors.brandPrimary, marginLeft: 10 },
  listItem1: { borderBottomWidth: 0, backgroundColor: "#fff" },
  iconAdd: { fontSize: 30, color: "gray" },
  listItemAdd: { justifyContent: "center", backgroundColor: "#c9c9c9" },
  listItem: {
    marginLeft: 0,
    paddingRight: 0,
    paddingTop: 10,
    paddingBottom: 10
  }
});
