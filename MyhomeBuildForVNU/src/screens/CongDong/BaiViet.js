import React from "react";
import { connect } from "react-redux";
import { Text } from "native-base";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import AppComponent from "../../../core/components/AppComponent";
import Icon from "../../component/Icon";
import { API, getApiUrl } from "../../config/server";
import colors from "../../../core/config/colors";
import metrics from "../../../core/config/metrics";
import { formatDateNow } from "../../../core/helpers/timeHelper";
import { assets } from "../../../assets";
import ViewMoreText from "../../component/ViewMoreText";
import strings from "../../config/string";
import ShowImageView from "../../component/ShowImageView";

export const typeAction = {
  VIEW: "VIEW",
  LIKE: "LIKE",
  DISLIKE: "DISLIKE",
  VIEW_IMAGE: "VIEW_IMAGE",
  MORE: "MORE",
  COMMENT: "COMMENT"
};

class BaiViet extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      item: props.item,
      visible: true,
      showImage: false,
      page: 0
    };
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ item: nextProps.item });
  };

  onClickLikeOrDislike = (type, name) => {
    if (!this.clickLikeOrDislike) {
      this.clickLikeOrDislike = true;
      setTimeout(() => (this.clickLikeOrDislike = false), 500);
      let { item } = this.state;
      let {
        id,
        total_like: totalLike,
        total_dislike: totalDislike,
        is_like: isLike,
        is_dislike: isDislike
      } =
        item || {};
      id = id || "";
      totalLike = totalLike || "0";
      isLike = isLike || "0";
      totalDislike = totalDislike || "0";
      isDislike = isDislike || "0";

      if (name === typeAction.LIKE) {
        totalLike = type === 1 ? Number(totalLike) + 1 : Number(totalLike) - 1;
        isLike = type === 1 ? "1" : "0";

        totalDislike =
          isDislike === "1" ? Number(totalDislike) - 1 : Number(totalDislike);
        isDislike = "0";
      } else if (name === typeAction.DISLIKE) {
        totalDislike =
          type === 1 ? Number(totalDislike) + 1 : Number(totalDislike) - 1;
        isDislike = type === 1 ? "1" : "0";

        totalLike = isLike === "1" ? Number(totalLike) - 1 : Number(totalLike);
        isLike = "0";
      }

      item = {
        ...item,
        total_like: totalLike,
        total_dislike: totalDislike,
        is_like: isLike,
        is_dislike: isDislike
      };
      this.setState({ item });
      this.props.onAction(name, item, this);
      this.postToServerWithAccount(
        getApiUrl(
          name === typeAction.LIKE ? API.LIKE_BAI_VIET : API.DISLIKE_BAI_VIET
        ),
        { id, type }
      );
    }
  };

  setItem = item => {
    this.setState({ item: { ...item } });
  };

  setVisible = state => {
    this.setState({ visible: state });
  };

  showModalImage = (state, index) => {
    if (Platform.OS === "ios") StatusBar.setHidden(state, "slide");
    this.setState({ showImage: state, page: index });
  };

  render() {
    const { accountInfo } = this.props;
    const { item, visible, showImage, page } = this.state;
    const {
      created_name: createdName,
      apartment_name: apartmentName,
      created_id: createdId,
      updated_at: updatedAt,
      is_edited: isEdited,
      created_at: createdAt,
      content,
      total_like: totalLike,
      total_dislike: totalDislike,
      total_comment: totalComment,
      image,
      avatar,
      is_like: isLike,
      is_dislike: isDislike
    } = item;
    const timePost = isEdited === "1" ? updatedAt : createdAt;
    const arrImage = image.filter((v, i) => i < 3);
    let viewImage = null;
    if (image.length === 1) {
      viewImage = (
        <TouchableWithoutFeedback
          onPress={this.showModalImage.bind(this, true, 0)}
        >
          <View style={styles.viewImageOne}>
            <Image
              source={assets.imagedefault}
              style={[styles.imageOne, { position: "absolute" }]}
            />
            <Image source={{ uri: image[0] }} style={styles.imageOne} />
          </View>
        </TouchableWithoutFeedback>
      );
    } else if (image.length >= 2) {
      viewImage = (
        <View style={styles.viewImageMore}>
          {arrImage.map((v, i) => {
            return (
              <TouchableWithoutFeedback
                key={i}
                onPress={this.showModalImage.bind(this, true, i)}
              >
                <View style={[styles.imageMore, { marginRight: 0.5 }]}>
                  <Image
                    source={assets.imagedefault}
                    style={[styles.imageMore, { position: "absolute" }]}
                  />
                  <Image source={{ uri: v }} style={styles.imageMore} />
                  {i === 2 &&
                    image.length > 3 && (
                      <View
                        style={[
                          StyleSheet.absoluteFillObject,
                          styles.imageMoreNumber
                        ]}
                      >
                        <Text style={styles.textImageMore}>{`+${image.length -
                          3}`}</Text>
                      </View>
                    )}
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
      );
    }
    if (!visible) return null;
    return (
      <View style={styles.viewPost}>
        <View style={styles.viewHeaderPost}>
          <View style={styles.viewAvatar}>
            <Image
              style={[styles.imageAvatar, { position: "absolute" }]}
              source={assets.avatarDefault}
            />
            <Image
              style={styles.imageAvatar}
              source={{ uri: avatar || undefined }}
            />
          </View>
          <View style={styles.viewTitle}>
            <Text style={styles.textTitle}>
              <Text style={styles.textCreateNamePost}>{createdName}</Text>
              <Text style={{ fontSize: 14, color: "gray" }}>
                {strings.dangTrong}
              </Text>
              <Text style={styles.textCreateNamePost}>{apartmentName}</Text>
            </Text>
            <Text note style={styles.textDate}>
              {formatDateNow(timePost)}
            </Text>
          </View>
          {accountInfo.id === createdId && (
            <TouchableOpacity
              onPress={this.props.onAction.bind(
                this,
                typeAction.MORE,
                {
                  ...item,
                  name: createdName
                },
                this
              )}
            >
              <View hitSlop={{ bottom: 20, top: 20, left: 20, right: 20 }}>
                <Icon
                  name="more-horiz"
                  iconType="MaterialIcons"
                  style={styles.icon}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <TouchableWithoutFeedback
          onPress={this.props.onAction.bind(this, typeAction.VIEW, item, this)}
        >
          <View style={styles.viewContent}>
            {this.props.isInDetail ? (
              <Text style={styles.textContent}>{content}</Text>
            ) : (
              <ViewMoreText
                numberOfLines={5}
                renderViewMore={onPress => (
                  <Text
                    style={[styles.textContent, { color: "#007aff" }]}
                    onPress={onPress}
                  >
                    {strings.xemThem}
                  </Text>
                )}
                renderViewLess={onPress => <Text> </Text>}
              >
                <Text style={styles.textContent}>{content}</Text>
              </ViewMoreText>
            )}
          </View>
        </TouchableWithoutFeedback>
        {viewImage}
        <View
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: colors.windowBackground,
            width: "100%",
            alignSelf: "center"
          }}
        />
        <View style={styles.viewAction}>
          <TouchableOpacity
            onPress={this.onClickLikeOrDislike.bind(
              this,
              isLike === "1" ? 2 : 1,
              typeAction.LIKE
            )}
          >
            <View style={styles.viewIconAction}>
              <Icon
                name={isLike === "1" ? "thumb-up" : "thumb-up-outline"}
                iconType="MaterialCommunityIcons"
                style={[
                  styles.iconAction,
                  { color: isLike === "1" ? colors.brandPrimary : "gray" }
                ]}
              />
              <Text
                note
                style={{ color: isLike === "1" ? colors.brandPrimary : "gray" }}
              >
                {totalLike}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.onClickLikeOrDislike.bind(
              this,
              isDislike === "1" ? 2 : 1,
              typeAction.DISLIKE
            )}
          >
            <View style={styles.viewIconAction}>
              <Icon
                name={isDislike === "1" ? "thumb-down" : "thumb-down-outline"}
                iconType="MaterialCommunityIcons"
                style={[
                  styles.iconAction,
                  { color: isDislike === "1" ? colors.brandPrimary : "gray" }
                ]}
              />
              <Text
                note
                style={{
                  color: isDislike === "1" ? colors.brandPrimary : "gray"
                }}
              >
                {totalDislike}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.props.onAction.bind(
              this,
              typeAction.COMMENT,
              item,
              this
            )}
          >
            <View style={styles.viewIconAction}>
              <Icon
                name={
                  totalComment && totalComment !== "0"
                    ? "comment"
                    : "comment-outline"
                }
                iconType="MaterialCommunityIcons"
                style={[styles.iconAction, { color: "gray" }]}
              />
              <Text note style={{ color: "gray" }}>
                {totalComment}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ShowImageView
          showGallery={showImage}
          onRequestClose={this.showModalImage.bind(this, false, 0)}
          onClosePress={this.showModalImage.bind(this, false, 0)}
          initPage={page}
          image={image}
        />
      </View>
    );
  }
}

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(BaiViet);

const styles = StyleSheet.create({
  viewModal: {
    backgroundColor: "#000",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  iconClose: { width: 30, height: 30 },
  iconCloseModal: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  viewIconAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 25
  },
  iconAction: { fontSize: 16, marginRight: 8 },
  viewAction: {
    flexDirection: "row",
    padding: 5,
    marginTop: 5,
    justifyContent: "flex-start"
  },
  textContent: { fontSize: 14, textAlign: "justify" },
  viewContent: { marginBottom: 10 },
  viewAvatar: { width: 40, height: 40 },
  icon: { color: "gray", fontSize: 25 },
  textDate: { fontSize: 11 },
  textCongDong: { fontSize: 14, color: "gray" },
  textCreateNamePost: { fontSize: 14, fontWeight: "bold" },
  textTitle: { marginBottom: 3 },
  viewTitle: { flex: 1, marginHorizontal: 10, marginTop: 5 },
  imageAvatar: { height: 40, width: 40, borderRadius: 20 },
  viewHeaderPost: { flexDirection: "row", marginBottom: 10 },
  viewPost: {
    padding: 10,
    paddingBottom: 5,
    borderBottomWidth: 5,
    borderBottomColor: colors.windowBackground,
    backgroundColor: "#fff"
  },
  textImageMore: { color: "#fff", fontWeight: "bold" },
  imageMoreNumber: {
    backgroundColor: "#0008",
    alignItems: "center",
    justifyContent: "center"
  },
  imageMore: {
    height: (metrics.DEVICE_WIDTH - 21.5) / 3,
    width: (metrics.DEVICE_WIDTH - 21.5) / 3
  },
  viewImageMore: {
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row"
  },
  viewImageOne: { alignItems: "center", marginBottom: 10 },
  imageOne: { height: metrics.DEVICE_WIDTH, width: metrics.DEVICE_WIDTH }
});
