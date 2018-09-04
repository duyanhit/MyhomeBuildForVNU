import React from "react";
import { connect } from "react-redux";
import { Button, Text, Thumbnail } from "native-base";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl
} from "react-native";

import AppComponent from "../../../core/components/AppComponent";
import string from "../../config/string";
import Icon from "../../component/Icon";
import colors from "../../../core/config/colors";
import { API } from "../../config/server";
import ListProduct from "../DichVu/ListProduct";
import DanhMuc from "../DichVu/DanhMuc";
import { screenNames } from "../../config/screen";
import config from "../../../core/config";

class DichVu extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      location: null,
      disShow: false,
      groupProduct: [
        {
          title: string.sanPhamGanToi,
          url: API.DS_SAN_PHAM_GAN_TOI,
          data: { page: 1, page_size: 10, location: true },
          disShow: false
        },
        {
          title: string.sanPhamNoiBat,
          url: API.DS_SAN_PHAM_THEO_DANH_GIA,
          data: { page: 1, page_size: 10 }
        },
        {
          title: string.deXuat,
          url: API.DS_SAN_PHAM_THEO_DE_XUAT,
          data: { page: 1, page_size: 10 }
        }
      ]
    };
  }

  componentWillMount = () => {
    this.findSingleLocation().then(perLocation => {
      this.setState({
        isLoading: false,
        location: perLocation.location,
        perLocation
      });
    });
  };

  renderItemGroupProduct = ({ item, index }) => {
    const { navigation } = this.props;
    const { location: locationState, perLocation, groupProduct } = this.state;
    let { url, data, title, disShow } = item;
    url = url || "";
    data = data || {};
    title = title || "";
    disShow = disShow || false;
    const { location } = data;
    if (disShow) return null;
    if (location && locationState) {
      data = {
        ...data,
        longitude: locationState.coords.longitude,
        latitude: locationState.coords.latitude
      };
    }

    let msg = "";
    if (perLocation.perLocations.status !== "granted") {
      msg = string.chuaDuocPhepTruyCapViTri;
    } else if (Platform.OS === "android" && !perLocation.GPS.gpsAvailable) {
      msg = string.chuaBatViTri;
    }
    return (
      <View
        style={{
          borderTopColor: colors.windowBackground,
          borderTopWidth: 5,
          paddingBottom: 10,
          borderBottomColor: colors.windowBackground,
          borderBottomWidth: groupProduct.length - 1 === index ? 5 : 0
        }}
      >
        <View style={styles.viewTitle}>
          <Text style={styles.textTitle}>{title}</Text>
          {!(msg && location) ? (
            <TouchableOpacity
              onPress={this.navigateToScreen(
                screenNames.DanhSachSanPhamTrongDanhMuc,
                {
                  url,
                  title,
                  location: data
                }
              )}
            >
              <View style={styles.btnXemTatCa}>
                <Text style={styles.xemTatCa}>{string.xemTatCa}</Text>
                <Icon
                  name="ios-arrow-forward"
                  iconType="Ionicons"
                  style={styles.icon}
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={{ backgroundColor: "#fff" }}>
          {msg && location ? (
            <View style={styles.locationErr}>
              <Thumbnail square source={config.images.locationDissable} />
              <Text />
              <Text note style={{ textAlign: "center" }}>
                {msg}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Button
                  style={{ alignSelf: "center" }}
                  transparent
                  onPress={() => {
                    this.findSingleLocation().then(perLocation1 => {
                      this.setState({
                        isLoading: false,
                        location: perLocation1.location,
                        perLocation: perLocation1,
                        groupProduct: [...groupProduct]
                      });
                    });
                  }}
                >
                  <Text
                    uppercase={false}
                    style={{ color: colors.brandPrimary }}
                  >
                    {string.thuLai}
                  </Text>
                </Button>
                <Button
                  style={{ alignSelf: "center" }}
                  transparent
                  onPress={() => {
                    groupProduct[0].disShow = true;
                    this.setState({
                      groupProduct: [...groupProduct]
                    });
                  }}
                >
                  <Text uppercase={false} note>
                    {string.boQua}
                  </Text>
                </Button>
              </View>
            </View>
          ) : (
            <ListProduct
              ref={ref => {
                if (ref) ref.wrappedInstance.refreshScreen();
              }}
              navigation={navigation}
              url={url}
              data={data}
              horizontal
            />
          )}
        </View>
      </View>
    );
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
    setTimeout(() => {
      this.setState({
        refreshing: false,
        groupProduct: [...this.state.groupProduct]
      });
    }, 1000);
  };

  render() {
    const { isLoading, groupProduct, refreshing } = this.state;
    if (isLoading) {
      return this.viewLoading();
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />
        }
      >
        <DanhMuc navigation={this.props.navigation} />
        <FlatList
          scrollEnabled={false}
          data={groupProduct}
          keyExtractor={(v, i) => i.toString()}
          renderItem={this.renderItemGroupProduct}
          extraData={this.state.gpsAvailable}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  viewTitle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingBottom: 10,
    backgroundColor: "#fff"
  },
  textTitle: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 15
  },
  btnXemTatCa: {
    flexDirection: "row",
    alignItems: "center"
  },
  xemTatCa: {
    fontSize: 13,
    color: colors.brandPrimary
  },
  icon: {
    fontSize: 15,
    color: colors.brandPrimary,
    marginLeft: 10
  },
  locationErr: {
    alignItems: "center",
    paddingBottom: 5,
    minHeight: 210,
    paddingTop: 15,
    paddingHorizontal: 50
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(DichVu);
