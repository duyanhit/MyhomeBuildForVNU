import React from "react";
import { Text, View, ActionSheet } from "native-base";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

import AppComponent from "../../../core/components/AppComponent";
import { formatDateNow } from "../../../core/helpers/timeHelper";
import colors from "../../../core/config/colors";
import { assets } from "../../../assets";
import Icon from "../../component/Icon";
import string from "../../config/string";

class CommentItem extends AppComponent {
  deleteComment = (id, index) => {
    if (index === 0) {
      this.props.deleteComment(id);
    }
  };

  render() {
    const { item, accountInfoId } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <View style={styles.viewAvatar}>
            <Image style={styles.avatarDefault} source={assets.avatarDefault} />
            <Image
              style={styles.avatar}
              source={{ uri: item.avatar || undefined }}
            />
          </View>

          <View style={styles.viewContent}>
            <Text style={styles.createdName}>{item.created_name}</Text>
            <Text note style={styles.time}>
              {formatDateNow(item.created_at, "vi")}
            </Text>
            <Text style={styles.contentText}>{item.content}</Text>
          </View>

          {accountInfoId === item.created_by && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  ActionSheet.show(
                    {
                      options: [string.xoa, string.dong],
                      destructiveButtonIndex: 0,
                      cancelButtonIndex: 1
                    },
                    index => {
                      this.deleteComment(item.id, index);
                    }
                  );
                }}
              >
                <View hitSlop={{ bottom: 20, top: 20, left: 20, right: 20 }}>
                  <Icon
                    name="more-vert"
                    iconType="MaterialIcons"
                    style={styles.icon}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 10
  },
  subContainer: {
    flexDirection: "row"
  },
  viewAvatar: {
    width: 50,
    height: 50
  },
  avatarDefault: {
    height: 40,
    width: 40,
    borderRadius: 20,
    position: "absolute"
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20
  },
  viewContent: {
    flex: 1,
    marginHorizontal: 10
  },
  createdName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.brandPrimary
  },
  time: {
    fontSize: 12
  },
  contentText: {
    fontSize: 14
  },
  icon: {
    color: "gray",
    fontSize: 20
  }
});

export default CommentItem;
