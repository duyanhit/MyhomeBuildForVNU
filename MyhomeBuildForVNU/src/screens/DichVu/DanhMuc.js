import React from "react";
import { connect } from "react-redux";
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet
} from "react-native";
import { Text, Spinner } from "native-base";

import AppComponent from "../../../core/components/AppComponent";
import { screenNames } from "../../config/screen";
import string from "../../config/string";
import { assets } from "../../../assets";
import colors from "../../../core/config/colors";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";

class DanhMuc extends AppComponent {
  state = { ...this.state };

  componentWillMount = () => {
    this.getScreenData();
  };

  getScreenData = () => {
    this.getFromServer(getApiUrl(API.DS_DANH_MUC), {}).then(response => {
      const propsData = parseJsonFromApi(response);
      this.setState({
        isLoading: false,
        refreshing: false,
        data: propsData.data,
        propsData
      });
    });
  };

  render() {
    const { data, propsData, isLoading } = this.state;
    let viewMain = null;
    if (isLoading) {
      viewMain = <Spinner />;
    } else {
      viewMain = this.renderView(propsData);
      if (!viewMain && data) {
        viewMain = (
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={data}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  onPress={this.navigateToScreen(
                    screenNames.DanhSachSanPhamTrongDanhMuc,
                    {
                      id: item.id,
                      title: item.name
                    }
                  )}
                >
                  <View style={{ width: 70 }}>
                    <View style={styles.viewImage}>
                      <Image
                        style={styles.imageDefault}
                        source={assets.sanPhamdefault}
                      />
                      <Image
                        style={styles.imageCategory}
                        source={{ uri: `${API.HOST}${item.image}` }}
                      />
                    </View>
                    <Text style={styles.category}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(v, i) => i.toString()}
          />
        );
      }
    }
    return <View style={styles.container}>{viewMain}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "#fff"
  },
  viewImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "white"
  },
  imageDefault: {
    width: 42,
    height: 42,
    borderRadius: 21,
    position: "absolute"
  },
  imageCategory: {
    width: 42,
    height: 42,
    borderRadius: 21
  },
  category: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center"
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(DanhMuc);
