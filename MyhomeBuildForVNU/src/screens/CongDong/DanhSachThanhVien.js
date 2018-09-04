import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  BackHandler
} from "react-native";
import { connect } from "react-redux";
import { uniqBy } from "lodash";
import { Body, ListItem, Thumbnail, Text } from "native-base";

import AppComponent, { typeList } from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import colors from "../../config/colors";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { assets } from "../../../assets";

class DanhSachThanhVien extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      listAdmin: [],
      listMember: [],
      listApartment: [],
      apartmentId: undefined,
      apartmentName: ""
    };
    this.handleBackPress = this.handleBackPress.bind(this);
  }

  componentWillMount = () => {
    const { accountInfo } = this.props;
    let listApartment = _.uniqBy(accountInfo.home, "apartment_id");
    if (listApartment) {
      this.setState(
        {
          listApartment,
          apartmentId: listApartment[0].apartment_id,
          apartmentName: listApartment[0].apartment_name
        },
        this.getScreenData
      );
    }

    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  };

  /**
   * xử lý nút back android
   */
  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  getScreenData = () => {
    const { accountInfo } = this.props;
    const { apartmentId, page, pageSize } = this.state;
    let { listAdmin, listMember, propsData } = this.state;

    if (accountInfo && apartmentId) {
      this.getFromServerWithAccount(getApiUrl(API.DANH_SACH_THANH_VIEN), {
        apartment: apartmentId,
        page,
        page_size: pageSize
      }).then(response => {
        propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          if (!propsData.data.admin && !propsData.data.member) {
            propsData = undefined;
          } else {
            propsData.data.admin = propsData.data.admin
              ? propsData.data.admin.map(v => ({
                  ...v,
                  img: v.img ? API.HOST + v.img : " "
                }))
              : [];
            listAdmin = propsData.data.admin;

            propsData.data.member = propsData.data.member
              ? propsData.data.member.map(v => ({
                  ...v,
                  avatar: v.avatar ? v.avatar : " "
                }))
              : [];
            listMember =
              page === 1
                ? propsData.data.member
                : [...this.state.listMember, ...propsData.data.member];
          }
        } else if (propsData.status !== 0 && !propsData.networkError) {
          this.showAlertDialog(propsData.message);
        }

        this.setState({
          refreshing: false,
          isLoading: false,
          propsData,
          listAdmin,
          listMember
        });
      });
    }
  };

  selectApartment = (id, name) => {
    this.setState({ apartmentId: id, apartmentName: name }, this.refreshScreen);
  };

  renderApartment = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          this.selectApartment(item.apartment_id, item.apartment_name)
        }
      >
        <View style={{ width: 80 }}>
          <View overflow="hidden" style={styles.viewImage}>
            <Image
              style={[styles.image, { position: "absolute" }]}
              source={assets.congDongDefault}
            />
            <Image
              style={styles.image}
              source={{
                uri: item.apartment_image || undefined
              }}
            />
          </View>
          <Text style={styles.apartmentName} numberOfLines={1}>
            {item.apartment_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderMember = ({ item }) => {
    return (
      <ListItem avatar style={styles.listItem}>
        <Thumbnail
          small
          source={assets.avatarDefault}
          style={[styles.thumbnail, { position: "absolute", marginLeft: 10 }]}
        />
        <Thumbnail
          small
          source={{ uri: item.avatar }}
          style={styles.thumbnail}
        />
        <Body style={styles.bodyItem}>
          <Text>{item.fullname}</Text>
        </Body>
      </ListItem>
    );
  };

  renderAdmin = ({ item }) => {
    return (
      <ListItem avatar style={styles.listItem}>
        <Thumbnail
          small
          source={assets.avatarDefault}
          style={[styles.thumbnail, { position: "absolute", marginLeft: 10 }]}
        />
        <Thumbnail small source={{ uri: item.img }} style={styles.thumbnail} />
        <Body style={styles.bodyItem}>
          <Text>{item.fullname}</Text>
          <Text note>{item.type}</Text>
        </Body>
      </ListItem>
    );
  };

  onEndReached = () => {
    if (this.state.propsData) {
      const { data } = this.state.propsData;
      if (data && data.member && data.member.length >= this.state.pageSize) {
        this.setState({ page: this.state.page + 1 }, this.getScreenData);
      }
    }
  };

  renderFooter = propsData => {
    if (propsData) {
      const { status, data } = propsData;
      if (status === 1 && data.member.length >= this.state.pageSize) {
        return (
          <View
            style={{ padding: 5, backgroundColor: colors.windowBackground }}
          >
            <ActivityIndicator
              size="small"
              color={colors.footerProgressColor}
            />
          </View>
        );
      } else if (
        status === 1 &&
        data.member.length < this.state.pageSize &&
        this.state.page > 1
      ) {
        return (
          <View
            style={{
              marginBottom: 0,
              marginTop: 0,
              backgroundColor: colors.windowBackground
            }}
          >
            <Text note style={{ textAlign: "center" }}>
              {/*{config.strings.noMoreData}*/}
            </Text>
          </View>
        );
      }
      return this.renderView(propsData);
    }
  };

  render() {
    const {
      propsData,
      listAdmin,
      listMember,
      refreshing,
      listApartment,
      apartmentName,
      page
    } = this.state;

    let listApartmentView;
    if (listApartment && listApartment.length > 1) {
      listApartmentView = (
        <View style={styles.viewListApartment}>
          <Text>
            {string.congDong + ": "}
            {apartmentName && (
              <Text style={{ fontWeight: "bold" }}>{apartmentName}</Text>
            )}
          </Text>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            style={styles.listApartment}
            data={listApartment}
            renderItem={this.renderApartment}
            keyExtractor={item => item.apartment_id.toString()}
          />
        </View>
      );
    }

    let listAdminView;
    if (listAdmin && listAdmin.length) {
      listAdminView = (
        <FlatList
          data={listAdmin}
          renderItem={this.renderAdmin}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={
            <ListItem itemDivider style={styles.itemDivider}>
              <Text>{string.quanTriVien}</Text>
            </ListItem>
          }
        />
      );
    }

    let listMemberView;
    if (listMember && listMember.length) {
      listMemberView = (
        <FlatList
          data={listMember}
          renderItem={this.renderMember}
          keyExtractor={item => item.id.toString()}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <ListItem itemDivider style={styles.itemDivider}>
              <Text>{string.cuDan}</Text>
            </ListItem>
          }
          ListFooterComponent={this.renderFooter(propsData)}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    let contentView;
    if (page === 1)
      contentView = this.renderView(propsData, typeList.THANHVIEN);
    if (!contentView) {
      contentView = (
        <View>
          {listAdminView}

          {listMemberView}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <AppHeader
          left
          title={string.thanhVien}
          navigation={this.props.navigation}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.refreshScreen}
            />
          }
        >
          {listApartmentView}

          {contentView}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.windowBackground
  },
  viewListApartment: {
    padding: 10,
    marginBottom: 1,
    backgroundColor: "#fff"
  },
  listApartment: {
    marginTop: 5
  },
  viewImage: {
    height: 60,
    width: 60,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    height: 52,
    width: 52,
    borderRadius: 26
  },
  apartmentName: {
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 10,
    textAlign: "center"
  },
  itemDivider: {
    backgroundColor: colors.windowBackground
  },
  listItem: {
    backgroundColor: "#fff",
    marginLeft: 0,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.windowBackground
  },
  bodyItem: {
    borderBottomWidth: 0
  },
  thumbnail: {
    marginVertical: 10
  },
  tabUnderline: {
    backgroundColor: colors.brandPrimary,
    height: 1
  },
  tabContainer: {
    height: 40,
    elevation: 0
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  DanhSachThanhVien
);
