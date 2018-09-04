import React from "react";
import {
  View,
  PanResponder,
  Animated,
  Dimensions,
  BackHandler,
  Platform,
  StatusBar
} from "react-native";
import { ImageManipulator } from "expo";
import { Text, Button } from "native-base";

const { width: driverWith, height: driverHeight } = Dimensions.get("window");
const driverW = driverWith;
const driverH =
  Platform.OS === "android"
    ? driverHeight - StatusBar.currentHeight
    : driverHeight;

const ratioWidthCropScreen = 0.95;

let cropScreenSize = {
  width: ratioWidthCropScreen * driverW,
  height: 0,
  widthMax: 3 * driverW,
  heightMax: 3 * driverW
};

export default class CropImage extends React.Component {
  constructor(props) {
    super(props);
    //cài đặt các hàm TouchStart(onPanResponderGrant), TouchMove(onPanResponderMove), TouchEnd(onPanResponderRelease)
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: (evt, gestureState) => {
        this.checkZoom(evt.nativeEvent, gestureState, 0);
      },
      onPanResponderMove: (evt, gestureState) => {
        this.checkZoom(evt.nativeEvent, gestureState, 1);
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.checkZoom(evt.nativeEvent, gestureState, 2);
      }
    });

    const { ratio, image } = props.navigation.state.params || {};
    this.state = { image };
    this.ratioCropScreen = ratio && ratio.length > 1 ? ratio[1] / ratio[0] : 1;
    cropScreenSize = {
      ...cropScreenSize,
      height: cropScreenSize.width * this.ratioCropScreen,
      x0: (driverW - cropScreenSize.width) / 2,
      y0: (driverH - cropScreenSize.width * this.ratioCropScreen) / 2,
      x1: driverW - (driverW - cropScreenSize.width) / 2,
      y1: driverH - (driverH - cropScreenSize.width * this.ratioCropScreen) / 2
    };
    this.animatedImage = {
      width: new Animated.Value(0),
      height: new Animated.Value(0),
      tranX: new Animated.Value(0),
      tranY: new Animated.Value(0)
    };
    this.setParamsCropImage(props.navigation.state.params.image);
    this.fucH = () => true;
    BackHandler.addEventListener("hardwareBackPress", this.fucH);
  }

  componentWillUnmount = () => {
    BackHandler.removeEventListener("hardwareBackPress", this.fucH);
  };

  setParamsCropImage = image => {
    let width = cropScreenSize.width;
    let height = (width * image.height) / image.width;
    if (height < cropScreenSize.height) {
      height = cropScreenSize.height;
      width = (height * image.width) / image.height;
    }
    this.imageNew = {
      ...this.image,
      width,
      height,
      percentWH: image.width / image.height,
      x:
        height > cropScreenSize.height
          ? cropScreenSize.x0
          : cropScreenSize.x0 - (width - cropScreenSize.width) / 2,
      y:
        height > cropScreenSize.height
          ? cropScreenSize.y0 - (height - cropScreenSize.height) / 2
          : cropScreenSize.y0,
      zImage: Math.sqrt(width * width + height * height)
    };
    this.animatedImage.width.setValue(this.imageNew.width);
    this.animatedImage.height.setValue(this.imageNew.height);
    this.animatedImage.tranX.setValue(this.imageNew.x);
    this.animatedImage.tranY.setValue(this.imageNew.y);
  };

  checkZoom = (touch, state, type) => {
    this.animatedImage.tranX.setValue(this.imageNew.x + state.dx);
    this.animatedImage.tranY.setValue(this.imageNew.y + state.dy);
    if (touch.touches.length > 1) {
      const x1 = touch.touches[0].locationX;
      const y1 = touch.touches[0].locationY;

      const x2 = touch.touches[1].locationX;
      const y2 = touch.touches[1].locationY;

      const x = (x1 - x2) * (x1 - x2);
      const y = (y1 - y2) * (y1 - y2);

      const z = Math.sqrt(x + y);
      if (!this.zoom) {
        this.zoom = true;
        this.z0 = z;
      } else {
        this.z1 = z;
        const d = this.imageNew.zImage - 2 * (this.z0 - z);

        const width =
          (this.imageNew.percentWH * d) /
          Math.sqrt(this.imageNew.percentWH * this.imageNew.percentWH + 1);
        const height =
          d / Math.sqrt(this.imageNew.percentWH * this.imageNew.percentWH + 1);

        this.imageNew = { ...this.imageNew, width, height };
        this.animatedImage.width.setValue(width);
        this.animatedImage.height.setValue(height);
      }
    } else if (this.zoom) {
      this.zoom = false;
      this.imageNew.zImage = this.imageNew.zImage - 2 * (this.z0 - this.z1);
      this.imageNew = {
        ...this.imageNew,
        width:
          (this.imageNew.percentWH * this.imageNew.zImage) /
          Math.sqrt(this.imageNew.percentWH * this.imageNew.percentWH + 1),
        height:
          this.imageNew.zImage /
          Math.sqrt(this.imageNew.percentWH * this.imageNew.percentWH + 1)
      };
    }
    if (type === 2) {
      this.imageNew = {
        ...this.imageNew,
        x: this.imageNew.x + state.dx,
        y: this.imageNew.y + state.dy
      };
      if (this.imageNew.width < cropScreenSize.width) {
        const width = cropScreenSize.width;
        const height =
          (cropScreenSize.width * this.state.image.height) /
          this.state.image.width;

        this.imageNew = {
          ...this.imageNew,
          width,
          height,
          zImage: Math.sqrt(width * width + height * height)
        };

        this.animatedImage.height.setValue(height);
        this.animatedImage.width.setValue(width);
      }
      if (this.imageNew.height < cropScreenSize.height) {
        const width =
          (cropScreenSize.height * this.state.image.width) /
          this.state.image.height;
        const height = cropScreenSize.height;

        this.imageNew = {
          ...this.imageNew,
          width,
          height,
          zImage: Math.sqrt(width * width + height * height)
        };

        this.animatedImage.height.setValue(height);
        this.animatedImage.width.setValue(width);
      }
      if (this.imageNew.width > cropScreenSize.widthMax) {
        const width = cropScreenSize.widthMax;
        const height =
          (cropScreenSize.widthMax * this.state.image.height) /
          this.state.image.width;

        this.imageNew = {
          ...this.imageNew,
          width,
          height,
          zImage: Math.sqrt(width * width + height * height)
        };

        this.animatedImage.height.setValue(height);
        this.animatedImage.width.setValue(width);
      }
      if (this.imageNew.height > cropScreenSize.heightMax) {
        const width =
          (cropScreenSize.heightMax * this.state.image.width) /
          this.state.image.height;
        const height = cropScreenSize.heightMax;

        this.imageNew = {
          ...this.imageNew,
          width,
          height,
          zImage: Math.sqrt(width * width + height * height)
        };

        this.animatedImage.height.setValue(height);
        this.animatedImage.width.setValue(width);
      }
      if (this.imageNew.x > cropScreenSize.x0) {
        this.animatedImage.tranX.setValue(cropScreenSize.x0);
        this.imageNew = { ...this.imageNew, x: cropScreenSize.x0 };
      }
      if (this.imageNew.y > cropScreenSize.y0) {
        this.animatedImage.tranY.setValue(cropScreenSize.y0);
        this.imageNew = { ...this.imageNew, y: cropScreenSize.y0 };
      }
      if (this.imageNew.width + this.imageNew.x < cropScreenSize.x1) {
        this.animatedImage.tranX.setValue(
          cropScreenSize.x1 - this.imageNew.width
        );
        this.imageNew = {
          ...this.imageNew,
          x: cropScreenSize.x1 - this.imageNew.width
        };
      }
      if (this.imageNew.height + this.imageNew.y < cropScreenSize.y1) {
        this.animatedImage.tranY.setValue(
          cropScreenSize.y1 - this.imageNew.height
        );
        this.imageNew = {
          ...this.imageNew,
          y: cropScreenSize.y1 - this.imageNew.height
        };
      }
    }
  };

  findFileNameAndType = uri => {
    const filename = uri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";
    return { type, name: filename };
  };

  cropImage = async bl => {
    const crop = {
      originX: Math.floor(
        ((cropScreenSize.x0 - this.imageNew.x) / this.imageNew.width) *
          this.state.image.width
      ),
      originY: Math.floor(
        ((cropScreenSize.y0 - this.imageNew.y) / this.imageNew.height) *
          this.state.image.height
      ),
      width: Math.floor(
        (cropScreenSize.width / this.imageNew.width) * this.state.image.width
      ),
      height: Math.floor(
        (cropScreenSize.height / this.imageNew.height) * this.state.image.height
      )
    };
    let image = await ImageManipulator.manipulate(this.state.image.uri, [
      { crop },
      {
        resize: this.props.navigation.state.params.reSize || {
          width: 200,
          height: 200
        }
      }
    ]);
    image = { ...image, ...this.findFileNameAndType(image.uri) };
    this.setParamsCropImage(image);
    this.setState({ image }, () => {
      if (bl === 1) {
        if (this.props.navigation.state.params.callBack) {
          this.props.navigation.state.params.callBack(this.state.image);
        }
        this.props.navigation.goBack();
      }
    });
  };

  huy = () => {
    if (this.props.navigation.state.params.callBack) {
      this.props.navigation.state.params.callBack(null);
    }
    this.props.navigation.goBack();
  };

  render() {
    // console.log(this.state.image);
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <Animated.Image
          {...this.imagePanResponder.panHandlers}
          style={{
            width: this.animatedImage.width,
            height: this.animatedImage.height,
            transform: [
              { translateX: this.animatedImage.tranX },
              { translateY: this.animatedImage.tranY }
            ]
          }}
          source={this.state.image}
        />
        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff4",
            left: 0,
            top: 0,
            width: cropScreenSize.x0,
            height: cropScreenSize.y0
          }}
        />
        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff4",
            left: cropScreenSize.x0,
            right: cropScreenSize.x0,
            top: 0,
            height: cropScreenSize.y0,
            borderBottomWidth: 0.5,
            borderBottomColor: "#000"
          }}
        />
        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff4",
            right: 0,
            top: 0,
            width: cropScreenSize.x0,
            height: cropScreenSize.y0
          }}
        />

        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff4",
            left: 0,
            top: cropScreenSize.y0,
            bottom: cropScreenSize.y0,
            width: cropScreenSize.x0,
            borderRightWidth: 0.5,
            borderRightColor: "#000"
          }}
        />
        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff4",
            right: 0,
            top: cropScreenSize.y0,
            bottom: cropScreenSize.y0,
            width: cropScreenSize.x0,
            borderLeftWidth: 0.5,
            borderLeftColor: "#000"
          }}
        />

        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff4",
            left: 0,
            bottom: 0,
            width: cropScreenSize.x0,
            height: cropScreenSize.y0
          }}
        />
        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff4",
            left: cropScreenSize.x0,
            right: cropScreenSize.x0,
            bottom: 0,
            height: cropScreenSize.y0,
            borderTopWidth: 0.5,
            borderTopColor: "#000",
            justifyContent: "center"
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <Button
              style={{ width: 100, justifyContent: "center" }}
              onPress={this.huy}
            >
              <Text>Hủy</Text>
            </Button>
            <Button
              style={{ width: 100, justifyContent: "center" }}
              onPress={this.cropImage.bind(this, 1)}
            >
              <Text>Cắt ảnh</Text>
            </Button>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff4",
            right: 0,
            bottom: 0,
            width: cropScreenSize.x0,
            height: cropScreenSize.y0
          }}
        />
      </View>
    );
  }
}
