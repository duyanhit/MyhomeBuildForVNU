import React from "react";
import {
  View,
  Text,
  Container,
  Picker,
  ListItem,
  Body,
  Icon,
  Header,
  Left,
  Title,
  Right
} from "native-base";
import {
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  BackHandler,
  Image
} from "react-native";
import { connect } from "react-redux";
import { uniqBy, remove } from "lodash";

import AppComponent, { typeList } from "../../../core/components/AppComponent";
import { API, getApiUrl } from "../../config/server";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { screenNames } from "../../config/screen";
import { assets } from "../../../assets";
import colors from "../../config/colors";

class DanhSachSoTay extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      category: null,
      apartment: 0,
      listCategory: [],
      selectApartment: false,
      haveApartment: false,
      data: []
    };
  }

  componentWillMount = () => {
    const countHome = this.countHome();
    if (countHome > 0) {
      this.getCategory();
      this.getScreenData();
    }
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  handleBackPress = () => {
    this.props.navigation.navigate(screenNames.Main);
    return true;
  };

  /**
   * get danh mục sổ tay
   */
  getCategory = () => {
    const { accountInfo } = this.props;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.SO_TAY_DAN_CU_DANH_MUC), {
        id: this.state.apartment
      }).then(response => {
        this.setState({
          listCategory: [
            {
              id: 0,
              name: string.tatCaDanhMuc,
              image: ""
            },
            ...response.data
          ],
          category: 0
        });
      });
    }
  };

  getScreenData = () => {
    const { accountInfo } = this.props;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.SO_TAY_DAN_CU_DANH_SACH), {
        apartment: this.state.apartment,
        category: this.state.category,
        page: this.state.page,
        page_size: this.state.pageSize
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        let { data } = this.state;
        if (propsData.status === 1) {
          data =
            this.state.page === 1
              ? propsData.data
              : [...this.state.data, ...propsData.data];
        } else if (propsData.status !== 0 && !propsData.networkError) {
          this.showAlertDialog(propsData.message);
        }

        this.setState({
          isLoading: false,
          refreshing: false,
          propsData,
          data
        });
      });
    }
  };

  renderItem = ({ item }) => {
    const { listCategory } = this.state;
    let avatar = API.HOST;
    listCategory.forEach(v => {
      if (item.category_name === v.name) {
        avatar += v.image;
      }
    });

    return (
      <ListItem
        style={{ backgroundColor: "#fff", marginLeft: 0, paddingLeft: 15 }}
        avatar
        button
        onPress={() => {
          BackHandler.removeEventListener(
            "hardwareBackPress",
            this.handleBackPress
          );
          this.navigateToScreen(screenNames.ChiTietSoTay, {
            id: item.id,
            title: item.name,
            onGoBack: () => {
              BackHandler.addEventListener(
                "hardwareBackPress",
                this.handleBackPress
              );
            }
          })();
        }}
      >
        <Icon name="ios-book" style={styles.avatarDefault} />
        <Image
          source={avatar ? { uri: avatar } : assets.imagedefault}
          style={styles.avatar}
        />
        <Body>
          <Text numberOfLines={1}>{item.name}</Text>
          <Text numberOfLines={1} note>
            {item.category_name}
          </Text>
        </Body>
      </ListItem>
    );
  };

  /**
   * chọn tòa nhà
   * @param value
   */
  onApartmentSelect = value => {
    if (value === 0) {
      this.setState(
        {
          apartment: value,
          category: 0,
          page: 1,
          selectApartment: false,
          haveApartment: false
        },
        this.getCategory
      );
    } else {
      this.setState(
        {
          apartment: value,
          page: 1,
          selectApartment: true,
          haveApartment: true
        },
        this.getCategory
      );
    }
    this.refreshScreen();
  };

  /**
   * chọn danh mục sổ tay
   * @param value
   */
  onCategorySelect = value => {
    this.setState({ category: value, page: 1 }, this.refreshScreen);
  };

  showAlert = () => {
    Alert.alert(string.thongBao, string.banHayChonChungCu);
  };

  render() {
    const {
      data,
      page,
      propsData,
      listCategory,
      isShowFilter,
      apartment,
      category,
      selectApartment,
      haveApartment
    } = this.state;
    const { accountInfo } = this.props;

    const countHome = this.countHome();
    let contentView = null;

    if (countHome === 0) {
      contentView = this.noValidHome();
    } else if (page === 1) {
      contentView = this.renderView(propsData, typeList.SOTAY);
    }

    if (!contentView) {
      contentView = (
        <FlatList
          style={styles.flatList}
          data={data}
          renderItem={this.renderItem}
          keyExtractor={item => item.id.toString()}
          refreshing={this.state.refreshing}
          onRefresh={this.refreshScreen}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={this.renderFooter(propsData)}
        />
      );
    }

    let listApartment = [
      {
        apartment_id: 0,
        apartment_name: string.tatCaChungCu,
        valid: "1"
      },
      ...accountInfo.home
    ];
    listApartment = _.uniqBy(listApartment, "apartment_id");
    listApartment = _.remove(listApartment, item => {
      return item.valid !== "0";
    });
    const countApartment = listApartment.length;

    const rightButtons = [
      countApartment > 2
        ? {
            icon: "filter-list",
            iconType: "MaterialIcons",
            onPress: () => this.showFilter()
          }
        : {}
    ];

    const filterView = isShowFilter && (
      <View style={styles.picker}>
        <TouchableOpacity
          style={[styles.touchPicker, { marginLeft: 10, marginRight: 5 }]}
        >
          {Platform.OS === "ios" ? (
            <Icon name="md-arrow-dropdown" style={[styles.pickerIcon]} />
          ) : null}
          <Picker
            style={styles.filter}
            mode="dialog"
            renderHeader={backAction => (
              <Header style={styles.headerPicker}>
                <Left>
                  <TouchableOpacity
                    onPress={backAction}
                    style={styles.backPicker}
                  >
                    <Text style={styles.textBack}>{string.quayLai}</Text>
                  </TouchableOpacity>
                </Left>
                <Body>
                  <Title style={{ color: colors.textHeader }}>
                    {string.chonChungCu}
                  </Title>
                </Body>
                <Right />
              </Header>
            )}
            iosHeader={string.chonChungCu}
            selectedValue={apartment}
            onValueChange={this.onApartmentSelect}
          >
            {listApartment.map(item => {
              return (
                <Picker.Item
                  key={item.apartment_id}
                  label={item.apartment_name}
                  value={item.apartment_id}
                />
              );
            })}
          </Picker>
        </TouchableOpacity>

        {haveApartment ? (
          <TouchableOpacity
            style={[
              styles.touchPicker,
              { marginLeft: 5, marginRight: 10, paddingRight: 5 }
            ]}
          >
            {Platform.OS === "ios" ? (
              <Icon name="md-arrow-dropdown" style={[styles.pickerIcon]} />
            ) : null}
            <Picker
              style={styles.filter}
              mode="dialog"
              renderHeader={backAction => (
                <Header style={styles.headerPicker}>
                  <Left>
                    <TouchableOpacity
                      onPress={backAction}
                      style={styles.backPicker}
                    >
                      <Text style={styles.textBack}>{string.quayLai}</Text>
                    </TouchableOpacity>
                  </Left>
                  <Body>
                    <Title>{string.chonChungCu}</Title>
                  </Body>
                  <Right />
                </Header>
              )}
              iosHeader={string.chonDanhMuc}
              selectedValue={category}
              onValueChange={this.onCategorySelect}
              enabled={selectApartment}
            >
              {listCategory.map(item => {
                return (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={item.id}
                  />
                );
              })}
            </Picker>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.fixPicker} onPress={this.showAlert}>
            <Text>{string.tatCaDanhMuc}</Text>
            <Icon
              name="md-arrow-dropdown"
              style={[styles.pickerIcon, { paddingRight: 10, paddingLeft: 20 }]}
            />
          </TouchableOpacity>
        )}
      </View>
    );

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          title={string.soTayDanCu}
          navigation={this.props.navigation}
          rightButtons={rightButtons}
          onPressBackButton={() =>
            this.props.navigation.navigate(screenNames.Main)
          }
        />

        {filterView}

        {contentView}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  picker: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#DCDCDC",
    borderBottomWidth: 0.5,
    flexDirection: "row"
  },
  touchPicker: {
    height: 40,
    marginVertical: 10,
    borderColor: "gray",
    borderWidth: 0.8,
    borderRadius: 8,
    flex: 1
  },
  filter: {
    height: 40,
    width: "100%"
  },
  flatList: {},
  pickerIcon: {
    backgroundColor: "transparent",
    right: 5,
    marginLeft: 0,
    flex: 1,
    position: "absolute",
    top: 10,
    zIndex: 1000,
    color: "#012552",
    fontSize: 20
  },
  avatarDefault: {
    position: "absolute",
    marginLeft: 25,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 30,
    color: "gray"
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    marginRight: 5
  },
  viewCategory: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "green"
  },
  fixPicker: {
    height: 40,
    marginVertical: 10,
    borderColor: "gray",
    borderWidth: 0.8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    marginRight: 10,
    justifyContent: "center",
    paddingLeft: 20
  },
  headerPicker: {
    borderBottomWidth: 0.8,
    borderBottomColor: colors.windowBackground
  },
  backPicker: {
    paddingHorizontal: 5,
    paddingVertical: 10
  },
  textBack: {
    color: colors.textHeader
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  DanhSachSoTay
);
