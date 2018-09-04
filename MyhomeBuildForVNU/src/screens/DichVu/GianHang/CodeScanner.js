import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform
} from "react-native";
import { BarCodeScanner, Permissions } from "expo";
import { Icon, Spinner } from "native-base";

import { assets } from "../../../../assets";
import AppComponent from "../../../../core/components/AppComponent";
import string from "../../../config/string";

class CodeScanner extends AppComponent {
  state = {
    hasCameraPermission: false,
    flash: false,
    camera: false
  };

  componentWillMount = () => {
    this.getAccessCamera();
  };

  getAccessCamera = async () => {
    let permission = await Permissions.getAsync(Permissions.CAMERA);
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(Permissions.CAMERA);
    }
    if (permission.status !== "granted") {
      this.showAlertDialog(string.banChuaCapQuyenSuDungMayAnh);
      this.props.navigation.goBack();
    } else {
      this.setState({ hasCameraPermission: true });
    }
  };

  _handleBarCodeRead = ({ data }) => {
    this.props.navigation.state.params.callBack(data);
    this.props.navigation.goBack();
  };

  switchFlash = () => {
    this.setState({ flash: !this.state.flash });
  };

  switchCamera = () => {
    this.setState({ camera: !this.state.camera });
  };

  render() {
    const { hasCameraPermission, flash, camera } = this.state;

    if (!hasCameraPermission) {
      return (
        <View style={styles.container}>
          <Spinner />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <BarCodeScanner
            onBarCodeRead={this._handleBarCodeRead}
            torchMode={flash ? "on" : "off"}
            type={camera ? "front" : "back"}
            style={StyleSheet.absoluteFill}
          />

          <Icon
            name="md-close"
            style={styles.iconClose}
            onPress={() => this.props.navigation.goBack()}
            hitSlop={{ top: 5, bottom: 5, right: 5, left: 5 }}
          />
          <View style={styles.viewScanner}>
            <Image source={assets.codeScanner} />

            <View style={styles.viewButton}>
              <View style={styles.button}>
                <TouchableOpacity
                  style={styles.touchable}
                  onPress={this.switchFlash}
                >
                  <Icon
                    name={flash ? "ios-flash" : "ios-flash-outline"}
                    style={{ color: "#fff" }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.button}>
                <TouchableOpacity
                  style={styles.touchable}
                  onPress={this.switchCamera}
                >
                  <Icon
                    name="ios-reverse-camera-outline"
                    type="Ionicons"
                    style={{ color: "#fff" }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  iconClose: {
    color: "#fff",
    position: "absolute",
    top: Platform.OS === "ios" ? 18 : 5,
    left: 10
  },
  viewScanner: {
    alignItems: "center",
    justifyContent: "center"
  },
  viewButton: {
    marginTop: 25,
    flexDirection: "row"
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  touchable: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default CodeScanner;
