import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, Thumbnail } from "native-base";
import Moment from "moment";

import AppComponent from "../../../../core/components/AppComponent";
import string from "../../../config/string";
import { moneyFormat } from "../../../../core/helpers/numberHelper";
import config from "../../../../core/config";
import { screenNames } from "../../../config/screen";
import { assets } from "../../../../assets";
import colors from "../../../config/colors";

const HUY_DON_HANG = 4;

class ItemDonHang extends AppComponent {
  render() {
    const {
      item,
      refreshScreen,
      donMua,
      chiTiet,
      filter,
      huyDonHang,
      filterOrderStatus
    } = this.props;

    let backgroundColor, textStatus;
    switch (item.status) {
      case "1":
        textStatus = string.choXacNhan;
        backgroundColor = "#f8941d";
        break;
      case "2":
        textStatus = string.dangGiaoHang;
        backgroundColor = "#1b75bd";
        break;
      case "3":
        textStatus = string.daNhanHang;
        backgroundColor = colors.brandPrimary;
        break;
      case "4":
        textStatus = string.daHuy;
        backgroundColor = "#f00";
        break;
    }

    return (
      <TouchableOpacity
        onPress={this.navigateToScreen(screenNames.ChiTietDonHang, {
          id: item.id,
          donMua,
          onGoBack: () => refreshScreen()
        })}
        activeOpacity={chiTiet ? 1 : 0.3}
      >
        <View
          style={[styles.container, { borderBottomWidth: chiTiet ? 0 : 0.8 }]}
        >
          {donMua &&
            !chiTiet && (
              <View style={styles.viewStatusAndTime}>
                {!filter && (
                  <TouchableOpacity
                    onPress={() => filterOrderStatus(item.status, textStatus)}
                    style={[styles.btnStatus, { backgroundColor }]}
                  >
                    <Text style={styles.textStatus}>{textStatus}</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.createdTime}>
                  {Moment(item.status_time).format("HH:mm, DD/MM/YYYY")}
                </Text>
              </View>
            )}

          <View style={styles.viewGianHang}>
            <View style={styles.gianHang}>
              <Image
                source={assets.shopDefault}
                style={[styles.imageStore, { position: "absolute" }]}
              />
              <Image
                source={{ uri: item.store_image }}
                style={styles.imageStore}
              />
              <Text style={{ fontSize: 13 }}>{item.store_name}</Text>
            </View>
            {!chiTiet && <Text style={styles.textId}>{"#" + item.id}</Text>}
          </View>

          <View style={styles.viewDetailOrder}>
            <Thumbnail square large source={{ uri: item.product_image }} />

            <View style={styles.viewDetail}>
              <Text style={styles.nameProduct} numberOfLines={chiTiet ? 3 : 2}>
                {item.product_name}
              </Text>

              <View style={styles.viewQuantity}>
                <Text style={styles.quantityProduct}>
                  {"x " + item.quantity}
                </Text>
              </View>

              <Text style={[config.styles.text.priceText, styles.price]}>
                {moneyFormat(Number(item.price))}
              </Text>

              <Text style={styles.tongTien}>
                {string.tongTien}
                <Text style={config.styles.text.priceText}>
                  {moneyFormat(Number(item.price) * Number(item.quantity))}
                </Text>
              </Text>
            </View>
          </View>

          {item.status === "1" &&
            !chiTiet &&
            !filter &&
            donMua && (
              <View style={styles.viewBottomItem}>
                <TouchableOpacity
                  style={[config.styles.button.huy, styles.btnHuyDonHang]}
                  onPress={() => huyDonHang(item.id, HUY_DON_HANG)}
                >
                  <Text style={config.styles.text.btnCancelText}>
                    {string.huyDonHang}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {item.status === "3" &&
            !chiTiet &&
            donMua &&
            item.product_star === "0" && (
              <View style={styles.viewBottomItem}>
                <TouchableOpacity
                  style={[config.styles.button.xacNhan, styles.btnDanhGia]}
                  onPress={this.navigateToScreen(screenNames.ChiTietDonHang, {
                    id: item.id,
                    donMua
                  })}
                >
                  <Text style={config.styles.text.btnConfirmText}>
                    {string.danhGiaSanPham}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomColor: colors.windowBackground
  },
  viewGianHang: {
    flexDirection: "row",
    alignItems: "center"
  },
  gianHang: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  textId: {
    flex: 1,
    textAlign: "right",
    fontSize: 13
  },
  imageStore: {
    height: 26,
    width: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#fff",
    marginRight: 8
  },
  viewDetailOrder: {
    flexDirection: "row",
    marginTop: 10
  },
  viewDetail: {
    flex: 3,
    marginLeft: 10
  },
  nameProduct: {
    fontSize: 14,
    textAlign: "justify",
    flex: 2
  },
  viewQuantity: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end"
  },
  quantityProduct: {
    textAlign: "right",
    fontSize: 13,
    color: "gray"
  },
  price: {
    fontSize: 13,
    textAlign: "right",
    flex: 1
  },
  tongTien: {
    textAlign: "right",
    paddingTop: 5,
    fontSize: 14
  },
  btnStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  createdTime: {
    textAlign: "right",
    fontSize: 12,
    color: "gray",
    flex: 1
  },
  textStatus: {
    fontSize: 12,
    color: "#fff"
  },
  viewBottomItem: {
    alignItems: "flex-end",
    marginTop: 10
  },
  btnHuyDonHang: {
    width: 100,
    paddingVertical: 5
  },
  btnDanhGia: {
    width: 150,
    paddingVertical: 5
  },
  viewStatusAndTime: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  }
});

export default ItemDonHang;
