import React from "react";
import { connect } from "react-redux";
import {
  Alert,
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  Platform
} from "react-native";
import {
  Text,
  ActionSheet,
  ListItem,
  Body,
  Thumbnail,
  Header,
  Icon as IconNB,
  Left,
  Button
} from "native-base";
import Moment from "moment";
import Stars from "react-native-stars";

import AppComponent from "../../../../core/components/AppComponent";
import ProgressDialog from "../../../../core/components/ProgressDialog";
import { dispatchParams } from "../../../../core/actions";
import { API, getApiUrl } from "../../../config/server";
import { parseJsonFromApi } from "../../../../core/helpers/apiHelper";
import metrics from "../../../../core/config/metrics";
import string from "../../../config/string";
import { screenNames } from "../../../config/screen";
import { assets } from "../../../../assets";
import colors from "../../../config/colors";
import Icon from "../../../component/Icon";
import { actionTypes } from "../../../reducers";
import ListProduct from "../../DichVu/ListProduct";
import ViewMoreText from "../../../component/ViewMoreText";

class ChiTietGianHang extends AppComponent {
  state = {
    ...this.state,
    isShowModal: false,
    loadingDialogVisible: false,
    showPass: false,
    password: "",
    passwordMsg: "",
    msg: "",
    showModalAddPassword: false,
    data: [],
    image: null,
    tenGianHang: "",
    diaChi: "",
    lienHe: "",
    moTa: "",
    isEditDiaChi: false,
    location: null
  };

  componentWillMount = () => {
    this.showSuaXoa = this.props.accountInfo.store.filter(
      v => v.id === this.props.navigation.state.params.id
    ).length;
    this.getScreenData();
  };

  getScreenData = () => {
    this.getFromServerWithAccount(getApiUrl(API.CHI_TIET_GIAN_HANG), {
      id: this.props.navigation.state.params.id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status !== 1) {
        this.showAlertDialog(propsData.message);
      }
      this.setState({ isLoading: false, data: propsData.data });
    });
  };

  xoaGianHang = () => {
    this.setState({ isLoading: true });
    this.postToServerWithAccount(getApiUrl(API.XOA_GIAN_HANG), {
      id: this.props.navigation.state.params.id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        const { accountInfo } = this.props;
        let { store } = accountInfo || {};
        store = store.filter(
          v => v.id !== this.props.navigation.state.params.id
        );
        this.props.dispatchParams(
          {
            ...accountInfo,
            store: [...store],
            device_token: accountInfo.device_token
          },
          actionTypes.APP_USER_INFO
        );
        Alert.alert(string.thongBao, string.xoaGianHangThanhCong, [
          {
            text: string.dongY,
            onPress: () => {
              this.props.navigation.goBack();
            }
          }
        ]);
      } else {
        Alert.alert(string.thongBao, propsData.message);
        this.setState({ isLoading: false });
      }
    });
  };

  actionMore = index => {
    const { data } = this.state;
    const { name, image, description, address, contact, id, cover } =
      data || {};
    let { longitude, latitude } = data || {};
    longitude = longitude && !isNaN(Number(longitude)) ? Number(longitude) : 0;
    latitude = latitude && !isNaN(Number(latitude)) ? Number(latitude) : 0;
    if (index === 0) {
      this.navigateToScreen(screenNames.TaoGianHang, {
        image,
        cover,
        tenGianHang: name,
        moTa: description,
        lienHe: contact,
        diaChi: address,
        location: { longitude, latitude },
        id,
        callBack: this.getScreenData
      })();
    } else if (index === 1) {
      Alert.alert(string.thongBao, string.banChacChanMuonXoaGianHangNayKhong, [
        { text: string.huy },
        { text: string.dongY, onPress: this.xoaGianHang }
      ]);
    }
  };

  onPressMore = () => {
    ActionSheet.show(
      {
        options: [string.sua, string.xoa, string.dong],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 1
      },
      this.actionMore
    );
  };

  callBack = () => {
    this.ListProduct.refreshScreen();
    this.refreshScreen();
  };

  renderDanhMuc = ({ item, index }) => {
    const { data } = this.state;
    const { id } = data || {};
    return (
      <ListItem
        onPress={this.navigateToScreen(
          screenNames.DanhSachSanPhamTrongDanhMuc,
          {
            url: API.DANH_SACH_SAN_PHAM_TRONG_GIAN_HANG,
            title: item.name,
            type: "SAN_PHAM_TRONG_DANH_MUC_CUA_GIAN_HANG",
            dataApi: { category: item.id, id }
          },
          true
        )}
        button
        style={[
          styles.listItemDanhMuc,
          { borderTopWidth: this.showSuaXoa && index === 0 ? 0 : 0.8 }
        ]}
      >
        <Body>
          <Text>{item.name}</Text>
        </Body>
        <Text style={{ fontSize: 12 }}>{`(${item.total_product})`}</Text>
        <Icon
          name="keyboard-arrow-right"
          iconType="MaterialIcons"
          style={{ fontSize: 20 }}
        />
      </ListItem>
    );
  };

  khoaGianHang = () => {
    const { data } = this.state;
    const { valid } = data || {};

    Alert.alert(
      string.thongBao,
      valid === "0" ? string.moKhoaGianHang : string.khoaGianHang,
      [
        { text: string.huy },
        {
          text: string.dongY,
          onPress: () => {
            this.setState({ dialogVisible: true });
            this.postToServerWithAccount(getApiUrl(API.KHOA_GIAN_HANG), {
              id: this.props.navigation.state.params.id,
              publish: valid === "0" ? "1" : "0"
            }).then(response => {
              const propsData = parseJsonFromApi(response);
              if (propsData.status === 1) {
                this.setState({
                  dialogVisible: false,
                  data: { ...data, valid: valid === "0" ? "1" : "0" }
                });
                this.ListProduct.refreshScreen();
                const { accountInfo } = this.props;
                let { store } = accountInfo || {};
                store = store.map(v => {
                  if (v.id === this.props.navigation.state.params.id) {
                    return { ...v, valid: valid === "0" ? "1" : "0" };
                  }
                  return v;
                });
                this.props.dispatchParams(
                  {
                    ...accountInfo,
                    store: [...store],
                    device_token: accountInfo.device_token
                  },
                  actionTypes.APP_USER_INFO
                );
              } else {
                Alert.alert(string.thongBao, propsData.message);
                this.setState({ dialogVisible: false });
              }
            });
          }
        }
      ]
    );
  };

  khoaSanPham = (item, index, cb) => {
    const { data } = this.state;
    const { valid } = data || {};
    if (valid === "0") {
      this.showAlertDialog(string.gianHangDaKhoa);
      return;
    }
    Alert.alert(
      string.thongBao,
      item.valid === "0" ? string.moKhoaSanPham : string.KhoaSanPham,
      [
        { text: string.huy },
        {
          text: string.dongY,
          onPress: () => {
            this.setState({ dialogVisible: true });
            this.postToServerWithAccount(getApiUrl(API.KHOA_SAN_PHAM), {
              id: item.id,
              publish: item.valid === "0" ? "1" : "0"
            }).then(response => {
              const propsData = parseJsonFromApi(response);
              if (propsData.status === 1) {
                cb();
                this.setState({ dialogVisible: false });
              } else {
                Alert.alert(string.thongBao, propsData.message, [
                  {
                    text: string.dong,
                    onPress: () => {
                      this.setState({ dialogVisible: false });
                    }
                  }
                ]);
              }
            });
          }
        }
      ]
    );
  };

  render() {
    const { data, isLoading } = this.state;
    let {
      id,
      valid,
      cover,
      name,
      image,
      created_at: createdAt,
      description,
      star,
      total_rate: totalRate,
      product_category: productCategory,
      address,
      contact
    } =
      data || {};
    name = name || "";
    valid = valid || "0";
    id = id || "";
    star = star ? Number(star) : 0;
    totalRate = totalRate ? Number(totalRate) : 0;
    image = image || "";
    cover = cover || "";
    productCategory = productCategory || null;
    createdAt = createdAt || "";
    description = description || "";
    address = address || "";
    contact = contact || "";

    let viewMain = null;
    if (isLoading) {
      viewMain = <View style={{ flex: 1 }}>{this.viewLoading()}</View>;
    } else {
      viewMain = (
        <View style={styles.viewMain}>
          <ListProduct
            khoaSanPham={this.khoaSanPham}
            isEdit={this.showSuaXoa}
            GHlocked={valid === "0"}
            dataEdit={{ callBack: this.callBack }}
            ref={ref => (ref ? (this.ListProduct = ref.wrappedInstance) : null)}
            navigation={this.props.navigation}
            url={API.DANH_SACH_SAN_PHAM_TRONG_GIAN_HANG}
            data={{ id: this.props.navigation.state.params.id }}
            propsList={{
              ListHeaderComponent: (
                <View>
                  <View style={{ height: metrics.DEVICE_WIDTH / 2 + 70 }}>
                    <View style={styles.coverStore}>
                      <Image
                        source={{ uri: `${API.HOST}${cover}` }}
                        style={styles.avatarStore1}
                      />
                      {valid === "0" ? (
                        <View style={styles.viewLock}>
                          <Text style={{ color: "#fff" }}>{string.daKhoa}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.viewAvatarStore}>
                      <Image
                        source={assets.shopDefault}
                        style={[styles.avatarStore, styles.imageDefault]}
                      />
                      <Image
                        resizeMode="contain"
                        source={{ uri: `${API.HOST}${image}` }}
                        style={[
                          styles.avatarStore,
                          {
                            borderWidth: 0.8,
                            borderColor: colors.windowBackground
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.textNameStore}>{name}</Text>
                  </View>

                  <View style={styles.itemViewDetail}>
                    <Text style={styles.textTitleDetail}>
                      {string.ngayThamGia}
                    </Text>
                    <Text style={styles.textTitleDetail}>
                      {Moment(createdAt).format("DD/MM/YYYY")}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.itemViewDetail,
                      { marginBottom: 15, alignItems: "center" }
                    ]}
                  >
                    {!!totalRate && (
                      <Stars
                        value={star}
                        count={5}
                        spacing={3}
                        starSize={15}
                        emptyStar={assets.starEmpty}
                        halfStar={assets.starHalf}
                        fullStar={assets.starFull}
                      />
                    )}
                    <Text
                      style={[
                        styles.textTitleDetail,
                        { color: undefined, marginLeft: 2 }
                      ]}
                    >
                      {`(${totalRate || string.chuaCoDanhGia})`}
                    </Text>
                  </View>

                  {!!this.showSuaXoa && (
                    <View style={styles.viewActionStore}>
                      <TouchableOpacity
                        onPress={this.navigateToScreen(screenNames.TaoSanPham, {
                          id: this.props.navigation.state.params.id,
                          callBack: this.callBack,
                          isAddNew: true,
                          active: valid === "0"
                        })}
                      >
                        <View
                          style={[styles.itemAction, { borderLeftWidth: 0 }]}
                        >
                          <Thumbnail
                            resizeMode={"center"}
                            square
                            style={styles.thumbnail}
                            source={assets.icShopAdd}
                          />
                          <Text style={styles.shopFunction}>
                            {string.sanPham}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={this.navigateToScreen(
                          screenNames.DanhSachDonBan,
                          { storeId: id }
                        )}
                      >
                        <View style={styles.itemAction}>
                          <Thumbnail
                            resizeMode={"center"}
                            square
                            style={styles.thumbnail}
                            source={assets.icShopOrder}
                          />
                          <Text style={styles.shopFunction}>
                            {string.donBan}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.khoaGianHang}>
                        <View style={styles.itemAction}>
                          <Thumbnail
                            resizeMode={"center"}
                            square
                            style={styles.thumbnail}
                            source={
                              valid === "0"
                                ? assets.icShopOpen
                                : assets.icShopLock
                            }
                          />

                          <Text style={styles.shopFunction}>
                            {valid === "0" ? string.moKhoa : string.khoa}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.onPressMore}>
                        <View style={[styles.itemAction]}>
                          <Thumbnail
                            resizeMode={"center"}
                            square
                            style={styles.thumbnail}
                            source={assets.icShopEdit}
                          />
                          <Text style={styles.shopFunction}>
                            {string.sua}/{string.xoa}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.viewDescription}>
                    <Text style={styles.textGioiThieu}>{string.gioiThieu}</Text>

                    <View style={styles.viewMoreDetail}>
                      <ViewMoreText
                        numberOfLines={2}
                        renderViewMore={onPress => (
                          <Text
                            style={[styles.textContent, { color: "#007aff" }]}
                            onPress={onPress}
                          >
                            {string.xemThem}
                          </Text>
                        )}
                        renderViewLess={onPress => <Text> </Text>}
                      >
                        <Text style={styles.textContent}>{description}</Text>
                      </ViewMoreText>
                    </View>

                    <View style={styles.viewContact}>
                      <IconNB name="ios-call" style={styles.iconContact} />
                      <Text>{contact}</Text>
                    </View>

                    <View style={styles.viewContact}>
                      <IconNB name="ios-pin" style={styles.iconContact} />
                      <Text style={{ marginRight: 15 }}>{address}</Text>
                    </View>
                  </View>

                  <FlatList
                    style={styles.flatList}
                    data={productCategory || []}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={this.renderDanhMuc}
                  />
                </View>
              )
            }}
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Header style={styles.header}>
          <Left
            style={Platform.OS === "ios" ? { maxWidth: 30 } : { maxWidth: 40 }}
          >
            <Button
              transparent
              onPress={() => this.props.navigation.goBack()}
              androidRippleColor="#ffffff"
            >
              <IconNB style={{ color: colors.textHeader }} name="arrow-back" />
            </Button>
          </Left>
          <TouchableOpacity
            style={styles.inputSearch}
            onPress={this.navigateToScreen(
              screenNames.TimKiemSanPham,
              {
                store: this.props.navigation.state.params.id,
                arrCategory: productCategory
              },
              true
            )}
          >
            <Icon iconType="EvilIcons" name="search" style={{ fontSize: 23 }} />
            <Text style={styles.textPlaceHolder}>{string.timKiemSanPham}</Text>
          </TouchableOpacity>
        </Header>
        {viewMain}
        <ProgressDialog
          visible={this.state.dialogVisible || false}
          message={string.vuiLongCho}
          transparent={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconAction: {
    fontSize: 20,
    color: colors.brandPrimary,
    marginBottom: 5
  },
  itemAction: {
    alignItems: "center",
    width: metrics.DEVICE_WIDTH / 4,
    paddingVertical: 5,
    borderLeftColor: colors.windowBackground,
    borderLeftWidth: 0.8
  },
  textTitleDetail: {
    fontSize: 12
  },
  itemViewDetail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3
  },
  textContent: {
    fontSize: 14,
    textAlign: "justify"
  },
  container: {
    flex: 1,
    backgroundColor: colors.windowBackground
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 0.8,
    borderBottomColor: colors.windowBackground
  },
  inputSearch: {
    backgroundColor: colors.windowBackground,
    flex: 1,
    marginVertical: 5,
    marginRight: 10,
    padding: 5,
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row"
  },
  textPlaceHolder: {
    flex: 1,
    marginLeft: 5,
    color: "#c9c9c9"
  },
  textInput: {
    borderWidth: 0.5,
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    marginBottom: 10
  },
  viewMain: {
    flex: 1,
    backgroundColor: colors.windowBackground
  },
  viewHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 5,
    borderBottomColor: colors.windowBackground,
    backgroundColor: "#fff"
  },
  viewImageHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  imageDefault: {
    position: "absolute"
  },
  avatarStore: {
    width: 80,
    height: 80
  },
  avatarStore1: {
    width: "100%",
    height: metrics.DEVICE_WIDTH / 2
  },
  viewDetailStore: {
    padding: 10,
    borderBottomWidth: 5,
    borderBottomColor: colors.windowBackground,
    backgroundColor: "#fff"
  },
  viewAddProduct: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  titleList: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold"
  },
  iconAddProduct: {
    fontSize: 25,
    color: colors.brandPrimary,
    marginRight: 10
  },
  thumbnail: {
    width: 20,
    height: 20
  },
  shopFunction: {
    fontSize: 12,
    marginTop: 5
  },
  listItemDanhMuc: {
    marginLeft: 0,
    paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 0.8,
    borderBottomColor: colors.windowBackground,
    borderTopColor: colors.windowBackground
  },
  coverStore: {
    height: metrics.DEVICE_WIDTH / 2,
    backgroundColor: "#eee"
  },
  viewLock: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: "#0006",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 25
  },
  viewAvatarStore: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#fff"
  },
  textNameStore: {
    fontWeight: "bold",
    position: "absolute",
    bottom: 0,
    alignSelf: "center"
  },
  viewActionStore: {
    flexDirection: "row",
    borderColor: colors.windowBackground,
    borderWidth: 0.8
  },
  viewDescription: {
    paddingTop: 5,
    borderTopWidth: 4,
    borderTopColor: colors.windowBackground
  },
  textGioiThieu: {
    marginBottom: 4,
    fontWeight: "bold",
    paddingHorizontal: 10
  },
  viewMoreDetail: {
    paddingHorizontal: 10,
    marginBottom: 10
  },
  viewContact: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 0.8,
    borderTopColor: colors.windowBackground,
    height: 50,
    paddingHorizontal: 10
  },
  iconContact: {
    color: colors.brandPrimary,
    fontSize: 18,
    marginRight: 10
  },
  flatList: {
    borderBottomWidth: 5,
    borderTopWidth: 5,
    borderColor: colors.windowBackground,
    marginBottom: 10
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  { dispatchParams },
  null,
  { withRef: true }
)(ChiTietGianHang);
