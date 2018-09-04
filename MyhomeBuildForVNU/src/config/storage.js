import { AsyncStorage } from "react-native";
import storage from "../../core/config/storage";

export const saveAccountInfo = (account, callback) => {
  AsyncStorage.setItem(
    storage.accountInfo,
    account ? JSON.stringify(account) : "",
    callback
  );
};

export default {
  ...storage,
  username: "username",
  password: "password",
  hasEmail: "0"
};
