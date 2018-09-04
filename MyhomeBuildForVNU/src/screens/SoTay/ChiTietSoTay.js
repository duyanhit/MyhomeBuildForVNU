import React from "react";
import {
  BackHandler,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import { Container, Text, View } from "native-base";
import { connect } from "react-redux";

import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import { API, getApiUrl } from "../../config/server";
import AppWebView from "../../../core/components/AppWebView";
import { assets } from "../../../assets";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import strings from "../../config/string";
import colors from "../../config/colors";

class ChiTietSoTay extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      link: "",
      showImageView: false,
      srcImageView: ""
    };
  }

  componentWillMount = () => {
    this.getScreenData();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  handleBackPress = () => {
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack();
    return true;
  };

  getScreenData = () => {
    const { accountInfo } = this.props;
    const id = this.props.navigation.state.params.id;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.SO_TAY_DAN_CU_CHI_TIET), {
        id
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          this.setState({
            isLoading: false,
            propsData,
            link: propsData.data
          });
        } else {
          this.showAlertDialog(propsData.message);
        }
      });
    }
  };

  /**
   * xem ảnh
   * @param image
   */
  callbackWeb = image => {
    if (image !== undefined && image !== null && image !== "") {
      this.setState({
        showImageView: true,
        srcImageView: image
      });
    }
  };

  render() {
    const title = this.props.navigation.state.params.title;
    const { propsData, link, showImageView, srcImageView } = this.state;
    let contentView = this.renderView(propsData);
    if (!contentView) {
      contentView = (
        <ScrollView style={styles.container}>
          <View style={styles.titleView}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <AppWebView
            style={styles.appWebView}
            source={{ uri: link }}
            injectedJavaScriptCustom={
              "$(document).on('click', '.image-show', function(e){window.postMessage($(this).prop('src'), '*');});"
            }
            onMessageCustom={e => this.callbackWeb(e)}
          />
        </ScrollView>
      );
    }

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          onClose={this.handleBackPress}
          title={strings.soTay}
          navigation={this.props.navigation}
        />
        {contentView}
        <Modal
          transparent
          animationType="fade"
          visible={showImageView || false}
          onRequestClose={() => this.setState({ showImageView: false })}
        >
          <View style={styles.viewImage}>
            <Image
              source={{ uri: srcImageView || "" }}
              resizeMode="contain"
              style={styles.image}
            />
            <TouchableWithoutFeedback
              onPress={() => this.setState({ showImageView: false })}
            >
              <Image source={assets.icClose} style={styles.close} />
            </TouchableWithoutFeedback>
          </View>
        </Modal>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  titleView: {
    alignItems: "center",
    marginTop: 10
  },
  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold"
  },
  appWebView: {
    marginVertical: 10
  },
  viewImage: {
    flex: 1,
    backgroundColor: "#000"
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute"
  },
  close: {
    height: 30,
    width: 30,
    alignSelf: "flex-end",
    marginTop: Platform.OS === "ios" ? 20 : 10,
    marginRight: 5
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  ChiTietSoTay
);
