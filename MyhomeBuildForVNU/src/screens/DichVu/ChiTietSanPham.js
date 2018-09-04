import React from "react";
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Container, Icon, Text } from "native-base";
import { connect } from "react-redux";
import Swiper from "react-native-swiper";
import Stars from "react-native-stars";
import Moment from "moment";

import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import strings from "../../config/string";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import ViewMoreText from "../../component/ViewMoreText";
import { moneyFormat } from "../../../core/helpers/numberHelper";
import { assets } from "../../../assets";
import metrics from "../../../core/config/metrics";
import ShowImageView from "../../component/ShowImageView";
import ItemSanPham from "./ItemSanPham";
import colors from "../../config/colors";
import { screenNames } from "../../config/screen";
import DatHang from "./DatHang";
import config from "../../../core/config";

const width = metrics.DEVICE_WIDTH / 2.5;

class ChiTietSanPham extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      data: null,
      id: this.props.navigation.state.params.id,
      showImage: false,
      page: 0,
      modalVisible: false
    };
  }

  componentWillMount = () => {
    const { id } = this.state;
    this.getScreenData(id);
  };

  getScreenData = id => {
    let { data } = this.state;
    let images, product, dataProductOther, dataProductCategory;
    this.setState({ isLoading: true });
    this.getFromServerWithAccount(getApiUrl(API.CHI_TIET_SAN_PHAM), {
      id: id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        data = propsData.data;
        product = data.product;

        images = product.image
          ? JSON.parse(product.image).map(value => `${API.HOST}${value}`)
          : [];

        product = { ...product, image: images };

        dataProductOther = data.product_other.map(value => ({
          ...value,
          image: value.image ? API.HOST + JSON.parse(value.image)[0] : null
        }));

        dataProductCategory = data.product_category.map(value => ({
          ...value,
          image: value.image ? API.HOST + JSON.parse(value.image)[0] : null
        }));

        data = { ...data, product: product };

        if (dataProductOther.length === 10) {
          dataProductOther = [
            ...dataProductOther,
            { id: "", isCategory: false }
          ];
        } else {
          dataProductOther = [...dataProductOther];
        }

        if (dataProductCategory.length === 10) {
          dataProductCategory = [
            ...dataProductCategory,
            { id: "", isCategory: true }
          ];
        } else {
          dataProductCategory = [...dataProductCategory];
        }
      } else if (propsData.status !== 0 && !propsData.networkError) {
        this.showAlertDialog(propsData.message);
      }

      this.setState({
        isLoading: false,
        data,
        propsData,
        dataProductOther,
        dataProductCategory
      });
    });
  };

  showModalImage = (state, index) => {
    if (Platform.OS === "ios") StatusBar.setHidden(state, "slide");
    this.setState({ showImage: state, page: index });
  };

  renderItemMore = ({ item, index }) => {
    const { navigation } = this.props;
    const { data } = this.state;
    return (
      <View style={styles.itemView}>
        {item.id !== "" ? (
          <ItemSanPham
            item={item}
            index={index}
            navigation={navigation}
            horizontal={true}
          />
        ) : (
          <TouchableOpacity
            onPress={
              item.isCategory
                ? this.navigateToScreen(
                    screenNames.DanhSachSanPhamTrongDanhMuc,
                    {
                      id: data.product.product_category_id,
                      title: data.product.product_category_name
                    },
                    true
                  )
                : this.navigateToScreen(
                    screenNames.ChiTietGianHang,
                    { id: data.product.store_id },
                    true
                  )
            }
          >
            <View style={styles.itemMore}>
              <Icon name="ios-arrow-dropright" style={styles.iconViewMore} />
              <Text style={styles.textViewMore}>{strings.xemThem}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  renderItemLess = ({ item, index }) => {
    const { navigation } = this.props;
    return (
      <View style={styles.itemView}>
        <ItemSanPham
          item={item}
          index={index}
          navigation={navigation}
          horizontal={true}
        />
      </View>
    );
  };

  onOpenModal = () => {
    this.setState({ modalVisible: true });
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false });
  };

  openLoading = () => {
    this.setState({ isLoading: true });
  };

  hideLoading = () => {
    this.setState({ isLoading: false });
  };

  render() {
    const { navigation } = this.props;
    const {
      propsData,
      data,
      showImage,
      page,
      dataProductOther,
      dataProductCategory,
      modalVisible
    } = this.state;

    let viewMain = this.renderView(propsData);
    let viewDescription;
    let viewSwiperImages;
    let image;
    let viewBuy;

    if (viewMain === null && data) {
      const { product } = data;
      image = product.image;

      if (product.store_valid === "1" && product.valid === "1") {
        viewBuy = (
          <View style={styles.viewFooter}>
            <TouchableOpacity onPress={this.onOpenModal}>
              <View
                style={[config.styles.button.xacNhan, { flexDirection: "row" }]}
              >
                <Icon name="ios-cart" type="Ionicons" style={styles.iconBuy} />
                <Text style={config.styles.text.btnConfirmText}>
                  {strings.datHang}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      }

      viewDescription = (
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
          <Text style={styles.textContent}>{product.description}</Text>
        </ViewMoreText>
      );

      viewSwiperImages = (
        <View style={[styles.images, { backgroundColor: "white" }]}>
          <Swiper
            ref="swiper"
            loadMinimal={true}
            loadMinimalSize={5}
            showsButtons={false}
            showsPagination={true}
            loop={false}
            containerStyle={styles.wrapper}
            activeDotColor={"#ed6b00"}
          >
            {image &&
              image.map((value, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={this.showModalImage.bind(this, true, index)}
                  >
                    <View style={[styles.images, { padding: 10 }]}>
                      <Image
                        source={{ uri: value }}
                        resizeMode="contain"
                        style={styles.imageDetail}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
          </Swiper>
        </View>
      );

      viewMain = (
        <View style={styles.viewMain}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {viewSwiperImages}

            <View style={styles.viewNamePrice}>
              <View>
                <Text style={{ fontSize: 16 }}>{product.name}</Text>
              </View>

              <View style={styles.viewPrice}>
                <Text style={[config.styles.text.priceText, { fontSize: 20 }]}>
                  {moneyFormat(Number(product.price))}
                </Text>
                <View style={styles.viewProductStars}>
                  <Stars
                    value={Number(product.star)}
                    count={5}
                    spacing={3}
                    starSize={15}
                    emptyStar={assets.starEmpty}
                    halfStar={assets.starHalf}
                    fullStar={assets.starFull}
                  />
                  {product.total_rate !== "0" ? (
                    <Text style={styles.totalRate}>
                      {" "}
                      ({product.total_rate})
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.fixHeight}>
              <View style={styles.viewTitle}>
                <Text style={styles.textName}>{strings.chiTiet}</Text>
              </View>
              <View style={styles.viewContent}>{viewDescription}</View>
            </View>

            {dataProductOther && dataProductOther.length > 0 ? (
              <View
                style={[styles.fixHeight, { backgroundColor: "transparent" }]}
              >
                <View style={styles.viewTitle}>
                  <Text style={styles.textName} numberOfLines={1}>
                    {strings.cungNguoiBan}
                  </Text>
                </View>
              </View>
            ) : null}

            {dataProductOther && dataProductOther.length > 0 ? (
              <FlatList
                data={dataProductOther}
                renderItem={
                  dataProductOther.length === 11
                    ? this.renderItemMore
                    : this.renderItemLess
                }
                keyExtractor={item => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            ) : null}

            {dataProductCategory && dataProductCategory.length > 0 ? (
              <View
                style={[styles.fixHeight, { backgroundColor: "transparent" }]}
              >
                <View style={styles.viewTitle}>
                  <Text style={styles.textName} numberOfLines={1}>
                    {strings.cungLoai}
                  </Text>
                </View>
              </View>
            ) : null}

            {dataProductCategory && dataProductCategory.length > 0 ? (
              <FlatList
                data={dataProductCategory}
                renderItem={
                  dataProductCategory.length === 11
                    ? this.renderItemMore
                    : this.renderItemLess
                }
                keyExtractor={item => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            ) : null}

            <View style={styles.fixHeight}>
              <View style={styles.viewContent}>
                <View style={styles.viewStore}>
                  <Image
                    source={assets.shopDefault}
                    style={[styles.storeAvatar, { position: "absolute" }]}
                  />
                  <Image
                    source={{ uri: `${API.HOST}${product.store_image}` }}
                    style={styles.storeAvatar}
                  />

                  <View style={styles.viewStoreName}>
                    <Text style={[styles.textName, { fontWeight: "300" }]}>
                      {product.store_name}
                    </Text>
                  </View>

                  <View style={styles.buttonViewStore}>
                    <TouchableOpacity
                      onPress={this.navigateToScreen(
                        screenNames.ChiTietGianHang,
                        { id: product.store_id },
                        true
                      )}
                    >
                      <Text style={styles.textViewStore}>
                        {strings.xemGianHang}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.viewInfoStore}>
                  <Stars
                    value={Number(product.store_star)}
                    count={5}
                    spacing={3}
                    starSize={15}
                    emptyStar={assets.starEmpty}
                    halfStar={assets.starHalf}
                    fullStar={assets.starFull}
                  />
                  {product.store_total_rate !== "0" ? (
                    <Text style={styles.totalRate}>
                      {" "}
                      ({product.store_total_rate})
                    </Text>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.viewInfoStore,
                    { justifyContent: "space-between" }
                  ]}
                >
                  <Text style={styles.textStore}>{strings.ngayThamGia}</Text>
                  <Text style={{ fontSize: 12 }}>
                    {Moment(product.store_create_at).format("DD/MM/YYYY")}
                  </Text>
                </View>
                <View style={styles.viewStoreDescription}>
                  <Text style={styles.textStore}>{strings.gioiThieu}</Text>
                </View>
                <View style={styles.viewStoreDescription}>
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
                    <Text style={styles.textContent}>
                      {product.store_description}
                    </Text>
                  </ViewMoreText>
                </View>
              </View>
            </View>
          </ScrollView>

          {viewBuy}
        </View>
      );
    }
    return (
      <Container style={styles.container}>
        <AppHeader
          left
          title={strings.chiTietSanPham}
          navigation={navigation}
        />

        {viewMain}

        <ShowImageView
          showGallery={showImage}
          onRequestClose={this.showModalImage.bind(this, false, 0)}
          onClosePress={this.showModalImage.bind(this, false, 0)}
          initPage={page}
          image={image}
        />

        <DatHang
          product={data && data.product}
          visible={modalVisible}
          onClose={this.onCloseModal}
          navigation={navigation}
          openLoading={this.openLoading}
          hideLoading={this.hideLoading}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.windowBackground },
  viewMain: {
    flex: 1,
    backgroundColor: "white"
  },
  viewPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  viewContent: { marginBottom: 10, marginTop: 10 },
  textContent: { fontSize: 14, textAlign: "justify" },
  wrapper: { flex: 1, marginLeft: 0, marginRight: 0 },
  fixHeight: {
    marginTop: 5,
    marginLeft: 0,
    padding: 10,
    backgroundColor: "white"
  },
  images: { height: 300 },
  imageDetail: { width: "100%", height: "100%" },
  textName: { fontSize: 16, fontWeight: "bold" },
  viewTitle: {
    marginLeft: 0,
    flexDirection: "row",
    alignItems: "center"
  },
  viewButtonBuy: {
    width: "100%",
    height: 42,
    backgroundColor: colors.brandPrimary,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  itemView: {
    paddingTop: 10,
    marginBottom: 10,
    width: width - 7,
    alignItems: "center",
    backgroundColor: "white"
  },
  itemMore: {
    height: 210,
    width: width - 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center"
  },
  iconViewMore: { fontSize: 35, color: colors.brandPrimary },
  textViewMore: { fontSize: 14, color: colors.brandPrimary },
  iconBuy: { marginRight: 10, fontSize: 25, color: "white" },
  storeAvatar: {
    height: 30,
    width: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
    marginRight: 15
  },
  buttonViewStore: {
    position: "absolute",
    right: 10,
    padding: 5,
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: "gray",
    borderRadius: 3
  },
  text: { fontSize: 14 },
  viewInfoStore: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },
  viewProductStars: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  totalRate: { color: "gray" },

  textViewStore: { fontSize: 12, color: "gray" },
  viewNamePrice: { padding: 10, backgroundColor: "white" },
  viewStore: { flexDirection: "row" },
  viewStoreName: { justifyContent: "center" },
  viewFooter: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 0.8,
    borderTopColor: colors.windowBackground
  },
  viewStoreDescription: {
    width: "100%",
    marginTop: 5
  },
  textStore: { fontSize: 12, color: "gray" }
});

const mapStateToProps = state => ({ accountInfo: state.accountReducer });

export default connect(mapStateToProps)(ChiTietSanPham);
