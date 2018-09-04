import { AsyncStorage, Alert } from "react-native";
import { consoleLog } from "../AppLog";
import screens from "../../config/screens";
import config from "../../config";
import storage from "../../config/storage";

export const appSignOut = async navigation => {
  consoleLog("clear all session");
  await AsyncStorage.removeItem(storage.accountInfo);
  try {
    navigation.navigate(screens.APP_AUTH_SCREEN);
  } catch (error) {
    consoleLog(error, "appSignOut");
  }
  return true;
};

export const confirmSignOut = (message, navigation, cancelable = true) => {
  const buttonPositive = {
    text: config.strings.signOutPostive,
    onPress: async () => {
      await appSignOut(navigation);
    }
  };
  const buttonNegative = cancelable && {
    text: config.strings.signOutNavigate
  };
  Alert.alert(config.strings.signOutTitlte, message, [
    buttonNegative,
    buttonPositive
  ]);
};
