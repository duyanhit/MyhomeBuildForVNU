import React from "react";
import { Modal, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import { Notifications } from "expo";

import { dispatchParams } from "../src/actions";
import { actionTypes } from "../src/reducers";
import AppComponent, { notifyType } from "../core/components/AppComponent";
import { API, getApiUrl } from "./config/server";
import { parseJsonFromApi } from "../core/helpers/apiHelper";
import string from "./config/string";
import { screenNames } from "./config/screen";

class Notification extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      visibleModal: false,
      notification: undefined
    };
  }

  componentWillMount = async () => {
    this.listenerNotification = Notifications.addListener(
      this.handleNotification
    );
  };

  componentWillUnmount = () => {
    if (this.listenerNotification) this.listenerNotification.remove();
  };

  handleNotification = notification => {
    const { accountInfo, dispatchParams } = this.props;
    let { countNotification } = this.props;

    if (accountInfo) {
      if (
        notification.data.notify_type &&
        notification.data.notify_type.toString() ===
          notifyType.NOTIFICATION_HOME
      ) {
        this.getFromServerWithAccount(
          getApiUrl(API.LAY_THONG_TIN_TAI_KHOAN)
        ).then(response => {
          const propsData = parseJsonFromApi(response);
          if (propsData.status === 1) {
            dispatchParams(
              { ...propsData.data, device_token: accountInfo.device_token },
              actionTypes.APP_USER_INFO
            );
          } else {
            this.logThis(propsData.message);
          }
        });
      }

      this.setState({ notification });
      if (notification.origin === "selected") {
        this.props.router._navigation.navigate(
          screenNames.DanhSachNotification
        );
      } else {
        this.openModal();
      }

      countNotification += 1;
      dispatchParams(countNotification, actionTypes.NOTIFICATION_CHANGE);
    }
  };

  openModal = () => {
    this.setState({ visibleModal: true });
  };

  closeModal = () => {
    this.setState({ visibleModal: false });
  };

  render() {
    const { visibleModal, notification } = this.state;

    if (notification) {
      let title;
      switch (notification.data.notify_type.toString()) {
        case notifyType.NOTIFICATION_SALE:
          title = string.donBan;
          break;
        case notifyType.NOTIFICATION_BUY:
          title = string.donMua;
          break;
        case notifyType.NOTIFICATION_NOTIFY:
          title = string.thongBao;
          break;
        case notifyType.NOTIFICATION_SURVEY:
          title = string.khaoSat;
          break;
        case notifyType.NOTIFICATION_MAIL:
          title = string.gopY;
          break;
        case notifyType.NOTIFICATION_HOME:
          title = string.canHo;
          break;
        default:
          title = string.thongBao;
          break;
      }

      return (
        <Modal
          transparent
          animationType="fade"
          visible={visibleModal}
          onRequestClose={this.closeModal}
        >
          <View style={styles.viewModal}>
            <View style={styles.viewContentModal}>
              <Text style={styles.title}>{title}</Text>

              <Text numberOfLines={1} style={styles.titleNotification}>
                {notification.data.title}
              </Text>

              {notification.data.content && (
                <Text numberOfLines={2}>{notification.data.content}</Text>
              )}

              <View style={styles.viewButton}>
                <TouchableOpacity
                  onPress={this.closeModal}
                  style={styles.button}
                >
                  <Text style={styles.textButton}>{string.dongY}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  viewModal: {
    backgroundColor: "#0004",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  viewContentModal: {
    width: 300,
    borderRadius: 5,
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: "center"
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5
  },
  titleNotification: {
    marginBottom: 5
  },
  viewButton: {
    marginTop: 10,
    alignItems: "flex-end"
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  textButton: {
    color: "#2474cd"
  }
});

const mapStateToProps = state => ({
  accountInfo: state.accountReducer,
  countNotification: state.countNotificationReducer
});

export default connect(
  mapStateToProps,
  { dispatchParams }
)(Notification);
