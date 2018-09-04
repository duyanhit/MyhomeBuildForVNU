import React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { Button, Footer, FooterTab, Icon } from "native-base";

import colors from "../config/colors";

export default class TabBar extends React.PureComponent {
  navigateToScreen = routeName => () => {
    this.props.navigation.navigate(routeName);
  };

  render() {
    const { index } = this.props.navigation.state;
    return (
      <Footer>
        <FooterTab>
          {this.props.routes.map((route, tabIndex) => {
            const actived = index === tabIndex;
            return (
              <Button
                key={tabIndex}
                vertical
                active={actived}
                onPress={actived ? () => {} : this.navigateToScreen(route.name)}
              >
                <Icon name={route.icon} style={styles.icon} />
                <Text
                  numberOfLines={1}
                  style={[styles.text, actived && styles.textActive]}
                >
                  {route.label}
                </Text>
              </Button>
            );
          })}
        </FooterTab>
      </Footer>
    );
  }
}

const styles = StyleSheet.create({
  icon: {},
  text: {
    fontSize: Platform.OS === "android" ? 14 : 11,
    color: colors.tabBarTextColor
  },
  textActive: {
    color: colors.tabBarActiveTextColor
  }
});
