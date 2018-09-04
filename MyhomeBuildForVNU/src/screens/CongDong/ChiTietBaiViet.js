import React from "react";
import {
  ActionSheet,
  Button,
  Footer,
  Icon,
  Input,
  Spinner,
  Text,
  Toast,
  View
} from "native-base";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";

import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import colors from "../../../core/config/colors";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import CommentItem from "./CommentItem";
import { screenNames } from "../../config/screen";
import BaiViet, { typeAction } from "./BaiViet";

class ChiTietBaiViet extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      data: props.navigation.state.params.item,
      propsComment: undefined,
      dataComment: [],
      content: "",
      behavior: undefined,
      showLoadMore: true,
      loadingMore: false,
      loadingComment: true,
      totalComment: Number(props.navigation.state.params.totalComment),
      isComment: false,
      isLoading: false
    };
  }

  componentWillMount = () => {
    this.getScreenData();
  };

  getScreenData = () => {
    // this.getDetail();
    this.getComment();
  };

  /**
   * get chi tiết bài viết
   */
  getDetail = () => {
    const { accountInfo } = this.props;
    const id = this.props.navigation.state.params.id;
    if (accountInfo) {
      this.getFromServerWithAccount(getApiUrl(API.CHI_TIET_BAI_VIET), {
        id
      }).then(response => {
        // alert(JSON.stringify(response));
        const propsData = parseJsonFromApi(response);
        if (propsData.status === 1) {
          let data = this.state.data;
          propsData.data.image = propsData.data.image
            ? JSON.parse(propsData.data.image).map(v => `${API.HOST}${v}`)
            : [];
          data = propsData.data;
          this.setState({
            data: propsData.data,
            propsData,
            isLoading: false
          });
        } else {
          this.showAlertDialog(propsData.message);
        }
      });
    }
  };

  /**
   * get các comment của bài viết
   */
  getComment = () => {
    const { accountInfo } = this.props;
    const id = this.props.navigation.state.params.id;
    if (accountInfo) {
      this.setState({ refreshing: true });
      this.getFromServerWithAccount(getApiUrl(API.DANH_SACH_COMMENT), {
        id,
        page: this.state.page,
        page_size: this.state.pageSize
      }).then(response => {
        const propsComment = parseJsonFromApi(response);
        let { dataComment } = this.state;
        if (propsComment.status === 1) {
          const showLoadMore = propsComment.data.length === this.state.pageSize;
          dataComment =
            this.state.page === 1
              ? propsComment.data
              : [...propsComment.data, ...this.state.dataComment];
          this.setState({
            loadingMore: false,
            loadingComment: false,
            refreshing: false,
            showLoadMore,
            dataComment,
            propsComment
          });
        } else if (propsComment.status === 0) {
          this.setState({
            loadingComment: false,
            propsComment: undefined,
            refreshing: false,
            dataComment: []
          });
        } else {
          this.setState({
            loadingComment: false,
            refreshing: false
          });
          this.showAlertDialog(propsComment.message);
        }
      });
    }
  };

  /**
   * Xóa bài viết
   * @param id
   * @param self
   */
  xoaBaiViet = (id, self) => {
    self.setVisible(false);
    this.postToServerWithAccount(getApiUrl(API.XOA_BAI_VIET), {
      id
    }).then(response => {
      const propsPost = parseJsonFromApi(response);
      let msg = propsPost.message;
      let textBtn = string.thuLai;
      if (propsPost.status === 1) {
        msg = string.baiVietDaDuocXoa;
        textBtn = string.dong;
        this.props.navigation.state.params.onGoBack(id, "delete");
        this.props.navigation.goBack();
      } else self.setVisible(true);
      Toast.show({
        text: msg,
        buttonText: textBtn,
        onClose: action => {
          if (textBtn === string.thuLai && action === "user") {
            this.xoaBaiViet(id, self);
          }
        },
        duration: 3000
      });
    });
  };

  /**
   * like, dislike, xóa, sửa,...
   * @param index
   * @param type
   * @param data
   * @param self
   */
  onAction = (index, type, data, self) => {
    if (type === typeAction.MORE) {
      let { id, name } = data;
      id = id || "";
      name = name || "";
      ActionSheet.show(
        {
          options: [string.sua, string.xoa, string.dong],
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
          title: `Bài viết của ${name}`
        },
        i => {
          if (i === 0) {
            this.navigateToScreen(screenNames.SuaBaiViet, {
              onGoBack: text => {
                this.state.data.content = text;
                self.setItem(this.state.data);
              },
              id
            })();
          } else if (i === 1) {
            Alert.alert(string.thongBao, string.xoaBaiViet, [
              { text: string.huy },
              {
                text: string.xoa,
                onPress: this.xoaBaiViet.bind(this, id, self),
                style: "destructive"
              }
            ]);
          }
        }
      );
    } else if (type === typeAction.VIEW) {
      // No action
    } else if (type === typeAction.LIKE) {
      // Like post
    } else if (type === typeAction.DISLIKE) {
      // Dislike post
    } else if (type === typeAction.COMMENT) {
      // No action
    } else if (type === typeAction.VIEW_IMAGE) {
      // View image
    }
  };

  /**
   * thay đổi totalComment
   * @param type
   */
  updateComment = type => {
    const { data } = this.state;
    let totalComment = Number(data.total_comment);
    if (type === "add") totalComment += 1;
    else if (type === "delete") totalComment -= 1;
    data.total_comment = totalComment;
    this.BaiViet.setItem(data);
  };

  /**
   * comment bài viết
   */
  sendComment = () => {
    const { accountInfo } = this.props;
    const { id } = this.props.navigation.state.params;
    let { content } = this.state;
    content = content.trim();
    if (accountInfo && content) {
      if (content.length > 500) {
        this.showAlertDialog(string.khongBinhLuanQuaDai);
      } else {
        Keyboard.dismiss();
        this.postToServerWithAccount(getApiUrl(API.TAO_COMMENT), {
          id,
          content
        }).then(response => {
          const propsComment = parseJsonFromApi(response);
          if (propsComment.status === 1) {
            this.setState({ content: "", isComment: true }, this.getComment);
            this.updateComment("add");
            this.scrollToEnd(this.scrollView);
          } else {
            this.showAlertDialog(propsComment.message);
          }
        });
      }
    }
  };

  /**
   * xóa comment
   * @param id
   */
  deleteComment = id => {
    const { accountInfo } = this.props;
    if (accountInfo) {
      this.postToServerWithAccount(getApiUrl(API.XOA_COMMENT), {
        id
      }).then(response => {
        const propsComment = parseJsonFromApi(response);
        if (propsComment.status === 1) {
          this.showAlertDialog(string.daXoaBinhLuan);
          this.getComment();
          this.updateComment("delete");
        }
      });
    }
  };

  /**
   * xác nhận xóa comment
   * @param id
   */
  confirmDialog = id => {
    Alert.alert(
      string.thongBao,
      string.banChacChanMuonXoaBinhLuanNay,
      [
        { text: string.huy },
        {
          text: string.dongY,
          onPress: () => this.deleteComment(id)
        }
      ],
      { cancelable: false }
    );
  };

  /**
   * render comment
   * @param item
   * @returns {*}
   */
  renderItem = ({ item }) => {
    const { accountInfo } = this.props;
    return (
      <CommentItem
        item={item}
        accountInfoId={accountInfo.id}
        deleteComment={this.confirmDialog}
      />
    );
  };

  /**
   * refresh comment
   */
  refreshComment = () => {
    this.setState({ page: 1, refreshing: true }, this.getComment);
  };

  /**
   * load more comment
   */
  loadMoreComment = () => {
    this.setState({ loadingMore: true });
    const { data, status } = this.state.propsComment;
    if (status === 1 && data.length >= this.state.pageSize) {
      this.setState({ page: this.state.page + 1 }, this.getComment);
    }
  };

  render() {
    const {
      content,
      dataComment,
      propsComment,
      data,
      propsData,
      showLoadMore,
      loadingMore,
      loadingComment,
      refreshing,
      isComment
    } = this.state;

    let viewComment = null;
    if (loadingComment) {
      viewComment = <Spinner />;
    } else if (!propsComment) {
      viewComment = (
        <View style={styles.noComment}>
          <Text note>{string.khongCoBinhLuan}</Text>
        </View>
      );
    } else {
      viewComment = (
        <View style={styles.viewComment}>
          {showLoadMore &&
            !loadingMore && (
              <TouchableOpacity
                style={styles.loadMore}
                onPress={this.loadMoreComment}
              >
                <Text style={styles.textLoadMore}>
                  {string.xemCacBinhLuanTruoc}
                </Text>
              </TouchableOpacity>
            )}

          {loadingMore && <Spinner />}

          <FlatList
            data={dataComment}
            renderItem={this.renderItem}
            keyExtractor={item => item.id.toString()}
            refreshing={refreshing}
            onRefresh={this.refreshComment}
          />
        </View>
      );
    }

    const commentInput = (
      <Footer style={styles.footer}>
        <View style={styles.viewBinhLuan}>
          <Input
            placeholder={string.comment}
            placeholderTextColor="gray"
            value={content}
            onChangeText={content => this.setState({ content })}
            onFocus={() => {
              this.setState({ behavior: "height" });
              this.scrollToEnd(this.scrollView);
            }}
            style={{ paddingTop: Platform.OS === "android" ? 0 : 6 }}
            onSubmitEditing={this.sendComment}
          />
          <Button disabled={!content} transparent onPress={this.sendComment}>
            <Icon
              name="send"
              type="MaterialIcons"
              style={{
                fontSize: 28,
                color: content ? colors.brandPrimary : "gray"
              }}
            />
          </Button>
        </View>
      </Footer>
    );

    let contentView;
    contentView = this.renderView(propsData);
    if (!contentView) {
      contentView = (
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            ref={ref => {
              // this.scrollToEnd(ref);
              this.scrollView = ref;
            }}
          >
            <BaiViet
              ref={ref => (ref ? (this.BaiViet = ref.wrappedInstance) : null)}
              isInDetail
              item={data}
              onAction={this.onAction.bind(this, null)}
            />

            {viewComment}
          </ScrollView>

          {commentInput}
        </View>
      );
    }

    const onClose = () => {
      this.props.navigation.state.params.onGoBack(this.BaiViet.state.item);
    };

    return (
      <KeyboardAvoidingView
        enabled={Platform.OS === "ios"}
        behavior="padding"
        flex={1}
        style={{ backgroundColor: "#fff" }}
      >
        <AppHeader
          left
          onClose={onClose}
          title={string.chiTietBaiViet}
          navigation={this.props.navigation}
        />

        {contentView}
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  noComment: {
    alignItems: "center",
    marginVertical: 15
  },
  footer: {
    backgroundColor: "#fff"
  },
  viewBinhLuan: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 10
  },
  loadMore: {
    marginLeft: 10,
    padding: 10
  },
  textLoadMore: {
    fontSize: 13,
    color: colors.brandPrimary
  },
  viewComment: {
    marginBottom: 15
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  ChiTietBaiViet
);
