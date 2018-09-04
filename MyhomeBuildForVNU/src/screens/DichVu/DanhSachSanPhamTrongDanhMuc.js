import React from "react";
import { connect } from "react-redux";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActionSheet, Container, Icon, Text } from "native-base";

import AppComponent, { typeList } from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import string from "../../config/string";
import ItemSanPham from "./ItemSanPham";
import metrics from "../../../core/config/metrics";
import colors from "../../../core/config/colors";

const numColumns = 2;
const width = metrics.DEVICE_WIDTH / numColumns;

class DanhSachSanPhamTrongDanhMuc extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      filterId: 0,
      filterText: string.moiNhat,
      data: []
    };
  }

  componentWillMount = () => {
    this.getScreenData();
  };

  getScreenData = () => {
    const {
      id,
      url,
      title,
      location,
      type,
      dataApi
    } = this.props.navigation.state.params;
    const { page, pageSize, filterId } = this.state;
    let api = "";
    let params = {
      product_order_by: filterId,
      page,
      page_size: pageSize
    };
    if (type === "SAN_PHAM_TRONG_DANH_MUC_CUA_GIAN_HANG") {
      params = { ...params, ...dataApi };
      api = url;
    } else if (id) {
      api = API.DANH_SACH_SAN_PHAM_THEO_DANH_MUC;
      params = {
        ...params,
        id
      };
    } else if (url) {
      if (title === string.sanPhamGanToi) {
        if (location) {
          params = {
            ...params,
            latitude: location.latitude,
            longitude: location.longitude
          };
        }
      }
      api = url;
    }

    this.getFromServerWithAccount(getApiUrl(api), params).then(response => {
      const propsData = parseJsonFromApi(response);
      let { data } = this.state;
      if (propsData.status === 1) {
        propsData.data = propsData.data.map(v => ({
          ...v,
          image: v.image ? API.HOST + JSON.parse(v.image)[0] : null
        }));
        data =
          page === 1 ? propsData.data : [...this.state.data, ...propsData.data];
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
  };

  renderItem = ({ item, index }) => {
    let marginLeft = 0;
    let marginRight = 0;
    if (index % 2 === 0) {
      marginLeft = 8;
      marginRight = 4;
    } else {
      marginLeft = 4;
      marginRight = 8;
    }

    if (item.empty) {
      return (
        <View
          style={[
            styles.item,
            { backgroundColor: "transparent", marginLeft, marginRight }
          ]}
        />
      );
    }

    return (
      <View style={[styles.item, { marginLeft, marginRight }]}>
        <ItemSanPham item={item} navigation={this.props.navigation} />
      </View>
    );
  };

  sortBy = index => {
    let { filterId, filterText } = this.state;
    if (index !== 4) {
      switch (index) {
        case 0:
          filterId = 0;
          filterText = string.moiNhat;
          break;
        case 1:
          filterId = 2;
          filterText = string.duocDanhGiaCao;
          break;
        case 2:
          filterId = 3;
          filterText = string.giaTangDan;
          break;
        case 3:
          filterId = 4;
          filterText = string.giaGiamDan;
          break;
        default:
          break;
      }

      this.setState(
        {
          filterId,
          filterText
        },
        this.refreshScreen
      );
    }
  };

  render() {
    const { title, id } = this.props.navigation.state.params;
    const { data, page, propsData, refreshing, filterText } = this.state;
    let contentView = null;
    if (page === 1) contentView = this.renderView(propsData, typeList.SANPHAM);

    const filterView = (
      <View style={styles.viewFilter}>
        <TouchableOpacity
          onPress={() => {
            ActionSheet.show(
              {
                options: [
                  string.moiNhat,
                  string.duocDanhGiaCao,
                  string.giaTangDan,
                  string.giaGiamDan,
                  string.dong
                ],
                cancelButtonIndex: 4,
                title: string.sapXepTheo
              },
              index => {
                this.sortBy(index);
              }
            );
          }}
        >
          <View style={styles.viewFilter2}>
            <Text style={styles.textFilter}>{filterText}</Text>
            <Icon name="sort" type="MaterialIcons" style={styles.iconFilter} />
          </View>
        </TouchableOpacity>
      </View>
    );

    if (!contentView) {
      contentView = (
        <FlatList
          data={data}
          numColumns={numColumns}
          renderItem={this.renderItem}
          keyExtractor={item => item.id.toString()}
          refreshing={refreshing}
          onRefresh={this.refreshScreen}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={id ? filterView : <View style={{ height: 8 }} />}
          ListFooterComponent={this.renderFooter(propsData)}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader left title={title} navigation={this.props.navigation} />
        {contentView}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    width: width - 12,
    marginBottom: 8,
    backgroundColor: "#fff"
  },
  viewFilter: {
    alignItems: "flex-end",
    marginHorizontal: 8
  },
  viewFilter2: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 10
  },
  textFilter: {
    color: "gray",
    fontSize: 14,
    marginRight: 5
  },
  iconFilter: {
    color: "gray",
    fontSize: 15
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(DanhSachSanPhamTrongDanhMuc);
