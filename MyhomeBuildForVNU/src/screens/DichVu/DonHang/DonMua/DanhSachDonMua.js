import React from "react";
import { FlatList, View, StyleSheet, Alert } from "react-native";
import { connect } from "react-redux";

import AppComponent, {
  typeList
} from "../../../../../core/components/AppComponent";
import { API, getApiUrl } from "../../../../config/server";
import AppHeader from "../../../../../core/components/AppHeader";
import string from "../../../../config/string";
import { parseJsonFromApi } from "../../../../../core/helpers/apiHelper";
import colors from "../../../../config/colors";
import ItemDonHang from "../ItemDonHang";

class DanhSachDonMua extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      orderStatus: 0,
      title: string.lichSu,
      data: []
    };
  }

  componentWillMount = () => {
    this.getScreenData();
  };

  getScreenData = () => {
    const { accountInfo } = this.props;
    const { page, pageSize, orderStatus } = this.state;

    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.DANH_SACH_DON_MUA), {
        order_status: orderStatus,
        page,
        page_size: pageSize
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        let { data } = this.state;
        if (propsData.status === 1) {
          propsData.data = propsData.data.map(v => ({
            ...v,
            product_image: v.product_image
              ? API.HOST + JSON.parse(v.product_image)[0]
              : "",
            store_image: API.HOST + v.store_image,
            date: v.created_at.slice(0, 10)
          }));
          data =
            page === 1
              ? propsData.data
              : [...this.state.data, ...propsData.data];
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

  huyDonHang = (id, status) => {
    const { accountInfo } = this.props;

    if (accountInfo) {
      this.postToServerWithAccount(getApiUrl(API.XU_LY_DON_HANG), {
        id,
        order_status: status
      }).then(response => {
        const res = parseJsonFromApi(response);
        if (res.status === 1) {
          this.showAlertDialog(string.huyDonHangThanhCong);
          this.refreshScreen();
        } else {
          this.showAlertDialog(res.message);
        }
      });
    }
  };

  confirmHuyDonHang = (id, status) => {
    Alert.alert(string.thongBao, string.banChacChanMuonHuyDonHangNay, [
      { text: string.huy },
      {
        text: string.dongY,
        onPress: () => this.huyDonHang(id, status)
      }
    ]);
  };

  filterOrderStatus = (status, title) => {
    this.setState(
      {
        orderStatus: status,
        title
      },
      this.refreshScreen
    );
  };

  closeFilterOrder = () => {
    this.setState(
      {
        orderStatus: 0,
        title: string.lichSu
      },
      this.refreshScreen
    );
  };

  renderItem = ({ item }) => {
    return (
      <View style={styles.viewItem}>
        <ItemDonHang
          item={item}
          navigation={this.props.navigation}
          refreshScreen={this.refreshScreen}
          donMua={true}
          filter={this.state.orderStatus !== 0}
          huyDonHang={this.confirmHuyDonHang}
          filterOrderStatus={this.filterOrderStatus}
        />
      </View>
    );
  };

  render() {
    const {
      page,
      data,
      propsData,
      refreshing,
      title,
      orderStatus
    } = this.state;

    let contentView = null;
    if (page === 1) contentView = this.renderView(propsData, typeList.DONHANG);
    if (!contentView) {
      contentView = (
        <FlatList
          data={data}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={this.refreshScreen}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={this.renderFooter(propsData)}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    return (
      <View style={styles.container}>
        <AppHeader
          left
          leftIcon={orderStatus !== 0 ? "close" : ""}
          onPressBackButton={
            orderStatus !== 0 ? this.closeFilterOrder : undefined
          }
          title={title}
          navigation={this.props.navigation}
        />

        {contentView}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  listItem: {
    backgroundColor: colors.windowBackground,
    borderBottomWidth: 0.8,
    borderBottomColor: "lightgray"
  },
  dateItem: {
    color: "gray",
    fontSize: 13
  },
  viewItem: {
    backgroundColor: colors.windowBackground,
    paddingBottom: 3
  }
});

export default connect(state => ({
  accountInfo: state.accountReducer
}))(DanhSachDonMua);
