import React from "react";
import { connect } from "react-redux";
import { Alert } from "react-native";
import { Notifications } from "expo";

import { dispatchParams } from "../../src/actions";
import { actionTypes } from "../../src/reducers";

class Notification extends React.Component {
  componentWillMount = async () => {
    this.listenerNotification = Notifications.addListener(
      this.handleNotification
    );
  };

  componentWillUnmount = () => {
    if (this.listenerNotification) this.listenerNotification.remove();
  };

  handleNotification = notification => {
    Alert.alert("Thông báo", "Có thông báo mới");
    let { countNotification } = this.props;
    countNotification += 1;
    this.props.dispatchParams(
      countNotification,
      actionTypes.NOTIFICATION_CHANGE
    );
  };

  render = () => null;
}

const mapStateToProps = state => ({
  accountInfo: state.accountReducer,
  countNotification: state.countNotificationReducer
});

export default connect(
  mapStateToProps,
  { dispatchParams }
)(Notification);
