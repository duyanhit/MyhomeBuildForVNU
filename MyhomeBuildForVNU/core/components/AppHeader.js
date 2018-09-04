import React from "react";
import { Platform } from "react-native";
import PropTypes from "prop-types";
// import * as Expo from "expo";
import {
  Body,
  Button,
  Header,
  Icon,
  Left,
  Right,
  Text,
  Title
} from "native-base";
import IconVec from "@expo/vector-icons";
// import Moment from "moment";
// import AppDatePicker from "../components/AppDatePicker";
import ButtonRawText from "./ButtonRawText";
import config from "../config";
import colors from "../config/colors";

const isIOS = Platform.OS === "ios";

export default class AppHeader extends React.Component {
  static propTypes = {
    left: PropTypes.bool,
    title: PropTypes.string,
    subTitle: PropTypes.string,
    navigation: PropTypes.object,
    callbackOnGoBack: PropTypes.func,
    onClose: PropTypes.func,
    style: PropTypes.object
  };

  // renderCalendar = (maxDate, dispatchType, index) => {
  //   return (
  //     <Button transparent key={index}>
  //       <AppDatePicker
  //         style={{ width: 26 }}
  //         date={Moment(this.state.date).format("YYYY-MM-DD")}
  //         mode="date"
  //         format="YYYY-MM-DD"
  //         minDate="2016-09-01"
  //         maxDate={maxDate}
  //         confirmBtnText={getLang(lang.label_ok, this.state.language)}
  //         cancelBtnText={getLang(lang.label_cancel, this.state.language)}
  //         hideText={true}
  //         timeZoneOffsetInMinutes={7 * 60}
  //         language={this.props.navigation.state.params.language}
  //         customStyles={{
  //           dateIcon: { position: "absolute", left: 0, top: 4, marginLeft: 0 },
  //           dateInput: { marginLeft: 0 }
  //         }}
  //         onDateChange={date =>
  //           this.props.dispatchParams
  //             ? this.props.dispatchParams({ date }, dispatchType)
  //             : {}}
  //       />
  //     </Button>
  //   );
  // };

  //render left button -----------------------------------------------
  _renderLeftButton = () => {
    const { leftIcon } = this.props;
    let icon;
    if (leftIcon === "menu") {
      icon = "menu";
    } else if (leftIcon === "close") {
      icon = "md-close";
    } else if (leftIcon === "home") {
      icon = "home";
    } else {
      icon = "arrow-back";
    }
    return (
      <Left style={{ maxWidth: 50 }}>
        <Button
          transparent
          onPress={this._leftAction}
          androidRippleColor="#ffffff"
        >
          <Icon style={{ color: colors.textHeader }} name={icon} />
        </Button>
      </Left>
    );
  };
  _leftAction = () => {
    const { leftIcon, onClose, navigation, onPressBackButton } = this.props;
    if (leftIcon && leftIcon.toString() === "menu") {
      this.props.navigation.openDrawer();
    } else {
      if (onClose) {
        onClose();
      }
      if (navigation) {
        if (onPressBackButton) onPressBackButton();
        else navigation.goBack();
      }
    }
  };
  //end render left button ------------------------------------------

  //render title ----------------------------------------------------
  _renderTitle = () => {
    const { title, subTitle } = this.props;
    const bodyStyle =
      (isIOS && {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }) ||
      {};
    return (
      <Body style={bodyStyle}>
        {subTitle && (
          <Text note style={config.styles.header.title} numberOfLines={2}>
            {subTitle}
          </Text>
        )}
        <Title style={{ color: colors.textHeader }}>{title}</Title>
      </Body>
    );
  };
  //end render title ------------------------------------------------

  //end render right button -----------------------------------------
  _renderRightButton = () => {
    const { left, rightButtons } = this.props;

    if (rightButtons === undefined) {
      if (left && isIOS) return <Right style={{ maxWidth: 50 }} />;
      return null;
    }

    const buttons = rightButtons.map((value, index) => {
      let icon;
      if (value.icon) {
        const FontName = IconVec[value.iconType];
        icon = null;
        if (FontName) {
          icon = (
            <FontName
              name={value.icon}
              size={config.settings.iconSize}
              color={colors.textHeader}
            />
          );
        }
        //         size={config.settings.iconSize}
        //         color={'white'} />;
        // switch (value.iconType) {
        //   case 'FontAwesome':
        //     icon = (
        //       <FontAwesome
        //         name={value.icon}
        //         size={config.settings.iconSize}
        //         color={'white'}
        //       />
        //     );
        //     break;
        //   case 'MaterialIcons':
        //     icon = (
        //       <MaterialIcons
        //         name={value.icon}
        //         size={config.settings.iconSize}
        //         color={'white'}
        //       />
        //     );
        //     break;
        //   default:
        //     icon = <Icon name={value.icon} />;
        //     break;
        // }
        return (
          <Button transparent key={index} onPress={value.onPress}>
            {icon}
          </Button>
        );
      } else if (value.text) {
        return (
          <ButtonRawText
            onPress={value.onPress}
            transparent
            text={value.text}
            key={index}
            textStyle={value.textStyle && value.textStyle}
          />
        );
      } else if (value.view) {
        return (
          <Button transparent key={index}>
            {value.viewContent}
          </Button>
        );
      }
      return null;
    });

    const maxWidth = 50 * rightButtons.length;
    return <Right style={{ maxWidth: maxWidth }}>{buttons}</Right>;
  };

  //end render right button -----------------------------------------

  render() {
    return (
      <Header
        noShadow={true}
        style={[
          {
            backgroundColor: "white",
            borderBottomWidth: 0.8,
            borderBottomColor: colors.windowBackground
          },
          this.props.style
        ]}
      >
        {this.props.left && this._renderLeftButton()}
        {this._renderTitle()}
        {this._renderRightButton()}
      </Header>
    );
  }
}
