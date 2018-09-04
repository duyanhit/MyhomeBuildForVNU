import React from "react";
import { View, StyleSheet, FlatList, Platform } from "react-native";
import { connect } from "react-redux";
import { Body, ListItem, Text, Thumbnail } from "native-base";

import AppComponent, {
  notifyType,
  typeList
} from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import colors from "../../config/colors";
import { formatDateTime2 } from "../../../core/helpers/timeHelper";
import { assets } from "../../../assets";
import { screenNames } from "../../config/screen";
import string from "../../config/string";

class DanhSachNotification extends AppComponent {
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
    const { accountInfo } = this.props;
    const { page, pageSize } = this.state;
    let { data } = this.state;

    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.DANH_SACH_NOTIFICATION), {
        page,
        page_size: pageSize
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          data =
            page === 1
              ? propsData.data
              : [...this.state.data, ...propsData.data];
        } else if (propsData.status !== 0 && !propsData.networkError) {
          this.showAlertDialog(propsData.message);
        }

        this.setState({
          refreshing: false,
          isLoading: false,
          propsData,
          data
        });
      });
    }
  };

  readNotification = (item, screen) => {
    const { accountInfo } = this.props;
    if (accountInfo && item.is_read === "0") {
      this.postToServerWithAccount(getApiUrl(API.READ_NOTIFICATION), {
        id: item.id
      }).then(response => {
        const res = parseJsonFromApi(response);
        if (res.status === 1) {
          this.refreshScreen();
        } else {
          this.showAlertDialog(res.message);
        }
      });
    }
    this.navigateToScreen(screen, {
      id: item.notify_id,
      donMua: item.notify_type.toString() === "2",
      initPage: 1,
      onGoBack: this.navigateToScreen(screenNames.DanhSachNotification),
      myCallback: () => {
        this.navigateToScreen(screenNames.DanhSachNotification)();
        this.refreshScreen();
      }
    })();
  };

  renderItem = ({ item }) => {
    let thumbnail, screen;
    switch (item.notify_type.toString()) {
      case notifyType.NOTIFICATION_SALE:
        thumbnail = assets.icNotificationDonBan;
        screen = screenNames.ChiTietDonHang;
        break;
      case notifyType.NOTIFICATION_BUY:
        thumbnail = assets.icNotificationDonMua;
        screen = screenNames.ChiTietDonHang;
        break;
      case notifyType.NOTIFICATION_NOTIFY:
        thumbnail = assets.icNotificationThongBao;
        screen = screenNames.ChiTietThongBao;
        break;
      case notifyType.NOTIFICATION_SURVEY:
        thumbnail = assets.icNotificationKhaoSat;
        screen = screenNames.ChiTietKhaoSat;
        break;
      case notifyType.NOTIFICATION_MAIL:
        thumbnail = assets.icNotificationGopY;
        screen = screenNames.ChiTietGopY;
        break;
      case notifyType.NOTIFICATION_HOME:
        thumbnail = assets.icNotificationCanHo;
        screen = screenNames.ThongTinTaiKhoan;
        break;
    }

    return (
      <ListItem
        avatar
        button
        style={[
          styles.listItem,
          {
            backgroundColor:
              item.is_read === "0" ? "rgba(237, 107, 0, 0.05)" : "#fff"
          }
        ]}
        onPress={() => this.readNotification(item, screen)}
      >
        <Thumbnail square small source={thumbnail} />
        <Body style={styles.body}>
          <Text numberOfLines={1} style={styles.textTitle}>
            {item.title}
          </Text>
          {item.content && (
            <Text numberOfLines={2} style={styles.textContent}>
              {item.content}
            </Text>
          )}
          <Text note style={styles.textTime}>
            {formatDateTime2(item.created_at)}
          </Text>
        </Body>
      </ListItem>
    );
  };

  render() {
    const { propsData, data, refreshing, page } = this.state;

    let contentView = null;
    if (page === 1) contentView = this.renderView(propsData, typeList.THONGBAO);

    if (!contentView) {
      contentView = (
        <FlatList
          data={data}
          renderItem={this.renderItem}
          keyExtractor={item => item.id.toString()}
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
          title={string.thongBao}
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
    marginLeft: 0,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.windowBackground
  },
  body: {
    borderBottomWidth: 0
  },
  textTitle: {
    fontSize: 15
  },
  textContent: {
    marginVertical: Platform.OS === "ios" ? 2 : undefined,
    color: colors.textHeader
  },
  textTime: {
    fontSize: 11
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  DanhSachNotification
);
