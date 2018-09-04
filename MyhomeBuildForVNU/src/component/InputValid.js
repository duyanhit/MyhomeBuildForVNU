import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Text } from "native-base";
import Icon from "./Icon";

const InputValid = props => {
  let {
    IconLeft,
    iconRight,
    msgError,
    styleInput,
    styleViewInput,
    propsInput
  } = props;

  msgError = msgError || "";
  styleInput = styleInput || {};
  styleViewInput = styleViewInput || {};
  propsInput = propsInput || {};
  IconLeft = IconLeft || null;
  iconRight = iconRight || null;

  return (
    <View
      style={[
        styles.viewInput,
        styleViewInput,
        { borderColor: !msgError ? undefined : "#f00" }
      ]}
    >
      {IconLeft}
      <TextInput
        underlineColorAndroid="transparent"
        style={[styles.textInput, styleInput]}
        placeholder="placeholder default"
        {...propsInput}
      />
      {!!msgError && <Text style={styles.msgError}>{msgError}</Text>}
      {iconRight}
    </View>
  );
};

const styles = StyleSheet.create({
  msgError: { marginHorizontal: 10, color: "#f00", fontSize: 12 },
  viewInput: { alignItems: "center", flexDirection: "row", borderWidth: 0.7 },
  textInput: { flex: 1, fontSize: 15 }
});

export default InputValid;
