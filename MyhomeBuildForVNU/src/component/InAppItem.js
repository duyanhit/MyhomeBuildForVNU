import React from "react";
import { TouchableWithoutFeedback, StyleSheet } from "react-native";
import Swipeout from "react-native-swipeout";
import { Body, Icon, Left, ListItem, Right, Text, View } from "native-base";

import AppComponent from "../../core/components/AppComponent";
import string from "../config/string";
import colors from "../../core/config/colors";
import config from "../../core/config/index";
import { formatDate2, formatDateNow } from "../../core/helpers/timeHelper";

class InAppItem extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item,
      number: 0,
      isRead: props.item.is_read
    };
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ item: nextProps.item, isRead: nextProps.item.is_read });
  };

  changeNumber = value => {
    this.setState({ number: value });
  };

  onClick = cb => {
    let { item } = this.state;
    item = { ...item, is_check: !item.is_check };
    this.setState({ item });
    if (!cb) this.props.onSelect(item, this.props.index, this);
  };

  changeRead = () => {
    this.setState({ isRead: "1" });
  };

  render() {
    const {
      index,
      showConfirmDialog,
      onPress,
      icon,
      sent,
      api,
      gopy,
      status,
      time,
      message
    } = this.props;
    const { item, number, isRead } = this.state;

    let mStatus = string.choXuLy;
    let color = "#f8941d";
    switch (item.status) {
      case "1":
        mStatus = string.dangXuLy;
        color = "#1b75bd";
        break;
      case "2":
        mStatus = string.daXuLy;
        color = colors.brandPrimary;
        break;
      default:
        mStatus = string.choXuLy;
        color = "#FB8C00";
        break;
    }

    const isReadStyle = isRead === "1" ? "gray" : colors.brandPrimary;

    const swipeSetting = {
      backgroundColor: "#fff",
      autoClose: true,
      right: [
        {
          onPress: () => showConfirmDialog(item.id, index, this, api, message),
          text: string.xoa,
          type: "delete"
        }
      ],
      left: [
        {
          onPress: () => showConfirmDialog(item.id, index, this, api, message),
          text: string.xoa,
          type: "delete"
        }
      ],
      rowID: item.id,
      sectionId: 1
    };

    return (
      <Swipeout {...swipeSetting}>
        <ListItem
          avatar
          button
          onPress={() => {
            onPress(item);
            this.changeRead();
          }}
          // onLongPress={this.onClick.bind(this, null)}
        >
          <TouchableWithoutFeedback
          // onPress={this.onClick.bind(this, null)}
          >
            {item.is_check ? (
              <View style={styles.viewText}>
                <Text style={styles.text}>{number}</Text>
              </View>
            ) : (
              <Left>
                <Icon
                  name={icon}
                  style={[styles.icon, { color: isReadStyle }]}
                />
              </Left>
            )}
          </TouchableWithoutFeedback>

          {!gopy ? (
            <Body>
              <Text numberOfLines={1} style={{ fontSize: 12 }}>
                {item.apartment_name}
              </Text>
              <Text numberOfLines={1}>{item.name}</Text>
              <Text numberOfLines={1} note>
                {item.content}
              </Text>
              {item.expired === "1" ? (
                <Text style={styles.expired}>{string.daHetHan}</Text>
              ) : (
                <Text style={{ fontSize: 12 }}>
                  {item.end_date &&
                    string.ngayHetHan + formatDate2(item.end_date)}
                </Text>
              )}
            </Body>
          ) : (
            <Body>
              <Text numberOfLines={1}>{item.title}</Text>
              <Text numberOfLines={1}>{item.to_name}</Text>
              <Text numberOfLines={1} note>
                {item.content_new}
              </Text>
            </Body>
          )}

          <Right style={styles.right}>
            {sent &&
              item.done !== "0" && (
                <Icon name="ios-checkmark-outline" style={styles.iconDone} />
              )}
            {!sent && (
              <Text note style={[config.styles.text.time, styles.dateTime]}>
                {formatDateNow(time, "vi", true)}
              </Text>
            )}
            {status && (
              <Text style={[styles.status, { color: color }]}>{mStatus}</Text>
            )}
          </Right>
        </ListItem>
      </Swipeout>
    );
  }
}

const styles = StyleSheet.create({
  viewText: {
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2.5
  },
  text: {
    color: "#fff",
    fontWeight: "bold"
  },
  icon: {
    fontSize: 30,
    margin: 5,
    width: 25
  },
  expired: {
    fontSize: 12,
    color: "#f00"
  },
  right: {
    justifyContent: "center",
    alignContent: "center"
  },
  iconDone: {
    color: colors.brandPrimary,
    fontSize: 30
  },
  dateTime: {
    textAlign: "center",
    fontSize: 10
  },
  status: {
    fontSize: 10,
    marginTop: 5
  }
});

export default InAppItem;
