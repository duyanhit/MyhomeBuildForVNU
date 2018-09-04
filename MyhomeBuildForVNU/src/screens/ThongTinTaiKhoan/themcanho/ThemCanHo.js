import React from "react";
import { connect } from "react-redux";
import {
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView
} from "react-native";
import { Container, ActionSheet } from "native-base";

import AppComponent from "../../../../core/components/AppComponent";
import { parseJsonFromApi } from "../../../../core/helpers/apiHelper";
import { API, getApiUrl } from "../../../config/server";
import string from "../../../config/string";
import AppHeader from "../../../../core/components/AppHeader";
import { screenNames } from "../../../config/screen";
import ProgressDialog from "../../../../core/components/ProgressDialog";
import { actionTypes } from "../../../reducers/index";
import { dispatchParams } from "../../../../core/actions/index";
import Icon from "../../../component/Icon";
import colors from "../../../config/colors";

class ThemCanHo extends AppComponent {
  constructor(props) {
    super(props);
    const data = this.props.navigation.state.params.selectedData
      ? this.props.navigation.state.params.selectedData
      : null;
    this.state = {
      refreshing: false,
      isLoading: false,
      apartmentId: data && data.apartment_id ? data.apartment_id : null,
      apartmentName: data && data.apartment_name ? data.apartment_name : null,
      buildingId:
        data && data.apartment_building_id ? data.apartment_building_id : null,
      buildingName:
        data && data.apartment_building_name
          ? data.apartment_building_name
          : null,
      floorId: data && data.floor ? data.floor : null,
      floorName: data && data.floor ? "Tầng " + data.floor : null,
      home: data && data.home_name ? data.home_name : null,
      dialogVisible: false,
      id: data ? data.resident_home_id : null,
      image:
        data && data.image_certificate ? { uri: data.image_certificate } : null
    };
  }

  apartment = null;
  building = null;

  componentWillMount = () => {
    this.getData();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  };

  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  getData = async () => {
    this.setState({ dialogVisible: true });
    let promises = [];
    const data = this.props.navigation.state.params.selectedData
      ? this.props.navigation.state.params.selectedData
      : null;
    if (data) {
      if (data.district_id) {
        promises.push(this.getApartment(data.district_id, false));
      }
      if (data.apartment_id) {
        promises.push(this.getBuilding(data.apartment_id, false));
      }
    }
    await Promise.all(promises)
      .then(result => {
        this.setState({
          dialogVisible: false
        });
      })
      .catch(reason => {
        this.setState({
          dialogVisible: false
        });
      });
  };

  getApartment = (district, closeDialog = true) => {
    return new Promise(resolve => {
      this.getFromServer(getApiUrl(API.DANH_SACH_CHUNG_CU), {
        district
      }).then(response => {
        this.apartment = parseJsonFromApi(response);
        if (closeDialog) {
          this.setState({
            dialogVisible: false
          });
        }
        return resolve(1);
      });
    });
  };

  getBuilding = (apartment, closeDialog = true) => {
    return new Promise(resolve => {
      this.getFromServer(getApiUrl(API.DANH_SACH_TOA_NHA), {
        apartment
      }).then(response => {
        this.building = parseJsonFromApi(response);
        if (closeDialog) {
          this.setState({
            dialogVisible: false
          });
        }
        return resolve(1);
      });
    });
  };

  showApartment = () => {
    this.navigateToScreen(screenNames.DanhSachChungCu, {
      selectedId: this.state.apartmentId,
      onSelect: this.onSelectApartment
    })();
  };

  onSelectApartment = (apartmentId, apartmentName) => {
    if (apartmentId !== this.state.apartmentId) {
      this.setState(
        {
          apartmentId,
          apartmentName,
          buildingId: null,
          buildingName: null,
          dialogVisible: true
        },
        () => this.getBuilding(apartmentId)
      );
    }
  };

  showBuilding = () => {
    if (this.state.apartmentId) {
      this.navigateToScreen(screenNames.DanhSachToaNha, {
        propsData: this.building,
        selectedId: this.state.buildingId,
        onSelect: this.onSelectBuilding
      })();
    } else {
      this.showAlertDialog(string.vuiLongChonChungCu);
    }
  };

  onSelectBuilding = (buildingId, buildingName) => {
    if (buildingId !== this.state.buildingId) {
      this.setState({
        buildingId,
        buildingName
      });
    }
  };

  showFloor = () => {
    this.navigateToScreen(screenNames.DanhSachTang, {
      selectedId: this.state.floorId,
      onSelect: this.onSelectFloor
    })();
  };

  onSelectFloor = (floorId, floorName) => {
    if (floorId !== this.state.floorId) {
      this.setState({
        floorId,
        floorName
      });
    }
  };

  onChangeHome = home => {
    this.setState({ home: home });
  };

  onSubmit = () => {
    if (this.onValid()) {
      const {
        apartmentId: apartment,
        buildingId: building,
        floorId: floor,
        home,
        id,
        image
      } = this.state;
      this.setState({ dialogVisible: true });
      this.postToServerWithAccount(
        getApiUrl(API.THEM_CAN_HO),
        {
          apartment,
          building,
          floor: floor || "",
          home: home ? home.trim() : "",
          id: id || ""
        },
        image && image.isImagePicker ? [{ ...image, key: "image" }] : null
      ).then(response => {
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          this.props.dispatchParams(
            {
              ...propsData.data,
              device_token: this.props.accountInfo.device_token
            },
            actionTypes.APP_USER_INFO
          );
          this.showAlertDialog(
            id ? string.capNhatThanhCong : string.themMoiCanHoThanhCong,
            () => {
              this.closeProgressDialog();
              this.props.navigation.goBack();
            }
          );
        } else {
          this.showAlertDialog(propsData.message, this.closeProgressDialog);
        }
      });
    }
  };

  onValid = () => {
    if (!this.state.apartmentId) {
      this.showAlertDialog(string.vuiLongChonChungCu);
      return false;
    }
    // if (!this.state.buildingId) {
    //   this.showAlertDialog(string.vuiLongChonToaNha);
    //   return false;
    // }
    // if (!this.state.floorId) {
    //   this.showAlertDialog(string.vuiLongChonTang);
    //   return false;
    // }
    if (this.state.home) {
      const home = this.state.home;
      if (home.trim().length > 11) {
        this.showAlertDialog(string.soPhongMaxLength);
        return false;
      }
      if (!/^[a-z0-9\-\.]+$/gi.test(home.trim())) {
        this.showAlertDialog(string.soPhongInvalid);
        return false;
      }
      if (home.trim().toString() === "0" || /^0/gi.test(home.trim())) {
        this.showAlertDialog(string.soPhongPhaiKhacKhong);
        return false;
      }
      if (/(^(\.|-))|((\.|-)$)/gi.test(home.trim())) {
        this.showAlertDialog(string.soPhongInvalidStart);
        return false;
      }
      if (/[\.]{2,}|[\-]{2,}/gi.test(home.trim())) {
        this.showAlertDialog(string.soPhongInvalidMultiDot);
        return false;
      }
      if (/([\.|-]{2,})/gi.test(home.trim())) {
        this.showAlertDialog(string.soPhongInvalidDotHyphen);
        return false;
      }
    }
    return true;
  };

  closeProgressDialog = () => {
    this.setState({ dialogVisible: false });
  };

  themAnh = () => {
    if (this.props.navigation.state.params.showThemAnh) {
      ActionSheet.show(
        {
          options: [string.mayAnh, string.thuVien, string.dong],
          cancelButtonIndex: 2,
          title: string.chonAnh
        },
        this.chonImage
      );
    }
  };

  xoaAnh = () => {
    this.setState({ image: null });
  };

  chonImage = async index => {
    let image = null;
    if (index === 0) {
      this.setState({ dialogVisible: true });
      image = await this.launchCameraAsync();
    } else if (index === 1) {
      this.setState({ dialogVisible: true });
      image = await this.launchImageLibraryAsync();
    }
    if (image) {
      image = await this.resizeImage(image);
    }
    if (image) {
      // this.navigateToScreen(screenNames.CropImage, {
      //   image,
      //   ratio: name === "anhDaiDien" ? [1, 1] : [2, 1],
      //   reSize:
      //     name === "anhDaiDien"
      //       ? { width: 400, height: 400 }
      //       : { width: 1000, height: 500 },
      //   callBack: this.callBackImage.bind(this, name)
      // })();
      this.setState({
        dialogVisible: false,
        image: { ...image, isImagePicker: true }
      });
    } else {
      this.setState({ dialogVisible: false });
    }
  };

  render() {
    const { image } = this.state;
    const propsData = this.province;
    let view = this.renderView(propsData);
    if (view === null) {
      view = (
        <View
          style={{
            flex: 1,
            paddingTop: 5,
            paddingBottom: 15,
            backgroundColor: "white"
          }}
        >
          <Text style={styles.textLabel}> {string.chungCu} </Text>
          <TouchableOpacity onPress={() => this.showApartment()}>
            <View style={styles.viewWrap}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.input}>
                {this.state.apartmentName || string.chonChungCu}
              </Text>
              <Icon
                name="chevron-small-right"
                iconType="Entypo"
                style={styles.icon}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.textLabelLine} />
          <Text style={styles.textLabel}> {string.toaNha} </Text>
          <TouchableOpacity onPress={() => this.showBuilding()}>
            <View style={styles.viewWrap}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.input}>
                {this.state.buildingName || string.chonToaNha}
              </Text>
              <Icon
                name="chevron-small-right"
                iconType="Entypo"
                style={styles.icon}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.textLabelLine} />
          <Text style={styles.textLabel}> {string.tang} </Text>
          <TouchableOpacity onPress={() => this.showFloor()}>
            <View style={styles.viewWrap}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.input}>
                {this.state.floorName || string.chonTang}
              </Text>
              <Icon
                name="chevron-small-right"
                iconType="Entypo"
                style={styles.icon}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.textLabelLine} />
          <Text style={styles.textLabel}> {string.soPhong} </Text>
          <View style={styles.viewWrap}>
            <TextInput
              style={styles.inputContent}
              maxLength={50}
              placeholder={string.soPhongPlaceholder}
              placeholderTextColor="#A6A6A6"
              underlineColorAndroid="transparent"
              onChangeText={text => this.onChangeHome(text)}
              value={this.state.home}
            />
          </View>
          <View style={styles.textLabelLine} />
          {(this.props.navigation.state.params.showThemAnh || image) && (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10
                }}
              >
                <Text style={[styles.textLabel, { flex: 1, marginTop: 0 }]}>
                  {" "}
                  {string.anhChungThuc}{" "}
                </Text>
                {image &&
                  this.props.navigation.state.params.showThemAnh && (
                    <TouchableOpacity onPress={this.xoaAnh}>
                      <Icon
                        name="ios-close-circle"
                        iconType="Ionicons"
                        style={{
                          fontSize: 20,
                          color: colors.brandPrimary,
                          marginRight: 20
                        }}
                      />
                    </TouchableOpacity>
                  )}
              </View>
              <TouchableOpacity
                onPress={this.themAnh}
                style={{
                  marginHorizontal: 20,
                  marginVertical: 20,
                  alignItems: "center"
                }}
              >
                {image ? (
                  <Image
                    source={image}
                    style={{ width: "100%", height: 200 }}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      name="ios-add-circle-outline"
                      iconType="Ionicons"
                      style={{ fontSize: 25, color: colors.brandPrimary }}
                    />
                    <Text style={{ marginLeft: 10 }}>Thêm hình ảnh</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.textLabelLine} />
            </View>
          )}

          <View style={styles.buttonWrap}>
            <TouchableOpacity onPress={this.onSubmit}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>{string.luuThongTin}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          title={string.canHo}
          navigation={this.props.navigation}
        />
        <ScrollView showsVerticalScrollIndicator={false}>{view}</ScrollView>
        <ProgressDialog
          visible={this.state.dialogVisible}
          message={string.vuiLongCho}
          transparent={false}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  viewWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  icon: {
    fontSize: 25,
    color: "#c5c5c5",
    textAlignVertical: "center",
    paddingRight: 8
  },
  input: {
    lineHeight: 25,
    flex: 1,
    marginHorizontal: 10,
    textAlignVertical: "center",
    paddingHorizontal: 10,
    marginVertical: 10,
    fontSize: 15
  },
  inputContent: {
    height: 30,
    flex: 1,
    marginHorizontal: 10,
    textAlignVertical: "center",
    paddingHorizontal: 10,
    marginVertical: 10,
    fontSize: 15
  },
  buttonWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    height: 42,
    borderRadius: 5,
    paddingHorizontal: 50,
    backgroundColor: colors.brandPrimary
  },
  buttonText: {
    color: "#fff",
    fontSize: 15
  },
  textLabel: {
    marginTop: 10,
    marginLeft: 18,
    fontSize: 11,
    color: "gray"
  },
  textLabelLine: {
    backgroundColor: "#c5c5c5",
    height: 0.5,
    width: "100%"
  }
});

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  { dispatchParams },
  null,
  { withRef: true }
)(ThemCanHo);
