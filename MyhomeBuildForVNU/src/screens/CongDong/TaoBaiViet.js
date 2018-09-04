import React from "react";
import {
  CameraRoll,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { View, Text } from "native-base";
import { connect } from "react-redux";
import { uniqBy } from "lodash";

import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import colors from "../../config/colors";
import InAppProgress from "../../component/InAppProgress";
import Icon from "../../component/Icon";
import metrics from "../../../core/config/metrics";
import { assets } from "../../../assets";
import { API, getApiUrl } from "../../config/server";

const width = (0.9 * metrics.DEVICE_WIDTH) / 3;

class TaoBaiViet extends AppComponent {
  constructor(props) {
    super(props);
    const { accountInfo } = this.props;
    this.home = _.uniqBy(accountInfo.home, "apartment_id");
    this.state = {
      ...this.state,
      content: "",
      apartment: this.home[0],
      dataImage: null,
      isEdited: false
    };
    this.heightCongDong = new Animated.Value(0);
  }

  /**
   * post bài viết
   */
  post = () => {
    const { accountInfo } = this.props;
    const { content, apartment, dataImage } = this.state;

    this.myProgress.openDialog();

    if (accountInfo) {
      this.postToServerWithAccount(
        getApiUrl(API.TAO_BAI_VIET),
        {
          content: content,
          apartment: apartment.apartment_id
        },
        dataImage && dataImage.length ? dataImage : null
      ).then(response => {
        this.showAlertDialog(string.dangBaiVietThanhCong, () => {
          this.myProgress.closeDialog();
          this.setState({ isLoading: false, content: "" }, () => {
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
          });
        });
      });
    }
  };

  /**
   * Xác nhận đăng bài
   */
  confirmPost = () => {
    if (!this.state.apartment) {
      this.showAlertDialog(string.vuiLongChonCongDongTruocKhiDang);
      return;
    }
    if (!this.state.content) {
      this.showAlertDialog(string.vuiLongNhapNoiDungTruocKhiDang);
      return;
    }
    Alert.alert(
      string.thongBao,
      string.banMuonDangBaiVietNay,
      [
        { text: string.huy },
        {
          text: string.dongY,
          onPress: () => {
            this.post();
          }
        }
      ],
      { cancelable: false }
    );
  };

  /**
   *
   */
  updateEdited = () => {
    let { isEdited, content, dataImage } = this.state;
    if (content || dataImage) {
      isEdited = true;
    } else isEdited = false;
    this.setState({ isEdited });
  };

  /**
   *
   * @param name
   * @param text
   */
  onChangeText = (name, text) => {
    this.setState({ [name]: text }, this.updateEdited);
  };

  /**
   * xóa ảnh đã soạn
   * @param index
   */
  removeImage = index => {
    const { dataImage } = this.state;
    dataImage.splice(index, 1);
    this.setState(
      { dataImage: dataImage.length ? [...dataImage] : null },
      this.updateEdited()
    );
  };

  /**
   * custom ảnh
   * @param item
   * @param index
   * @returns {*}
   */
  renderItem = ({ item, index }) => {
    return (
      <View key={index}>
        <Image
          source={item}
          style={[
            styles.image,
            { marginLeft: index !== 0 && index !== 3 ? 5 : undefined }
          ]}
          resizeMode={"cover"}
        />
        <TouchableWithoutFeedback onPress={() => this.removeImage(index)}>
          <Image source={assets.icClose} style={styles.closeIcon} />
        </TouchableWithoutFeedback>
      </View>
    );
  };

  /**
   * hiển thị ảnh
   * @returns {*}
   */
  renderImage = () => {
    const { dataImage } = this.state;
    if (dataImage) {
      return (
        <FlatList
          data={dataImage}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
        />
      );
    }
    return null;
  };

  /**
   * mở camera
   */
  selectCamera = () => {
    if (this.state.dataImage && this.state.dataImage.length === 5) {
      Alert.alert(string.thongBao, string.banChiDuocChonToiDa5Anh);
      return;
    }
    this.setState({ isLoading: true });
    this.launchCameraAsync().then(async value => {
      if (value) {
        await CameraRoll.saveToCameraRoll(value.uri, "photo");
        this.resizeImage(value).then(value1 => {
          if (value1) {
            let { dataImage } = this.state;
            dataImage = dataImage ? [...dataImage, value1] : [value1];
            this.setState({ dataImage, isLoading: false }, this.updateEdited);
          }
        });
      } else this.setState({ isLoading: false });
    });
  };

  /**
   * mở bộ sưu tập
   */
  selectAlbum = () => {
    if (this.state.dataImage && this.state.dataImage.length === 5) {
      Alert.alert(string.thongBao, string.banChiDuocChonToiDa5Anh);
      return;
    }
    this.setState({ isLoading: true });
    this.launchImageLibraryAsync().then(value => {
      if (value) {
        this.resizeImage(value).then(value1 => {
          if (value1) {
            let { dataImage } = this.state;
            dataImage = dataImage ? [...dataImage, value1] : [value1];
            this.setState({ dataImage, isLoading: false }, this.updateEdited);
          }
        });
      } else this.setState({ isLoading: false });
    });
  };

  /**
   * chọn cộng đồng
   */
  selectApartment = () => {
    const { accountInfo } = this.props;
    this.showActionSheet(
      [
        ..._.uniqBy(accountInfo.home, "apartment_id").map((v, i) => ({
          text: v.apartment_name,
          code: i,
          data: v
        })),
        { text: string.dong, code: -1, data: {} }
      ],
      item => {
        if (item.code !== -1)
          this.setState({
            apartment: item.data
          });
      }
    );
  };

  expandCongDong = () => {
    if (this.expandStateCongDong) {
      this.expandStateCongDong = false;
      Animated.timing(this.heightCongDong, {
        duration: 300,
        toValue: 0
      }).start();
    } else {
      this.expandStateCongDong = true;
      Animated.timing(this.heightCongDong, {
        duration: 300,
        toValue: this.heightViewConDong
      }).start();
    }
  };

  renderItemAparment = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({ apartment: item });
        }}
      >
        <View style={{ width: 80 }}>
          <View overflow="hidden" style={styles.avatarCongDong}>
            <Image
              style={[styles.imageCongDong, { position: "absolute" }]}
              source={assets.congDongDefault}
            />
            <Image
              style={styles.imageCongDong}
              source={{
                uri: item.apartment_image || undefined
              }}
            />
          </View>
          <Text style={styles.textCongDong} numberOfLines={1}>
            {item.apartment_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { accountInfo } = this.props;
    const rightButtons = [
      {
        icon: "send",
        iconType: "MaterialIcons",
        onPress: () => this.confirmPost()
      }
    ];
    return (
      <KeyboardAvoidingView
        enabled={Platform.OS === "ios"}
        behavior="padding"
        flex={1}
        style={{ backgroundColor: "#fff" }}
      >
        <AppHeader
          left
          title={string.taoBaiViet}
          navigation={this.props.navigation}
          rightButtons={rightButtons}
        />
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.viewCongDongAvatar}>
            <View style={styles.viewAvatar}>
              <Image
                style={[styles.imageAvatar, { position: "absolute" }]}
                source={assets.avatarDefault}
              />
              <Image
                style={styles.imageAvatar}
                source={{ uri: accountInfo.avatar || undefined }}
              />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.textAccountName}>
                {accountInfo.fullname || ""}
              </Text>
              <View style={styles.viewSelectApartment}>
                <Text style={styles.textDangTrong}>{string.dangTrong}</Text>
                <TouchableOpacity
                  style={{ flexDirection: "row" }}
                  onPress={this.expandCongDong}
                >
                  <View
                    hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    style={[
                      styles.viewCongDong,
                      { maxWidth: metrics.DEVICE_WIDTH - 140 }
                    ]}
                  >
                    <Text style={styles.textApartmentName}>
                      {this.state.apartment
                        ? this.state.apartment.apartment_name
                        : string.tatCa}
                    </Text>
                    <Image
                      source={assets.icArrowDown}
                      style={styles.iconDropDown}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Animated.View
            style={[styles.viewAnimation, { height: this.heightCongDong }]}
          >
            <View
              onLayout={event =>
                (this.heightViewConDong = event.nativeEvent.layout.height)
              }
              style={{ position: "absolute" }}
            >
              <FlatList
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 10 }}
                horizontal
                data={this.home}
                renderItem={this.renderItemAparment}
                keyExtractor={(v, i) => i.toString()}
              />
            </View>
          </Animated.View>
          <TextInput
            ref="inputContent"
            placeholder={string.banMuonDangGi}
            style={styles.textInputContent}
            underlineColorAndroid="#fff0"
            multiline
            value={this.state.content}
            onChangeText={this.onChangeText.bind(this, "content")}
          />
          <View style={styles.flatList}>{this.renderImage()}</View>
        </ScrollView>
        <View style={styles.viewAddImage}>
          <TouchableOpacity onPress={this.selectAlbum}>
            <View style={[styles.viewItemAdd, styles.viewAddItemChonAnh]}>
              <Icon
                name="ios-image-outline"
                iconType="Ionicons"
                style={styles.iconAdd}
              />
              <Text>{string.chonAnh}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.selectCamera}>
            <View style={styles.viewItemAdd}>
              <Icon
                name="ios-camera-outline"
                iconType="Ionicons"
                style={styles.iconAdd}
              />
              <Text>{string.chupAnh}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <InAppProgress self={self => (this.myProgress = self)} />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  iconAdd: {
    fontSize: 35,
    color: colors.brandPrimary,
    marginRight: 15
  },
  viewAddItemChonAnh: {
    borderBottomWidth: 0.5,
    borderBottomColor: "gray"
  },
  viewItemAdd: {
    flexDirection: "row",
    padding: 5,
    paddingHorizontal: 15,
    alignItems: "center"
  },
  viewAddImage: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderTopWidth: 0.5,
    borderColor: "gray",
    borderEndWidth: 0.5,
    borderStartWidth: 0.5,
    paddingBottom: metrics.IS_IPHONE_X ? 20 : 0
  },
  textCongDong: {
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 10,
    textAlign: "center"
  },
  imageCongDong: {
    height: 52,
    width: 52,
    borderRadius: 26
  },
  avatarCongDong: {
    height: 60,
    width: 60,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: colors.brandPrimary,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  viewAnimation: {
    overflow: "hidden",
    backgroundColor: "#ddd"
  },
  viewCongDong: {
    padding: 3,
    paddingHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  imageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  viewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center"
  },
  viewCongDongAvatar: {
    flexDirection: "row",
    padding: 15
  },
  viewContainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  closeIcon: {
    width: 25,
    height: 25,
    position: "absolute",
    right: 0,
    top: -1
  },
  flatList: {
    paddingHorizontal: (metrics.DEVICE_WIDTH - (3 * width + 10)) / 2,
    marginTop: 10,
    marginBottom: 10
  },
  image: {
    width,
    height: width,
    marginBottom: 5
  },
  textAccountName: {
    fontWeight: "bold",
    marginBottom: 5
  },
  viewSelectApartment: {
    flexDirection: "row",
    alignItems: "center"
  },
  textDangTrong: {
    fontSize: 13,
    color: "gray",
    marginRight: 10
  },
  textApartmentName: {
    fontSize: 12,
    marginRight: 5
  },
  iconDropDown: {
    width: 10,
    height: 10,
    tintColor: "#000"
  },
  textInputContent: {
    fontSize: 16,
    padding: 10
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  TaoBaiViet
);
