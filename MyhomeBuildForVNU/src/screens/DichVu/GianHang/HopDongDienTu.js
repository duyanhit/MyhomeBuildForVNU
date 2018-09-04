import React from "react";
import { Text, TouchableOpacity, View, StyleSheet, Modal } from "react-native";
import { Container, Content, Header, Title } from "native-base";

import AppComponent from "../../../../core/components/AppComponent";
import AppWebView from "../../../../core/components/AppWebView";
import { API } from "../../../config/server";
import config from "../../../../core/config";
import string from "../../../config/string";
import colors from "../../../config/colors";

class HopDongDienTu extends AppComponent {
  render() {
    const { showModalLicense, closeModalLicense, navigation } = this.props;

    return (
      <Modal
        visible={showModalLicense}
        onRequestClose={() => {
          closeModalLicense();
          navigation.goBack();
        }}
        animationType="fade"
      >
        <Container>
          <Header style={styles.viewHeader}>
            <Title style={styles.textTitle}>
              {string.dieuKhoanTaoGianHang}
            </Title>
          </Header>

          <Content>
            <AppWebView
              style={styles.appWebView}
              source={{ uri: API.HOST + API.HOP_DONG_DIEN_TU }}
            />
          </Content>

          <View style={styles.viewButton}>
            <TouchableOpacity
              style={[config.styles.button.huy, { marginRight: 5, flex: 1 }]}
              onPress={() => {
                closeModalLicense();
                navigation.goBack();
              }}
            >
              <Text style={config.styles.text.btnCancelText}>
                {string.khongDongY}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[config.styles.button.xacNhan, { marginLeft: 5, flex: 1 }]}
              onPress={closeModalLicense}
            >
              <Text style={config.styles.text.btnConfirmText}>
                {string.toiDongY}
              </Text>
            </TouchableOpacity>
          </View>
        </Container>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  viewHeader: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 0.8,
    borderBottomColor: colors.windowBackground
  },
  textTitle: {
    color: "black"
  },
  appWebView: {
    width: "100%",
    height: "100%"
  },
  viewButton: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 0.8,
    borderTopColor: colors.windowBackground
  }
});

export default HopDongDienTu;
