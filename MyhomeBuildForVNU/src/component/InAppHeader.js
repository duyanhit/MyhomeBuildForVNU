import React from "react";
import { View } from "react-native";
import { connect } from "react-redux";

import AppHeader from "../../core/components/AppHeader";
import { screenNames } from "../config/screen";
import AppComponent from "../../core/components/AppComponent";

class InAppHeader extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      multiSelect: false
    };
    this.props.self(this);
  }

  onMultiSelect = () => {
    this.setState({ multiSelect: true });
  };

  cancelMultiSelect = () => {
    this.setState({ multiSelect: false });
  };

  render() {
    const { multiSelect } = this.state;
    const {
      title,
      deleteMultiItem,
      cancelMultiSelect,
      showFilter,
      api,
      message
    } = this.props;

    const countHome = this.countHome();

    // const rightButtons = [
    //   multiSelect && {
    //     icon: "delete",
    //     iconType: "MaterialIcons",
    //     onPress: () => deleteMultiItem(api, message)
    //   },
    //   countHome > 1 && !multiSelect
    //     ? {
    //         icon: "filter-list",
    //         iconType: "MaterialIcons",
    //         onPress: () => showFilter()
    //       }
    //     : {}
    // ];

    let rightButtons;
    if (multiSelect) {
      rightButtons = [
        {
          icon: "delete",
          iconType: "MaterialIcons",
          onPress: () => deleteMultiItem(api, message)
        }
      ];
    } else if (countHome > 1 && !multiSelect) {
      rightButtons = [
        {
          icon: "filter-list",
          iconType: "MaterialIcons",
          onPress: () => showFilter()
        }
      ];
    }

    let onClose;
    let style;
    let navigation = this.props.navigation;
    if (multiSelect) {
      onClose = () => cancelMultiSelect();
      style = { backgroundColor: "#4b4b4b" };
      navigation = null;
    }

    return (
      <View>
        <AppHeader
          left
          onClose={onClose}
          title={title}
          rightButtons={rightButtons}
          navigation={navigation}
          style={style}
          onPressBackButton={() =>
            this.props.navigation.navigate(screenNames.Main)
          }
        />
      </View>
    );
  }
}

export default connect(state => ({ accountInfo: state.accountReducer }))(
  InAppHeader
);
