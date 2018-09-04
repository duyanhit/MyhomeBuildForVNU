import React from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { Container, Icon, Text } from "native-base";
import { connect } from "react-redux";

import AppComponent from "../../../../core/components/AppComponent";
import AppHeader from "../../../../core/components/AppHeader";
import strings from "../../../config/string";
import colors from "../../../config/colors";
import { parseJsonFromApi } from "../../../../core/helpers/apiHelper";
import { API, getApiUrl } from "../../../config/server";
import { moneyFormat } from "../../../../core/helpers/numberHelper";
import { formatDateTime2 } from "../../../../core/helpers/timeHelper";
import { assets } from "../../../../assets";

class LichSuMuaGoiDichVu extends AppComponent {
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
      getApiUrl(API.LICH_SU_MUA_GOI_DICH_VU),
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

  renderItem = ({ item, index }) => {
    let status;
    let statusColor;
    if (item.status === "0") {
      status = "Giao dịch không thành công";
      statusColor = colors.TrangThai1;
    } else {
      status = "Giao dịch thành công";
      statusColor = colors.TrangThai3;
    }
    return (
      <View style={styles.viewItem}>
        <View style={styles.viewContent}>
          <View style={styles.viewStatus}>
            <Text>{formatDateTime2(item.created_at)}</Text>
            <Text style={{ color: statusColor }}>{status}</Text>
          </View>
          <View style={styles.viewMore}>
            <Image
              source={
                item.package_image
                  ? { uri: API.HOST + item.package_image }
                  : assets.logo
              }
              style={styles.viewImage}
            />
            <View style={styles.viewInfo}>
              <View style={styles.viewName}>
                <Text style={styles.textName}>{item.package_name}</Text>
              </View>
              <View style={styles.viewCoin}>
                <Text style={styles.textCoin}>
                  {item.coin} {strings.xu}
                </Text>
              </View>
              <View style={styles.viewMoney}>
                <Text style={styles.textPrice}>{moneyFormat(item.price)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  render = () => {
    const { navigation } = this.props;
    const { propsData, data, refreshing } = this.state;
    let viewMain = this.renderView(propsData);

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
          title={strings.lichSuMuaGoiDichVu}
          navigation={navigation}
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
  viewContent: {
    width: "100%",
    padding: 10
  },
  viewCoin: {
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 5
  },
  textCoin: { color: colors.coinColor, fontWeight: "bold" },
  textName: { fontSize: 16, fontWeight: "bold" },
  viewName: {
    marginTop: 5,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  viewStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  viewMoney: {
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 35,
    height: 30,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    width: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  textPrice: {
    color: colors.brandPrimary
  },
  viewMore: {
    flexDirection: "row"
  },
  viewImage: {
    height: 80,
    width: 80,
    borderWidth: 1,
    borderColor: "white",
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10
  },
  viewInfo: {}
});

const mapStateToProps = state => ({
  accountInfo: state.accountReducer
});

export default connect(mapStateToProps)(LichSuMuaGoiDichVu);
