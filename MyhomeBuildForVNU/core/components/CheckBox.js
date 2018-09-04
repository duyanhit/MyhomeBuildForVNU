import React, { PureComponent } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewPropTypes
} from "react-native";
import PropTypes from "prop-types";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import IonIcon from "react-native-vector-icons/Ionicons";
import MaerialComIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { Icon } from "native-base";

/*
  -----------------
  Icons summary
  -----------------
  0:faEdge,
  1:faFill,
  2:faMix,
  3:faCircleEdge,
  4:faCircleFill,
  5:faCircleMix,
  6:iosEdge,
  7:iosFill,
  8:iosMix,
  9:iosCircleEdge,
  10:iosCircleFill,
  11:iosCircleMix,
  12:matEdge,
  13:matFill,
  14:matMix,
  15:matCircleEdge,
  16:matCircleFill,
  17:matCircleMix
  -----------------
*/

const styles = StyleSheet.create({
  contentStyle: {
    alignItems: "center"
  },
  labelStyle: {
    fontSize: 16,
    marginLeft: 3
  }
});

const iconDb = [
  {
    component: FontAwesomeIcon,
    iconName: "faEdge",
    checkedIconName: "check-square-o",
    uncheckedIconName: "square-o"
  },
  {
    component: FontAwesomeIcon,
    iconName: "faFill",
    checkedIconName: "check-square",
    uncheckedIconName: "square"
  },
  {
    component: FontAwesomeIcon,
    iconName: "faMix",
    checkedIconName: "check-square",
    uncheckedIconName: "square-o"
  },
  {
    component: FontAwesomeIcon,
    iconName: "faCircleEdge",
    checkedIconName: "check-circle-o",
    uncheckedIconName: "circle-o"
  },
  {
    component: FontAwesomeIcon,
    iconName: "faCircleFill",
    checkedIconName: "check-circle",
    uncheckedIconName: "circle"
  },
  {
    component: FontAwesomeIcon,
    iconName: "faCircleMix",
    checkedIconName: "check-circle",
    uncheckedIconName: "circle-o"
  },
  {
    component: IonIcon,
    iconName: "iosEdge",
    checkedIconName: "ios-checkbox",
    uncheckedIconName: "ios-square"
  },
  {
    component: IonIcon,
    iconName: "iosFill",
    checkedIconName: "ios-checkbox-outline",
    uncheckedIconName: "ios-square-outline"
  },
  {
    component: IonIcon,
    iconName: "iosMix",
    checkedIconName: "ios-checkbox",
    uncheckedIconName: "ios-square-outline"
  },
  {
    component: IonIcon,
    iconName: "iosCircleEdge",
    checkedIconName: "ios-checkmark-circle-outline",
    uncheckedIconName: "ios-radio-button-off-outline"
  },
  {
    component: IonIcon,
    iconName: "iosCircleFill",
    checkedIconName: "ios-checkmark-circle",
    uncheckedIconName: "ios-radio-button-off-outline"
  },
  {
    component: IonIcon,
    iconName: "iosCircleMix",
    checkedIconName: "ios-checkmark-circle",
    uncheckedIconName: "ios-radio-button-off-outline"
  },
  {
    component: MaerialComIcon,
    iconName: "matEdge",
    checkedIconName: "checkbox-marked-outline",
    uncheckedIconName: "checkbox-blank-outline"
  },
  {
    component: MaerialComIcon,
    iconName: "matFill",
    checkedIconName: "checkbox-marked",
    uncheckedIconName: "checkbox-blank"
  },
  {
    component: MaerialComIcon,
    iconName: "matMix",
    checkedIconName: "checkbox-marked",
    uncheckedIconName: "checkbox-blank-outline"
  },
  {
    component: MaerialComIcon,
    iconName: "matCircleEdge",
    checkedIconName: "check-circle-outline",
    uncheckedIconName: "checkbox-blank-circle-outline"
  },
  {
    component: MaerialComIcon,
    iconName: "matCircleFill",
    checkedIconName: "check-circle",
    uncheckedIconName: "checkbox-blank-circle"
  },
  {
    component: MaerialComIcon,
    iconName: "matCircleMix",
    checkedIconName: "check-circle",
    uncheckedIconName: "checkbox-blank-circle-outline"
  }
];

let defaultIcon = iconDb[8];

class CheckBox extends PureComponent {
  static propTypes = {
    style: ViewPropTypes.style,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool,
    labelPosition: PropTypes.string,
    labelStyle: Text.propTypes.style,
    iconName: PropTypes.string,
    iconStyle: ViewPropTypes.style,
    iconSize: PropTypes.number,
    checkedColor: PropTypes.string,
    uncheckedColor: PropTypes.string
  };

  static defaultProps = {
    style: {},
    checked: false,
    labelPosition: "right",
    labelStyle: styles.labelStyle,
    iconName: "iosMix",
    iconStyle: {},
    iconSize: 30,
    checkedColor: "#464646",
    uncheckedColor: "#464646"
  };

  componentWillMount() {
    this.setState({
      checked: this.props.checked
    });
  }

  componentWillReceiveProps(props) {
    this.setState({
      checked: props.checked
    });
  }

  _onChange() {
    const newVal = !this.state.checked;
    const { onChange } = this.props;
    this.setState({ checked: newVal }, () => {
      onChange(newVal);
    });
  }

  _renderIcon(iconName) {
    const { iconSize, iconStyle, checkedColor, uncheckedColor } = this.props;
    const checked = this.state.checked;
    const index = iconDb.findIndex(i => i.iconName === iconName);

    if (index !== -1) {
      defaultIcon = iconDb[index];
    }

    const { component: Icon, checkedIconName, uncheckedIconName } = defaultIcon;

    return (
      <Icon
        name={checked ? checkedIconName : uncheckedIconName}
        size={iconSize}
        color={checked ? checkedColor : uncheckedColor}
        style={iconStyle}
      />
    );
  }

  _renderContent() {
    const { labelPosition, labelStyle, label, iconName } = this.props;
    const flexDirection = labelPosition === "left" ? "row-reverse" : "row";

    return (
      <View style={[styles.contentStyle, { flexDirection }]}>
        {this._renderIcon.call(this, iconName)}
        {label ? <Text style={labelStyle}>{label}</Text> : null}
      </View>
    );
  }

  render() {
    const { style } = this.props;
    return (
      <TouchableOpacity onPress={this._onChange.bind(this)} style={style}>
        {this._renderContent.call(this)}
      </TouchableOpacity>
    );
  }
}

export default CheckBox;
