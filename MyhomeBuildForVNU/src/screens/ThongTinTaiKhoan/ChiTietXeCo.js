import React from "react";
import { connect } from "react-redux";
import { Animated, StyleSheet, View } from "react-native";
import { Button, Spinner, Text } from "native-base";
import AppComponent from "../../../core/components/AppComponent";
import DanhSachBienSo from "./DanhSachBienSo";
import { API, getApiUrl } from "../../config/server";
import string from "../../config/string";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import { assets } from "../../../assets";

export const startAnimatedTo = (input, value) => {
  Animated.timing(input, { duration: 300, toValue: value }).start();
};

class ChiTietXeCo extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      autoHeight: new Animated.Value(0),
      isAutoHeight: false,
      data: null,
      showView: false,
      id: props.id,
      msg: ""
    };
  }

  scrollToIndex = () => {
    setTimeout(
      () =>
        this.Flist.scrollToIndex({
          index: this.index,
          viewPosition: 1,
          viewOffset: -1
        }),
      310
    );
  };

  setId = id => {
    this.setState({
      id,
      autoHeight: new Animated.Value(0),
      isAutoHeight: false,
      data: null,
      showView: false,
      msg: ""
    });
  };

  expand = (stateExpand, Flist, index) => {
    this.Flist = Flist;
    this.index = index;
    const { autoHeight, isAutoHeight, data, showView } = this.state;
    if (!stateExpand || isAutoHeight) {
      this.state.isAutoHeight = false;
      startAnimatedTo(autoHeight, 0);
    } else {
      this.state.isAutoHeight = true;
      if (!showView) {
        this.setState({ showView: true, isLoading: true }, () => {
          setTimeout(() => {
            startAnimatedTo(autoHeight, this.heightView);
            this.scrollToIndex();
          }, 100);
          this.getScreenData();
        });
      } else if (data) {
        startAnimatedTo(autoHeight, this.heightView);
        this.scrollToIndex();
      } else {
        this.setState({ isLoading: true }, () => {
          setTimeout(() => {
            startAnimatedTo(autoHeight, this.heightView);
            this.scrollToIndex();
          }, 100);
          this.getScreenData();
        });
      }
    }
  };

  getScreenData = async () => {
    let { id } = this.state;
    const { autoHeight } = this.state;
    id = id || "";
    this.getFromServerWithAccount(getApiUrl(API.LAY_THONG_TIN_XE_CO), {
      id
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        this.setState({ data: propsData.data, isLoading: false }, () => {
          setTimeout(() => {
            startAnimatedTo(autoHeight, this.heightView);
            this.scrollToIndex();
          }, 100);
        });
      } else {
        this.setState({ isLoading: false, msg: propsData.message }, () => {
          setTimeout(() => {
            startAnimatedTo(autoHeight, this.heightView);
            this.scrollToIndex();
          }, 100);
        });
      }
    });
  };

  onSelectItem = type => {
    if (!this.onExpand) {
      this.onExpand = true;
      setTimeout(() => (this.onExpand = false), 500);
      const { autoHeight } = this.state;
      const item = this[type];
      item.expand(true);
      if (!item.state.isAutoHeight) {
        startAnimatedTo(autoHeight, this.heightView - item.heightView);
      } else {
        startAnimatedTo(autoHeight, this.heightView + item.heightView);
      }
    }
  };

  onAddAndRomove = (height, state) => {
    const { autoHeight } = this.state;
    if (state) startAnimatedTo(autoHeight, this.heightView + height);
    else startAnimatedTo(autoHeight, this.heightView - height);
  };

  sendDataXeCo = async () => {
    let { id } = this.state;
    const { autoHeight } = this.state;
    id = id || "";
    let liMotobike = this.XEMAY.state.data.filter(v => v !== "");
    liMotobike = liMotobike.length ? JSON.stringify(liMotobike) : "";
    let liCare = this.OTO.state.data.filter(v => v !== "");
    liCare = liCare.length ? JSON.stringify(liCare) : "";
    const dataApi = {
      number_bicycle: this.XEDAP.state.value,
      number_bicycle_elec: this.XEDAPDIEN.state.value,
      license_bicycle_elec: "",
      number_motobike: this.XEMAY.state.value,
      license_motobike: liMotobike,
      number_car: this.OTO.state.value,
      license_car: liCare,
      area: this.DIENTICH.state.value
    };
    this.postToServerWithAccount(getApiUrl(API.LAY_THONG_TIN_XE_CO), {
      id,
      ...dataApi
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status.toString() === "1") {
        this.setState({ data: propsData.data, isLoading: false }, () => {
          setTimeout(() => {
            startAnimatedTo(autoHeight, this.heightView);
            this.scrollToIndex();
          }, 100);
        });
      } else {
        this.setState({ isLoading: false, msg: propsData.message }, () => {
          setTimeout(() => {
            startAnimatedTo(autoHeight, this.heightView);
            this.scrollToIndex();
          }, 100);
        });
      }
    });
  };

  luuThongTin = async () => {
    const { autoHeight } = this.state;
    this.setState({ isLoading: true }, () => {
      setTimeout(() => {
        startAnimatedTo(autoHeight, this.heightView);
        this.scrollToIndex();
      }, 100);
      this.sendDataXeCo();
    });
  };

  render() {
    const { autoHeight, data, isLoading, showView, msg } = this.state;
    const {
      area,
      number_bicycle: numberBicycle,
      number_bicycle_e: numberBicycleE,
      number_motobike: numberMotobike,
      number_car: numberCar
    } =
      data || {};
    let { license_motobike: licenseMotobike, license_car: licenseCar } =
      data || {};

    let viewMain = null;

    if (data) {
      licenseMotobike = JSON.parse(licenseMotobike || null);
      licenseCar = JSON.parse(licenseCar || null);
      viewMain = (
        <View>
          {/* <View style={styles.viewSuaXoa}>
            <Button onPress={this.props.sua} small style={{ marginRight: 15 }}>
              <Text>Sửa</Text>
            </Button>
            <Button onPress={this.props.xoa} small style={{ marginLeft: 15 }}>
              <Text>Xóa</Text>
            </Button>
          </View>
          <View style={styles.viewLine} /> */}
          <DanhSachBienSo
            ref={ref => (ref ? (this.DIENTICH = ref.wrappedInstance) : null)}
            title="Diện tích"
            placeholder="m2"
            isIcon={false}
            iconLeft={assets.icDienTich}
            value={area}
            isBienSo={false}
          />
          <DanhSachBienSo
            ref={ref => (ref ? (this.OTO = ref.wrappedInstance) : null)}
            title="Ô tô"
            placeholder="Chiếc"
            isIcon
            iconLeft={assets.icOto}
            value={numberCar}
            isBienSo
            data={licenseCar || [""]}
            onSelectItem={this.onSelectItem.bind(this, "OTO")}
            onAddAndRomove={this.onAddAndRomove}
          />
          <DanhSachBienSo
            ref={ref => (ref ? (this.XEMAY = ref.wrappedInstance) : null)}
            title="Xe máy"
            placeholder="Chiếc"
            isIcon
            iconLeft={assets.icXeMay}
            value={numberMotobike}
            isBienSo
            data={licenseMotobike || [""]}
            onSelectItem={this.onSelectItem.bind(this, "XEMAY")}
            onAddAndRomove={this.onAddAndRomove}
          />
          <DanhSachBienSo
            ref={ref => (ref ? (this.XEDAPDIEN = ref.wrappedInstance) : null)}
            title="Xe đạp điện"
            placeholder="Chiếc"
            isIcon={false}
            iconLeft={assets.icXeDapDien}
            value={numberBicycleE}
            isBienSo={false}
          />
          <DanhSachBienSo
            ref={ref => (ref ? (this.XEDAP = ref.wrappedInstance) : null)}
            title="Xe đạp"
            placeholder="Chiếc"
            isIcon={false}
            iconLeft={assets.icXeDap}
            value={numberBicycle}
            isBienSo={false}
          />
          <Button
            onPress={this.luuThongTin}
            small
            style={{ alignSelf: "center", marginVertical: 10 }}
          >
            <Text>{string.luuThongTin}</Text>
          </Button>
        </View>
      );
    }

    if (isLoading) viewMain = <Spinner />;

    if (msg) {
      viewMain = (
        <View style={styles.viewError}>
          {/* <View style={styles.viewSuaXoa}>
            <Button onPress={this.props.sua} small style={{ marginRight: 15 }}>
              <Text>Sửa</Text>
            </Button>
            <Button onPress={this.props.xoa} small style={{ marginLeft: 15 }}>
              <Text>Xóa</Text>
            </Button>
          </View> */}
          <Text note style={styles.textError}>
            {msg}
          </Text>
        </View>
      );
    }

    if (!showView) viewMain = null;

    return (
      <Animated.View style={[styles.viewAnimation, { height: autoHeight }]}>
        <View
          onLayout={({ nativeEvent }) => {
            this.heightView = nativeEvent.layout.height;
          }}
          style={styles.viewAbsoluteContent}
        >
          {viewMain}
        </View>
      </Animated.View>
    );
  }
}

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(ChiTietXeCo);

const styles = StyleSheet.create({
  viewError: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20
  },
  textError: { color: "red" },
  viewAbsoluteContent: { position: "absolute", width: "100%", top: 0 },
  viewAnimation: {
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    borderBottomColor: "#c9c9c9",
    overflow: "hidden"
  },
  viewSuaXoa: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10
  },
  viewLine: {
    width: "80%",
    borderTopWidth: 0.5,
    borderTopColor: "#c9c9c9",
    alignSelf: "center",
    marginVertical: 10
  }
});
