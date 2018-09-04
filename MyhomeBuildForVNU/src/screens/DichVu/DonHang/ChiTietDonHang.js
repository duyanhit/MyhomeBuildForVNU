import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Modal,
  BackHandler
} from "react-native";
import { Container, Icon, Text } from "native-base";
import { connect } from "react-redux";
import Stars from "react-native-stars";
import Moment from "moment";

import AppComponent from "../../../../core/components/AppComponent";
import AppHeader from "../../../../core/components/AppHeader";
import string from "../../../config/string";
import { API, getApiUrl } from "../../../config/server";
import { parseJsonFromApi } from "../../../../core/helpers/apiHelper";
import colors from "../../../config/colors";
import config from "../../../../core/config";
import { assets } from "../../../../assets";
import ItemDonHang from "./ItemDonHang";
import { formatDateTime2 } from "../../../../core/helpers/timeHelper";
import { dispatchParams } from "../../../actions";
import { actionTypes } from "../../../reducers";
import { accountActionTypes } from "../../../../core/reducers";
import ProgressDialog from "../../../../core/components/ProgressDialog";

const orderStatus = {
  XAC_NHAN: 2,
  HOAN_THANH: 3,
  HUY_DON_HANG: 4
};

class ChiTietDonHang extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      data: undefined,
      page: 0,
      statusChange: false,
      showModalPay: false,
      visibleProgress: false
    };
    this.handleBackPress = this.handleBackPress.bind(this);
  }

  componentWillMount = () => {
    this.getScreenData();
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  };

  /**
   * xử lý nút back android
   */
  handleBackPress = () => {
    if (this.props.navigation.state.params.onGoBack) {
      this.props.navigation.state.params.onGoBack();
    }
  };

  /**
   * get chi tiết đơn hàng
   */
  getScreenData = () => {
    const { accountInfo } = this.props;
    const { id, donMua } = this.props.navigation.state.params;
    const api = donMua ? API.CHI_TIET_DON_MUA : API.CHI_TIET_DON_BAN;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(api), {
        id
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        let { data } = this.state;
        if (propsData.status === 1) {
          data = propsData.data;
          data.product_image = data.product_image
            ? API.HOST + JSON.parse(data.product_image)[0]
            : "";
          data.store_image = data.store_image
            ? API.HOST + data.store_image
            : "";
        } else if (propsData.status !== 0 && !propsData.networkError) {
          this.showAlertDialog(propsData.message);
        }

        this.setState({
          isLoading: false,
          refreshing: false,
          propsData,
          data
        });
      });
    }
  };

  /**
   * thay đổi coin trong accountInfo
   */
  updateCoin = () => {
    const { accountInfo } = this.props;
    const { data } = this.state;
    accountInfo.coin = accountInfo.coin - data.coin;
    dispatchParams(
      { ...accountInfo, device_token: accountInfo.device_token },
      accountActionTypes.APP_USER_INFO
    );
  };

  /**
   * thanh toán để xem liên hệ người mua
   * @param id
   */
  orderPay = id => {
    const { accountInfo } = this.props;
    if (accountInfo) {
      this.postToServerWithAccount(getApiUrl(API.THANH_TOAN_XEM_LIEN_HE), {
        id
      }).then(response => {
        const res = parseJsonFromApi(response);
        if (res.status === 1) {
          this.closeModalPay();
          this.refreshScreen();
          this.updateCoin();
        } else {
          this.showAlertDialog(res.message);
        }
      });
    }
  };

  /**
   * các tùy chọn xử lý đơn hàng
   * @param id
   * @param status
   */
  processOrder = (id, status, huyGiaoHang) => {
    const { accountInfo, dispatchParams } = this.props;
    let { countBadge } = this.props;
    const { donMua } = this.props.navigation.state.params;
    if (accountInfo) {
      this.openProgressDialog();
      this.postToServerWithAccount(getApiUrl(API.XU_LY_DON_HANG), {
        id,
        order_status: status
      }).then(response => {
        const res = parseJsonFromApi(response);
        this.getScreenData();
        if (res.status === 1) {
          if (status === orderStatus.HUY_DON_HANG) {
            if (donMua) {
              this.showAlertDialog(
                string.huyDonHangThanhCong,
                this.closeProgressDialog
              );
            } else {
              this.showAlertDialog(
                huyGiaoHang
                  ? string.huyGiaoHangThanhCong
                  : string.tuChoiDonHangThanhCong,
                this.closeProgressDialog
              );
              countBadge -= 1;
              dispatchParams(countBadge, actionTypes.BADGE_CHANGE);
            }
          } else if (status === orderStatus.XAC_NHAN) {
            this.closeProgressDialog();
            countBadge -= 1;
            dispatchParams(countBadge, actionTypes.BADGE_CHANGE);
          } else {
            this.closeProgressDialog();
          }

          this.setState({ statusChange: true });
          BackHandler.addEventListener(
            "hardwareBackPress",
            this.handleBackPress
          );
        } else {
          Alert.alert(string.loi, res.message, [
            {
              text: string.dongY,
              onPress: () => this.closeProgressDialog()
            }
          ]);
        }
      });
    }
  };

  /**
   * xác nhận các tùy chọn xử lý đơn hàng
   * @param id
   * @param status
   * @param huyGiaoHang
   * @param nhanHang
   */
  confirmOrder = (id, status, huyGiaoHang, nhanHang) => {
    const { donMua } = this.props.navigation.state.params;
    let message;
    if (status === orderStatus.XAC_NHAN) {
      message = string.banXacNhanDonHangNay;
    } else if (status === orderStatus.HOAN_THANH) {
      message = nhanHang
        ? string.banDaNhanDuocHang
        : string.banDaHoanThanhGiaoHang;
    } else if (status === orderStatus.HUY_DON_HANG) {
      if (donMua) {
        message = string.banChacChanMuonHuyDonHangNay;
      } else {
        if (huyGiaoHang) {
          message = string.banChacChanMuonHuyGiaoHangDonHangNay;
        } else {
          message = string.banChacChanMuonTuChoiDonHangNay;
        }
      }
    }
    Alert.alert(
      string.thongBao,
      message,
      [
        { text: string.huy },
        {
          text: string.dongY,
          onPress: () => {
            this.processOrder(id, status, huyGiaoHang);
          }
        }
      ],
      { cancelable: false }
    );
  };

  /**
   * đánh giá sản phẩm / người mua
   * @param id
   * @param star
   * @param donMua
   */
  rateOrder = (id, star, donMua) => {
    const { accountInfo } = this.props;
    const api = donMua ? API.DANH_GIA_SAN_PHAM : API.DANH_GIA_NGUOI_MUA;
    if (accountInfo) {
      this.openProgressDialog();
      this.postToServerWithAccount(getApiUrl(api), {
        id,
        star
      }).then(response => {
        const res = parseJsonFromApi(response);
        if (res.status === 1) {
          this.setState({ statusChange: true });
          BackHandler.addEventListener(
            "hardwareBackPress",
            this.handleBackPress
          );
          this.getScreenData();
          this.closeProgressDialog();
        } else {
          this.showAlertDialog(res.message, this.closeProgressDialog);
        }
      });
    }
  };

  /**
   * xác nhận đánh giá
   * @param id
   * @param star
   * @param donMua
   */
  confirmRateOrder = (id, star, donMua) => {
    Alert.alert(
      string.thongBao,
      string.banDanhGia + star + " " + string.sao + "?",
      [
        { text: string.huy },
        {
          text: string.dongY,
          onPress: () => this.rateOrder(id, star, donMua)
        }
      ],
      { cancelable: false }
    );
  };

  /**
   * mở modal thanh toán
   */
  openModalPay = () => {
    this.setState({ showModalPay: true });
  };

  /**
   * đóng modal thanh toán
   */
  closeModalPay = () => {
    this.setState({ showModalPay: false });
  };

  openProgressDialog = () => {
    this.setState({ visibleProgress: true });
  };

  closeProgressDialog = () => {
    this.setState({ visibleProgress: false });
  };

  render() {
    const {
      propsData,
      data,
      statusChange,
      refreshing,
      showModalPay,
      visibleProgress
    } = this.state;
    let contentView = this.renderView(propsData);
    const { donMua } = this.props.navigation.state.params;

    /**
     * view tiến trình đơn hàng
     */
    let progressView;
    if (data) {
      let time1, time2, time3, time4;
      if (data.history) {
        for (let i = 0; i < data.history.length; i++) {
          const time =
            Moment(data.history[i].created_at).format("HH:mm, DD/MM/Y") + ": ";
          if (data.history[i].type === "1") {
            time1 = time;
          } else if (data.history[i].type === "3") {
            time2 = time;
          } else if (data.history[i].type === "4") {
            time3 = time;
          } else if (data.history[i].type === "5") {
            time4 = time;
          }
        }
      }

      let detail2, detail3;
      if (data.status === "2" || (data.status === "3" && time2)) {
        detail2 = time2 + string.dangGiaoHang;
      } else if (data.status === "4" && !time2 && !time3) {
        detail2 = time4 + string.huyDonHang;
      }
      if (data.status === "3" && time3) {
        detail3 = donMua
          ? time3 + string.daNhanHang
          : time3 + string.daGiaoHang;
      } else if (data.status === "4" && !time3 && time2) {
        detail2 = time2 + string.dangGiaoHang;
        detail3 = time4 + string.huyDonHang;
      }

      let borderColor1 = "gray",
        borderColor2 = "gray";
      let backgroundColor1, backgroundColor2, backgroundColor3;
      let borderView1 = "gray",
        borderView2 = "gray",
        borderView3 = "gray";
      // let inner1, inner2, inner3;

      if (data.status === "1") {
        // inner1 = true;
        backgroundColor1 = colors.brandPrimary;
        borderView1 = colors.brandPrimary;
      } else if (data.status === "2") {
        // inner1 = true;
        // inner2 = true;
        backgroundColor1 = colors.brandPrimary;
        backgroundColor2 = colors.brandPrimary;
        borderView1 = colors.brandPrimary;
        borderView2 = colors.brandPrimary;
        borderColor1 = colors.brandPrimary;
      } else if (data.status === "3") {
        // inner1 = true;
        // inner2 = true;
        // inner3 = true;
        backgroundColor1 = colors.brandPrimary;
        backgroundColor2 = colors.brandPrimary;
        backgroundColor3 = colors.brandPrimary;
        borderView1 = colors.brandPrimary;
        borderView2 = colors.brandPrimary;
        borderView3 = colors.brandPrimary;
        borderColor1 = colors.brandPrimary;
        borderColor2 = colors.brandPrimary;
      } else if (data.status === "4") {
        // inner1 = true;
        backgroundColor1 = "#f00";
        if (!time2) {
          // inner2 = true;
          backgroundColor2 = "#f00";
        }
        if (time2 && !time3) {
          // inner2 = true;
          // inner3 = true;
          backgroundColor2 = "#f00";
          backgroundColor3 = "#f00";
        }
        borderView1 = "#f00";
        borderView2 = "#f00";
        borderView3 = "#f00";
        borderColor1 = "#f00";
        borderColor2 = "#f00";
      }

      progressView = (
        <View style={styles.viewProgress}>
          <View style={styles.viewMarkTime}>
            <View
              style={[
                styles.circle,
                {
                  borderColor: borderView3
                }
              ]}
            >
              <View
                style={[
                  styles.innerCircle,
                  {
                    backgroundColor: backgroundColor3
                  }
                ]}
              />
            </View>

            {(time3 || time4) && <Text style={styles.text}>{detail3}</Text>}
          </View>

          <View
            style={[
              styles.indicator,
              {
                backgroundColor: borderColor2
              }
            ]}
          />

          <View style={styles.viewMarkTime}>
            <View
              style={[
                styles.circle,
                {
                  borderColor: borderView2
                }
              ]}
            >
              <View
                style={[
                  styles.innerCircle,
                  {
                    backgroundColor: backgroundColor2
                  }
                ]}
              />
            </View>

            {(time2 || time4) && <Text style={styles.text}>{detail2}</Text>}
          </View>

          <View
            style={[
              styles.indicator,
              {
                backgroundColor: borderColor1
              }
            ]}
          />

          <View style={[styles.viewMarkTime, { marginBottom: 0 }]}>
            <View
              style={[
                styles.circle,
                {
                  borderColor: borderView1
                }
              ]}
            >
              <View
                style={[
                  styles.innerCircle,
                  {
                    backgroundColor: backgroundColor1
                  }
                ]}
              />
            </View>

            {time1 && (
              <Text style={styles.text}>{time1 + string.choXacNhan}</Text>
            )}
          </View>
        </View>
      );
    }

    let danhGia;
    if (data) {
      if (donMua) {
        danhGia = data.star === "0" ? string.danhGiaSanPham : string.daDanhGia;
      } else {
        danhGia = string.danhGiaNguoiMua;
      }
    }

    if (!contentView) {
      contentView = (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.refreshScreen}
            />
          }
        >
          <View>
            <View style={styles.thongTinSanPham}>
              <ItemDonHang item={data} donMua={donMua} chiTiet={true} />
            </View>

            <View style={styles.thongTinDonHang}>
              <View style={styles.thongTin}>
                <Text style={[styles.thongTin1, { marginBottom: 5 }]}>
                  {string.maDonHang}
                </Text>
                <Text style={[styles.thongTin2, { marginBottom: 5 }]}>
                  {"#" + data.id}
                </Text>
              </View>

              <View style={styles.thongTin}>
                <Text style={styles.thongTin1}>{string.thoiGianDat}</Text>
                <Text style={styles.thongTin2}>
                  {formatDateTime2(data.created_at)}
                </Text>
              </View>
            </View>

            {!donMua && (
              <View style={styles.thongTinDonHang}>
                <Text style={styles.titleSection}>
                  {string.thongTinNguoiMua}
                </Text>

                <View
                  style={[
                    styles.viewImageNguoiMua,
                    { marginVertical: data.author_avatar ? 5 : 10 }
                  ]}
                >
                  <Image
                    source={assets.avatarDefault}
                    style={[styles.imageNguoiMua, { position: "absolute" }]}
                  />
                  {data.author_avatar && (
                    <Image
                      source={{ uri: data.author_avatar }}
                      style={styles.imageNguoiMua}
                    />
                  )}
                  <Text
                    style={{ marginLeft: data.author_avatar ? undefined : 38 }}
                  >
                    {data.author_name}
                  </Text>
                </View>

                <View style={styles.starNguoiMua}>
                  <Stars
                    value={Number(data.author_star)}
                    count={5}
                    spacing={5}
                    starSize={15}
                    emptyStar={assets.starEmpty}
                    fullStar={assets.starFull}
                  />
                  {data.author_total_rate !== "0" ? (
                    <Text style={styles.textAuthorTotalRate}>
                      {" "}
                      ({data.author_total_rate})
                    </Text>
                  ) : null}
                </View>

                <View style={styles.thongTin}>
                  <Text
                    style={[
                      styles.thongTin1,
                      { alignSelf: "flex-start", marginLeft: 39 }
                    ]}
                  >
                    {string.lienHe}
                  </Text>

                  <View>
                    {data.phone_receive ? (
                      <TouchableOpacity
                        onPress={() => this.callPhone(data.phone_receive)}
                        style={{ marginBottom: 5 }}
                      >
                        <View style={styles.viewPhone}>
                          <Icon name="ios-call" style={styles.iconPhone} />
                          <Text style={styles.textPhone}>
                            {data.phone_receive}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : null}

                    {data.phone ? (
                      <TouchableOpacity
                        onPress={() => this.callPhone(data.phone)}
                      >
                        <View style={styles.viewPhone}>
                          <Icon name="ios-call" style={styles.iconPhone} />
                          <Text style={styles.textPhone}>{data.phone}</Text>
                        </View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            )}

            <View style={[styles.thongTinDonHang, { paddingVertical: 20 }]}>
              {progressView}
            </View>

            {!donMua &&
              data.status === "3" && (
                <View style={[styles.thongTinDonHang, { paddingVertical: 15 }]}>
                  <View style={styles.danhGia}>
                    <Text>
                      {string.danhGiaCuaNguoiMua}
                      {data.star === "0" && <Text>{string.chuaDanhGia}</Text>}
                    </Text>
                  </View>

                  <Stars
                    value={Number(data.star)}
                    count={5}
                    spacing={10}
                    starSize={30}
                    emptyStar={
                      data.star === "0"
                        ? assets.starEmptyUnrating
                        : assets.starEmpty
                    }
                    fullStar={assets.starFull}
                  />
                </View>
              )}

            {data.status === "3" && (
              <View
                style={[
                  styles.thongTinDonHang,
                  { marginBottom: 0, paddingVertical: 15 }
                ]}
              >
                <View style={styles.danhGia}>
                  <Text>{danhGia}</Text>
                </View>

                {donMua ? (
                  <Stars
                    value={data.star === "0" ? null : Number(data.star)}
                    rating={0}
                    count={5}
                    update={star => this.confirmRateOrder(data.id, star, true)}
                    spacing={10}
                    starSize={30}
                    emptyStar={
                      data.star === "0"
                        ? assets.starEmptyUnrating
                        : assets.starEmpty
                    }
                    fullStar={assets.starFull}
                  />
                ) : (
                  <Stars
                    value={
                      data.star_user === "0" ? null : Number(data.star_user)
                    }
                    rating={0}
                    count={5}
                    update={star => this.confirmRateOrder(data.id, star)}
                    spacing={10}
                    starSize={30}
                    emptyStar={
                      data.star_user === "0"
                        ? assets.starEmptyUnrating
                        : assets.starEmpty
                    }
                    fullStar={assets.starFull}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>
      );
    }

    let footerView, coinPay, coinTotal;
    if (data) {
      coinPay = data.coin ? data.coin : 0;
      coinTotal = data.total_coin ? data.total_coin : 0;

      if (donMua) {
        if (data.status === "1") {
          footerView = (
            <View style={styles.viewFooter}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={config.styles.button.huy}
                onPress={() =>
                  this.confirmOrder(data.id, orderStatus.HUY_DON_HANG)
                }
              >
                <Text style={config.styles.text.btnCancelText}>
                  {string.huyDonHang}
                </Text>
              </TouchableOpacity>
            </View>
          );
        } else if (data.status === "2") {
          footerView = (
            <View style={styles.viewFooter}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={config.styles.button.xacNhan}
                onPress={() =>
                  this.confirmOrder(
                    data.id,
                    orderStatus.HOAN_THANH,
                    false,
                    true
                  )
                }
              >
                <Text style={config.styles.text.btnConfirmText}>
                  {string.daNhanHang}
                </Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          footerView = null;
        }
      } else {
        if (data.status === "1") {
          footerView = (
            <View style={styles.viewFooter}>
              <View style={styles.footerDonBan}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[config.styles.button.huy, styles.btnLeft]}
                  onPress={() =>
                    this.confirmOrder(data.id, orderStatus.HUY_DON_HANG)
                  }
                >
                  <Text style={config.styles.text.btnCancelText}>
                    {string.tuChoiDonHang}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[config.styles.button.xacNhan, styles.btnRight]}
                  onPress={() =>
                    this.confirmOrder(data.id, orderStatus.XAC_NHAN)
                  }
                >
                  <Text style={config.styles.text.btnConfirmText}>
                    {string.xacNhanDonHang}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        } else if (data.status === "2") {
          footerView = (
            <View style={styles.viewFooter}>
              <View style={styles.footerDonBan}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[config.styles.button.huy, styles.btnLeft]}
                  onPress={() =>
                    this.confirmOrder(data.id, orderStatus.HUY_DON_HANG, true)
                  }
                >
                  <Text style={config.styles.text.btnCancelText}>
                    {string.huyGiaoHang}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[config.styles.button.xacNhan, styles.btnRight]}
                  onPress={() =>
                    this.confirmOrder(data.id, orderStatus.HOAN_THANH)
                  }
                >
                  <Text style={config.styles.text.btnConfirmText}>
                    {string.hoanThanh}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        } else {
          footerView = null;
        }
      }
    }

    const onClose = () => {
      statusChange && this.props.navigation.state.params.onGoBack
        ? this.props.navigation.state.params.onGoBack()
        : {};
    };

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          onClose={onClose}
          title={string.chiTiet}
          navigation={this.props.navigation}
        />

        {contentView}

        {footerView}

        <Modal
          visible={showModalPay}
          transparent
          onRequestClose={this.closeModalPay}
          animationType="fade"
        >
          <View style={styles.viewModal}>
            <View style={styles.contentModal}>
              <Text>{string.xacNhanYeuCauHienThiThongTinNguoiMua}</Text>

              <View style={{ height: 20 }} />

              <View style={{ width: "100%", paddingLeft: 5 }}>
                <Text>
                  {string.hienCo + ": "}
                  <Text style={{ fontWeight: "bold" }}>
                    {coinTotal + " xu"}
                  </Text>
                </Text>
                <Text>
                  {string.chiPhi + ": "}
                  <Text style={{ fontWeight: "bold", color: "#f00" }}>
                    {coinPay + " xu"}
                  </Text>
                </Text>
              </View>

              <View style={{ height: 20 }} />

              <View style={styles.viewButton}>
                <TouchableOpacity
                  style={[
                    config.styles.button.huy,
                    { marginRight: 5, flex: 1 }
                  ]}
                  onPress={this.closeModalPay}
                >
                  <Text style={config.styles.text.btnCancelText}>
                    {string.huy}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    config.styles.button.xacNhan,
                    { marginLeft: 5, flex: 1 }
                  ]}
                  onPress={() => this.orderPay(data.id)}
                >
                  <Text style={config.styles.text.btnConfirmText}>
                    {string.dongY}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ProgressDialog visible={visibleProgress} message={string.vuiLongCho} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  viewProgress: {
    paddingLeft: 20,
    paddingRight: 10
  },
  viewMarkTime: {
    flexDirection: "row",
    marginBottom: -2,
    alignItems: "center"
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  indicator: {
    height: 25,
    width: 1,
    borderWidth: 0,
    marginLeft: 7,
    marginBottom: -1,
    marginTop: 1
  },
  thongTinSanPham: {
    backgroundColor: "#fff",
    marginBottom: 0.8
  },
  thongTinDonHang: {
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 0.8
  },
  thongTin: {
    flexDirection: "row",
    alignItems: "center"
  },
  thongTin1: {
    flex: 1
  },
  thongTin2: {
    flex: 1,
    textAlign: "right"
  },
  viewPhone: {
    flexDirection: "row",
    alignItems: "center"
  },
  textPhone: {
    color: colors.brandPrimary,
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 14
  },
  iconPhone: {
    color: colors.brandPrimary,
    fontSize: 20
  },
  footerDonBan: {
    width: "100%",
    flexDirection: "row"
  },
  titleSection: {
    fontWeight: "bold",
    fontSize: 14
  },
  text: {
    fontSize: 12,
    color: "gray"
  },
  viewFooter: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 0.8,
    borderTopColor: colors.windowBackground
  },
  btnLeft: {
    marginRight: 5,
    flex: 1
  },
  btnRight: {
    marginLeft: 5,
    flex: 1
  },
  danhGia: {
    alignItems: "center",
    marginBottom: 10
  },
  viewImageNguoiMua: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  imageNguoiMua: {
    height: 30,
    width: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fff",
    marginRight: 8
  },
  starNguoiMua: {
    marginLeft: 36,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 5
  },
  viewModal: {
    backgroundColor: "#0004",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  contentModal: {
    width: 300,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  viewButton: {
    flexDirection: "row",
    marginTop: 10
  },
  textAuthorTotalRate: {
    color: "gray"
  }
});

export default connect(
  state => ({
    accountInfo: state.accountReducer,
    countBadge: state.countBadgeReducer
  }),
  { dispatchParams }
)(ChiTietDonHang);
