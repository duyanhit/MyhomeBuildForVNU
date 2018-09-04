import React from "react";
import { connect } from "react-redux";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Platform
} from "react-native";
import {
  ActionSheet,
  Container,
  Text,
  Header,
  Icon as IconNB,
  Left,
  Button
} from "native-base";

import AppComponent, { typeList } from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import string from "../../config/string";
import ItemSanPham from "./ItemSanPham";
import metrics from "../../../core/config/metrics";
import colors from "../../../core/config/colors";
import Icon from "../../component/Icon";
import { screenNames } from "../../config/screen";

const numColumns = 2;
const width = metrics.DEVICE_WIDTH / numColumns;

class TimKiemSanPham extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      filterId: 0,
      filterText: string.moiNhat,
      data: null,
      arrCategory: this.props.navigation.state.params.arrCategory,
      selectCategory: null,
      propsData: { status: 0 }
    };
  }

  componentWillMount = () => {
    if (!this.props.navigation.state.params.store) {
      this.getAllCategory();
    } else this.setState({ isLoading: false });
    // this.getScreenData();
    // console.log(this.props.navigation.state);
  };

  getAllCategory = () => {
    this.getFromServer(getApiUrl(API.DS_DANH_MUC), {}).then(response => {
      const propsData = parseJsonFromApi(response);
      this.setState({
        isLoading: false,
        arrCategory: propsData.data,
        propsData
      });
      if (propsData.status !== 1) {
        this.showAlertDialog(propsData.message);
        this.props.navigation.goBack();
      }
    });
  };

  getScreenData = () => {
    let { store } = this.props.navigation.state.params;
    store = store || "";
    const { page, pageSize, filterId, selectCategory } = this.state;
    this.getFromServerWithAccount(getApiUrl(API.TIM_KIEM_SAN_PHAM), {
      keyword: this.textKeyword || "",
      store,
      product_order_by: filterId,
      id: selectCategory ? selectCategory.id : "",
      page,
      page_size: pageSize
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      let { data } = this.state;
      if (propsData.status === 1) {
        propsData.data = propsData.data.map(v => ({
          ...v,
          image: v.image ? API.HOST + JSON.parse(v.image)[0] : null
        }));
        data =
          page === 1 ? propsData.data : [...this.state.data, ...propsData.data];
      } else {
        data = page === 1 ? [] : data;
      }
      this.setState({
        isLoading: false,
        refreshing: false,
        data,
        propsData
      });
    });
  };

  timKiem = () => {
    this.textKeyword = this.textInputKeyword._lastNativeText;
    this.textInputKeyword.blur();
    this.textKeyword = this.textKeyword ? this.textKeyword.trim() : "";
    if (!this.textKeyword) {
      this.showAlertDialog(string.banChuaNhapTuKhoaTimKiem);
      return;
    }
    if (this.textKeyword) {
      this.setState({ selectCategory: null, filterId: 0 }, () =>
        this.refreshScreen()
      );
    }
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
      this.setState({ filterId, filterText }, this.refreshScreen);
    }
  };

  sortCategory = index => {
    const { arrCategory } = this.state;
    if (index === 0) {
      this.setState({ selectCategory: null }, this.refreshScreen);
    } else if (index - 1 < arrCategory.length) {
      this.setState(
        { selectCategory: arrCategory[index - 1] },
        this.refreshScreen
      );
    }
  };

  render() {
    const { title, id } = this.props.navigation.state.params;
    const {
      data,
      page,
      propsData,
      refreshing,
      filterText,
      arrCategory,
      selectCategory,
      filterId
    } = this.state;
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
              this.sortBy
            );
          }}
        >
          <View style={styles.viewFilter2}>
            <Text style={styles.textFilter}>{filterText}</Text>
            <Icon
              name="sort"
              iconType="MaterialIcons"
              style={styles.iconFilter}
            />
          </View>
        </TouchableOpacity>
        {!!arrCategory &&
          !!arrCategory.length && (
            <TouchableOpacity
              onPress={() => {
                ActionSheet.show(
                  {
                    options: [
                      "Tất cả",
                      ...arrCategory.map(v => v.name),
                      "Đóng"
                    ],
                    cancelButtonIndex: arrCategory.length + 1,
                    title: string.danhMuc
                  },
                  this.sortCategory
                );
              }}
            >
              <View style={styles.viewFilter2}>
                <Text style={styles.textFilter}>
                  {selectCategory ? selectCategory.name : "Tất cả"}
                </Text>
                <Icon
                  name="sort"
                  iconType="MaterialIcons"
                  style={styles.iconFilter}
                />
              </View>
            </TouchableOpacity>
          )}
      </View>
    );

    // if (!contentView) {
    contentView = (
      <FlatList
        data={data || []}
        numColumns={numColumns}
        renderItem={this.renderItem}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={this.refreshScreen}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          (filterId !== 0 || !!selectCategory || (!!data && !!data.length)) &&
          filterView
        }
        ListFooterComponent={page !== 1 && this.renderFooter(propsData)}
        ListEmptyComponent={this.viewNoData(
          data ? string.khongCoSanPham : string.timKiemSanPham,
          true
        )}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    );
    // }

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <Header
          style={{
            alignItems: "center",
            backgroundColor: "white",
            borderBottomWidth: 0.8,
            borderBottomColor: colors.windowBackground
          }}
        >
          <Left
            style={Platform.OS === "ios" ? { maxWidth: 30 } : { maxWidth: 40 }}
          >
            <Button
              transparent
              onPress={() => this.props.navigation.goBack()}
              androidRippleColor="#ffffff"
            >
              <IconNB style={{ color: colors.textHeader }} name="arrow-back" />
            </Button>
          </Left>
          <View
            style={{
              backgroundColor: colors.windowBackground,
              flex: 1,
              marginVertical: 5,
              marginRight: 10,
              padding: 5,
              alignItems: "center",
              borderRadius: 5,
              flexDirection: "row"
            }}
          >
            <Icon name="search" iconType="EvilIcons" style={{ fontSize: 23 }} />
            <TextInput
              autoFocus
              ref={ref => (this.textInputKeyword = ref)}
              underlineColorAndroid="#0000"
              placeholder="Tìm kiếm sản phẩm"
              style={{ flex: 1, marginLeft: 5, fontSize: 14 }}
              onSubmitEditing={this.timKiem}
              returnKeyLabel="Tìm kiếm"
              returnKeyType="search"
            />
          </View>
        </Header>
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
    flexDirection: "row",
    justifyContent: "flex-end",
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
)(TimKiemSanPham);
