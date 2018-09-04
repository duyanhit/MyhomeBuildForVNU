import React from "react";
import { connect } from "react-redux";
import {
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet
} from "react-native";
import { Spinner, Text } from "native-base";

import AppComponent from "../../../core/components/AppComponent";
import { screenNames } from "../../config/screen";
import colors from "../../../core/config/colors";
import metrics from "../../../core/config/metrics";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import ItemSanPham from "../DichVu/ItemSanPham";
import string from "../../config/string";

class ListProduct extends AppComponent {
  state = { ...this.state };

  componentWillMount = () => {
    this.getScreenData();
  };

  getScreenData = () => {
    let { data: dataProps, url } = this.props;
    const { page, pageSize } = this.state;
    dataProps = dataProps || {};
    url = url || "";
    this.getFromServerWithAccount(getApiUrl(url), {
      page,
      page_size: pageSize,
      ...dataProps
    }).then(response => {
      let propsData = parseJsonFromApi(response);
      let { data } = this.state;
      if (propsData.status === 1) {
        propsData.data = propsData.data.map(v => ({
          ...v,
          image: v.image ? API.HOST + JSON.parse(v.image)[0] : null,
          images: JSON.parse(v.image).map(v1 => `${API.HOST}${v1}`)
        }));
        data = page === 1 ? propsData.data : [...data, ...propsData.data];
      } else if (propsData.status === 0) {
        propsData = { ...propsData, message: string.khongCoSanPham };
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

  khoaSanPham = (item, index) => {
    this.setState({ dialogVisible: true });
    const { data } = this.state;
    this.postToServerWithAccount(getApiUrl(API.KHOA_SAN_PHAM), {
      id: item.id,
      publish: item.valid === "0" ? "1" : "0"
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        data[index].valid = item.valid === "0" ? "1" : "0";
        this.setState({
          dialogVisible: false,
          data: [...data]
        });
      } else {
        Alert.alert(string.thongBao, propsData.message);
        this.setState({ dialogVisible: false });
      }
    });
  };

  renderItemProduct = ({ item, index }) => {
    const {
      navigation,
      horizontal,
      isEdit,
      data,
      dataEdit,
      GHlocked
    } = this.props;
    let styleItem = {};
    let widthSize;

    if (horizontal) {
      styleItem = { marginLeft: index === 0 ? 5 : 0, marginRight: 5 };
      widthSize = 2.5;
    } else {
      styleItem = { marginLeft: 8, marginBottom: 8 };
      widthSize = 2;
    }
    return (
      <View
        style={{
          width: metrics.DEVICE_WIDTH / widthSize - 12,
          ...styleItem
        }}
      >
        <ItemSanPham
          onPress={
            isEdit
              ? this.navigateToScreen(screenNames.TaoSanPham, {
                  item,
                  id: data.id,
                  callBack: dataEdit.callBack,
                  active: GHlocked
                })
              : null
          }
          onLongPress={
            isEdit
              ? this.props.khoaSanPham.bind(this, item, index, () => {
                  const { data: dataList } = this.state;
                  dataList[index].valid = item.valid === "0" ? "1" : "0";
                  this.setState({ data: [...dataList] });
                })
              : undefined
          }
          item={item}
          index={index}
          navigation={navigation}
          horizontal={horizontal}
        />
        {!horizontal &&
          !!isEdit &&
          item.valid === "0" && (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { alignItems: "center", justifyContent: "center" }
              ]}
            >
              <TouchableOpacity
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: "#0006" }
                ]}
                //onPress={this.props.khoaSanPham.bind(this, item, index)}
                onPress={
                  isEdit
                    ? this.navigateToScreen(screenNames.TaoSanPham, {
                        item,
                        id: data.id,
                        callBack: dataEdit.callBack,
                        active: GHlocked
                      })
                    : null
                }
              />
              <TouchableOpacity
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#ed6b00",
                  justifyContent: "center",
                  alignItems: "center"
                }}
                onPress={this.props.khoaSanPham.bind(this, item, index, () => {
                  const { data: dataList } = this.state;
                  dataList[index].valid = item.valid === "0" ? "1" : "0";
                  this.setState({ data: [...dataList] });
                })}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  {string.moBan}
                </Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
    );
  };

  render() {
    const { data, propsData, isLoading } = this.state;
    const { horizontal } = this.props;
    let { propsList } = this.props;
    propsList = propsList || {};
    if (isLoading) return <Spinner />;
    let viewMain = this.renderView(propsData);
    if (!horizontal || (!viewMain && data)) {
      viewMain = (
        <FlatList
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "#fff" }}
          numColumns={horizontal ? undefined : 2}
          data={data || []}
          horizontal={horizontal}
          renderItem={this.renderItemProduct}
          keyExtractor={(v, i) => i.toString()}
          refreshing={horizontal ? undefined : this.state.refreshing}
          onRefresh={horizontal ? undefined : this.refreshScreen}
          onEndReached={horizontal ? undefined : this.onEndReached}
          onEndReachedThreshold={horizontal ? undefined : 0.3}
          ListFooterComponent={
            horizontal ? undefined : this.renderFooter(propsData, true)
          }
          {...propsList}
        />
      );
    }
    return viewMain;
    //return <View style={{ flex: 1 }}>{viewMain}</View>;
  }
}

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(ListProduct);
