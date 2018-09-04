import React from "react";
import { Animated, Easing } from "react-native";
import {
  createSwitchNavigator,
  createDrawerNavigator,
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
import TabBar from "./TabBar";
//animated
import getSlideFromRightTransitionConfig from "./SlideLeftToRight";
import AppHeader from "../components/AppHeader";

/**
 *
 * @param {[{name: string, screen: Component, icon: string, label: string}]} screenObj
 * @param {Component} CustomTabBar
 */
export const createTabNavigators = (screenObj, CustomTabBar) => {
  //routeConfigMap setting
  const routeConfigMap = {};
  screenObj.forEach(value => {
    routeConfigMap[value.name] = { screen: value.screen };
  });

  let tabBar;
  if (!CustomTabBar) {
    tabBar = props => <TabBar {...props} routes={screenObj} />;
  } else if (CustomTabBar instanceof Function) {
    tabBar = props => <CustomTabBar {...props} routes={screenObj} />;
  } else {
    tabBar = CustomTabBar;
  }

  //drawConfigMap setting
  const drawConfigMap = {
    navigationOptions: {
      header: props => {
        const { index } = props.scene.route;
        return (
          <AppHeader
            left
            leftIcon={"menu"}
            title={screenObj[index].label}
            {...props}
          />
        );
      }
    },
    swipeEnabled: true,
    lazy: true,
    tabBarPosition: "bottom",
    animationEnabled: false,
    tabBarComponent: tabBar
  };
  return createBottomTabNavigator(routeConfigMap, drawConfigMap);
};

/**
 *
 * @param {[]} screenObj
 * @param {object} stackConfig
 */
export const createStackNavigators = (screenObj, stackConfig) => {
  //routeConfigMap setting
  const routeConfigMap = {};
  screenObj.forEach(value => {
    routeConfigMap[value.name] = { screen: value.screen };
    if (value.navigationOptions) {
      routeConfigMap[value.name] = {
        screen: value.screen,
        navigationOptions: value.navigationOptions
      };
    }
  });

  //stackConfig setting
  let stackConfigMap = stackConfig;
  if (stackConfigMap === undefined) {
    stackConfigMap = {
      mode: "card",
      transitionConfig: getSlideFromRightTransitionConfig
    };
  } else {
    stackConfigMap.transitionConfig = getSlideFromRightTransitionConfig;
  }

  return createStackNavigator(routeConfigMap, stackConfigMap);
};

/**
 *
 * @param {[]} screenObj
 * @param {object} drawerConfigMap
 */
export const createDrawerNavigators = (screenObj, drawerConfigMap) => {
  //routeConfigMap setting
  const routeConfigMap = {};
  screenObj.forEach(value => {
    routeConfigMap[value.name] = { screen: value.screen };
  });

  //stackConfigMap setting
  // if (drawerConfigMap === undefined) {
  // } else {
  // }

  return createDrawerNavigator(routeConfigMap, drawerConfigMap);
};
/**
 *
 * @param {[]} screenObj
 * @param {object} switchConfig
 */
export const createSwitchNavigators = (screenObj, switchConfig) => {
  const routeConfigMap = {};
  screenObj.forEach(value => {
    routeConfigMap[value.name] = { screen: value.screen };
  });
  return createSwitchNavigator(routeConfigMap, switchConfig);
};
