import React from "react";
import { Item, Input, Icon, Text } from "native-base";
import styles from "../config/styles";
import colors from "../config/colors";

export default class AppInput extends React.Component {
  state = {
    secureTextEntry: this.props.secureTextEntry !== undefined,
    iconEye: "ios-eye"
  };

  toggleValue = () => {
    this.setState({
      secureTextEntry: !this.state.secureTextEntry,
      iconEye: this.state.secureTextEntry ? "ios-eye-off" : "ios-eye"
    });
  };

  render() {
    const {
      input,
      refInput,
      icon,
      secureTextEntry,
      keyboardType,
      returnKeyType,
      returnKeyLabel,
      onEnter,
      label,
      rounded,
      bordered,
      styleInput,
      styleItem,
      formError,
      meta: { touched, error }
    } = this.props;
    const hasError = error !== undefined;
    return (
      <Item
        error={(touched && hasError) || formError}
        rounded={rounded}
        bordered={bordered}
        style={[{ left: 0, paddingLeft: 0, marginLeft: 0 }, styleItem]}
      >
        {icon ? <Icon active name={icon} primary /> : null}
        <Input
          autoCapitalize="none"
          placeholderTextColor={colors.inputTextPlaceHolder}
          selectionColor={colors.inputTextSelected}
          {...input}
          ref={refInput}
          focus={this.focus}
          underlineColorAndroid={"transparent"}
          returnKeyLabel={returnKeyLabel}
          placeholder={label}
          secureTextEntry={this.state.secureTextEntry}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onEnter}
          style={styleInput}
        />
        {touched && hasError ? (
          <Text style={styles.textError}>{error}</Text>
        ) : null}

        {secureTextEntry && (
          <Icon name={this.state.iconEye} button onPress={this.toggleValue} />
        )}
      </Item>
    );
  }
}
