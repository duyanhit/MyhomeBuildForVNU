import React from "react";
import { connect } from "react-redux";
import {
  Alert,
  AsyncStorage,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import {
  Body,
  Button,
  Content,
  Left,
  ListItem,
  Right,
  Text,
  Thumbnail
} from "native-base";
import { Feather } from "@expo/vector-icons";
import { Fingerprint } from "expo";

import AppComponent from "../../../core/components/AppComponent";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { consoleLog } from "../../../core/components/AppLog";
import storage from "../../config/storage";
import string from "../../config/string";
import { screenNames } from "../../config/screen";
import { assets } from "../../../assets";
import metrics from "../../../core/config/metrics";
import colors from "../../config/colors";
import ProgressDialog from "../../../core/components/ProgressDialog";
import { GenerateMD5FromString } from "../../../core/helpers/MD5HashGenerator";
import AddPassword from "./AddPassword";
import { dispatchParams } from "../../actions";
import { actionTypes } from "../../reducers";

class TaiKhoan extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isShowModal: false,
      loadingDialogVisible: false,
      showPass: false,
      password: "",
      passwordMsg: "",
      msg: "",
      showModalAddPassword: false,
      badge: undefined,
      coin: "",
      prefixItem: [
        {
          name: string.myhomePay,
          id: "-1",
          icon: assets.icMenuDangKyVanTay,
          iconType: "MaterialIcons",
          hidden: true
        },
        {
          name: string.dangKyVanTay,
          id: "-2",
          icon: assets.icMenuDangKyVanTay,
          iconType: "MaterialIcons"
        },
        {
          name: string.dangKyGianHang,
          id: "-3",
          icon: assets.icMenuThemGianHang,
          iconType: "MaterialIcons"
        },
        {
          name: string.gianHangCuaToi,
          id: "-4",
          icon: assets.icMenuThemGianHang,
          iconType: "Entypo",
          stores: [],
          hidden: !(props.accountInfo.store && props.accountInfo.store.length)
        },
        {
          name: string.donDatHang,
          id: "-5",
          icon: assets.icMenuDonBan,
          iconType: "MaterialCommunityIcons",
          hidden: !(props.accountInfo.store && props.accountInfo.store.length)
        },
        {
          name: string.lichSuMuaHang,
          id: "-6",
          icon: assets.icMenuDonMua,
          iconType: "MaterialIcons"
        },
        {
          name: string.dieuKhoanVaChinhSach,
          id: "-7",
          icon: assets.icMenuDieuKhoan,
          iconType: "Entypo"
        },
        {
          name: string.logout,
          id: "-8",
          icon: assets.icMenuDangXuat,
          iconType: "MaterialCommunityIcons"
        }
      ]
    };
  }

  componentWillMount = () => {
    this.getCountBadge();
    this.countCoin();
  };

  componentWillReceiveProps = nextProps => {
    const { accountInfo } = nextProps;
    const { prefixItem } = this.state;
    const { store } = accountInfo || {};
    prefixItem[3].hidden = !(store && store.length);
    prefixItem[4].hidden = !(store && store.length);
    this.setState({ prefixItem: [...prefixItem] });
  };

  getCountBadge = () => {
    const { accountInfo, dispatchParams } = this.props;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.COUNT_DON_BAN_PENDING)).then(
        response => {
          const res = parseJsonFromApi(response);
          if (res.status === 1) {
            dispatchParams(res.data, actionTypes.BADGE_CHANGE);
          } else {
            dispatchParams(0, actionTypes.BADGE_CHANGE);
          }
          this.setState({ refreshing: false });
        }
      );
    }
  };

  callSignOut = async navigation => {
    try {
      this.setState({ loadingDialogVisible: true });
      this.postToServerWithAccount(getApiUrl(API.DANG_XUAT), {}).then(
        response => {
          const apiRes = parseJsonFromApi(response);
          if (apiRes.status === 1) {
            // AsyncStorage.removeItem(storage.accountInfo);
            let multiRemoves = [storage.accountInfo, storage.hasEmail];
            AsyncStorage.multiRemove(multiRemoves, err => {});
            navigation.navigate(screenNames.Login, { dangXuat: true });
            this.props.dispatchParams(0, actionTypes.BADGE_CHANGE);
            this.closeDialogProgress();
          } else {
            Alert.alert(
              string.titleError,
              apiRes.message,
              [
                {
                  text: string.dongY,
                  onPress: () => this.closeDialogProgress()
                }
              ],
              { cancelable: false }
            );
          }
        }
      );
    } catch (error) {
      consoleLog(error, "appSignOut");
    }
  };

  closeDialogProgress = () => {
    // this.setState({ loadingDialogVisible: false });
  };

  dangXuat = () => {
    Alert.alert(string.signOutTitlte, string.signOutConfirmMessage, [
      {
        text: string.signOutNavigate
      },
      {
        text: string.labelOK,
        onPress: () => {
          this.callSignOut(this.props.navigation);
        }
      }
    ]);
  };

  /**
   * kiểm tra mật khẩu
   * @param pass
   * @returns {Promise<void>}
   */
  submitForm = async pass => {
    const { accountInfo } = this.props;
    let { password } = this.state;
    password = pass || password;
    const passMD5 = GenerateMD5FromString(password);
    if (accountInfo) {
      this.setState({ loadingDialogVisible: true, msg: "" });
      this.getFromServerWithAccount(getApiUrl(API.KIEM_TRA_MAT_KHAU), {
        password
      }).then(response => {
        this.setState({ loadingDialogVisible: false });
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          AsyncStorage.setItem(storage.password, password);
          this.showAlertDialog(string.dangKyVanTayThanhCong, () => {
            this.onCloseModal();
          });
        } else {
          this.showAlertDialog(string.matKhauKhongChinhXac);
          this.setState({ password: "" });
        }
      });
    }
  };

  checkVali = text => {
    if (!text) {
      this.setState({ passwordMsg: string.chuaNhap });
    } else if (text.length < 6) {
      this.setState({ passwordMsg: string.quaNgan });
    } else if (text.length > 32) {
      this.setState({ passwordMsg: string.quaDai });
    }
  };

  submit = () => {
    const { password, passwordMsg } = this.state;
    this.checkVali(password);
    if (!password) {
      this.setState({ msg: string.chuaNhapMatKhau });
      return;
    }
    if (passwordMsg) {
      return;
    }
    this.submitForm();
  };

  /**
   * kiểm tra vân tay
   * @returns {Promise<void>}
   */
  checkFingerPrint = async () => {
    const { accountInfo } = this.props;
    if (accountInfo.has_password === 0) {
      Alert.alert(
        string.thongBao,
        string.taiKhoanCuaBanChuaCoMatKhau,
        [
          { text: string.huy },
          {
            text: string.capNhat,
            onPress: () => this.setState({ showModalAddPassword: true })
          }
        ],
        { cancelable: false }
      );
    } else {
      let vanTayScan = await Fingerprint.hasHardwareAsync();
      if (!vanTayScan) {
        this.showAlertDialog(string.khongCoQuetVanTay);
      } else {
        let vanTay = await Fingerprint.isEnrolledAsync();
        if (!vanTay) {
          this.showAlertDialog(string.chuaLuuVanTay);
        } else {
          this.setState({ isShowModal: true });
        }
      }
    }
  };

  /**
   * Close modal
   */
  onCloseModal = () => {
    this.setState({
      isShowModal: false,
      password: ""
    });
  };

  onCloseModalAddPassword = () => {
    this.setState({ showModalAddPassword: false });
  };

  onItemPress = item => {
    switch (item.name) {
      case string.myhomePay:
        this.navigateToScreen(screenNames.DanhSachGoiDichVu, {})();
        break;
      case string.dangKyVanTay:
        this.checkFingerPrint();
        break;
      case string.dieuKhoanVaChinhSach:
        this.navigateToScreen(screenNames.ThongTinUngDung, {})();
        break;
      case string.logout:
        this.dangXuat();
        break;
      case string.dangKyGianHang:
        this.navigateToScreen(screenNames.TaoGianHang, {})();
        break;
      case string.donDatHang:
        this.navigateToScreen(screenNames.DanhSachDonBan, {})();
        break;
      case string.lichSuMuaHang:
        this.navigateToScreen(screenNames.DanhSachDonMua, {})();
        break;
      default:
        break;
    }
  };

  renderSubItem = ({ item }) => {
    return (
      <ListItem
        avatar
        button
        onPress={this.navigateToScreen(screenNames.ChiTietGianHang, {
          id: item.id
        })}
      >
        <Left>
          <Image
            source={assets.shopDefault}
            style={[styles.imageStore, { position: "absolute" }]}
          />
          <Image
            source={{ uri: API.HOST + item.image }}
            style={styles.imageStore}
          />
        </Left>
        <Body style={{ borderBottomWidth: 0, paddingLeft: 5 }}>
          <Text numberOfLines={1}>{item.name}</Text>
        </Body>
        {item.valid === "0" && (
          <Text note style={{ marginRight: 20, fontSize: 11 }}>
            {string.daKhoa}
          </Text>
        )}
      </ListItem>
    );
  };

  renderItem = ({ item, index }) => {
    const { countBadge } = this.props;
    let style;
    if (index === 3) {
      style = {
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderTopColor: "lightgray",
        borderBottomColor: "lightgray",
        marginVertical: 5,
        paddingBottom: 5
      };
    }

    if (item.hidden) {
      return <View />;
    }

    return (
      <View style={style}>
        <ListItem avatar button onPress={this.onItemPress.bind(this, item)}>
          <Left>
            {index !== 3 ? (
              <Thumbnail square style={styles.icon} source={item.icon} />
            ) : (
              <Text numberOfLines={1} style={styles.gianHangCuaToi}>
                {item.name}
              </Text>
            )}
          </Left>
          <Body
            style={{
              borderBottomWidth: 0
            }}
          >
            {index !== 3 && <Text numberOfLines={1}>{item.name}</Text>}
          </Body>
          {index === 4 && countBadge && Number(countBadge) > 0 ? (
            <Right style={styles.rightItem}>
              <View style={styles.viewBadge}>
                <Text style={styles.badge}>{countBadge}</Text>
              </View>
            </Right>
          ) : null}
        </ListItem>

        {item.stores && (
          <FlatList
            style={{ paddingLeft: 5 }}
            data={item.stores}
            renderItem={this.renderSubItem}
            keyExtractor={itm => itm.id.toString()}
          />
        )}
      </View>
    );
  };

  countCoin = () => {
    // const { accountInfo } = this.props;
    // this.setState({ coin: accountInfo.coin });
  };

  render() {
    const { accountInfo } = this.props;
    const { email, fullname, avatar, phone, store } = accountInfo || {};

    const {
      showPass,
      isShowModal,
      password,
      passwordMsg,
      msg,
      showModalAddPassword,
      refreshing,
      coin,
      prefixItem,
      loadingDialogVisible
    } = this.state;

    prefixItem[3].stores = store;

    return (
      <View style={{ flex: 1, backgroundColor: colors.windowBackground }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                this.setState({ refreshing: true });
                this.getCountBadge();
                this.countCoin();
              }}
            />
          }
        >
          <Content style={{ flex: 1, backgroundColor: "white" }}>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate(screenNames.ThongTinTaiKhoan)
              }
            >
              <View style={{ flexDirection: "row", margin: 15 }}>
                <Image
                  source={assets.avatarDefault}
                  style={[styles.avatar, { position: "absolute" }]}
                />
                <Image
                  source={avatar ? { uri: avatar } : assets.avatarDefault}
                  style={styles.avatar}
                />

                <View style={{ justifyContent: "center" }}>
                  <Text style={[styles.textInfo, { fontWeight: "bold" }]}>
                    {fullname}
                  </Text>
                  {phone ? (
                    <Text note style={styles.textInfo}>
                      {phone}
                    </Text>
                  ) : null}
                  {email ? (
                    <Text note style={styles.textInfo}>
                      {email}
                    </Text>
                  ) : null}
                  {coin ? (
                    <Text
                      note
                      style={[styles.textInfo, { color: colors.coinColor }]}
                    >
                      {coin} {string.xu}
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>

            <View
              style={{ height: 1, backgroundColor: colors.windowBackground }}
            />

            <FlatList
              style={{ marginTop: 15 }}
              data={prefixItem}
              keyExtractor={item => item.id.toString()}
              renderItem={this.renderItem}
            />

            <ProgressDialog
              message={string.vuiLongCho}
              visible={loadingDialogVisible}
              transparent={false}
            />

            <Modal
              visible={isShowModal}
              transparent
              onRequestClose={() => this.setState({ isShowModal: false })}
              animationType="fade"
            >
              <View style={styles.contentRoot}>
                <View style={styles.viewRoot}>
                  <Text style={styles.textVanTay}>{string.dangKyVanTay}</Text>
                  <Text style={styles.nhapMatKhau}>
                    {string.nhapMatKhauDeDangKyVanTay}
                  </Text>

                  <Text style={styles.message}>{msg}</Text>

                  <View
                    style={[
                      styles.viewInput,
                      { borderColor: !passwordMsg ? undefined : "#f00" }
                    ]}
                  >
                    <Feather
                      name="unlock"
                      style={[
                        styles.iconPass,
                        { color: !passwordMsg ? colors.brandPrimary : "#f00" }
                      ]}
                    />
                    <TextInput
                      underlineColorAndroid="transparent"
                      style={styles.textInput}
                      placeholder={string.matKhau}
                      secureTextEntry={!showPass}
                      value={password}
                      onChangeText={text =>
                        this.setState({
                          password: text,
                          msg: "",
                          passwordMsg: ""
                        })
                      }
                      onEndEditing={event =>
                        this.checkVali(event.nativeEvent.text)
                      }
                      onSubmitEditing={this.submit}
                    />
                    {!!passwordMsg && (
                      <Text style={styles.valiMessage}>{passwordMsg}</Text>
                    )}
                    <TouchableWithoutFeedback
                      onPress={() => this.setState({ showPass: !showPass })}
                    >
                      <Feather
                        name={showPass ? "eye-off" : "eye"}
                        style={[
                          styles.iconPass,
                          { color: !passwordMsg ? colors.brandPrimary : "#f00" }
                        ]}
                      />
                    </TouchableWithoutFeedback>
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
              </View>
            </Modal>

            <AddPassword
              visible={showModalAddPassword}
              onClose={this.onCloseModalAddPassword}
            />
          </Content>
        </ScrollView>
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
  viewContent: {
    width: "100%",
    padding: 10
  },
  message: {
    color: "#f00",
    fontSize: 14,
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
  viewButton: {
    flexDirection: "row",
    marginTop: 20
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 5,
    alignSelf: "center",
    justifyContent: "center"
  },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "white",
    marginRight: 15
  },
  textInfo: {
    width: metrics.DEVICE_WIDTH - 90
  },
  icon: {
    width: 30,
    height: 30,
    margin: 5
  },
  rightItem: {
    justifyContent: "center",
    alignContent: "center",
    borderBottomWidth: 0
  },
  viewBadge: {
    backgroundColor: "red",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 50
  },
  badge: {
    fontSize: 11,
    color: "white"
  },
  textVanTay: {
    color: colors.brandPrimary,
    fontWeight: "bold"
  },
  nhapMatKhau: {
    marginVertical: 10,
    marginHorizontal: 15,
    textAlign: "center"
  },
  valiMessage: {
    marginHorizontal: 10,
    color: "#f00",
    fontSize: 12
  },
  imageStore: {
    width: 30,
    height: 30,
    borderRadius: 15
  },
  gianHangCuaToi: {
    color: "gray",
    paddingLeft: 5,
    marginVertical: 10
  }
});

export default connect(
  state => ({
    accountInfo: state.accountReducer,
    countBadge: state.countBadgeReducer
  }),
  { dispatchParams },
  null,
  { withRef: true }
)(TaiKhoan);
