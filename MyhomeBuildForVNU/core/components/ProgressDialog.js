import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

const ProgressDialog = ({ visible, message }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={() => {}}
  >
    <View style={styles.container}>
      <View style={styles.loading}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
        <View style={styles.loadingContent}>
          <Text>{message}</Text>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, .5)",
    alignItems: "center",
    justifyContent: "center"
  },
  loading: {
    padding: 30,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5
  },
  loader: {},
  loadingContent: {
    paddingLeft: 15
  }
});

export default ProgressDialog;
