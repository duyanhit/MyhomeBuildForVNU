import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { ListItem, Text } from "native-base";
import { connect } from "react-redux";
import { uniqBy } from "lodash";
import Moment from "moment";

import AppComponent, {
  typeList
} from "../../../../../core/components/AppComponent";
import { API, getApiUrl } from "../../../../config/server";
import { parseJsonFromApi } from "../../../../../core/helpers/apiHelper";
import ItemDonHang from "../ItemDonHang";
import colors from "../../../../config/colors";
import string from "../../../../config/string";

class DanhSachDonBan extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      data: []
    };
  }

  componentWillMount = () => {
    this.getScreenData();
  };

  getScreenData = () => {
    const { accountInfo, orderStatus, storeId } = this.props;
    const { page, pageSize } = this.state;

    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.DANH_SACH_DON_BAN), {
        order_status: orderStatus,
        page,
        page_size: pageSize,
        store: storeId
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

  renderSubItem = ({ item }) => {
    return (
      <ItemDonHang
        item={item}
        navigation={this.props.navigation}
        refreshScreen={this.refreshScreen}
      />
    );
  };

  renderItem = ({ item }) => {
    let dateFilter;
    if (Moment(item.date).format("Y") === Moment().format("Y")) {
      dateFilter = Moment(item.date).format("DD [tháng] MM");
    } else {
      dateFilter = Moment(item.date).format("DD [tháng] MM [năm] YYYY");
    }

    return (
      <View>
        <ListItem itemDivider style={styles.listItem}>
          <Text style={styles.dateItem}>
            {dateFilter +
              " - " +
              item.obj.length.toString() +
              " " +
              string.donHang}
          </Text>
        </ListItem>

        <FlatList
          scrollEnable={false}
          data={item.obj}
          renderItem={this.renderSubItem}
          keyExtractor={itm => itm.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  render() {
    const { page, data, propsData, refreshing } = this.state;

    let allDate = uniqBy(data, "date").map(v => ({
      date: v.date,
      obj: []
    }));

    allDate = allDate.map(v => ({
      ...v,
      obj: data.filter(v2 => v.date === v2.date)
    }));

    let contentView = null;
    if (page === 1) contentView = this.renderView(propsData, typeList.DONHANG);
    if (!contentView) {
      contentView = (
        <FlatList
          data={allDate}
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

    return <View style={styles.container}>{contentView}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  listItem: {
    backgroundColor: colors.windowBackground
  },
  dateItem: {
    color: "gray",
    fontSize: 13
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  DanhSachDonBan
);
