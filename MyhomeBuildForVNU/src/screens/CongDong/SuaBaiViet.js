import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
  Image,
  Alert,
  FlatList
} from "react-native";
import { connect } from "react-redux";
import { Content, ListItem } from "native-base";

import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import settings from "../../../core/config/metrics";
import InAppProgress from "../../component/InAppProgress";

const width = (0.9 * settings.DEVICE_WIDTH) / 3;

class SuaBaiViet extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      dataImage: [],
      content: "",
      apartment: null,
      height: 0,
      id: props.navigation.state.params.id
    };
  }

  componentWillMount = () => {
    this.getScreenData();
  };

  getScreenData = () => {
    const { accountInfo } = this.props;
    const { id } = this.state;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.CHI_TIET_BAI_VIET), {
        id
      }).then(response => {
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          this.setState({
            isLoading: false,
            propsData,
            data: propsData.data,
            content: propsData.data.content,
            dataImage: propsData.data.image
              ? JSON.parse(propsData.data.image)
              : [],
            apartment: propsData.data.apartment_id
          });
        } else {
          this.showAlertDialog(propsData.message);
        }
      });
    }
  };

  /**
   * custom ảnh
   * @param item
   * @param index
   * @returns {*}
   */
  renderItem = ({ item, index }) => {
    return (
      <View key={index}>
        <Image
          source={{ uri: API.HOST + item }}
          style={[
            styles.image,
            { marginLeft: index !== 0 && index !== 3 ? 5 : undefined }
          ]}
          resizeMode={"cover"}
        />
      </View>
    );
  };

  /**
   * hiển thị ảnh
   * @returns {*}
   */
  renderImage = () => {
    const { dataImage } = this.state;
    if (dataImage) {
      return (
        <FlatList
          data={dataImage}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
        />
      );
    }
    return null;
  };

  /**
   * sửa bài viết
   */
  post = () => {
    const { accountInfo } = this.props;
    const { content, apartment, dataImage, id } = this.state;

    this.myProgress.openDialog();

    if (accountInfo) {
      this.postToServerWithAccount(
        getApiUrl(API.TAO_BAI_VIET),
        { id, content, apartment },
        dataImage && dataImage.length ? dataImage : null
      ).then(response => {
        this.showAlertDialog(response.data.sysMessage, () => {
          this.myProgress.closeDialog();
          this.setState({ isLoading: false }, () => {
            this.props.navigation.state.params.onGoBack(content);
            this.props.navigation.goBack();
          });
        });
      });
    }
  };

  /**
   *
   */
  confirmPost = () => {
    if (!this.state.content) {
      this.showAlertDialog(string.nhapNoiDung);
      return;
    }
    Alert.alert(
      string.thongBao,
      string.capNhatThayDoi,
      [
        { text: string.huy },
        {
          text: string.dongY,
          onPress: () => {
            this.post();
          }
        }
      ],
      { cancelable: false }
    );
  };

  render() {
    const { propsData, data, content } = this.state;
    let contentView = this.renderView(propsData);
    if (!contentView) {
      contentView = (
        <Content>
          <ListItem style={styles.listItem}>
            <Text note style={styles.titleView}>
              {string.congDongDaChon}
            </Text>
            <Text note style={styles.apartmentSelect}>
              {data.apartment_name}
            </Text>
          </ListItem>

          <TouchableWithoutFeedback
            onPress={() => {
              this.refs.inputContent.focus();
            }}
          >
            <View style={styles.viewInput}>
              <TextInput
                ref="inputContent"
                style={[styles.inputContent, { fontSize: 16 }]}
                underlineColorAndroid="transparent"
                multiline
                placeholder={string.noiDung}
                placeholderTextColor="gray"
                value={content}
                onChangeText={text => this.setState({ content: text })}
              />
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.flatList}>{this.renderImage()}</View>
        </Content>
      );
    }

    const rightButtons = [
      {
        icon: "send",
        iconType: "MaterialIcons",
        onPress: () => this.confirmPost()
      }
    ];

    return (
      <View style={styles.container}>
        <AppHeader
          left
          title={string.suaBaiViet}
          navigation={this.props.navigation}
          rightButtons={rightButtons}
        />

        <InAppProgress self={self => (this.myProgress = self)} />

        {contentView}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  listItem: {
    marginLeft: 0,
    paddingRight: 0
  },
  titleView: {
    color: "#000",
    marginHorizontal: 10
  },
  apartmentSelect: {
    fontWeight: "bold",
    color: "#000"
  },
  viewInput: {
    minHeight: 200
  },
  inputContent: {
    width: "100%",
    backgroundColor: "#fff",
    fontSize: 18,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingLeft: 5
  },
  flatList: {
    paddingHorizontal: 12,
    marginTop: 10
  },
  image: {
    width: width,
    height: width,
    marginBottom: 5
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  SuaBaiViet
);
