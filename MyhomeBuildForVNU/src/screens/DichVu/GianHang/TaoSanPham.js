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
  Alert,
  Switch,
  StyleSheet
} from "react-native";
import {
  ActionSheet,
  Text,
  Picker,
  Header,
  Left,
  Right,
  Body,
  Title
} from "native-base";

import AppComponent from "../../../../core/components/AppComponent";
import { dispatchParams } from "../../../../core/actions";
import AppHeader from "../../../../core/components/AppHeader";
import { API, getApiUrl } from "../../../config/server";
import { parseJsonFromApi } from "../../../../core/helpers/apiHelper";
import string from "../../../config/string";
import metrics from "../../../../core/config/metrics";
import config from "../../../../core/config";
import colors from "../../../config/colors";
import Icon from "../../../component/Icon";
import { assets } from "../../../../assets";
import { screenNames } from "../../../config/screen";

class TaoSanPham extends AppComponent {
  state = {
    ...this.state,
    image:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.image
        ? {
            uri: `${API.HOST}${this.props.navigation.state.params.image}`,
            isImagePicker: false
          }
        : null,
    tenSanPham:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.tenGianHang,
    diaChi:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.diaChi,
    giaSanPham:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.lienHe,
    maSanPham:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.maSanPham,
    moTa:
      this.props.navigation.state.params &&
      this.props.navigation.state.params.moTa,
    isEdit:
      this.props.navigation.state.params &&
      !!this.props.navigation.state.params.item,

    active:
      this.props.navigation.state.params &&
      !this.props.navigation.state.params.active
  };

  componentWillMount = () => {
    if (this.props.navigation.state.params.item) {
      this.chiTietSanPham(selected => this.getScreenData(selected));
    } else this.getScreenData();
  };

  chiTietSanPham = cb => {
    let {
      image,
      tenSanPham,
      giaSanPham,
      moTa,
      selected,
      maSanPham,
      active
    } = this.state;
    const { item } = this.props.navigation.state.params;
    this.getFromServerWithAccount(getApiUrl(API.CHI_TIET_SAN_PHAM), {
      id: item.id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        const { product } = propsData.data;

        image = product.image
          ? JSON.parse(product.image).map(value => ({
              uri: `${API.HOST}${value}`,
              isNew: false,
              value
            }))
          : [];

        tenSanPham = product.name;
        giaSanPham = product.price;
        moTa = product.description;
        maSanPham = product.code || "";
        active = product.valid === "1";
        selected = { id: product.product_category_id };
      } else {
        this.showAlertDialog(propsData.message);
        setTimeout(() => {
          this.props.navigation.goBack();
        }, 300);
      }
      this.setState(
        { image, tenSanPham, giaSanPham, moTa, maSanPham, active },
        () => cb(selected)
      );
    });
  };

  getScreenData = data => {
    this.getFromServer(getApiUrl(API.DS_DANH_MUC), {}).then(response => {
      const propsData = parseJsonFromApi(response);
      let selected = null;
      if (propsData.status === 1) {
        selected = data || propsData.data[0];
      } else {
        this.showAlertDialog(propsData.message);
        setTimeout(() => {
          this.props.navigation.goBack();
        }, 300);
      }
      this.setState({
        isLoading: false,
        dataDanhMuc: propsData.data,
        propsData,
        selected
      });
    });
  };

  componentWillUnmount = () => {
    if (this.timeoutDiaChi) {
      clearTimeout(this.timeoutDiaChi);
      this.timeoutDiaChi = null;
    }
  };

  chonImage = async index => {
    this.setState({ isLoading: true });
    let imageTemp = null;
    if (index === 0) {
      imageTemp = await this.launchCameraAsync();
    } else if (index === 1) {
      imageTemp = await this.launchImageLibraryAsync();
    }
    if (imageTemp) {
      imageTemp = await this.resizeImage(imageTemp);
    }
    if (imageTemp) {
      this.navigateToScreen(screenNames.CropImage, {
        image: imageTemp,
        ratio: [1, 1],
        reSize: { width: 500, height: 500 },
        callBack: this.callBackImage
      })();
      // this.setState({
      //   isLoading: false,
      //   image: [...image, { ...imageTemp, isNew: true }]
      // });
    } else {
      this.setState({ isLoading: false });
    }
  };

  callBackImage = imageTemp => {
    let { image } = this.state;
    image = image || [];
    if (imageTemp) {
      this.setState({
        isLoading: false,
        image: [...image, { ...imageTemp, isNew: true }]
      });
    } else {
      this.setState({ isLoading: false });
    }
  };

  themAnh = () => {
    ActionSheet.show(
      {
        options: [string.mayAnh, string.thuVien, string.dong],
        cancelButtonIndex: 2,
        title: string.chonAnh
      },
      this.chonImage
    );
  };

  convertNumber = str => {
    const arrStr = [];
    let temp = str.toString();
    while (temp) {
      const strStr = temp.substring(
        temp.length - 3 < 0 ? 0 : temp.length - 3,
        temp.length
      );
      temp = temp.substring(0, temp.length - 3 < 0 ? 0 : temp.length - 3);
      arrStr.unshift(strStr);
    }
    return arrStr.join(".");
  };

  onChangeText = (name, text) => {
    let txt = text;
    if (name === "giaSanPham") {
      txt = text.replace(/\.+/g, "");
    }
    this.setState({ [name]: txt });
  };

  getCode = code => {
    this.setState({ maSanPham: code });
  };

  renderItemInput = props => {
    let { title, name, style, value, styleTextInput } = props;
    style = style || {};
    styleTextInput = styleTextInput || {};
    name = name || "";
    title = title || "";
    value = value || "";
    return (
      <View style={[{ paddingHorizontal: 15 }, style]}>
        <Text style={styles.textTitle}>{title}</Text>
        <View style={{ flexDirection: "row" }}>
          <TextInput
            underlineColorAndroid="#0000"
            onChangeText={this.onChangeText.bind(this, name)}
            {...props}
            placeholder={title}
            value={value}
            style={[styleTextInput, styles.textInput]}
          />
          {title === string.maSanPham && (
            <TouchableOpacity
              onPress={this.navigateToScreen(screenNames.CodeScanner, {
                callBack: this.getCode
              })}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Icon
                name="md-qr-scanner"
                iconType="Ionicons"
                style={styles.iconScan}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  taoSanPham = () => {
    this.setState({ isLoading: true });
    const {
      image,
      tenSanPham,
      giaSanPham,
      maSanPham,
      moTa,
      selected,
      active,
      isEdit
    } = this.state;
    const imageOld = image.filter(v => !v.isNew).map(v => v.value);
    let imageNew = image && image.length && image.filter(v => v.isNew);
    imageNew = imageNew && imageNew.length ? imageNew : null;

    this.postToServerWithAccount(
      getApiUrl(API.TAO_SAN_PHAM),
      {
        name: tenSanPham,
        price: giaSanPham,
        category: selected.id,
        code: maSanPham || "",
        description: moTa,
        publish: active ? 1 : 0,
        store:
          this.props.navigation.state.params &&
          this.props.navigation.state.params.id &&
          !isEdit
            ? this.props.navigation.state.params.id
            : "",
        id:
          this.props.navigation.state.params &&
          this.props.navigation.state.params.item
            ? this.props.navigation.state.params.item.id
            : "",
        image_old: JSON.stringify(imageOld)
      },
      imageNew || null
    ).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        if (this.props.navigation.state.params.callBack) {
          this.props.navigation.state.params.callBack();
        }
        if (this.props.navigation.state.params.isAddNew) {
          this.showAlertDialog(string.dangSanPhamMoiThanhCong);
        } else {
          this.showAlertDialog(string.suaSanPhamThanhCong);
        }
        this.props.navigation.goBack();
      } else {
        this.showAlertDialog(propsData.message);
      }
      this.setState({ isLoading: false });
    });
  };

  confirmTaoSanPham = () => {
    const { image, tenSanPham, giaSanPham, maSanPham, moTa } = this.state;
    const format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?a-zA-Z]/;

    if (!image || !image.length) {
      this.showAlertDialog(string.banChuaChonAnhSanPham);
      return;
    }
    if (!tenSanPham) {
      this.showAlertDialog(string.banChuaNhapTenSanPham);
      return;
    }
    if (tenSanPham.length > 100) {
      this.showAlertDialog(string.tenSanPhamKhongDuocVuotQua100KyTu);
      return;
    }
    if (!giaSanPham) {
      this.showAlertDialog(string.banChuaNhapGiaSanPham);
      return;
    } else if (format.test(giaSanPham)) {
      this.showAlertDialog(string.giaSanPhamKhongHopLe);
      return;
    } else if (giaSanPham.length > 9) {
      this.showAlertDialog(string.giaSanPhamPhaiNhoHon1Ty);
      return;
    } else if (Number(giaSanPham.replace(/\.+/g, "")) === 0) {
      this.showAlertDialog(string.giaSanPhamPhaiLonHon0);
      return;
    }
    if (!moTa) {
      this.showAlertDialog(string.banChuaNhapMoTaSanPham);
      return;
    }
    if (maSanPham && maSanPham.length > 255) {
      this.showAlertDialog(string.maSanPhamKhongDuocVuotQua255KyTu);
      return;
    }
    this.taoSanPham();
  };

  confirmXoaSanPham = () => {
    Alert.alert(string.thongBao, string.banMuonXoaSanPhamNay, [
      { text: string.huy },
      {
        text: string.xoa,
        onPress: () => {
          this.xoaSanPham();
        }
      }
    ]);
  };

  xoaSanPham = () => {
    this.setState({ isLoading: true });
    this.postToServerWithAccount(getApiUrl(API.XOA_SAN_PHAM), {
      id:
        this.props.navigation.state.params &&
        this.props.navigation.state.params.item
          ? this.props.navigation.state.params.item.id
          : ""
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        if (this.props.navigation.state.params.callBack) {
          this.props.navigation.state.params.callBack();
        }
        this.props.navigation.goBack();
        this.showAlertDialog(string.xoaSanPhamThanhCong);
      } else {
        this.showAlertDialog(propsData.message);
      }
      this.setState({ isLoading: false });
    });
  };

  onValueChange = key => {
    let { selected, dataDanhMuc } = this.state;
    dataDanhMuc = dataDanhMuc.filter(v => v.id === key);
    selected = dataDanhMuc[0];
    this.setState({ selected });
  };

  remoteImage = i => {
    const { image } = this.state;
    image.splice(i - 1, 1);
    this.setState({ image: [...image] });
  };

  switchActive = () => {
    this.setState({ active: !this.state.active });
  };

  render() {
    const {
      tenSanPham,
      selected,
      giaSanPham,
      moTa,
      isLoading,
      maSanPham,
      isEdit,
      active
    } = this.state;
    let { dataDanhMuc, image } = this.state;
    image = image ? [{ uri: null }, ...image] : [{ uri: null }];
    dataDanhMuc =
      dataDanhMuc &&
      dataDanhMuc.map(v => (
        <Picker.Item key={v.id} label={v.name} value={v.id} />
      ));
    let viewMain = null;
    if (isLoading) {
      viewMain = <View style={{ flex: 1 }}>{this.viewLoading()}</View>;
    } else {
      viewMain = (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: "white" }}
        >
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={styles.scrollView}
          >
            {image &&
              image.map((v, i) => {
                if (i >= 5) return null;
                if (v.uri === null) {
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.btnAddImage}
                      onPress={this.themAnh}
                    >
                      <View style={styles.viewBtnAddImage}>
                        <Icon
                          name="ios-add-circle-outline"
                          iconType="Ionicons"
                          style={styles.icon}
                        />
                        <Text style={styles.textAddImage}>
                          {string.anhSanPham}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }
                return (
                  <View
                    key={i}
                    style={[
                      styles.viewImage,
                      { marginRight: i === image.length - 1 ? 15 : 0 }
                    ]}
                  >
                    <Image source={v} style={styles.image} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.btnDeleteImage}
                      onPress={this.remoteImage.bind(this, i)}
                    >
                      <Image
                        style={styles.iconDeleteImage}
                        source={assets.icClose}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
          </ScrollView>
          {dataDanhMuc && (
            <View style={{}}>
              <Text style={styles.textDanhMuc}>{string.danhMuc}</Text>
              <Picker
                enabled={!isEdit}
                mode="dialog"
                style={styles.picker}
                textStyle={{ paddingLeft: 0 }}
                selectedValue={selected.id}
                onValueChange={this.onValueChange.bind(this)}
                iosIcon={
                  <Icon
                    name="arrow-drop-down"
                    iconType="MaterialIcons"
                    style={{ marginRight: 5 }}
                  />
                }
                renderHeader={backAction => (
                  <Header style={styles.headerPicker}>
                    <Left>
                      <TouchableOpacity
                        onPress={backAction}
                        style={styles.btnBack}
                      >
                        <Text style={{ color: colors.textHeader }}>
                          {string.quayLai}
                        </Text>
                      </TouchableOpacity>
                    </Left>
                    <Body>
                      <Title style={{ color: colors.textHeader }}>
                        {string.chonDanhMuc}
                      </Title>
                    </Body>
                    <Right />
                  </Header>
                )}
              >
                {dataDanhMuc}
              </Picker>
            </View>
          )}
          <this.renderItemInput
            editable={!isEdit}
            title={string.tenSanPham}
            name="tenSanPham"
            style={{}}
            value={tenSanPham || ""}
          />
          <this.renderItemInput
            title={string.giaSanPham}
            name="giaSanPham"
            style={{}}
            styleTextInput={config.styles.text.priceText}
            keyboardType="phone-pad"
            value={giaSanPham ? this.convertNumber(giaSanPham) : ""}
          />
          <this.renderItemInput
            title={string.maSanPham}
            name="maSanPham"
            style={{}}
            value={maSanPham || ""}
          />
          <this.renderItemInput
            title={string.moTaSanPham}
            name="moTa"
            styleTextInput={{
              textAlignVertical: "top"
            }}
            style={{}}
            value={moTa || ""}
            multiline
          />
          <View style={styles.viewSwitch}>
            <Text style={styles.textSwitch}>{string.dangBan}</Text>
            <Switch
              disabled={this.props.navigation.state.params.active}
              value={active}
              onValueChange={this.switchActive}
              onTintColor={colors.brandPrimary}
              thumbTintColor={colors.windowBackground}
            />
          </View>
        </ScrollView>
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
          title={isEdit ? string.suaSanPham : string.taoSanPham}
          navigation={this.props.navigation}
        />

        {viewMain}

        <View style={styles.viewBtnAddProduct}>
          {isEdit && (
            <TouchableOpacity
              style={[config.styles.button.huy, { flex: 1, marginRight: 5 }]}
              onPress={this.confirmXoaSanPham}
            >
              <Text style={config.styles.text.btnCancelText}>{string.xoa}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              config.styles.button.xacNhan,
              { flex: 1, marginLeft: isEdit ? 5 : undefined }
            ]}
            onPress={this.confirmTaoSanPham}
          >
            <Text style={config.styles.text.btnConfirmText}>
              {active ? string.dangSanPham : string.luu}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    marginTop: 15,
    marginBottom: 10
  },
  btnAddImage: {
    width: 100,
    height: 100,
    marginLeft: 15
  },
  viewBtnAddImage: {
    height: 100,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    borderColor: colors.brandPrimary,
    borderStyle: "dashed",
    borderWidth: 1
  },
  icon: {
    fontSize: 30,
    color: colors.brandPrimary
  },
  textAddImage: {
    color: colors.brandPrimary,
    fontSize: 12
  },
  viewImage: {
    height: 100,
    width: 100,
    borderWidth: 1,
    borderColor: "gray",
    marginLeft: 5
  },
  image: {
    height: 98,
    width: 98
  },
  btnDeleteImage: {
    position: "absolute",
    right: 0,
    backgroundColor: "#0004"
  },
  iconDeleteImage: {
    width: 30,
    height: 30
  },
  textDanhMuc: {
    fontSize: 12,
    color: "gray",
    marginTop: 10,
    marginLeft: 15
  },
  picker: {
    width: metrics.DEVICE_WIDTH - (Platform.OS === "ios" ? 30 : 16),
    marginLeft: Platform.OS === "ios" ? 15 : 8
  },
  viewSwitch: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
    borderTopWidth: 0.8,
    borderTopColor: colors.windowBackground,
    paddingTop: 10
  },
  textSwitch: {
    flex: 1,
    fontSize: 16
  },
  viewBtnAddProduct: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 0.8,
    borderTopColor: colors.windowBackground
  },
  headerPicker: {
    borderBottomWidth: 0.8,
    borderBottomColor: colors.windowBackground
  },
  btnBack: {
    paddingHorizontal: 5,
    paddingVertical: 10
  },
  textTitle: {
    fontSize: 12,
    color: "gray",
    marginVertical: 10
  },
  textInput: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: undefined,
    flex: 1
  },
  iconScan: {
    fontSize: 23,
    color: "gray"
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  { dispatchParams },
  null,
  { withRef: true }
)(TaoSanPham);
