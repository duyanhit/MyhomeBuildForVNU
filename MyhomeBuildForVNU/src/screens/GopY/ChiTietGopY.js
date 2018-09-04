import React from "react";
import { ListItem, Footer, Button, Input, Icon } from "native-base";
import {
  View,
  Text,
  Platform,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Modal,
  TouchableWithoutFeedback,
  Image,
  BackHandler
} from "react-native";
import { connect } from "react-redux";
import _ from "lodash";
import Moment from "moment";

import ProgressDialog from "../../../core/components/ProgressDialog";
import AppComponent from "../../../core/components/AppComponent";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import colors from "../../../core/config/colors";
import AppHeader from "../../../core/components/AppHeader";
import { assets } from "../../../assets";
import settings from "../../../core/config/metrics";
import string from "../../config/string";

const width = 0.5 * settings.DEVICE_WIDTH;

class ChiTietGopY extends AppComponent {
  state = {
    ...this.state,
    content: "",
    behavior: undefined,
    visibleProgress: true,
    reply: 0,
    id: this.props.navigation.state.params.id,
    item: undefined,
    showImageView: false,
    srcImageView: "",
    isSent: false
  };

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
    const { id } = this.state;
    this.getFromServerWithAccount(getApiUrl(API.CHI_TIET_GOP_Y), {
      id: id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      this.setState({
        visibleProgress: false,
        isLoading: false,
        propsData,
        data: propsData.data,
        item: propsData.data ? propsData.data[0] : undefined
      });

      if (propsData.status !== 1 && propsData.data) {
        this.showAlertDialog(propsData.message);
      }
    });
  };

  send = () => {
    const { item, id } = this.state;
    let { content } = this.state;

    if (item) {
      content = content.trim();
      const sendTo =
        item && item.receive_object_type ? item.receive_object_type : "";

      setTimeout(() => {
        if (content !== "") {
          this.setState({ visibleProgress: true });
          this.postToServerWithAccount(getApiUrl(API.GUI_GOP_Y), {
            content: content,
            root_id: id,
            send_to: sendTo,
            home_id: item.from_id,
            mail_category: item.mail_category_id
          }).then(response => {
            const propsData = parseJsonFromApi(response);
            if (propsData.status === 1) {
              this.setState(
                { visibleProgress: false, content: "", isSent: true },
                () => {
                  this.refreshScreen();
                }
              );
            } else {
              this.setState({ visibleProgress: false });
              this.showAlertDialog(propsData.message);
            }
          });
        }
      }, 200);
    }
  };

  confirmDelete = () => {
    Alert.alert(
      string.thongBao,
      string.banCoChacMuonXoaGopYNay,
      [
        {
          text: string.huy,
          onPress: () => {}
        },
        {
          text: string.dongY,
          onPress: () => {
            this.onDelete();
          }
        }
      ],
      { cancelable: false }
    );
  };

  onDelete = () => {
    this.setState({
      visibleProgress: true
    });
    this.postToServerWithAccount(getApiUrl(API.XOA_GOP_Y), {
      id: this.state.id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        this.showAlertDialog(string.xoaGopYThanhCong, () => {
          this.setState({
            visibleProgress: false
          });
          this.handleBackPress();
          this.props.navigation.state.params.myCallback();
        });
      } else {
        this.setState({
          visibleProgress: false
        });
        this.showAlertDialog(propsData.message);
      }
    });
  };

  renderMessenger = () => {
    const { data, item } = this.state;
    const { accountInfo } = this.props;
    if (item) {
      return (
        <View style={{ paddingHorizontal: 10 }}>
          {data.map((item, index) => {
            let textAlign = "left";
            let justifyContent = "flex-start";
            let backgroundColor = "#fff";
            let color = "#000";
            if (_.isEqual(item.resident_id, accountInfo.id)) {
              textAlign = "right";
              justifyContent = "flex-end";
              backgroundColor = colors.brandPrimary;
              color = "#fff";
            }
            return (
              <View key={index}>
                <ListItem style={{ ...styles.listItemChild, justifyContent }}>
                  <View style={{ justifyContent, maxWidth: "70%" }}>
                    <Text style={[styles.textItemTime, { textAlign }]}>
                      {Moment(item.time).format("HH:mm, DD/MM/Y")}
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent }}>
                      <View style={{ ...styles.viewChild, backgroundColor }}>
                        <Text style={{ color }}>{item.content}</Text>
                      </View>
                    </View>
                  </View>
                </ListItem>
                {item.attach.map((image, imageIndex) => {
                  const height =
                    width * (Number(image.height) / Number(image.width));
                  return (
                    <ListItem
                      key={imageIndex}
                      style={{ ...styles.listImages, justifyContent }}
                    >
                      <TouchableWithoutFeedback
                        onPress={() =>
                          this.setState({
                            srcImageView: image.link,
                            showImageView: true
                          })
                        }
                      >
                        <Image
                          source={{ uri: image.link }}
                          resizeMode="contain"
                          style={{ height, width }}
                        />
                      </TouchableWithoutFeedback>
                    </ListItem>
                  );
                })}
              </View>
            );
          })}
        </View>
      );
    }
  };

  render() {
    const {
      propsData,
      content,
      data,
      item,
      srcImageView,
      showImageView,
      isSent,
      visibleProgress
    } = this.state;

    let viewMain = this.renderView(propsData);
    let viewPhanHoi;
    if (viewMain === null) {
      if (data) {
        viewPhanHoi = (
          <Footer style={styles.footer}>
            <View style={styles.phanHoiView}>
              <Input
                placeholder={string.phanHoi}
                placeholderTextColor="gray"
                value={content}
                onChangeText={content => this.setState({ content })}
                onFocus={() => {
                  this.setState({ behavior: "height" });
                  this.scrollToEnd(this.scrollView);
                }}
                style={{ paddingTop: Platform.OS === "android" ? 0 : 6 }}
                onSubmitEditing={this.send}
              />
              <Button disabled={!content} transparent onPress={this.send}>
                <Icon
                  name="send"
                  type="MaterialIcons"
                  style={{
                    fontSize: 28,
                    color: content ? colors.brandPrimary : "gray"
                  }}
                />
              </Button>
            </View>
          </Footer>
        );
      }

      viewMain = item && (
        <View style={styles.viewMain}>
          <ListItem style={styles.styleCategoryName}>
            <Text style={styles.textTieuDe}>{string.gopYVeViec}</Text>
            <Text style={styles.textCategoryName}>
              {item.mail_category_name}
            </Text>
          </ListItem>

          <ScrollView
            showsVerticalScrollIndicator={false}
            ref={ref => {
              this.scrollToEnd(ref);
              this.scrollView = ref;
            }}
          >
            {this.renderMessenger()}
          </ScrollView>
        </View>
      );
    }

    const rightButtons = [
      {
        icon: "delete",
        iconType: "MaterialIcons",
        onPress: () => {
          this.confirmDelete();
        }
      }
    ];

    const onClose = () => {
      this.handleBackPress();
      isSent && this.props.navigation.state.params.myCallback();
    };

    return (
      <KeyboardAvoidingView
        style={{ backgroundColor: colors.windowBackground }}
        enabled={Platform.OS === "ios"}
        behavior="padding"
        flex={1}
      >
        <AppHeader
          left
          onClose={onClose}
          title={string.chiTietGopY}
          rightButtons={rightButtons}
          navigation={this.props.navigation}
        />

        {viewMain}
        {viewPhanHoi}

        <ProgressDialog visible={visibleProgress} message={string.vuiLongCho} />

        <Modal
          transparent
          animationType="fade"
          visible={showImageView || false}
          onRequestClose={() => this.setState({ showImageView: false })}
        >
          <View style={styles.showImages}>
            <Image
              source={{ uri: srcImageView || "" }}
              resizeMode="contain"
              style={styles.imageView}
            />
            <TouchableWithoutFeedback
              onPress={() => this.setState({ showImageView: false })}
            >
              <Image source={assets.icClose} style={styles.images} />
            </TouchableWithoutFeedback>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }
}

const styles = {
  listItem: {
    margin: 10,
    paddingVertical: 10,
    marginBottom: 10,
    paddingHorizontal: 0,
    backgroundColor: "#0000"
  },
  footer: {
    backgroundColor: "white"
  },
  textTitle: {
    color: "#000",
    marginLeft: 10
  },
  textContent: {
    fontWeight: "bold",
    color: "#000"
  },
  listItemChild: {
    backgroundColor: "#fff0",
    marginLeft: 0,
    paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 0
  },
  viewChild: {
    flexDirection: "row",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  phanHoiView: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 10
  },
  canNotRep: {
    fontSize: 10,
    color: "gray",
    alignSelf: "center"
  },
  titleView: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff"
  },
  listImages: {
    backgroundColor: "#fff0",
    marginLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: 0
  },
  viewMain: {
    flex: 1
  },
  showImages: {
    flex: 1,
    backgroundColor: "#000"
  },
  imageView: {
    width: "100%",
    height: "100%",
    position: "absolute"
  },
  images: {
    height: 30,
    width: 30,
    alignSelf: "flex-end",
    marginTop: Platform.OS === "ios" ? 20 : 10,
    marginRight: 5
  },
  styleCategoryName: {
    marginLeft: 0,
    paddingRight: 0,
    borderBottomWidth: 0,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#0000"
  },
  textCategoryName: {
    fontWeight: "bold",
    color: "#000"
  },
  textTieuDe: {
    paddingHorizontal: 10,
    color: "#000"
  },
  textItemTitle: {
    fontWeight: "bold"
  },
  textItemTime: {
    marginBottom: 2,
    fontSize: 11,
    color: "#A9A9A9"
  }
};

const mapStateToProps = state => ({ accountInfo: state.accountReducer });

export default connect(mapStateToProps)(ChiTietGopY);
