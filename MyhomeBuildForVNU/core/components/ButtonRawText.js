import React from "react";
import { Text } from "react-native";
import PropTypes from "prop-types";
import { Button } from "native-base";

export default class ButtonRawText extends Button {
  static propTypes = {
    text: PropTypes.string.isRequired,
    textStyle: PropTypes.object,
    onPress: PropTypes.func
  };

  render() {
    const { transparent } = this.props;
    const view = (
      <Text style={this.props.textStyle && this.props.textStyle}>
        {this.props.text}
      </Text>
    );
    if (transparent) {
      return (
        <Button transparent onPress={this.props.onPress}>
          {view}
        </Button>
      );
    }
    return <Button onPress={this.props.onPress}>{view}</Button>;
  }
}
