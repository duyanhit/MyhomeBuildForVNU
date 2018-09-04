import React, { Component } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Gallery from "react-native-image-gallery";
import { Icon } from "native-base";
import strings from "../config/string";

class ShowImageView extends Component {
  images = [];

  static defaultProps = {
    showGallery: false,
    onRequestClose: undefined,
    onClosePress: undefined,
    initPage: 0,
    image: undefined
  };

  constructor(props) {
    super(props);
    this.state = {
      index: this.props.initPage
    };
  }

  onChangeImage = index => {
    this.setState({ index });
  };

  renderError = () => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text style={styles.textKhongTaiAnh}>{strings.khongTaiDuocAnh}</Text>
      </View>
    );
  };

  render() {
    if (this.props.image) {
      this.images = this.props.image.map(value => ({ source: { uri: value } }));
    }

    const { index } = this.state;

    return (
      <Modal
        transparent
        visible={this.props.showGallery || false}
        onRequestClose={this.props.onRequestClose}
        animationType="fade"
      >
        <View style={styles.viewModal}>
          <Gallery
            style={{ flex: 1 }}
            pageMargin={10}
            errorComponent={this.renderError}
            onPageSelected={this.onChangeImage}
            images={this.images}
            initialPage={this.props.initPage}
          />

          <View style={styles.iconCloseModal}>
            <TouchableOpacity onPress={this.props.onClosePress}>
              <Icon
                hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                name={"ios-close"}
                style={styles.iconClose}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.viewPagenumber}>
            <Text style={styles.textPagenumber}>
              {index + 1} / {this.images.length}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  viewModal: {
    backgroundColor: "#000",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  iconClose: {
    fontSize: 40,
    color: "white"
  },
  iconCloseModal: {
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    position: "absolute",
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  viewPagenumber: {
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    position: "absolute",
    justifyContent: "center",
    bottom: 10,
    height: 30,
    width: 60
  },
  textPagenumber: {
    textAlign: "center",
    color: "white",
    fontSize: 13,
    fontStyle: "italic"
  },
  textKhongTaiAnh: {
    color: "white",
    fontSize: 15,
    fontStyle: "italic"
  }
});

export default ShowImageView;
