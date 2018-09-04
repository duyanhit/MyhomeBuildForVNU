import { Dimensions, Platform } from "react-native";

const IS_ANDROID = Platform.OS === "android";
const { height, width } = Dimensions.get("window");
const isIphoneX = !IS_ANDROID && height === 812 && width === 375;

export default {
  ANDROID_STATUSBAR: 24,
  DEVICE_HEIGHT: IS_ANDROID ? height - 24 : height,
  DEVICE_WIDTH: width,
  TOOLBAR_HEIGHT: !IS_ANDROID ? (isIphoneX ? 88 : 64) : 56,
  IS_IPHONE_X: isIphoneX
};
