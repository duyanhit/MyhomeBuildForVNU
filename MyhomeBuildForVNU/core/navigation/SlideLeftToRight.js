import { Animated, Easing } from "react-native";

// function forInitial(props) {
//   const { navigation, scene } = props;
//
//   const focused = navigation.state.index === scene.index;
//   const opacity = focused ? 1 : 0;
//   // If not focused, move the scene far away.
//   const translate = focused ? 0 : 1000000;
//   return {
//     opacity,
//     transform: [{ translateX: translate }, { translateY: translate }]
//   };
// }
//
// function forHorizontal(props) {
//   const { layout, position, scene } = props;
//
//   if (!layout.isMeasured) {
//     return forInitial(props);
//   }
//
//   const index = scene.index;
//   const inputRange = [index - 1, index, index + 1];
//
//   const width = layout.initWidth;
//   const outputRange = I18nManager.isRTL
//     ? ([-width, 0, width * 0.3]: Array<number>)
//     : ([width, 0, width * -0.3]: Array<number>);
//
//   // Add [index - 1, index - 0.99] to the interpolated opacity for screen transition.
//   // This makes the screen's shadow to disappear smoothly.
//   const opacity = position.interpolate({
//     inputRange: [index - 1, index - 0.99, index, index + 0.99, index + 1],
//     outputRange: [0, 1, 1, 0.3, 0]
//   });
//
//   const translateY = 0;
//   const translateX = position.interpolate({
//     inputRange,
//     outputRange
//   });
//
//   return {
//     opacity,
//     transform: [{ translateX }, { translateY }]
//   };
// }

export default function getSlideFromRightTransitionConfig() {
  return {
    transitionSpec: {
      duration: 300,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true
    },
    screenInterpolator: sceneProps => {
      const { position, layout, scene, index, scenes } = sceneProps;
      const toIndex = index;
      const thisSceneIndex = scene.index;
      const height = layout.initHeight;
      const width = layout.initWidth;

      const translateX = position.interpolate({
        inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
        outputRange: [width, 0, -width / 10]
      });

      return { transform: [{ translateX }] };
    }
  };
}
