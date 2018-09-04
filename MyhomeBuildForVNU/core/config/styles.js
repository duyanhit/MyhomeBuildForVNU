import { Platform } from "react-native";
import colors from "./colors";

const circleView = (
  viewSize,
  borderWidth = 0,
  borderColor = "transparent"
) => ({
  width: viewSize,
  height: viewSize,
  alignItems: "center",
  justifyContent: "center",
  borderWidth,
  borderColor,
  borderRadius: viewSize / 2
});

export default {
  header: {
    title: {
      color: colors.brandPrimary
    }
  },
  circleView,
  middleView: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
    minHeight: 210
  },
  alignCenter: { textAlign: "center" },
  view: {
    cardStyle: {
      marginVertical: 5,
      marginHorizontal: 0,
      backgroundColor: "white",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 1.5,
      elevation: 3
    },
    detailScreen: {
      flex: 1,
      padding: 15
    },
    circle: {
      borderRadius: 100 / 2,
      padding: 10,
      borderWidth: 1,
      alignContent: "center",
      alignItems: "center"
    },
    middleContent: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: colors.windowBackground
    },
    listContent: {
      flex: 1,
      backgroundColor: colors.windowBackground,
      padding: 15
    },
    darkContent: {
      backgroundColor: "white"
    },
    center: {
      flex: 1,
      alignSelf: "center"
    }
  },
  directionColumn: {
    flexDirection: "column"
  },
  directionRow: {
    flexDirection: "row"
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    padding: 15
  },
  text: {
    title: { fontWeight: "bold" },
    content: { fontWeight: "normal" },
    header: { lineHeight: 32, textAlign: "center" },
    time: {
      fontSize: Platform.OS === "ios" ? 10 : 12
    },
    center: {
      textAlign: "center"
    },
    tryAgain: {
      // fontStyle: "italic"
    },
    error: {
      color: "red"
    },
    mediumBtn: {
      fontSize: 14
    },
    btnConfirmText: {
      fontSize: 14,
      color: "#fff"
    },
    btnCancelText: {
      fontSize: 14,
      color: "#888"
    },
    priceText: {
      color: "#ed6b00",
      fontWeight: "bold",
      fontSize: 14
    }
  },
  grid: {
    center: { alignItems: "center" }
  },
  list: {
    marginLeft: 0
  },
  transparent: {
    backgroundColor: "transparent"
  },
  listItem: {
    marginLeft: 0,
    marginRight: 0
  },
  icon: {
    read: {
      backgroundColor: "#888",
      height: 10,
      width: 10,
      borderRadius: 5
    },
    unRead: {
      backgroundColor: "#e21b0c",
      height: 10,
      width: 10,
      borderRadius: 5
    }
  },
  item: {
    isRead: {
      color: "#888",
      paddingLeft: 10
    },
    isNotRead: {
      paddingLeft: 10,
      color: "#333",
      fontWeight: "bold"
    }
  },
  viewCenter: {
    flex: 1,
    justifyContent: "center"
  },
  textError: {
    color: "red",
    fontSize: 12,
    paddingRight: 5
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 1.5,
    elevation: 3
  },
  button: {
    group: {
      flexDirection: "row",
      alignSelf: "center",
      marginTop: 60
    },
    mediumText: {
      fontSize: 14
    },
    huy: {
      borderWidth: 0.8,
      borderColor: "#888",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      backgroundColor: "#fff",
      borderRadius: 5
    },
    xacNhan: {
      borderWidth: 0.8,
      borderColor: colors.brandPrimary,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      backgroundColor: colors.brandPrimary,
      borderRadius: 5
    }
  },
  ICON: {
    noData: {
      fontSize: 60,
      color: "#cccccc"
    },
    error: {
      fontSize: 60,
      color: "red"
    }
  }
};
