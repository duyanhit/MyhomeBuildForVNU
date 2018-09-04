import React from "react";
import { connect } from "react-redux";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";
import { Location, MapView } from "expo";
import { ActionSheet, Text, Spinner } from "native-base";

import AppComponent from "../../../../core/components/AppComponent";
import { dispatchParams } from "../../../../core/actions";
import AppHeader from "../../../../core/components/AppHeader";
import { API, getApiUrl } from "../../../config/server";
import { parseJsonFromApi } from "../../../../core/helpers/apiHelper";
import string from "../../../config/string";
import { screenNames } from "../../../config/screen";
import metrics from "../../../../core/config/metrics";
import config from "../../../../core/config";
import colors from "../../../config/colors";
import Icon from "../../../component/Icon";
import { actionTypes } from "../../../reducers";
import ChonDiaChi from "./ChonDiaChi";
import SuggestDiaChi from "./SuggestDiaChi";
import HopDongDienTu from "./HopDongDienTu";

class TaoGianHang extends AppComponent {
  state = {
    ...this.state,
    anhDaiDien:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.image
        ? {
            uri: `${API.HOST}${this.props.navigation.state.params.image}`,
            isImagePicker: false
          }
        : null,
    anhBia:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.cover
        ? {
            uri: `${API.HOST}${this.props.navigation.state.params.cover}`,
            isImagePicker: false
          }
        : null,
    tenGianHang:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.tenGianHang,
    diaChi:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.diaChi,
    lienHe:
      (this.props.navigation.state.params &&
        this.props.navigation.state.params.lienHe) ||
      this.props.accountInfo.phone,
    moTa:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.moTa,
    isEditDiaChi:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.id,

    showModalLicense: false
  };

  latlngMap = {
    latitude: 21.020965181930173,
    longitude: 105.82116397768182,
    latitudeDelta: 0.0961423217173234,
    longitudeDelta: 0.2636719378938892
  };

  componentWillMount = () => {
    if (
      !(
        this.props.navigation.state.params &&
        this.props.navigation.state.params.location
      )
    ) {
      this.getLocation();
      this.openModalLicense();
    } else {
      this.location = this.props.navigation.state.params.location;
      setTimeout(() => {
        if (this.timeoutDiaChi) {
          clearTimeout(this.timeoutDiaChi);
          this.timeoutDiaChi = null;
        }
        this.attemptReverseGeocodeAsync(this.location);
      }, 1000);
    }
  };

  componentWillUnmount = () => {
    if (this.timeoutDiaChi) {
      clearTimeout(this.timeoutDiaChi);
      this.timeoutDiaChi = null;
    }
  };

  getLocation = async bl => {
    const obj = bl
      ? { isLoadLocation: true }
      : { isLoading: true, isLoadLocation: true };
    this.setState(obj);
    const perLocation = await this.findSingleLocation();
    let msg = "";
    if (perLocation.perLocations.status !== "granted") {
      msg = string.chuaDuocPhepTruyCapViTri1;
    } else if (Platform.OS === "android" && !perLocation.GPS.gpsAvailable) {
      msg = string.chuaBatViTri;
    }
    if (bl && msg) this.showAlertDialog(msg);
    const { coords } = perLocation.location || {};
    let { latitude, longitude } = coords || {};
    latitude = latitude || "";
    longitude = longitude || "";
    this.location = perLocation.location;
    if (perLocation.location) {
      this.attemptReverseGeocodeAsync({ latitude, longitude }, bl);
    } else {
      this.setState({ isLoading: false, isLoadLocation: false });
    }
  };

  chonImage = async (name, index) => {
    let image = null;
    if (index === 0) {
      this.setState({ isLoading: true });
      image = await this.launchCameraAsync();
    } else if (index === 1) {
      this.setState({ isLoading: true });
      image = await this.launchImageLibraryAsync();
    }
    if (image) {
      image = await this.resizeImage(image);
    }
    if (image) {
      this.navigateToScreen(screenNames.CropImage, {
        image,
        ratio: name === "anhDaiDien" ? [1, 1] : [2, 1],
        reSize:
          name === "anhDaiDien"
            ? { width: 400, height: 400 }
            : { width: 1000, height: 500 },
        callBack: this.callBackImage.bind(this, name)
      })();
      // this.setState({
      //   isLoading: false,
      //   [name]: { ...image, isImagePicker: true }
      // });
    } else {
      this.setState({ isLoading: false });
    }
  };

  callBackImage = (name, image) => {
    if (image) {
      this.setState({
        isLoading: false,
        [name]: { ...image, isImagePicker: true }
      });
    } else {
      this.setState({ isLoading: false });
    }
  };

  themAnh = name => {
    ActionSheet.show(
      {
        options: [string.mayAnh, string.thuVien, string.dong],
        cancelButtonIndex: 2,
        title: string.chonAnh
      },
      this.chonImage.bind(this, name)
    );
  };

  attemptReverseGeocodeAsync = async (location, isLoad) => {
    // const {isEditDiaChi} = this.state;
    if (isLoad) this.setState({ isLoadLocation: true });
    // try {
    //   // if (!isEditDiaChi) {
    //     // let result = await Location.reverseGeocodeAsync(location);
    //     // result = result && result.length && result[0];
    //     // let {city, country, name, region} = result;
    //     // name = name || "";
    //     // country = country || "";
    //     // city = city || "";
    //     // region = region || "";
    //     // this.setState({diaChi: `${name}, ${city}, ${region}, ${country}`});
    //   // }
    // } catch (e) {
    //   console.log("error");
    // } finally {
    if (location && location.latitude && location.longitude && this._mapView) {
      this._mapView.animateToCoordinate(location);
    }
    this.latlngMap = { ...this.latlngMap, ...location };
    this.setState({ isLoading: false, isLoadLocation: false, location });
    // }
  };

  onFocus = () => {
    const { diaChi } = this.state;
    this.refs.SuggestDiaChi.onFocus(diaChi);
  };

  onEndEditing = event => {
    this.refs.SuggestDiaChi.onEndEditing(event.nativeEvent.text);
  };

  onChangeText = (name, text) => {
    let { isEditDiaChi } = this.state;
    if (name === "diaChi") {
      this.refs.SuggestDiaChi.onChangeText(text);
      if (text) {
        isEditDiaChi = true;
      } else {
        isEditDiaChi = false;
      }
    }
    this.setState({ [name]: text, isEditDiaChi });
  };

  openChonDiaChi = () => {
    const { location } = this.state;
    this.refs.ChonDiaChi.open(location);
  };

  renderItemInput = props => {
    let { title, name, style, value, styleTextInput } = props;
    style = style || {};
    styleTextInput = styleTextInput || {};
    name = name || "";
    title = title || "";
    value = value || "";
    return (
      <View
        style={[
          {
            //borderBottomWidth: 0.5,
            //borderBottomColor: "gray",
            paddingHorizontal: 15
          },
          style
        ]}
      >
        <View style={{ marginVertical: 10, flexDirection: "row" }}>
          <Text style={{ fontSize: 14, color: "gray", flex: 1 }}>{title}</Text>
        </View>
        <TextInput
          underlineColorAndroid="#0000"
          onChangeText={this.onChangeText.bind(this, name)}
          {...props}
          placeholder={title}
          value={value}
          style={[{ fontSize: 15, marginBottom: 10 }, styleTextInput]}
          //style={[styles.textInput, style]}
        />
      </View>
    );
  };

  taoGianHang = () => {
    const { accountInfo } = this.props;
    this.setState({ isLoading: true });
    const { anhBia, anhDaiDien } = this.state;
    let { tenGianHang, diaChi, lienHe, moTa } = this.state;
    tenGianHang = tenGianHang.trim();
    diaChi = diaChi.trim();
    lienHe = lienHe.trim();
    moTa = moTa.trim();
    const id =
      this.props.navigation.state.params &&
      this.props.navigation.state.params.id
        ? this.props.navigation.state.params.id
        : "";
    const arrImage = [];
    if (anhBia.isImagePicker) {
      arrImage.push({ ...anhBia, key: "cover" });
    }
    if (anhDaiDien.isImagePicker) {
      arrImage.push({ ...anhDaiDien, key: "image" });
    }

    if (accountInfo) {
      this.postToServerWithAccount(
        getApiUrl(API.TAO_MOI_GIAN_HANG),
        {
          name: tenGianHang,
          address: diaChi,
          contact: lienHe,
          description: moTa,
          longitude: this.location.longitude,
          latitude: this.location.latitude,
          id
        },
        arrImage.length ? arrImage : null
      ).then(response => {
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          this.props.dispatchParams(
            { ...propsData.data, device_token: accountInfo.device_token },
            actionTypes.APP_USER_INFO
          );
          if (this.props.navigation.state.params.callBack) {
            this.showAlertDialog(string.suaGianHangThanhCong);
            this.props.navigation.state.params.callBack();
            this.props.navigation.goBack();
          } else {
            setTimeout(() => {
              this.props.navigation.replace(screenNames.ChiTietGianHang, {
                id: propsData.data.store[0].id
              });
            }, 200);
          }
        } else {
          this.showAlertDialog(propsData.message);
        }
        this.setState({ isLoading: false });
      });
    }
  };

  confirmTaoGianHang = () => {
    // this._mapView.animateToCoordinate({
    //   latitude: this.props.navigation.state.params.location.latitude,
    //   longitude: this.props.navigation.state.params.location.longitude
    // });
    // console.log(this.props);
    // console.log(this.location);

    const { anhDaiDien, anhBia } = this.state;
    let { tenGianHang, diaChi, lienHe, moTa } = this.state;
    tenGianHang = tenGianHang && tenGianHang.trim();
    diaChi = diaChi && diaChi.trim();
    lienHe = lienHe && lienHe.replace(/ + /g, " ").trim();
    moTa = moTa && moTa.trim();

    if (!anhDaiDien) {
      this.showAlertDialog(string.banChuaChonAnhGianHang);
      return;
    }
    if (!anhBia) {
      this.showAlertDialog(string.banChuaChonAnhBiaGianHang);
      return;
    }

    if (!tenGianHang) {
      this.showAlertDialog(string.banChuaNhapTenGianHang);
      return;
    }

    if (tenGianHang.length > 50) {
      this.showAlertDialog(string.tenGianHangKhongDuocVuotQua50KyTu);
      return;
    }

    if (!diaChi) {
      this.showAlertDialog(string.banChuaNhapDiaChiGianHang);
      return;
    }

    if (diaChi.length > 100) {
      this.showAlertDialog(string.diaChiKhongDuocVuotQua100KyTu);
      return;
    }

    if (!this.location) {
      this.showAlertDialog(string.banChuaChonToaDoGianHang);
      return;
    }

    if (!lienHe) {
      this.showAlertDialog(string.banChuaNhapLienHeGianHang);
      return;
    }

    if (lienHe.length < 10 || lienHe.length > 11) {
      this.showAlertDialog(string.sdtPhai10Hoac11So);
      return;
    }

    if (isNaN(Number(lienHe))) {
      this.showAlertDialog(string.khongPhaiSdt);
      return;
    }

    if (!/^0[0-9]{9,10}$/.test(lienHe)) {
      this.showAlertDialog(string.sdtKhongDung);
      return;
    }

    if (!moTa) {
      this.showAlertDialog(string.banChuaNhapMoTaGianHang);
      return;
    }
    this.taoGianHang();
  };

  onRegionChangeComplete = result => {
    this.location = result;
    this.latlngMap = {
      latitudeDelta: result.latitudeDelta,
      longitudeDelta: result.longitudeDelta,
      latitude: result.latitude,
      longitude: result.longitude
    };
    // this.timeoutDiaChi = setTimeout(
    //   this.attemptReverseGeocodeAsync.bind(this, result, true),
    //   1500
    // );
  };

  // onRegionChange = () => {
  //   if (this.timeoutDiaChi) {
  //     clearTimeout(this.timeoutDiaChi);
  //     this.timeoutDiaChi = null;
  //   }
  // };

  openModalLicense = () => {
    this.setState({ showModalLicense: true });
  };

  closeModalLicense = () => {
    this.setState({ showModalLicense: false });
  };

  onSelect = address => {
    const { description, place_id: placeId } = address;
    this.setState({ isLoadLocation: true, diaChi: description }, () => {
      this.getFromServer(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          placeid: placeId,
          key: "AIzaSyCLV1SW82jibElhZe3v-_q4EQaSdNCpBIo"
        }
      ).then(response => {
        const { result } = response;
        const { geometry } = result || {};
        const { location } = geometry || {};
        const { lat, lng } = location || {};
        if (lat && lng) {
          this.attemptReverseGeocodeAsync(
            { latitude: lat, longitude: lng },
            true
          );
        } else this.attemptReverseGeocodeAsync(null, true);
      });
    });
  };

  render() {
    const {
      anhDaiDien,
      anhBia,
      tenGianHang,
      diaChi,
      lienHe,
      moTa,
      isLoading,
      showModalLicense,
      isLoadLocation,
      location
    } = this.state;
    let viewMain = null;
    if (isLoading) {
      viewMain = <View style={{ flex: 1 }}>{this.viewLoading()}</View>;
    } else {
      viewMain = (
        <View flex={1}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            <View style={{ height: metrics.DEVICE_WIDTH / 2 + 50 }}>
              <TouchableOpacity onPress={this.themAnh.bind(this, "anhBia")}>
                <View
                  style={{
                    backgroundColor: colors.windowBackground,
                    height: metrics.DEVICE_WIDTH / 2,
                    marginBottom: 50
                  }}
                >
                  {anhBia && (
                    <Image
                      source={anhBia}
                      style={{
                        width: "100%",
                        height: metrics.DEVICE_WIDTH / 2
                      }}
                    />
                  )}
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      position: "absolute",
                      top: 15,
                      right: 15
                    }}
                  >
                    <Icon
                      name="edit"
                      iconType="Entypo"
                      style={{
                        fontSize: 15,
                        color: colors.brandPrimary,
                        marginRight: 5
                      }}
                    />
                    <Text style={styles.textAdd}>{string.themAnhBia}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnAddAvatar,
                  {
                    position: "absolute",
                    bottom: 10,
                    alignSelf: "center",
                    backgroundColor: "#fff"
                  }
                ]}
                onPress={this.themAnh.bind(this, "anhDaiDien")}
              >
                {anhDaiDien ? (
                  <Image
                    source={anhDaiDien}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imageAddAvatar}>
                    <Icon
                      name="edit"
                      iconType="Entypo"
                      style={styles.iconAdd}
                    />
                    <Text style={styles.textAdd}>{string.themHinhAnh}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <this.renderItemInput
              title={string.tenGianHang}
              name="tenGianHang"
              style={{ marginTop: 20 }}
              styleTextInput={{}}
              value={tenGianHang || ""}
            />
            <this.renderItemInput
              title={string.diaChiGianHang}
              name="diaChi"
              style={{}}
              styleTextInput={{ width: metrics.DEVICE_WIDTH - 70 }}
              value={diaChi || ""}
              multiline
              onFocus={this.onFocus}
              onEndEditing={this.onEndEditing}
            />
            <View>
              <View style={styles.viewMapView}>
                <View
                  style={{
                    marginBottom: 20,
                    marginHorizontal: 15,
                    flexDirection: "row"
                  }}
                >
                  <Text style={{ fontSize: 12, color: "gray", flex: 1 }}>
                    {string.viTriGianHang}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      onPress={this.getLocation.bind(this, true)}
                    >
                      <Text style={{ marginRight: 5 }}>
                        <Icon
                          name="location-pin"
                          iconType="Entypo"
                          style={{ fontSize: 12, color: colors.brandPrimary }}
                        />
                        <Text
                          style={{ fontSize: 12, color: colors.brandPrimary }}
                        >
                          Vị trí của tôi
                        </Text>
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        borderRightColor: colors.brandPrimary,
                        borderRightWidth: 1
                      }}
                    />
                    <TouchableOpacity onPress={this.openChonDiaChi}>
                      <Text style={{ marginLeft: 5 }}>
                        <Icon
                          name="map"
                          iconType="MaterialCommunityIcons"
                          style={{ fontSize: 12, color: colors.brandPrimary }}
                        />
                        <Text
                          style={{ fontSize: 12, color: colors.brandPrimary }}
                        >
                          Bản đồ
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View>
                  <MapView
                    ref={ref => (this._mapView = ref)}
                    style={styles.mapView}
                    initialRegion={{
                      latitude: 21.020965181930173,
                      longitude: 105.82116397768182,
                      latitudeDelta: 0.0961423217173234,
                      longitudeDelta: 0.2636719378938892
                    }}
                    initialRegion={this.latlngMap}
                    onRegionChangeComplete={this.onRegionChangeComplete}
                  >
                    {location && (
                      <MapView.Marker
                        coordinate={{
                          latitude: Number(location.latitude),
                          longitude: Number(location.longitude)
                        }}
                        title={diaChi}
                      >
                        <Icon
                          name="location-pin"
                          iconType="Entypo"
                          style={styles.iconMarkUp}
                        />
                      </MapView.Marker>
                    )}
                  </MapView>
                  {isLoadLocation && (
                    <View
                      style={[
                        StyleSheet.absoluteFillObject,
                        {
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#0004"
                        }
                      ]}
                    >
                      <Spinner />
                    </View>
                  )}
                </View>
              </View>
              <this.renderItemInput
                title={string.soDienThoaiLienHe}
                name="lienHe"
                //style={{borderTopWidth: 0.5, borderTopColor: "gray"}}
                styleTextInput={{}}
                value={lienHe || ""}
                keyboardType="phone-pad"
              />
              <this.renderItemInput
                title={string.gioiThieuGianHang}
                name="moTa"
                styleTextInput={styles.textMoTa}
                style={{ marginBottom: 15, paddingBottom: 10 }}
                value={moTa || ""}
                multiline
              />
              <SuggestDiaChi ref="SuggestDiaChi" onSelect={this.onSelect} />
            </View>
          </ScrollView>
          <View style={styles.viewFooter}>
            <TouchableOpacity
              style={[config.styles.button.xacNhan, { borderRadius: 5 }]}
              onPress={this.confirmTaoGianHang}
            >
              <Text style={config.styles.text.btnConfirmText}>
                {this.props.navigation.state.params &&
                this.props.navigation.state.params.tenGianHang
                  ? string.luu
                  : string.taoGianHang}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        enabled={Platform.OS === "ios"}
        behavior="padding"
        flex={1}
      >
        <AppHeader
          left
          title={
            this.props.navigation.state.params &&
            this.props.navigation.state.params.tenGianHang
              ? string.suaGianHang
              : string.taoGianHang
          }
          navigation={this.props.navigation}
        />
        <View style={{ flex: 1 }}>{viewMain}</View>

        <HopDongDienTu
          showModalLicense={showModalLicense}
          closeModalLicense={this.closeModalLicense}
          navigation={this.props.navigation}
        />
        <ChonDiaChi
          ref="ChonDiaChi"
          onLocation={lc => {
            if (lc) this.attemptReverseGeocodeAsync(lc, true);
          }}
        />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white"
  },
  textInput: {
    borderWidth: 0.5,
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    marginBottom: 10
  },
  btnAddAvatar: {
    width: 80,
    height: 80
    // marginBottom: 10,
    // marginTop: 15,
    // marginLeft: 15
  },
  imageAddAvatar: {
    height: 80,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderColor: colors.brandPrimary,
    borderStyle: "dashed",
    borderWidth: 1
  },
  avatar: {
    height: 80,
    width: 80,
    borderWidth: 1,
    borderColor: colors.brandPrimary
  },
  iconAdd: {
    fontSize: 20,
    color: colors.brandPrimary
  },
  textAdd: {
    color: colors.brandPrimary,
    fontSize: 12
  },
  viewMapView: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  mapView: {
    width: metrics.DEVICE_WIDTH,
    height: 150
  },
  viewIconMarkUp: {
    position: "absolute",
    paddingBottom: 19,
    justifyContent: "center",
    alignItems: "center"
  },
  iconMarkUp: {
    fontSize: 40,
    color: colors.brandPrimary,
    paddingBottom: Platform.OS === "ios" ? 26 : 0
  },
  textMoTa: {
    paddingTop: 0,
    textAlignVertical: "top"
  },
  viewFooter: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 0.8,
    borderTopColor: colors.windowBackground
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  { dispatchParams },
  null,
  { withRef: true }
)(TaoGianHang);
