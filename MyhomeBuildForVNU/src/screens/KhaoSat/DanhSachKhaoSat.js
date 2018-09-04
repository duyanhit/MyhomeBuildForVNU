import React from "react";
import {
  View,
  Container,
  Picker,
  Icon,
  Header,
  Left,
  Body,
  Title,
  Right,
  Text
} from "native-base";
import { connect } from "react-redux";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  BackHandler
} from "react-native";
import _ from "lodash";

import AppComponent, { typeList } from "../../../core/components/AppComponent";
import { API, getApiUrl } from "../../config/server";
import string from "../../config/string";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import InAppHeader from "../../component/InAppHeader";
import InAppProgress from "../../component/InAppProgress";
import InAppItem from "../../component/InAppItem";
import { screenNames } from "../../config/screen";
import colors from "../../config/colors";

class DanhSachKhaoSat extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      homeId: 0,
      data: []
    };
    this.arrTemp = [];
  }

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
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.DS_KHAO_SAT), {
        home_id: this.state.homeId,
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

  renderItem = ({ item, index }) => {
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
        icon={"ios-list-box"}
        sent={true}
        api={API.XOA_KHAO_SAT}
        message={string.xoaKhaoSatDaChon}
      />
    );
  };

  /**
   * sang màn hình chi tiết khảo sát
   * @param item
   */
  toChiTietScreen = item => {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    this.navigateToScreen(screenNames.ChiTietKhaoSat, {
      id: item.id,
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
    const { data, propsData, page, isShowFilter } = this.state;
    const { accountInfo } = this.props;
    const countHome = this.countHome();
    let contentView = null;

    if (countHome === 0) {
      contentView = this.noValidHome();
    } else if (page === 1) {
      contentView = this.renderView(propsData, typeList.KHAOSAT);
    }

    if (!contentView) {
      contentView = (
        <FlatList
          style={styles.flatList}
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={this.renderItem}
          refreshing={this.state.refreshing}
          onRefresh={() => {
            this.onUncheck();
            this.refreshScreen();
          }}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={this.renderFooter(propsData)}
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
          navigation={this.props.navigation}
          cancelMultiSelect={this.onUncheck}
          deleteMultiItem={this.deleteMultiItem}
          showFilter={this.showFilter}
          title={string.khaoSat}
          api={API.XOA_KHAO_SAT}
          message={string.xoaCacKhaoSatDaChon}
        />

        <InAppProgress self={self => (this.myProgress = self)} />

        {filterView}

        {contentView}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  flatList: {},
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
  DanhSachKhaoSat
);
