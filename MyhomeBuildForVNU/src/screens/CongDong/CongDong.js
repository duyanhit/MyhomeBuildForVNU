import React from "react";
import { connect } from "react-redux";
import { ActionSheet, Toast } from "native-base";
import { Alert, FlatList, StyleSheet, View } from "react-native";

import AppComponent, { typeList } from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { API, getApiUrl } from "../../config/server";
import { screenNames } from "../../config/screen";
import colors from "../../../core/config/colors";
import BaiViet, { typeAction } from "./BaiViet";
import DanhSachCongDong from "./DanhSachCongDong";

class CongDong extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      data: null,
      page: 1,
      congDong: {
        name: string.tatCaCongDong,
        image: undefined
      }
    };
    const { accountInfo } = this.props;
    const { home } = accountInfo || {};
    this.home = _.uniqBy(home || [], "apartment_id");
  }

  componentDidMount = () => {
    if (this.home && this.home.length) {
      setTimeout(() => this.getScreenData(), 500);
    }
  };

  getScreenData = async () => {
    const { page, pageSize } = this.state;
    let { data } = this.state;
    this.getFromServerWithAccount(getApiUrl(API.DANH_SACH_BAI_VIET), {
      page,
      page_size: pageSize,
      apartment: this.apartment_id || ""
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      const temp =
        propsData.data &&
        propsData.data.map(v => ({
          ...v,
          image: v.image
            ? JSON.parse(v.image).map(v1 => `${API.HOST}${v1}`)
            : []
        }));
      if (propsData.status === 1) {
        data = page === 1 ? temp : data.concat(temp);
      } else if (propsData.status !== 0 && !propsData.networkError) {
        this.showAlertDialog(propsData.message);
      }
      this.setState(
        {
          isLoading: false,
          refreshing: false,
          data,
          propsData
        },
        () => {
          this.isOnEndReached = false;
        }
      );
    });
  };

  xoaBaiViet = (id, self) => {
    self.setVisible(false);
    this.postToServerWithAccount(getApiUrl(API.XOA_BAI_VIET), {
      id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      let msg = propsData.message;
      let textBtn = string.thuLai;
      if (propsData.status === 1) {
        msg = string.baiVietDaDuocXoa;
        textBtn = "";
      } else {
        self.setVisible(true);
        this.showAlertDialog(propsData.message);
      }
      Toast.show({
        text: msg,
        buttonText: textBtn,
        onClose: action => {
          if (textBtn === string.thuLai && action === "user") {
            this.xoaBaiViet(id, self);
          }
        },
        duration: 3000
      });
    });
  };

  onAction = (index, type, data, self) => {
    if (type === typeAction.MORE) {
      let { id, name } = data;
      id = id || "";
      name = name || "";
      ActionSheet.show(
        {
          options: [string.sua, string.xoa, string.dong],
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
          title: `Bài viết của ${name}`
        },
        i => {
          if (i === 0) {
            this.navigateToScreen(screenNames.SuaBaiViet, {
              onGoBack: text => {
                const temp = { ...data, content: text };
                self.setItem(temp);
              },
              id
            })();
          } else if (i === 1) {
            Alert.alert(string.thongBao, string.banCoChacMuonXoaBaiVietNay, [
              { text: string.huy },
              {
                text: string.xoa,
                onPress: this.xoaBaiViet.bind(this, id, self),
                style: "destructive"
              }
            ]);
          }
        }
      );
    } else if (type === typeAction.VIEW) {
      const { id } = data;
      this.navigateToScreen(screenNames.ChiTietBaiViet, {
        item: data,
        id,
        onGoBack: this.goBack.bind(this, self)
      })();
    } else if (type === typeAction.LIKE) {
      // console.log("vao like");
    } else if (type === typeAction.DISLIKE) {
      // console.log("vao dislike");
    } else if (type === typeAction.COMMENT) {
      const { id } = data;
      this.navigateToScreen(screenNames.ChiTietBaiViet, {
        item: data,
        id,
        onGoBack: this.goBack.bind(this, self)
      })();
    } else if (type === typeAction.VIEW_IMAGE) {
      // console.log("vao viewImage");
    }
  };

  goBack = (self, data, type) => {
    if (type === "delete") self.setVisible(true);
    else self.setItem(data);
  };

  returnData = id => {
    this.apartment_id = id;
    const arr = this.home.filter(v => v.apartment_id === id);
    if (arr && arr.length) {
      this.setState(
        {
          congDong: {
            name: `Cộng đồng ${arr[0].apartment_name}`,
            image: arr[0].apartment_image
          }
        },
        this.refreshScreen
      );
    } else {
      this.setState(
        {
          congDong: {
            name: string.tatCaCongDong,
            image: undefined
          }
        },
        this.refreshScreen
      );
    }
  };

  renderItem = ({ item, index }) => {
    if (item.type && item.type === "header") {
      return (
        <DanhSachCongDong
          navigation={this.props.navigation}
          onSelect={this.returnData}
          refreshScreen={this.refreshScreen}
        />
      );
    }
    return (
      <BaiViet
        isInDetail={false}
        item={item}
        onAction={this.onAction.bind(this, index)}
      />
    );
  };

  render() {
    const { data, propsData, congDong } = this.state;
    const { accountInfo } = this.props;
    let viewMain = null;
    if (!accountInfo.home || !accountInfo.home.length) {
      viewMain = this.noValidHome();
    } else {
      viewMain = this.renderView(propsData, typeList.CONGDONG);
      if (!viewMain && data) {
        viewMain = (
          <View style={{ flex: 1 }}>
            <FlatList
              data={[{ type: "header" }, ...data]}
              keyExtractor={(v, i) => i.toString()}
              renderItem={this.renderItem}
              refreshing={this.state.refreshing}
              onRefresh={this.refreshScreen}
              onEndReached={() => {
                if (!this.isOnEndReached) {
                  this.isOnEndReached = true;
                  this.onEndReached();
                }
              }}
              onEndReachedThreshold={0.3}
              ListFooterComponent={this.renderFooter(propsData)}
              item
            />
          </View>
        );
      } else {
        viewMain = (
          <View style={{ flex: 1 }}>
            <FlatList
              data={[{ type: "header" }]}
              keyExtractor={(v, i) => i.toString()}
              renderItem={this.renderItem}
              refreshing={this.state.refreshing}
              onRefresh={this.refreshScreen}
              item
            />
            {viewMain}
          </View>
        );
      }
    }

    const rightButtons = [
      accountInfo.home &&
        accountInfo.home.length > 0 && {
          icon: "ios-people-outline",
          iconType: "Ionicons",
          onPress: this.navigateToScreen(screenNames.DanhSachThanhVien, {})
        }
    ];

    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <AppHeader
          left
          title={string.congDong}
          navigation={this.props.navigation}
          onPressBackButton={() =>
            this.props.navigation.navigate(screenNames.Main)
          }
          rightButtons={rightButtons}
        />
        {viewMain}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imageAvatar: { width: 40, height: 40 },
  buttonView: {
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  textView: {
    marginTop: 50
  },
  fabView: {
    backgroundColor: colors.brandPrimary
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(CongDong);
