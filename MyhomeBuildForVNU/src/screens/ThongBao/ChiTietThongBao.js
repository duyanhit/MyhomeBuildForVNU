import React from "react";
import { View, Text, Container } from "native-base";
import { Alert, BackHandler, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";

import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { formatDateNow } from "../../../core/helpers/timeHelper";
import AppWebView from "../../../core/components/AppWebView";
import InAppProgress from "../../component/InAppProgress";
import colors from "../../config/colors";

class ChiTietThongBao extends AppComponent {
  componentWillMount = () => {
    this.getScreenData();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  handleBackPress = () => {
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack();
    return true;
  };

  getScreenData = () => {
    const { accountInfo } = this.props;
    const { id } = this.props.navigation.state.params;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.CHI_TIET_THONG_BAO), {
        id
      }).then(response => {
        this.setState({
          isLoading: false,
          propsData: parseJsonFromApi(response)
        });
      });
    }
  };

  /**
   * xóa thông báo
   * @param id
   */
  xoaThongBao = id => {
    const { accountInfo } = this.props;
    if (accountInfo) {
      this.myProgress.openDialog();
      this.postToServerWithAccount(getApiUrl(API.XOA_THONG_BAO), {
        id
      }).then(response => {
        if (response.status === 1) {
          this.showAlertDialog(string.xoaThongBaoThanhCong, () => {
            this.myProgress.closeDialog();
            this.props.navigation.state.params.myCallback();
            this.handleBackPress();
          });
        }
      });
    }
  };

  /**
   * Xác nhận xóa thông báo
   * @param id
   */
  showConfirmDialog = id => {
    if (id) {
      Alert.alert(
        string.canhBao,
        string.banCoMuonXoaThongBao,
        [
          { text: string.huy },
          {
            text: string.dongY,
            onPress: () => this.xoaThongBao(id)
          }
        ],
        { cancelable: false }
      );
    }
  };

  /**
   * xem ảnh
   * @param image
   */
  callbackWeb = image => {
    if (image !== undefined && image !== null && image !== "") {
      this.setState({
        showImageView: true,
        srcImageView: image
      });
    }
  };

  render() {
    const { propsData } = this.state;
    let itemId;
    let contentView = this.renderView(propsData);
    if (!contentView) {
      const { data } = propsData;
      itemId = data.id;
      contentView = (
        <View style={styles.container}>
          <Text style={{ fontWeight: "bold" }}>{data.name}</Text>
          <View style={styles.viewHeader}>
            <View style={styles.viewLeft}>
              <Text note>{string.tu}:</Text>
              <Text note>{string.toi}:</Text>
              <Text note>{string.ngay}:</Text>
            </View>
            <View>
              <Text note>{data.from_name}</Text>
              <Text note>{data.to_name}</Text>
              <Text note>{formatDateNow(data.sent_at, "vi")}</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <AppWebView
              source={{ uri: data.detail }}
              injectedJavaScriptCustom={
                "$(document).on('click', '.image-show', function(e){window.postMessage($(this).prop('src'), '*');});"
              }
              onMessageCustom={e => this.callbackWeb(e)}
            />
          </ScrollView>
        </View>
      );
    }

    const rightButtons = [
      {
        icon: "delete",
        iconType: "MaterialIcons",
        onPress: () => this.showConfirmDialog(itemId)
      }
    ];

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          onClose={this.handleBackPress}
          title={string.chiTietThongBao}
          navigation={this.props.navigation}
          rightButtons={rightButtons}
        />
        {contentView}
        <InAppProgress self={self => (this.myProgress = self)} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingTop: 15
  },
  viewHeader: {
    flexDirection: "row",
    marginTop: 15
  },
  viewLeft: {
    alignItems: "flex-end",
    width: 40,
    marginRight: 10
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  ChiTietThongBao
);
