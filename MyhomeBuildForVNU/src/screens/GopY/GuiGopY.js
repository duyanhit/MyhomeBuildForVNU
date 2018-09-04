import React from "react";
import { connect } from "react-redux";
import {
  CameraRoll,
  View,
  Image,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
  TextInput,
  BackHandler,
  Platform,
  KeyboardAvoidingView,
  FlatList
} from "react-native";
import {
  ListItem,
  Body,
  Text,
  Button,
  Content,
  Footer,
  Icon
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

import ProgressDialog from "../../../core/components/ProgressDialog";
import { assets } from "../../../assets";
import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import settings from "../../../core/config/metrics";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { API, getApiUrl } from "../../config/server";
import colors from "../../../core/config/colors";
import string from "../../config/string";

const width = settings.DEVICE_WIDTH;
const width2 = (0.9 * settings.DEVICE_WIDTH) / 3;

class GuiGopY extends AppComponent {
  state = {
    isLoading: false,
    dataCategory: null,
    listGroup: null,
    category: null,
    building: null,
    content: "",
    dataImage: null,
    isEdited: false,
    arrayBuilding: [],
    receiver: null
  };

  homePosition = 0;

  componentWillMount() {
    this.getDataApartment();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  handleBackPress = () => {
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack();
    return true;
  };

  getScreenData = async data => {
    this.setState({ isLoading: true });
    const promises = [
      this.getData(data.apartment_id),
      this.getDataList(data.apartment_id)
    ];
    const [propsData, list] = await Promise.all(promises);
    if (propsData.status === 1 && list.status === 1) {
      this.setState({
        dataCategory: propsData.data,
        category: { ...propsData.data[0] },
        refreshing: false,
        isLoading: false,
        listGroup: list.data,
        building: { ...data },
        receiver: list.data ? list.data[0] : null
      });
    } else if (propsData.status !== 1) {
      this.showAlertDialog(propsData.message, () =>
        this.props.navigation.goBack()
      );
    } else if (list.status !== 1) {
      this.showAlertDialog(list.message, () => this.props.navigation.goBack());
    }
  };

  /**
   * Lấy danh sách tiêu đề góp ý
   * @param apartment_id
   * @returns {Promise<any>}
   */
  getData = apartment_id => {
    return new Promise(resolve => {
      this.getFromServerWithAccount(getApiUrl(API.DANH_MUC_GOP_Y), {
        apartment: apartment_id
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        return resolve(propsData);
      });
    });
  };

  /**
   * Lấy danh sách nhóm quản trị
   * @param apartment_id
   * @returns {Promise<any>}
   */
  getDataList = apartment_id => {
    return new Promise(resolve => {
      this.getFromServerWithAccount(getApiUrl(API.DS_NHOM_QUAN_TRI), {
        apartment: apartment_id
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        return resolve(propsData);
      });
    });
  };

  /**
   * Lấy danh sách căn hộ
   */
  getDataApartment = () => {
    const { accountInfo } = this.props;
    let arrayApartmentId = accountInfo.home;
    let arrayBuilding = [];
    arrayApartmentId.map((value, index) => {
      if (value.valid.toString() === "1") {
        arrayBuilding.push(value);
      }
    });
    this.setState({ arrayBuilding: arrayBuilding }, () => {
      this.getScreenData(this.state.arrayBuilding[this.homePosition] || "");
    });
  };

  /**
   * Chọn căn hộ
   */
  selectApartment = () => {
    const { arrayBuilding } = this.state;
    this.showActionSheet(
      [
        ...arrayBuilding.map((v, i) => ({
          text:
            v.home_name +
            " - " +
            v.apartment_building_name +
            " - " +
            v.apartment_name,
          code: i,
          data: v
        })),
        { text: string.dong, code: -1, data: {} }
      ],
      item => {
        if (item.code !== -1) {
          this.getScreenData(item.data);
          this.setState({
            checkSendTo: true,
            building: item.data,
            selectBQT: false,
            selectBQL: false,
            selectCDT: false
          });
        }
      }
    );
  };

  /**
   * Chọn đối tượng nhân góp ý
   */
  selectReceiver = () => {
    const { listGroup } = this.state;
    this.showActionSheet(
      [
        ...listGroup.map((v, i) => ({
          text: v.name,
          code: i,
          data: v
        })),
        { text: string.dong, code: -1, data: {} }
      ],
      item => {
        if (item.code !== -1)
          this.setState({
            receiver: item.data
          });
      }
    );
  };

  /**
   * Chọn tiêu đề góp ý
   */
  selectCategory = () => {
    const { dataCategory } = this.state;
    this.showActionSheet(
      [
        ...dataCategory.map((v, i) => ({
          text: v.name,
          code: i,
          data: v
        })),
        { text: string.dong, code: -1, data: {} }
      ],
      item => {
        if (item.code !== -1) this.setState({ category: item.data });
      }
    );
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
   * Mở máy ảnh
   */
  camera = () => {
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
   * Mở bộ sưu tập
   */
  album = () => {
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
   * Render ảnh
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
   * Danh sách ảnh
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
   * Xóa ảnh
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
   * Gửi góp ý
   * @param building
   */
  send = building => {
    const { category, receiver } = this.state;
    let { content } = this.state;
    content = content.trim();
    if (!content) {
      Alert.alert(string.thongBao, string.vuiLongNhapNoiDung);
      return;
    }

    Alert.alert(
      string.canhBao,
      string.banMuonGuiGopYNay,
      [
        { text: string.huy },
        {
          text: string.dongY,
          onPress: () => {
            this.setState({ isLoading: true });
            this.postToServerWithAccount(
              getApiUrl(API.GUI_GOP_Y),
              {
                content: content,
                send_to: receiver.type,
                home_id: building.resident_home_id,
                mail_category: category.id
              },
              this.state.dataImage && this.state.dataImage.length
                ? this.state.dataImage
                : null
            ).then(response => {
              const propsData = parseJsonFromApi(response);
              if (propsData.status === 1) {
                this.showAlertDialog(string.guiGopYThanhCong, () => {
                  this.setState({ isLoading: false, content: "" }, () => {
                    this.props.navigation.state.params.myCallback();
                    this.handleBackPress();
                  });
                });
              } else {
                this.setState({ isLoading: false });
                setTimeout(() => {
                  this.showAlertDialog(propsData.message);
                }, 300);
              }
            });
          }
        }
      ],
      { cancelable: false }
    );
  };

  render = () => {
    const { content, building, receiver, isLoading } = this.state;
    const iconRight = [
      {
        icon: "send",
        iconType: "MaterialIcons",
        onPress: () => this.send(building)
      }
    ];

    return (
      <View style={styles.container}>
        <KeyboardAvoidingView
          enabled={Platform.OS === "ios"}
          behavior="padding"
          flex={1}
        >
          <ProgressDialog
            message={string.vuiLongCho}
            visible={isLoading}
            transparent={false}
          />
          <AppHeader
            title={string.guiGopY}
            left
            onClose={this.handleBackPress}
            navigation={this.props.navigation}
            rightButtons={iconRight}
          />
          <Content>
            <ListItem
              style={styles.viewList}
              button
              onPress={this.selectApartment}
            >
              <Text note style={styles.titleView}>
                {string.canHo}:
              </Text>
              <Text note style={styles.titleSelect}>
                {building
                  ? building.home_name +
                    " - " +
                    building.apartment_building_name +
                    " - " +
                    building.apartment_name
                  : ""}
              </Text>
              <View style={styles.iconDropdown}>
                <Icon name="ios-arrow-dropdown" />
              </View>
            </ListItem>

            <ListItem
              style={styles.viewList}
              button
              onPress={this.selectReceiver}
            >
              <Text note style={styles.titleView}>
                {string.guiToi}:
              </Text>
              <Text note style={styles.titleSelect}>
                {receiver ? receiver.name : ""}
              </Text>
              <View style={styles.iconDropdown}>
                <Icon name="ios-arrow-dropdown" />
              </View>
            </ListItem>

            <ListItem
              style={styles.viewList}
              button
              onPress={this.selectCategory}
            >
              <Text note style={styles.titleView}>
                {string.veViec}:
              </Text>
              <Text note style={styles.titleSelect}>
                {this.state.category ? this.state.category.name : ""}
              </Text>
              <View style={styles.iconDropdown}>
                <Icon name="ios-arrow-dropdown" />
              </View>
            </ListItem>

            <TouchableWithoutFeedback
              onPress={() => {
                this.refs.inputContent.focus();
              }}
            >
              <View style={styles.inputView}>
                <TextInput
                  style={styles.inputContent}
                  multiline
                  ref="inputContent"
                  placeholder={string.noiDung}
                  placeholderTextColor="gray"
                  value={content}
                  onChangeText={this.onChangeText.bind(this, "content")}
                  underlineColorAndroid="transparent"
                />
              </View>
            </TouchableWithoutFeedback>

            <View style={styles.flatList}>{this.renderImage()}</View>
          </Content>
          <Footer>
            <Body style={styles.footerBody}>
              <Button full transparent onPress={this.camera}>
                <Icon name="ios-camera-outline" style={styles.iconFooter} />
              </Button>
              <Button full transparent onPress={this.album}>
                <Icon name="ios-image-outline" style={styles.iconFooter} />
              </Button>
            </Body>
          </Footer>
        </KeyboardAvoidingView>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.windowBackground
  },
  sendTo: {
    marginLeft: 0,
    paddingRight: 0,
    borderBottomWidth: 0
  },
  iconCheck: {
    color: colors.brandPrimary,
    fontSize: 18
  },
  textSendTo: {
    color: "#000"
  },
  titleView: {
    width: 50,
    color: "#000",
    marginHorizontal: 10
  },
  titleSelect: {
    width: width - 100,
    fontWeight: "bold",
    color: "#000"
  },
  iconDropdown: {
    marginLeft: 0
  },
  viewTextSend: {
    color: "#000",
    marginLeft: 10,
    marginTop: 10
  },
  listSendTo: {
    marginLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: "space-around"
  },
  viewList: {
    marginLeft: 0,
    paddingRight: 0
  },
  inputContent: {
    width: "100%",
    fontSize: 18,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingLeft: 5
  },
  footerBody: {
    justifyContent: "space-around"
  },
  iconFooter: {
    fontSize: 40
  },
  inputView: {
    minHeight: 150
  },
  image: {
    width: width2,
    height: width2,
    marginBottom: 5
  },
  closeIcon: {
    width: 25,
    height: 25,
    position: "absolute",
    right: 0,
    top: -1
  },
  flatList: {
    paddingHorizontal: 12,
    marginTop: 10
  }
});

const mapStateToProps = state => ({ accountInfo: state.accountReducer });

export default connect(mapStateToProps)(GuiGopY);
