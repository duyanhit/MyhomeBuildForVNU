import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { MapView } from "expo";
import { Text } from "native-base";

import AppComponent from "../../../../core/components/AppComponent";
import string from "../../../config/string";
import metrics from "../../../../core/config/metrics";
import config from "../../../../core/config";
import colors from "../../../config/colors";
import Icon from "../../../component/Icon";

class ChonDiaChi extends AppComponent {
  state = {
    ...this.state,
    visible: false
  };

  latlngMap = {
    latitude: 21.020965181930173,
    longitude: 105.82116397768182,
    latitudeDelta: 0.0961423217173234,
    longitudeDelta: 0.2636719378938892
  };

  onRegionChangeComplete = result => {
    this.location = result;
    this.latlngMap = {
      latitudeDelta: result.latitudeDelta,
      longitudeDelta: result.longitudeDelta,
      latitude: result.latitude,
      longitude: result.longitude
    };
  };

  open = location => {
    this.location = location;
    if (location) {
      this.latlngMap = {
        ...this.latlngMap,
        ...this.location
      };
    }
    this.setState({ visible: true });
  };

  close = () => {
    this.setState({ visible: false });
  };

  render() {
    const { visible } = this.state;
    return (
      <Modal
        visible={visible}
        transparent
        onRequestClose={() => {}}
        animationType="fade"
      >
        <View style={styles.contentModal}>
          <View style={styles.viewContent}>
            <Text style={styles.titleModal}>{string.viTriGianHang}</Text>

            <View style={styles.viewLicense}>
              <MapView
                style={{ width: "100%", height: 200 }}
                initialRegion={{
                  latitude: 21.020965181930173,
                  longitude: 105.82116397768182,
                  latitudeDelta: 0.0961423217173234,
                  longitudeDelta: 0.2636719378938892
                }}
                initialRegion={this.latlngMap}
                onRegionChangeComplete={this.onRegionChangeComplete}
              />
              <Icon
                name="location-pin"
                iconType="Entypo"
                style={styles.iconMarkUp}
              />
            </View>

            <View style={styles.viewButton}>
              <TouchableOpacity
                style={[
                  config.styles.button.huy,
                  { marginRight: 5, flex: 1, borderRadius: 5 }
                ]}
                onPress={() => {
                  this.close();
                  this.props.onLocation(null);
                }}
              >
                <Text style={styles.textButton}>{string.huy}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  config.styles.button.xacNhan,
                  { marginLeft: 5, flex: 1, borderRadius: 5 }
                ]}
                onPress={() => {
                  this.close();
                  this.props.onLocation(this.location);
                }}
              >
                <Text style={[styles.textButton, { color: "#fff" }]}>
                  {string.chon}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white"
  },
  textInput: {
    borderWidth: 0.5,
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    marginBottom: 10
  },
  btnAddAvatar: {
    width: 80,
    height: 80
    // marginBottom: 10,
    // marginTop: 15,
    // marginLeft: 15
  },
  imageAddAvatar: {
    height: 80,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderColor: colors.brandPrimary,
    borderStyle: "dashed",
    borderWidth: 1
  },
  avatar: {
    height: 100,
    width: 100,
    borderWidth: 1,
    borderColor: colors.brandPrimary
  },
  iconAdd: {
    fontSize: 20,
    color: colors.brandPrimary
  },
  textAdd: {
    color: colors.brandPrimary,
    fontSize: 12
  },
  viewMapView: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  mapView: {
    width: metrics.DEVICE_WIDTH,
    height: 150
  },
  viewIconMarkUp: {
    position: "absolute",
    paddingBottom: 19,
    justifyContent: "center",
    alignItems: "center"
  },
  iconMarkUp: {
    position: "absolute",
    fontSize: 40,
    color: colors.brandPrimary,
    paddingBottom: Platform.OS === "ios" ? 25 : 33
  },
  textMoTa: {
    paddingTop: 0,
    textAlignVertical: "top"
  },
  btnLuu: {
    alignSelf: "center",
    width: 150,
    justifyContent: "center",
    marginBottom: 15
  },
  contentModal: {
    backgroundColor: "#0004",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  viewContent: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  titleModal: {
    color: colors.brandPrimary,
    fontWeight: "bold",
    marginBottom: 10
  },
  viewLicense: {
    width: "100%",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  appWebView: {
    width: "100%",
    height: "100%"
  },
  viewButton: {
    flexDirection: "row",
    paddingHorizontal: 10
  },
  button: {
    marginHorizontal: 10,
    flex: 1,
    alignSelf: "center",
    justifyContent: "center"
  },
  textButton: {
    fontSize: 14
  },
  viewFooter: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 0.8,
    borderTopColor: colors.windowBackground
  }
});

export default ChonDiaChi;
