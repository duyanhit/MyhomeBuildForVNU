import React from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Container, Text } from "native-base";
import { connect } from "react-redux";

import AppComponent from "../../../../core/components/AppComponent";
import AppHeader from "../../../../core/components/AppHeader";
import strings from "../../../config/string";
import { API, getApiUrl } from "../../../config/server";
import { parseJsonFromApi } from "../../../../core/helpers/apiHelper";
import colors from "../../../config/colors";
import { moneyFormat } from "../../../../core/helpers/numberHelper";
import metrics from "../../../../core/config/metrics";
import ViewMoreText from "../../../component/ViewMoreText";
import { screenNames } from "../../../config/screen";
import { assets } from "../../../../assets";
import Icon from "../../../component/Icon";

const width = metrics.DEVICE_WIDTH;

class DanhSachGoiDichVu extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      data: null
    };
  }

  componentWillMount = () => {
    this.getScreenData();
  };

  getScreenData = () => {
    let { data } = this.state;
    this.getFromServerWithAccount(
      getApiUrl(API.DANH_SACH_GOI_DICH_VU),
      {}
    ).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        data = propsData.data;
      }
      this.setState({
        isLoading: false,
        refreshing: false,
        data,
        propsData
      });
    });
  };

  showConfirm = id => {
    Alert.alert(
      strings.thongBao,
      strings.banMuonChonGoiDichVuNay,
      [
        {
          text: strings.huy,
          onPress: () => {}
        },
        {
          text: strings.dongY,
          onPress: () => this.buyPackage(id)
        }
      ],
      { cancelable: false }
    );
  };

  buyPackage = id => {};

  renderItem = ({ item, index }) => {
    return (
      <View style={styles.viewItem}>
        <Image
          source={item.image ? { uri: API.HOST + item.image } : assets.logo}
          style={styles.viewImage}
        />
        <View style={styles.viewInfo}>
          <Text style={styles.textName}>{item.name}</Text>
          <View style={styles.viewDescription}>
            <ViewMoreText
              numberOfLines={5}
              renderViewMore={onPress => (
                <Text
                  style={[styles.textContent, { color: "#007aff" }]}
                  onPress={onPress}
                >
                  {strings.xemThem}
                </Text>
              )}
              renderViewLess={onPress => <Text> </Text>}
            >
              <Text style={styles.textContent}>{item.desc}</Text>
            </ViewMoreText>
          </View>
          <View style={styles.viewCoin}>
            <Text style={styles.textCoin}>
              {item.coin} {strings.xu}
            </Text>
          </View>
          <View style={styles.viewPrice}>
            <TouchableOpacity
              style={styles.viewTouch}
              onPress={() => this.showConfirm(item.id)}
            >
              <Text style={styles.textPrice}>
                {" "}
                {moneyFormat(Number(item.price))}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  render = () => {
    const { navigation } = this.props;
    const { propsData, data, refreshing } = this.state;
    let viewMain = this.renderView(propsData);
    const rightButtons = [
      {
        icon: "history",
        iconType: "MaterialIcons",
        onPress: this.navigateToScreen(screenNames.LichSuMuaGoiDichVu, {})
      }
    ];

    if (viewMain === null && data) {
      viewMain = (
        <View style={styles.content}>
          <FlatList
            data={data}
            renderItem={this.renderItem}
            keyExtractor={item => item.id.toString()}
            refreshing={refreshing}
            onRefresh={this.refreshScreen}
            onEndReached={this.onEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={this.renderFooter(propsData)}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }
    return (
      <Container style={styles.container}>
        <AppHeader
          left
          title={strings.muaGoiDichVu}
          navigation={navigation}
          rightButtons={rightButtons}
        />
        {viewMain}
      </Container>
    );
  };
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.windowBackground },
  content: { flex: 1 },
  viewItem: {
    borderBottomWidth: 0.8,
    borderBottomColor: colors.windowBackground,
    flexDirection: "row",
    backgroundColor: "white"
  },
  viewInfo: { width: width - 160, marginTop: 15, marginRight: 10 },
  textName: { fontSize: 20, fontWeight: "bold" },
  viewCoin: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center"
  },
  viewPrice: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  viewTouch: {
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 35,
    height: 40,
    borderWidth: 0.8,
    borderColor: colors.brandPrimary,
    width: "80%",
    justifyContent: "center",
    alignItems: "center"
  },
  iconCoin: { color: colors.brandPrimary },
  viewImage: {
    resizeMode: "center",
    height: 100,
    width: 100,
    borderColor: "white",
    marginTop: 15,
    marginRight: 15,
    marginLeft: 15
  },
  viewDescription: { marginTop: 10, width: "100%" },
  textContent: { textAlign: "justify" },
  textCoin: {
    color: colors.coinColor,
    fontWeight: "bold",
    fontSize: 16
  },
  textPrice: { color: colors.brandPrimary }
});

const mapStateToProps = state => ({
  accountInfo: state.accountReducer
});

export default connect(mapStateToProps)(DanhSachGoiDichVu);
