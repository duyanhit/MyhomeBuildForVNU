import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { connect } from "react-redux";
import { Icon, Thumbnail } from "native-base";

import colors from "../../config/colors";
import strings from "../../config/string";
import { moneyFormat } from "../../../core/helpers/numberHelper";
import { assets } from "../../../assets";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { screenNames } from "../../config/screen";
import { API, getApiUrl } from "../../config/server";
import AppComponent from "../../../core/components/AppComponent";
import config from "../../../core/config";

class DatHang extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      numberOfProduct: "1",
      phone: "",
      product: this.props.product,
      defaultPhone: true
    };
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ product: nextProps.product });
  };

  onCloseModal = () => {
    this.setState({ numberOfProduct: 1, phone: "", defaultPhone: true }, () =>
      this.props.onClose()
    );
  };

  openLoading = () => {
    this.props.openLoading();
  };

  hideLoading = () => {
    this.props.hideLoading();
  };

  decrement = () => {
    const { numberOfProduct } = this.state;
    if (Number(numberOfProduct) > 1) {
      this.setState({
        numberOfProduct: Number(numberOfProduct) - 1
      });
    }
  };

  increment = () => {
    const { numberOfProduct } = this.state;
    if (Number(numberOfProduct) < 99) {
      this.setState({
        numberOfProduct: Number(numberOfProduct) + 1
      });
    }
  };

  checkPhoneAndNumberOfProduct = () => {
    let { phone, numberOfProduct, defaultPhone } = this.state;
    phone = phone.replace(/ + /g, " ").trim();
    numberOfProduct = numberOfProduct
      .toString()
      .replace(/ + /g, " ")
      .trim();
    let phoneMsg;
    let numberOfProductMsg;

    if (!defaultPhone) {
      if (!phone) {
        phoneMsg = strings.vuiLongNhapSoDienThoai;
      } else if (phone.length < 10 || phone.length > 11) {
        phoneMsg = strings.sdtPhai10Hoac11So;
      } else if (isNaN(Number(phone))) {
        phoneMsg = strings.khongPhaiSdt;
      } else if (!/^0[0-9]{9,10}$/.test(phone)) {
        phoneMsg = strings.sdtKhongDung;
      }
    }
    if (numberOfProduct < 1 || numberOfProduct > 99) {
      numberOfProductMsg = strings.vuiLongNhapSoLuongSanPham;
    } else if (isNaN(Number(numberOfProduct))) {
      numberOfProductMsg = strings.vuiLongPhaiNhapSo;
    } else if (/[^0-9]/.test(numberOfProduct)) {
      numberOfProductMsg = strings.vuiLongPhaiNhapSo;
    }
    if (phoneMsg) {
      this.showAlertDialog(phoneMsg, this.refs.inputPhone.focus());
    } else if (numberOfProductMsg) {
      this.showAlertDialog(
        numberOfProductMsg,
        this.refs.numberOfProduct.focus()
      );
    } else {
      Alert.alert(
        strings.thongBao,
        strings.banMuonDatHangSanPhamNay,
        [
          {
            text: strings.huy,
            onPress: () => {}
          },
          {
            text: strings.dongY,
            onPress: () => this.buyProduct()
          }
        ],
        { cancelable: false }
      );
    }
  };

  buyProduct = () => {
    const { accountInfo, navigation } = this.props;
    const { phone, numberOfProduct, product } = this.state;
    this.onCloseModal();
    this.openLoading();
    this.postToServerWithAccount(getApiUrl(API.DAT_HANG_SAN_PHAM), {
      id: product.id,
      phone: accountInfo.phone,
      phone_receive: phone,
      quantity: numberOfProduct
    }).then(response => {
      this.hideLoading();
      this.setState({
        numberOfProduct: 1,
        phone: ""
      });
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        setTimeout(() => {
          // setTimeout để có thể hiện thị Alert trên IOS
          this.showAlertDialog(strings.datHangThanhCong, () => {
            navigation.navigate(screenNames.DanhSachDonMua);
          });
        }, 300);
      } else {
        setTimeout(() => {
          // setTimeout để có thể hiện thị Alert trên IOS
          this.showAlertDialog(propsData.message);
        }, 300);
      }
    });
  };

  showNewPhone = () => {
    this.setState({
      defaultPhone: false
    });
  };

  hideNewPhone = () => {
    this.setState({
      defaultPhone: true,
      phone: ""
    });
  };

  render() {
    const { visible, accountInfo } = this.props;
    const { phone, product, numberOfProduct, defaultPhone } = this.state;
    let viewProductInModal, viewSoLuong;

    if (product) {
      let image = product.image;

      viewSoLuong = (
        <View style={[styles.viewContentModal, { marginTop: 0 }]}>
          <View style={styles.viewNumberOfProduct}>
            <TouchableOpacity
              style={[styles.viewButtonNumberOfProduct, { marginRight: 10 }]}
              onPress={() => this.decrement()}
            >
              <Icon
                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                type="Entypo"
                name="minus"
                style={[styles.iconButtonNumberOfProduct, { color: "gray" }]}
              />
            </TouchableOpacity>

            <View style={styles.viewTextNumberOfProduct}>
              <TextInput
                ref="numberOfProduct"
                underlineColorAndroid="transparent"
                style={styles.inputPhone}
                keyboardType="numeric"
                value={numberOfProduct.toString()}
                onChangeText={text => this.setState({ numberOfProduct: text })}
                onSubmitEditing={() => this.checkPhoneAndNumberOfProduct()}
              />
            </View>

            <TouchableOpacity
              style={[styles.viewButtonNumberOfProduct, { marginLeft: 10 }]}
              onPress={() => this.increment()}
            >
              <Icon
                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                name="md-add"
                style={[
                  styles.iconButtonNumberOfProduct,
                  { color: colors.brandPrimary }
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      );

      viewProductInModal = (
        <View style={styles.viewProductInModal}>
          <Thumbnail
            square
            large
            source={image ? { uri: image[0] } : assets.sanPhamdefault}
          />
          <View style={styles.viewProductInfo}>
            <Text numberOfLines={2} style={{ fontSize: 15 }}>
              {product.name}
            </Text>
            <Text
              numberOfLines={1}
              style={[config.styles.text.priceText, { fontSize: 15 }]}
            >
              {moneyFormat(Number(product.price))}
            </Text>

            {viewSoLuong}
          </View>
        </View>
      );
    }
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={visible}
          onRequestClose={() => this.onCloseModal()}
        >
          <KeyboardAvoidingView
            enabled={Platform.OS === "ios"}
            behavior="padding"
            flex={1}
            style={styles.viewModalContainer}
          >
            <View style={styles.viewModal}>
              <View style={styles.viewModalContent}>
                {viewProductInModal}

                {defaultPhone ? (
                  <View style={styles.viewContentModal}>
                    <Text>{strings.lienHe}</Text>
                    <View style={styles.viewDefaultPhone}>
                      <Text>{accountInfo.phone ? accountInfo.phone : ""}</Text>
                    </View>
                    <TouchableOpacity onPress={() => this.showNewPhone()}>
                      <View style={styles.viewMorePhone}>
                        <Text
                          style={[
                            styles.textModalContact,
                            {
                              color: colors.brandPrimary,
                              justifyContent: "center",
                              alignItems: "center"
                            }
                          ]}
                        >
                          {strings.themLienHe}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <View style={styles.viewContentModal}>
                      <View style={styles.viewMorePhoneText}>
                        <Text>{strings.lienHe}</Text>
                      </View>
                      <View style={styles.viewMorePhoneInput}>
                        <View
                          style={[styles.viewDefaultPhone, { marginLeft: 0 }]}
                        >
                          <TextInput
                            ref="inputPhone"
                            underlineColorAndroid="transparent"
                            style={styles.inputPhone}
                            keyboardType="phone-pad"
                            value={phone}
                            placeholder={strings.soDienThoai}
                            onChangeText={text =>
                              this.setState({ phone: text })
                            }
                            onSubmitEditing={() =>
                              this.checkPhoneAndNumberOfProduct()
                            }
                          />
                        </View>
                      </View>
                      <View style={styles.viewMorePhoneRemove}>
                        <TouchableOpacity onPress={() => this.hideNewPhone()}>
                          <View
                            style={[
                              styles.viewMorePhone,
                              { justifyContent: "center", alignItems: "center" }
                            ]}
                          >
                            <Text style={styles.textModalContact}>
                              {strings.xoa}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.viewDefaultPhone,
                        { marginLeft: "30%", marginTop: 10 }
                      ]}
                    >
                      <Text>{accountInfo.phone ? accountInfo.phone : ""}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.viewModalContact}>
                  <Text note style={styles.textModalContact}>
                    {strings.nguoiBanHangSeLienHeVoiBan}
                  </Text>
                </View>
              </View>

              <View style={styles.viewButtonModal}>
                <TouchableOpacity
                  onPress={this.onCloseModal}
                  style={[config.styles.button.huy, styles.btnLeft]}
                >
                  <Text style={config.styles.text.btnCancelText}>
                    {strings.huy}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => this.checkPhoneAndNumberOfProduct()}
                  style={[config.styles.button.xacNhan, styles.btnRight]}
                >
                  <Text style={config.styles.text.btnConfirmText}>
                    {strings.datHang}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewProductInModal: {
    flexDirection: "row"
  },
  viewProductInfo: {
    marginLeft: 10,
    width: 220,
    paddingBottom: 5,
    paddingRight: 5
  },
  viewModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0004"
  },
  viewModal: {
    width: "90%",
    minWidth: 280,
    maxWidth: 360,
    backgroundColor: "white",
    borderRadius: 5
  },
  viewContentModal: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  viewNumberOfProduct: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  viewButtonNumberOfProduct: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  iconButtonNumberOfProduct: {
    fontSize: 15
  },
  viewTextNumberOfProduct: {
    width: 25,
    minWidth: 25,
    maxWidth: 50,
    height: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#D2D3D5"
  },
  viewInputPhone: {
    marginLeft: 91,
    alignItems: "center",
    borderWidth: 0.7,
    borderColor: "#D2D3D5",
    height: 30,
    width: 120
  },
  inputPhone: {
    textAlign: "center",
    flex: 1,
    width: "100%",
    justifyContent: "center"
  },
  viewButtonModal: {
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5
  },
  viewModalContact: {
    marginTop: 5,
    borderLeftColor: "#FEBE36",
    borderLeftWidth: 2,
    paddingLeft: 5
  },
  textModalContact: { fontSize: 12, color: "gray" },
  viewModalButton: {
    alignItems: "center",
    justifyContent: "center"
  },
  viewModalContent: { padding: 15 },
  btnLeft: {
    marginRight: 5,
    flex: 1
  },
  btnRight: {
    marginLeft: 5,
    flex: 1
  },
  viewDefaultPhone: {
    marginLeft: 45,
    width: 120,
    height: 30,
    borderWidth: 0.7,
    borderColor: "#D2D3D5",
    alignItems: "center",
    justifyContent: "center"
  },
  viewMorePhone: {
    marginLeft: 10,
    width: 80,
    height: 30,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  viewNewPhone: { flexDirection: "row", marginTop: 10 },

  viewMorePhoneText: { width: "30%" },
  viewMorePhoneInput: { width: "40%" },
  viewMorePhoneRemove: { width: "30%" }
});

const mapStateToProps = state => ({ accountInfo: state.accountReducer });

export default connect(mapStateToProps)(DatHang);
