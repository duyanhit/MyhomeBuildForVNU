import React, { Component } from "react";
import { Container, ScrollableTab, Tab, Tabs } from "native-base";

import colors from "../../../../config/colors";
import string from "../../../../config/string";
import AppHeader from "../../../../../core/components/AppHeader";
import DanhSachDonBan from "./DanhSachDonBan";

const orderStatus = {
  CHO_XAC_NHAN: 1,
  DANG_GIAO_HANG: 2,
  DA_GIAO_HANG: 3,
  DA_HUY: 4
};

class DonBan extends Component {
  render() {
    const { storeId } = this.props.navigation.state.params;

    return (
      <Container>
        <AppHeader
          style={{ borderBottomWidth: 0 }}
          left
          title={string.donBan}
          navigation={this.props.navigation}
        />

        <Tabs
          locked={true}
          tabBarUnderlineStyle={{
            backgroundColor: colors.brandPrimary,
            height: 1
          }}
          tabContainerStyle={{
            height: 40,
            elevation: 0
          }}
          renderTabBar={() => (
            <ScrollableTab
              style={{
                backgroundColor: "#fff",
                borderBottomWidth: 0.8,
                borderBottomColor: colors.windowBackground
              }}
            />
          )}
        >
          <Tab
            heading={string.choXacNhan}
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: "#c9c9c9" }}
            activeTextStyle={{ color: colors.brandPrimary }}
          >
            <DanhSachDonBan
              orderStatus={orderStatus.CHO_XAC_NHAN}
              navigation={this.props.navigation}
              storeId={storeId}
            />
          </Tab>

          <Tab
            heading={string.dangGiaoHang}
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: "#c9c9c9" }}
            activeTextStyle={{ color: colors.brandPrimary }}
          >
            <DanhSachDonBan
              orderStatus={orderStatus.DANG_GIAO_HANG}
              navigation={this.props.navigation}
              storeId={storeId}
            />
          </Tab>

          <Tab
            heading={string.daGiaoHang}
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: "#c9c9c9" }}
            activeTextStyle={{ color: colors.brandPrimary }}
          >
            <DanhSachDonBan
              orderStatus={orderStatus.DA_GIAO_HANG}
              navigation={this.props.navigation}
              storeId={storeId}
            />
          </Tab>

          <Tab
            heading={string.daHuy}
            activeTabStyle={{ backgroundColor: "#fff" }}
            tabStyle={{ backgroundColor: "#fff" }}
            textStyle={{ color: "#c9c9c9" }}
            activeTextStyle={{ color: colors.brandPrimary }}
          >
            <DanhSachDonBan
              orderStatus={orderStatus.DA_HUY}
              navigation={this.props.navigation}
              storeId={storeId}
            />
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

export default DonBan;
