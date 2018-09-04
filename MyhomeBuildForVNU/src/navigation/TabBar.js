import React from "react";
import { Icon } from "native-base";
import { connect } from "react-redux";
import AppComponent from "../../core/components/AppComponent";
import BottomNavigation, {
  ShiftingTab
} from "react-native-material-bottom-navigation";
import colors from "../../core/config/colors";
import IconVec from "@expo/vector-icons";

class TabBar extends AppComponent {
  state = { arrTabScreens: [] };

  renderIcon = (icon, iconType) => ({ isActive }) => {
    const style = isActive ? { color: "white" } : { color: "#FFFFFF99" };
    if (!iconType) {
      return <Icon style={[style, { fontSize: 24 }]} name={icon} />;
    }
    const FontName = IconVec[iconType];
    return <FontName style={[style, { fontSize: 24 }]} name={icon} />;
  };

  renderTab = ({ tab, isActive }) => {
    return (
      <ShiftingTab
        key={tab.key}
        isActive={isActive}
        label={tab.label}
        renderIcon={this.renderIcon(tab.icon, tab.iconType)}
        animationDuration={10}
      />
    );
  };

  render() {
    const { index, routes } = this.props.navigation.state;
    return (
      <BottomNavigation
        activeTab={routes[index].routeName}
        style={{ backgroundColor: colors.brandPrimary }}
        onTabPress={activeTab => this.props.navigation.navigate(activeTab.name)}
        renderTab={this.renderTab}
        tabs={this.props.routes}
      />
    );
  }
}

export default connect(state => ({
  accountInfo: state.accountReducer
}))(TabBar);
