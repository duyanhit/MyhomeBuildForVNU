import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  View
} from "react-native";
import { ActionSheet, Button, Spinner, Text, Thumbnail } from "native-base";
import config from "core/config";
import { consoleLog } from "./AppLog";
import { getFromServer, postToServer } from "core/actions";
import { confirmSignOut } from "./Auth/AppSignOut";
import {
  Constants,
  ImageManipulator,
  ImagePicker,
  Location,
  Notifications,
  Permissions
} from "expo";
import constants from "../config/constants";
import string from "../../src/config/string";
import { getApiUrl } from "../../src/config/server";
import { parseJsonFromApi } from "../helpers/apiHelper";
import { screenNames } from "../../src/config/screen";
import colors from "../config/colors";

export const typeList = {
  THONGBAO: "THONGBAO",
  KHAOSAT: "KHAOSAT",
  GOPY: "GOPY",
  SOTAY: "SOTAY",
  HOTLINE: "HOTLINE",
  CONGDONG: "CONGDONG",
  DONHANG: "DONHANG",
  SANPHAM: "SANPHAM",
  THANHVIEN: "THANHVIEN"
};

export const notifyType = {
  NOTIFICATION_SALE: "1",
  NOTIFICATION_BUY: "2",
  NOTIFICATION_NOTIFY: "3",
  NOTIFICATION_SURVEY: "4",
  NOTIFICATION_MAIL: "5",
  NOTIFICATION_HOME: "6"
};

export default class AppComponent extends React.Component {
  iconNoData;
  imgNoData = config.images.noData;
  imgError = config.images.error;
  imgNoConnection = config.images.noConnection;
  imgNoHome = config.images.noSchoolInfo;
  msgNoData = null;

  state = {
    refreshing: false,
    isLoading: true,
    page: 1,
    pageSize: config.settings.numPerPage,
    propsData: undefined,
    isShowFilter: false
  };

  registerForPushNotificationsAsync = async () => {
    let permission = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }
    if (Constants.isDevice && permission.status === "granted") {
      const deviceToken = await Notifications.getExpoPushTokenAsync();
      return deviceToken;
    }
    return null;
  };

  findSingleLocation = async () => {
    const perLocations = await Permissions.askAsync(Permissions.LOCATION);
    const GPS = await Location.getProviderStatusAsync();
    if (perLocations.status !== "granted") {
      return { location: null, perLocations, GPS };
    }
    let result = null;
    try {
      result = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true
      });
    } catch (e) {
      result = null;
    }
    return { location: result, perLocations, GPS };
  };

  getScreenData = () => {};

  refreshScreen = () => {
    // this.logThis("refreshScreen");
    this.setState({ page: 1, refreshing: true }, this.getScreenData);
  };

  onEndReached = () => {
    const { data, status } = this.state.propsData;
    if (status === 1 && data.length >= this.state.pageSize) {
      this.setState({ page: this.state.page + 1 }, this.getScreenData);
    }
  };

  tryToGetDataAgain = () => {
    this.setState({ isLoading: true });
    setTimeout(this.getScreenData, config.settings.timeoutTryAgain);
  };

  viewLoading = noStyle => {
    const viewStyle = (noStyle && {}) || config.styles.middleView;
    return (
      <View style={viewStyle}>
        <Spinner />
        <Text note style={config.styles.alignCenter}>
          {config.strings.loading}
        </Text>
      </View>
    );
  };

  viewNoData = (message, isBtn) => (
    <View style={[config.styles.middleView, { paddingHorizontal: 50 }]}>
      {this.iconNoData || <Thumbnail square source={this.imgNoData} />}
      <Text />
      <Text note style={config.styles.alignCenter}>
        {message}
      </Text>
      <Text />
      {!isBtn && (
        <Button block transparent onPress={this.tryToGetDataAgain}>
          <Text primary style={config.styles.text.tryAgain}>
            {config.strings.tryAgain}
          </Text>
        </Button>
      )}
    </View>
  );

  noValidHome = () => {
    const { accountInfo } = this.props;
    const countHome = this.countHome();
    return (
      <View style={[config.styles.middleView, { paddingHorizontal: 50 }]}>
        <Thumbnail square source={this.imgNoHome} />
        <Text />
        <Text note style={config.styles.alignCenter}>
          {accountInfo.home.length
            ? string.canHoChuaDuocPheDuyet
            : string.nhapThongTinDeSuDungTinhNangNay}
        </Text>
        <Text />
        <Button
          block
          transparent
          onPress={this.navigateToScreen(screenNames.ThongTinTaiKhoan, {
            onGoBack: () => {
              if (countHome > 0) this.refreshScreen();
            },
            initPage: 1
          })}
        >
          <Text primary style={config.styles.text.tryAgain}>
            {config.strings.capNhat}
          </Text>
        </Button>
      </View>
    );
  };

  viewApiError = message => (
    <View style={[config.styles.middleView, { paddingHorizontal: 50 }]}>
      <Thumbnail square source={this.imgError} />
      <Text />
      <Text note style={config.styles.text.alignCenter}>
        {message || config.strings.networkError}
      </Text>
      <Text />
      <Button block transparent onPress={this.tryToGetDataAgain}>
        <Text primary style={config.styles.text.tryAgain}>
          {config.strings.tryAgain}
        </Text>
      </Button>
    </View>
  );

  viewNetworkError = () => (
    <View style={[config.styles.middleView, { paddingHorizontal: 50 }]}>
      <Thumbnail source={this.imgNoConnection} />
      <Text />
      <Text note style={config.styles.alignCenter}>
        {config.strings.networkError}
      </Text>
      <Text />
      <Button block transparent onPress={this.tryToGetDataAgain}>
        <Text primary style={config.styles.text.tryAgain}>
          {config.strings.tryAgain}
        </Text>
      </Button>
    </View>
  );

  renderFooter = (propsData, isBtn) => {
    const { status, data } = this.state.propsData;
    if (status === 1 && data.length >= this.state.pageSize) {
      return (
        <View style={{ padding: 5, backgroundColor: colors.windowBackground }}>
          <ActivityIndicator size="small" color={colors.footerProgressColor} />
        </View>
      );
    } else if (
      status === 1 &&
      data.length < this.state.pageSize &&
      this.state.page > 1
    ) {
      return (
        <View
          style={{
            marginBottom: 0,
            marginTop: 0,
            backgroundColor: colors.windowBackground
          }}
        >
          <Text note style={{ textAlign: "center" }}>
            {/*{config.strings.noMoreData}*/}
          </Text>
        </View>
      );
    }
    return this.renderView(propsData, null, isBtn);
  };

  renderView = (propsData, type, isBtn) => {
    const { isLoading, page } = this.state;
    let message = "";
    if (type) {
      switch (type) {
        case typeList.HOTLINE:
          message = string.khongCoHotline;
          break;
        case typeList.THONGBAO:
          message = string.khongCoThongBao;
          break;
        case typeList.KHAOSAT:
          message = string.khongCoKhaoSat;
          break;
        case typeList.GOPY:
          message = string.khongCoGopY;
          break;
        case typeList.SOTAY:
          message = string.khongCoSoTay;
          break;
        case typeList.CONGDONG:
          message = string.khongCoBaiViet;
          break;
        case typeList.DONHANG:
          message = string.khongCoDonHang;
          break;
        case typeList.SANPHAM:
          message = string.khongCoSanPham;
          break;
        case typeList.THANHVIEN:
          message = string.khongCoThanhVien;
          break;
        default:
          break;
      }
    }
    if (isLoading === undefined || isLoading) {
      return this.viewLoading();
    } else if (propsData) {
      if (propsData.empty && page === 1) {
        return this.viewNoData(
          this.msgNoData || (type ? message : propsData.message),
          isBtn
        );
      } else if (propsData.error) {
        if (propsData.status.toString() === "-99") {
          confirmSignOut(config.strings.titleMessage, propsData.message, true);
        }
        return this.viewApiError(propsData.message);
      } else if (propsData.networkError) {
        return this.viewNetworkError();
      }
    }
    return null;
  };

  /**
   *
   * @param routeName
   * @param params
   * @param pushActions: Add a route on the top of the stack, and navigate forward to it
   */

  navigateToScreen = (routeName, params, pushActions) => () => {
    const { navigation } = this.props;
    if (navigation) {
      pushActions
        ? navigation.push(routeName, params)
        : navigation.navigate(routeName, params);
    }
  };

  logThis = (str1, str2) => {
    consoleLog(str1, str2);
  };

  /**
   *
   * @param apiUrl
   * @param data
   * @param requiredData
   * @returns {Promise<AxiosResponse<any>>}
   */
  getFromServer = (apiUrl, data, requiredData) => {
    // custom for every app
    const { accountInfo } = this.props;
    let apiData = data;
    if (requiredData && accountInfo) {
      apiData = {
        account_id: accountInfo.id,
        access_token: accountInfo.access_token,
        device_token: accountInfo.device_token,
        platform: Platform.OS === "ios" ? 1 : 2,
        ...data
      };
    }
    return getFromServer(apiUrl, apiData);
  };

  /**
   *
   * @param apiUrl
   * @param data
   * @returns {Promise<AxiosResponse<any>>}
   */
  getFromServerWithAccount = (apiUrl, data) => {
    return this.getFromServer(apiUrl, data, true);
  };

  postToServer = (apiUrl, data, requiredData, files) => {
    // custom for every app
    const { accountInfo } = this.props;
    let apiData = data;
    if (requiredData && accountInfo) {
      apiData = {
        account_id: accountInfo.id,
        access_token: accountInfo.access_token,
        device_token: accountInfo.device_token,
        platform: Platform.OS === "ios" ? 1 : 2,
        ...data
      };
    }
    let tempData = {};
    if (apiData) tempData = { ...tempData, ...apiData };
    if (files) {
      const fromData = new FormData();
      files.forEach(v => fromData.append(v.key || "image[]", v));
      Object.keys(tempData).forEach(k => fromData.append(`${k}`, tempData[k]));
      tempData = fromData;
    }
    return postToServer(apiUrl, tempData);
  };

  postToServerWithAccount = (apiUrl, data, files) => {
    return this.postToServer(apiUrl, data, true, files);
  };

  launchCameraAsync = async options => {
    const { isEdit = false, aspect = [1, 1] } = options || {};
    let permission = await Permissions.getAsync(Permissions.CAMERA);
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(Permissions.CAMERA);
    }
    if (permission.status !== "granted") {
      this.showAlertDialog(string.banChuaCapQuyenSuDungMayAnh);
      return;
    }
    permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    }
    if (permission.status !== "granted") {
      this.showAlertDialog(string.banChuaCapQuyenSuDungThuVien);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: isEdit,
      aspect,
      base64: false,
      exif: false
    });
    if (result.cancelled) return;
    const localUri = result.uri;
    const filename = localUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";
    return {
      uri: localUri,
      name: filename,
      type,
      width: result.width,
      height: result.height,
      base64: result.base64
    };
  };

  launchImageLibraryAsync = async options => {
    const { isEdit = false, aspect = [1, 1] } = options || {};
    let permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    }
    if (permission.status !== "granted") {
      Alert.alert("Thông báo", "Bạn chưa cập quyền sử dụng thư viện ảnh");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      mediaTypes: "Images",
      allowsEditing: isEdit,
      aspect,
      base64: false,
      exif: false
    });
    if (result.cancelled) return;
    const localUri = result.uri;
    const filename = localUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";
    return {
      uri: localUri,
      name: filename,
      type,
      width: result.width,
      height: result.height,
      base64: result.base64
    };
  };

  findFileNameAndType = uri => {
    const filename = uri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";
    return { type, name: filename };
  };

  resizeImage = async image => {
    let widthNew =
      image.width < image.height
        ? constants.resize.height
        : constants.resize.width;
    let heightNew = Math.floor(widthNew * (image.height / image.width));
    if (
      heightNew >
      (image.width < image.height
        ? constants.resize.width
        : constants.resize.height)
    ) {
      heightNew =
        image.width < image.height
          ? constants.resize.width
          : constants.resize.height;
      widthNew = Math.floor(heightNew * (image.width / image.height));
    }
    // const cropData = {
    //   offset: { x: 0, y: 0 },
    //   size: { width: image.width, height: image.height },
    //   displaySize: { width: widthNew, height: heightNew },
    //   resizeMode: "contain"
    // };
    const imageNew = await ImageManipulator.manipulate(image.uri, [
      { resize: { width: widthNew, height: heightNew } }
    ]);
    return { ...image, ...imageNew };
    // return await new Promise(resolve => {
    //   ImageEditor.cropImage(
    //     image.uri,
    //     cropData,
    //     success =>
    //       resolve({
    //         uri: success,
    //         name: image.name,
    //         type: image.type,
    //         width: widthNew,
    //         height: heightNew
    //       }),
    //     () => resolve(null)
    //   );
    // });
  };

  showAlertDialog = (message, onPress) => {
    Alert.alert(
      string.thongBao,
      message,
      [{ text: string.dongY, onPress: onPress }],
      { cancelable: false }
    );
  };

  showFilter = () => {
    this.setState({ isShowFilter: !this.state.isShowFilter });
  };

  /**
   * Chọn item (khi chọn nhiều)
   * @param item
   * @param index
   * @param self
   */
  onSelect = (item, index, self) => {
    const { data } = this.state;
    data[index] = item;
    if (item.is_check) {
      data[index].self = self;
      this.arrTemp.push(data[index]);
    } else {
      this.arrTemp = _.remove(this.arrTemp, i => {
        return i.id !== data[index].id;
      });
      data[index].self = null;
    }
    this.arrTemp.forEach((v, i) => {
      v.self.changeNumber(i + 1);
    });
    if (this.arrTemp && this.arrTemp.length) {
      this.myHeader.onMultiSelect();
      this.setState({ isShowFilter: false });
    } else {
      this.myHeader.cancelMultiSelect();
    }
  };

  /**
   * Bỏ chọn tất cả các item đã chọn
   */
  onUncheck = () => {
    const { data } = this.state;
    for (let index = 0; index < data.length; index++) {
      if (data[index].self) {
        data[index].self.onClick(true);
        data[index].self = null;
        data[index].is_check = false;
      }
    }
    this.arrTemp = [];
    this.myHeader.cancelMultiSelect();
  };

  /**
   * Xóa item
   * @param id
   * @param api
   */
  xoa = (id, api) => {
    const { accountInfo } = this.props;
    if (accountInfo) {
      this.myProgress.openDialog();
      this.postToServerWithAccount(getApiUrl(api), {
        id
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          this.onUncheck();
          this.refreshScreen();
          this.showAlertDialog(string.xoaDuLieuThanhCong, () =>
            this.myProgress.closeDialog()
          );
        }
      });
    }
  };

  /**
   * Xác nhận xóa item
   * @param id
   * @param i
   * @param self
   * @param api
   * @param message
   */
  showConfirmDialog = (id, i, self, api, message) => {
    if (i === 0 || i) this.state.data[i].self = self;
    Alert.alert(
      string.thongBao,
      message,
      [
        {
          text: string.huy,
          onPress: () => {
            if (i === 0 || i) this.state.data[i].self = null;
          }
        },
        {
          text: string.dongY,
          onPress: () => {
            this.xoa(id, api);
          }
        }
      ],
      { cancelable: false }
    );
  };

  /**
   * Xóa nhiều item
   * @param api
   * @param message
   */
  deleteMultiItem = (api, message) => {
    const id = this.state.data
      .filter(v => v.is_check)
      .map(v => v.id)
      .join();
    if (!id) {
      this.showAlertDialog(string.chonBanGhiDeXoa);
    } else {
      this.showConfirmDialog(id, null, null, api, message);
    }
  };

  /**
   * Đếm căn hộ đã được duyệt
   * @returns {number}
   */
  countHome = () => {
    const { accountInfo } = this.props;
    let countHome = 0;
    if (accountInfo.home) {
      accountInfo.home.forEach(i => {
        if (i.valid.toString() === "1") countHome += 1;
      });
    }
    return countHome;
  };

  showActionSheet = (arrData, callback) => {
    let destructiveButtonIndex;
    if (
      arrData.length >= 2 &&
      arrData[arrData.length - 2].data &&
      arrData[arrData.length - 2].data.destructiveButtonIndex
    ) {
      destructiveButtonIndex = arrData.length - 2;
    }
    ActionSheet.show(
      {
        options: arrData.map(v => v.text),
        cancelButtonIndex: arrData.length - 1,
        destructiveButtonIndex
      },
      index => {
        const i = Number(index);
        if (i >= 0 && callback) callback(arrData[i]);
      }
    );
  };

  scrollToEnd = target => {
    if (target && target.scrollToEnd) {
      setTimeout(() => target.scrollToEnd({ animated: true }), 200);
    }
  };

  /**
   * gọi điện thoại
   * @param phoneNumber
   */
  callPhone = phoneNumber => {
    Linking.canOpenURL(`tel:${phoneNumber}`)
      .then(supported => {
        if (supported) {
          return Linking.openURL(`tel:${phoneNumber}`)
            .then(() => {})
            .catch(e => this.logThis(e));
        }
      })
      .catch(e => this.logThis(e));
  };
}
