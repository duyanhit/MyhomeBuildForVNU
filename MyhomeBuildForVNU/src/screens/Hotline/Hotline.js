import React from "react";
import {
  View,
  Text,
  Container,
  ListItem,
  Icon,
  Body,
  Right,
  Button,
  Picker,
  Header,
  Left,
  Title
} from "native-base";
import { FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { uniqBy } from "lodash";

import AppComponent, { typeList } from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import colors from "../../config/colors";

class Hotline extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      apartment: 0,
      data: []
    };
  }

  componentWillMount = () => {
    const countHome = this.countHome();
    if (countHome > 0) {
      this.getScreenData();
    }
  };

  getScreenData = () => {
    const { accountInfo } = this.props;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.HOTLINE), {
        apartment: this.state.apartment
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        let { data } = this.state;
        if (propsData.status === 1) {
          data = propsData.data;
        } else if (propsData.status !== 0 && !propsData.networkError) {
          this.showAlertDialog(propsData.message);
        }

        this.setState({
          isLoading: false,
          refreshing: false,
          apartment: this.state.apartment,
          propsData,
          data
        });
      });
    }
  };

  renderSubItem = ({ item }) => {
    return (
      <ListItem avatar>
        <Icon name={"ios-contact-outline"} />
        <Body>
          <Text numberOfLines={1}>{item.fullname}</Text>
          <Text numberOfLines={1}>{item.phone}</Text>
          <Text numberOfLines={2} note>
            {item.description}
          </Text>
        </Body>
        <Right style={{ justifyContent: "center" }}>
          <Button transparent onPress={() => this.callPhone(item.phone)}>
            <Icon name={"ios-call"} />
          </Button>
        </Right>
      </ListItem>
    );
  };

  renderItem = ({ item }) => {
    return (
      <View>
        <ListItem itemDivider>
          <Text numberOfLines={1} style={{ fontWeight: "bold" }}>
            {item.name} - {item.apartment_name}
          </Text>
        </ListItem>
        <FlatList
          style={{ backgroundColor: "#fff" }}
          scrollEnable={false}
          data={item.data}
          renderItem={this.renderSubItem}
          keyExtractor={(itm, idx) => idx.toString()}
        />
      </View>
    );
  };

  /**
   * chọn tòa nhà
   * @param value
   */
  onApartmentSelect = value => {
    this.setState(
      {
        apartment: value,
        page: 1
      },
      this.refreshScreen
    );
  };

  render() {
    const { data, page, propsData, isShowFilter } = this.state;
    const { accountInfo } = this.props;
    const countHome = this.countHome();
    let contentView = null;

    if (countHome === 0) {
      contentView = this.noValidHome();
    } else if (page === 1) {
      contentView = this.renderView(propsData, typeList.HOTLINE);
    }

    if (!contentView) {
      contentView = (
        <FlatList
          data={data}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
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
                    {string.chonChungCu}
                  </Title>
                </Body>
                <Right />
              </Header>
            )}
            iosIcon={<Icon name="ios-arrow-down-outline" />}
            iosHeader={string.chonChungCu}
            selectedValue={this.state.apartment}
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
      </View>
    );

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          title={string.hotline}
          navigation={this.props.navigation}
          rightButtons={rightButtons}
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
  Hotline
);
