import React from "react";
import { connect } from "react-redux";
import {
  View,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
import { Text } from "native-base";

import AppComponent from "../../../core/components/AppComponent";
import { startAnimatedTo } from "./ChiTietXeCo";
import Icon from "../../component/Icon";
import metrics from "../../../core/config/metrics";
import { assets } from "../../../assets";
import InputValid from "../../component/InputValid";
import string from "../../config/string";

class DanhSachBienSo extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      autoHeight: new Animated.Value(0),
      isAutoHeight: false,
      data: props.data,
      value: props.value
    };
  }

  expand = stateExpand => {
    const { autoHeight, isAutoHeight } = this.state;
    if (!stateExpand || isAutoHeight) {
      this.state.isAutoHeight = false;
      startAnimatedTo(autoHeight, 0);
    } else {
      this.state.isAutoHeight = true;
      startAnimatedTo(autoHeight, this.heightView);
    }
  };

  add = () => {
    const { autoHeight, data } = this.state;
    if (data[data.length - 1] !== "") {
      this.state.data.push("");
      this.setState({ data: [...this.state.data] }, () => {
        setTimeout(() => {
          this.props.onAddAndRomove(this.heightView / data.length, true);
          startAnimatedTo(autoHeight, this.heightView);
        }, 100);
      });
    }
  };

  remove = i => {
    const { autoHeight, data } = this.state;
    if (this.state.data.length !== 1) {
      this.state.data.splice(i, 1);
      let soBienSo = this.state.data.filter(v1 => v1);
      soBienSo = soBienSo.length.toString();
      this.setState({ data: [...this.state.data], value: soBienSo }, () => {
        setTimeout(() => {
          this.props.onAddAndRomove(this.heightView / data.length, false);
          startAnimatedTo(autoHeight, this.heightView);
        }, 100);
      });
    } else if (this.state.data[0] !== "") {
      this.state.data[0] = "";
      this.setState({ data: [...this.state.data], value: "0" });
    }
  };

  convertNumber = str => {
    const arrStr = [];
    let temp = str.toString();
    while (temp) {
      const strStr = temp.substring(
        temp.length - 3 < 0 ? 0 : temp.length - 3,
        temp.length
      );
      temp = temp.substring(0, temp.length - 3 < 0 ? 0 : temp.length - 3);
      arrStr.unshift(strStr);
    }
    return arrStr.join(".");
  };

  render() {
    let { title, placeholder, isIcon, iconLeft, isBienSo } = this.props;
    let { value, data } = this.state;
    const { autoHeight } = this.state;
    title = title || "";
    data = data && data.length ? data : null;
    isBienSo = isBienSo || false;
    placeholder = placeholder || "";
    isIcon = isIcon || false;
    iconLeft = iconLeft || assets.icDienTich;
    value = value || "";
    return (
      <View style={styles.viewItem}>
        <View style={styles.viewItemInput}>
          <Image source={iconLeft} style={styles.iconLeft} />
          <Text style={styles.textInput}>{title}</Text>
          <InputValid
            styleViewInput={styles.inputValidView}
            styleInput={styles.inputValidInput}
            propsInput={{
              editable: !isBienSo,
              placeholder,
              value: this.convertNumber(value),
              onChangeText: txt =>
                this.setState({ value: txt.replace(/\.+/g, "") }),
              keyboardType: "number-pad",
              onFocus: event => {
                if (event.nativeEvent.text === "0") {
                  this.setState({ value: "" });
                }
              },
              onEndEditing: event => {
                const temp = event.nativeEvent.text
                  .replace(/[^0-9]+/g, "")
                  .replace(/^0+/g, "");
                if (temp === "") this.setState({ value: "0" });
                else this.setState({ value: temp });
              }
            }}
          />
          <View style={styles.viewIconRight}>
            {isIcon && (
              <TouchableOpacity onPress={this.props.onSelectItem}>
                <Icon
                  iconType="Ionicons"
                  name="ios-arrow-down"
                  style={styles.iconRight}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Animated.View style={[styles.viewAnimation, { height: autoHeight }]}>
          <View
            onLayout={({ nativeEvent }) =>
              (this.heightView = nativeEvent.layout.height)
            }
            style={styles.viewAbsoluteContent}
          >
            {isBienSo &&
              data &&
              data.map((v, i) => {
                return (
                  <ItemInputBienXoSe
                    key={i}
                    placeholder={string.bienSoXe}
                    value={v}
                    onChangeText={txt => {
                      data[i] = txt;
                      this.setState({ data: [...data] });
                    }}
                    onEndEditing={({ nativeEvent }) => {
                      const temp = nativeEvent.text.replace(
                        /[^0-9a-zA-Z.-]+/g,
                        ""
                      );
                      data[i] = temp;
                      let soBienSo = data.filter(v1 => v1);
                      soBienSo = soBienSo.length.toString();
                      if (temp === "") this.remove(i);
                      this.setState({ data: [...data], value: soBienSo });
                    }}
                    lastItem={i === data.length - 1}
                    onAdd={this.add}
                    onRemove={this.remove.bind(this, i)}
                  />
                );
              })}
          </View>
        </Animated.View>
      </View>
    );
  }
}

export default connect(
  state => ({ accountInfo: state.accountReducer }),
  null,
  null,
  { withRef: true }
)(DanhSachBienSo);

const styles = StyleSheet.create({
  viewItem: { width: "100%", overflow: "hidden", backgroundColor: "white" },
  viewItemInput: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5
  },
  iconLeft: { width: 30, height: 30, marginLeft: 15, marginRight: 15 },
  textInput: { flex: 1 },
  inputValidView: {
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 0.7,
    borderRadius: 5,
    paddingVertical: 7,
    width: 0.35 * metrics.DEVICE_WIDTH
  },
  inputValidInput: { fontSize: 16, marginHorizontal: 10, textAlign: "right" },
  viewIconRight: { width: 55, alignItems: "center" },
  iconRight: { fontSize: 25 },
  viewAnimation: { overflow: "hidden", borderWidth: 0 },
  viewAbsoluteContent: { position: "absolute", width: "100%", top: 0 }
});

export const ItemInputBienXoSe = props => {
  const {
    placeholder,
    value,
    lastItem,
    onAdd,
    onRemove,
    onChangeText,
    onEndEditing
  } = props;
  return (
    <View
      style={{
        flexDirection: "row",
        marginVertical: 2,
        justifyContent: "flex-end"
      }}
    >
      <TouchableOpacity onPress={onRemove}>
        <Icon
          iconType="FontAwesome"
          name="remove"
          style={{ fontSize: 30, color: "red", marginHorizontal: 12 }}
        />
      </TouchableOpacity>
      <InputValid
        styleViewInput={[
          styles.inputValidView,
          { width: 0.35 * metrics.DEVICE_WIDTH }
        ]}
        styleInput={[styles.inputValidInput, { textAlign: "left" }]}
        propsInput={{ placeholder, value, onChangeText, onEndEditing }}
      />
      <View style={{ marginRight: 13, marginLeft: 12, width: 30 }}>
        {lastItem && (
          <TouchableOpacity onPress={onAdd}>
            <Icon
              iconType="FontAwesome"
              name="plus-circle"
              style={{ fontSize: 30, color: "gray" }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
