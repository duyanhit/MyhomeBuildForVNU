import React from "react";
import {
  BackHandler,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";
import {
  Container,
  Fab,
  Icon,
  View,
  Picker,
  ListItem,
  Header,
  Left,
  Body,
  Title,
  Right,
  Text
} from "native-base";

import AppComponent, { typeList } from "../../../core/components/AppComponent";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { API, getApiUrl } from "../../config/server";
import colors from "../../../core/config/colors";
import { screenNames } from "../../config/screen";
import string from "../../config/string";
import InAppHeader from "../../component/InAppHeader";
import InAppProgress from "../../component/InAppProgress";
import InAppItem from "../../component/InAppItem";

class DanhSachGopY extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      mType: "0",
      mIsRead: "0",
      homeId: 0,
      data: []
    };
    this.arrTemp = [];
  }

  NumberOnEndReachedThreshold = 0.3;

  componentWillMount = () => {
    const countHome = this.countHome();
    if (countHome > 0) {
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

  getScreenData = () => {
    const { accountInfo } = this.props;
    const { page, pageSize, data, homeId } = this.state;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.DS_GOP_Y), {
        page: page,
        page_size: pageSize,
        home_id: homeId
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        let { data } = this.state;
        if (propsData.status === 1) {
          data =
            this.state.page === 1
              ? [...propsData.data, { id: "-1" }]
              : [...this.state.data, ...propsData.data, { id: "-1" }];
        } else if (propsData.status !== 0 && !propsData.networkError) {
          this.showAlertDialog(propsData.message);
        }

        this.setState({
          refreshing: false,
          isLoading: false,
          propsData,
          data
        });
      });
    }
  };

  renderItem = ({ item, index }) => {
    if (item.id > 0) {
      return (
        <InAppItem
          item={item}
          index={index}
          onSelect={this.onSelect}
          navigation={this.props.navigation}
          showConfirmDialog={(id, i, self, api, message) =>
            this.showConfirmDialog(id, i, self, api, message)
          }
          onPress={this.toChiTietScreen}
          icon={"ios-chatboxes"}
          api={API.XOA_GOP_Y}
          gopy={true}
          status={true}
          time={item.time}
          message={string.xoaGopYDaChon}
        />
      );
    } else if (item.id === "-1") {
      return <ListItem style={styles.fixLastItem} />;
    }
  };

  /**
   * sang màn hình chi tiết góp ý
   * @param item
   */
  toChiTietScreen = item => {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    this.navigateToScreen(screenNames.ChiTietGopY, {
      id: item.id,
      item: item,
      onGoBack: () => {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
      },
      myCallback: () => {
        this.onUncheck();
        this.refreshScreen();
      }
    })();
  };

  /**
   * chọn căn hộ
   * @param value
   */
  onHomeSelect = value => {
    this.setState(
      {
        homeId: value,
        page: 1
      },
      this.refreshScreen
    );
  };

  render() {
    const { data, page, propsData, refreshing, isShowFilter } = this.state;
    const { navigation, accountInfo } = this.props;
    const countHome = this.countHome();
    let contentView = null;

    if (countHome === 0) {
      contentView = this.noValidHome();
    } else if (page === 1) {
      contentView = this.renderView(propsData, typeList.GOPY);
    }

    if (!contentView) {
      contentView = (
        <FlatList
          refreshing={refreshing}
          onRefresh={() => {
            this.onUncheck();
            this.refreshScreen();
          }}
          onEndReachedThreshold={this.NumberOnEndReachedThreshold}
          onEndReached={this.onEndReached}
          data={data}
          ListFooterComponent={this.renderFooter(propsData)}
          renderItem={this.renderItem}
          keyExtractor={item => item.id.toString()}
        />
      );
    }

    let listHome = [
      {
        resident_home_id: 0,
        home_name: string.tatCaCanHo,
        valid: "1"
      },
      ...accountInfo.home
    ];

    listHome = _.remove(listHome, item => {
      return item.valid !== "0";
    });

    const filterView = isShowFilter && (
      <View style={styles.picker}>
        <TouchableOpacity style={styles.touchPicker}>
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
                    {string.chonCanHo}
                  </Title>
                </Body>
                <Right />
              </Header>
            )}
            iosIcon={<Icon name="ios-arrow-down-outline" />}
            iosHeader={string.chonCanHo}
            selectedValue={this.state.homeId}
            onValueChange={this.onHomeSelect}
          >
            {listHome.map(item => {
              return (
                <Picker.Item
                  key={item.resident_home_id}
                  label={
                    item.resident_home_id !== 0
                      ? item.home_name + " - " + item.apartment_building_name
                      : item.home_name
                  }
                  value={item.resident_home_id}
                />
              );
            })}
          </Picker>
        </TouchableOpacity>
      </View>
    );

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <InAppHeader
          self={self => (this.myHeader = self)}
          navigation={navigation}
          cancelMultiSelect={this.onUncheck}
          deleteMultiItem={this.deleteMultiItem}
          showFilter={this.showFilter}
          title={string.gopY}
          api={API.XOA_GOP_Y}
          message={string.xoaCacGopYDaChon}
        />

        <InAppProgress self={self => (this.myProgress = self)} />

        {filterView}

        {contentView}

        {countHome > 0 && (
          <Fab
            style={styles.fabView}
            position="bottomRight"
            onPress={this.navigateToScreen(screenNames.GuiGopY, {
              onGoBack: () =>
                BackHandler.addEventListener(
                  "hardwareBackPress",
                  this.handleBackPress
                ),
              myCallback: () => {
                this.onUncheck();
                this.refreshScreen();
              }
            })}
          >
            <Icon name="ios-add-outline" />
          </Fab>
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  modalOverBackground: {
    backgroundColor: "#0004",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalBackground: {
    width: "100%",
    backgroundColor: "#fff"
  },
  btnKhan: {
    textAlign: "center",
    width: 50,
    padding: 3,
    color: colors.brandPrimary,
    fontSize: 9,
    borderColor: colors.brandPrimary,
    borderWidth: 0.5
  },
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
    margin: 10,
    borderColor: "gray",
    borderWidth: 0.8,
    borderRadius: 8,
    flex: 1
  },
  filter: {
    height: 40,
    width: "100%"
  },
  contentView: {
    flex: 1
  },
  fabView: {
    backgroundColor: colors.brandPrimary
  },
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
  fixLastItem: {
    height: 90,
    marginLeft: 0,
    backgroundColor: "transparent",
    borderBottomWidth: 0
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

const mapStateToProps = state => ({ accountInfo: state.accountReducer });

export default connect(mapStateToProps)(DanhSachGopY);
