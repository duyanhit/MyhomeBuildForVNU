import React from "react";
import { Body, Container, Content, ListItem, Text, View } from "native-base";
import {
  Alert,
  BackHandler,
  FlatList,
  StyleSheet,
  TextInput
} from "react-native";
import { connect } from "react-redux";

import AppComponent from "../../../core/components/AppComponent";
import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import { API, getApiUrl } from "../../config/server";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import config from "../../../core/config";
import colors from "../../../core/config/colors";
import CheckBox from "../../../core/components/CheckBox";
import { formatDate2 } from "../../../core/helpers/timeHelper";

class ChiTietKhaoSat extends AppComponent {
  // trả thêm key month, expired
  thongBaoKey = {
    expired: undefined, //item.expired
    type: undefined, // item.type
    isView: undefined //item.viewable
  };

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
    const id = this.props.navigation.state.params.id;
    const { accountInfo } = this.props;
    this.getFromServerWithAccount(getApiUrl(API.CHI_TIET_KHAO_SAT), {
      id
    }).then(response => {
      this.setState({
        isLoading: false,
        refreshing: false,
        propsData: parseJsonFromApi(response)
      });
    });
  };

  /**
   * gửi kết quả
   */
  sendResult = () => {
    const id = this.props.navigation.state.params.id;
    const { accountInfo } = this.props;

    this.setState({ dialogVisible: true });
    if (accountInfo) {
      this.postToServerWithAccount(getApiUrl(API.GUI_LUA_CHON_KHAO_SAT), {
        id,
        note_value: this.getCheckedID()
      }).then(response => {
        this.setState({ dialogVisible: false });
        const result = parseJsonFromApi(response);
        const status = result.status;

        if (status === 1) {
          this.showAlertDialog(string.guiCauTraLoiThanhCong, () => {
            this.handleBackPress();
            this.props.navigation.state.params.myCallback();
          });
        } else {
          this.showAlertDialog(result.message);
        }
      });
    }
  };

  /**
   *
   * @returns {any}
   */
  getCheckedID = () => {
    let data = this.state.propsData.data.question;
    let idArray = [];

    data.forEach(item => {
      let answ = {
        id: item.id,
        answer: undefined,
        value: undefined
      };

      const type = item.type;
      const isOther = item.is_other;
      const answer = item.answer;

      switch (type) {
        case "0": // chọn 1
          if (isOther === "0") {
            // không có ĐA khác
            answer.forEach(itemAns => {
              if (itemAns.checked === "1") {
                answ = { ...answ, answer: itemAns.id, value: "" };
                idArray.push(answ);
              }
            });
          } else if (isOther === "1") {
            // có ĐA khác - chỉ lấy 1 đáp án được chọn
            let haveCheck = false;
            answer.forEach(itemAns => {
              if (itemAns.checked === "1") {
                haveCheck = true;
                answ = { ...answ, answer: itemAns.id, value: "" };
                idArray.push(answ);
              }
            });
            if (!haveCheck) {
              // không có item nào đc chọn, kiểm tra xem ĐA khác có đc chọn hay k
              if (item.last_answer_value !== null) {
                answ = { ...answ, answer: "", value: item.last_answer_value };
                idArray.push(answ);
              }
            }
          } else if (isOther === "2") {
            // có lý do - lấy 1 đáp án được chọn và lý do
            let haveCheck = false;
            answer.forEach(itemAns => {
              if (itemAns.checked === "1") {
                haveCheck = true;
                answ = { ...answ, answer: itemAns.id, value: "" };
              }
            });
            if (!haveCheck) {
              // không có item nào đc chọn, kiểm tra xem có lý do hay k
              if (item.last_answer_value !== null) {
                answ = { ...answ, answer: "", value: item.last_answer_value };
                idArray.push(answ);
              }
            } else {
              // có item đc chọn, kiểm tra xem có lý do hay k
              if (item.last_answer_value !== null) {
                answ = { ...answ, value: item.last_answer_value };
                idArray.push(answ);
              } else {
                answ = { ...answ, value: "" };
                idArray.push(answ);
              }
            }
          }

          break;
        case "1": // chọn nhiều
          if (isOther === "0") {
            // không có ĐA khác
            let ids = [];
            answer.forEach(itemAns => {
              if (itemAns.checked === "1") {
                ids.push(itemAns.id);
              }
            });

            if (ids.length > 0) {
              answ = { ...answ, answer: ids.join(), value: "" };
              idArray.push(answ);
            }
          } else if (isOther === "1") {
            // có ĐA khác - lấy tất cả đáp án được chọn và đáp án khác
            let ids = [];
            answer.forEach(itemAns => {
              if (itemAns.checked === "1") {
                // lấy tất cả id đáp án đc check
                ids.push(itemAns.id);
              }
            });

            if (ids.length > 0) {
              // có item đc chọn, kiểm tra xem có đáp án khác hay k
              answ = { ...answ, answer: ids.join(), value: "" };
              if (item.last_answer_value !== null) {
                // có đáp án khác
                answ = {
                  ...answ,
                  answer: ids.join(),
                  value: item.last_answer_value
                };
              }
              idArray.push(answ);
            } else {
              // không có item đc chọn, kiểm tra xem có đáp án khác hay k
              answ = { ...answ, answer: "", value: "" };
              if (item.last_answer_value !== null) {
                answ = {
                  ...answ,
                  answer: "",
                  value: item.last_answer_value
                };
                idArray.push(answ);
              }
            }
          } else if (isOther === "2") {
            // có lý do - lấy tất cả các đáp án được chọn và lý do
            let ids = [];
            answer.forEach(itemAns => {
              if (itemAns.checked === "1") {
                // lấy tất cả id đáp án đc check
                ids.push(itemAns.id);
              }
            });

            if (ids.length > 0) {
              // có item đc chọn, kiểm tra xem có lý do hay k
              answ = { ...answ, answer: ids.join(), value: "" };
              if (item.last_answer_value !== null) {
                // có lý do
                answ = {
                  ...answ,
                  answer: ids.join(),
                  value: item.last_answer_value
                };
              }
              idArray.push(answ);
            } else {
              // không có item đc chọn, kiểm tra xem có lý do hay k
              answ = { ...answ, answer: "", value: "" };
              if (item.last_answer_value !== null) {
                answ = {
                  ...answ,
                  answer: "",
                  value: item.last_answer_value
                };
                idArray.push(answ);
              }
            }
          }
          break;
        case "2": // tự luận
          if (item.last_answer_value !== null) {
            answ = { ...answ, answer: "", value: item.last_answer_value };
            idArray.push(answ);
          }
          break;
        default:
          break;
      }
    });

    return idArray.length > 0 ? JSON.stringify(idArray) : undefined;
  };

  /**
   * Xác nhận gửi câu trả lời
   */
  showConfirmDialog = () => {
    if (this.getCheckedID() === undefined) {
      this.showAlertDialog(string.vuiLongTraLoiCauHoi);
    } else {
      const type = this.thongBaoKey.type;

      Alert.alert(
        string.thongBao,
        type === "0" ? string.banMuonGuiCauTraLoi : string.banMuonGuiDangKy,
        [
          { text: string.huy },
          {
            text: string.dongY,
            onPress: () => {
              this.sendResult();
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  /**
   *
   * @param item
   */
  onOtherRadioPress = item => {};

  /**
   *
   * @param item
   */
  onOtherCheckboxPress = item => {};

  /**
   *
   * @param clickItem
   * @param newText
   */
  onOtherInputChange = (clickItem, newText) => {
    //check xem nếu là radio thì phải uncheck hết các radio đang được check trong câu hỏi
    let { propsData } = this.state;
    propsData = {
      ...propsData,
      data: {
        ...propsData.data,
        question: propsData.data.question.map(item => {
          return {
            ...item,
            last_answer_value:
              item.id === clickItem.id
                ? newText !== ""
                  ? newText
                  : null
                : item.last_answer_value,
            answer:
              item.type === "0" && item.id === clickItem.id
                ? item.answer.map(item2 => {
                    return {
                      ...item2,
                      checked: "0"
                    };
                  })
                : item.answer
          };
        })
      }
    };

    this.setState({
      propsData
    });
  };

  /**
   *
   * @param clickItem
   * @param newText
   */
  onCommentInputChange = (clickItem, newText) => {
    let { propsData } = this.state;
    propsData = {
      ...propsData,
      data: {
        ...propsData.data,
        question: propsData.data.question.map(item => {
          return {
            ...item,
            last_answer_value:
              item.id === clickItem.id
                ? newText !== ""
                  ? newText
                  : null
                : item.last_answer_value
          };
        })
      }
    };

    this.setState({
      propsData
    });
  };

  /**
   *
   * @param clickItem
   * @param newText
   */
  onInputChange = (clickItem, newText) => {
    let { propsData } = this.state;
    propsData = {
      ...propsData,
      data: {
        ...propsData.data,
        question: propsData.data.question.map(item => {
          return {
            ...item,
            last_answer_value:
              item.id === clickItem.id
                ? newText !== ""
                  ? newText
                  : null
                : item.last_answer_value
          };
        })
      }
    };

    this.setState({
      propsData
    });
  };

  /**
   *
   * @param clickItem
   * @param itemID
   */
  onRadioPress = (clickItem, itemID) => {
    let { propsData } = this.state;
    propsData = {
      ...propsData,
      data: {
        ...propsData.data,
        question: propsData.data.question.map(item => {
          return {
            ...item,
            answer:
              item.type === "0" && item.id === itemID
                ? item.answer.map(item2 => {
                    return {
                      ...item2,
                      checked: item2.id === clickItem.id ? "1" : "0"
                    };
                  })
                : item.answer,
            last_answer_value:
              item.type === "0" && item.id === itemID
                ? null
                : item.last_answer_value
          };
        })
      }
    };

    this.setState({
      propsData
    });
  };

  /**
   *
   * @param clickItem
   * @param itemID
   */
  onCheckboxPress = (clickItem, itemID) => {
    let { propsData } = this.state;
    propsData = {
      ...propsData,
      data: {
        ...propsData.data,
        question: propsData.data.question.map(item => {
          return {
            ...item,
            answer:
              item.type === "1" && item.id === itemID
                ? item.answer.map(item2 => {
                    return {
                      ...item2,
                      checked:
                        item2.id === clickItem.id
                          ? item2.checked === "0"
                            ? "1"
                            : "0"
                          : item2.checked
                    };
                  })
                : item.answer
          };
        })
      }
    };

    this.setState({
      propsData
    });
  };

  /**
   *
   * @param item
   * @param index
   * @param type
   * @param itemID
   * @returns {*}
   */
  renderAnswer = ({ item, index, type, itemID }) => {
    return (
      <ListItem
        key={index}
        button
        style={{ borderBottomWidth: 0 }}
        onPress={() =>
          type === "0"
            ? this.onRadioPress(item, itemID)
            : this.onCheckboxPress(item, itemID)
        }
      >
        {type === "0" ? (
          <CheckBox
            iconSize={25}
            iconName="matCircleMix"
            checked={item.checked === "1"} // 0 - chua check, 1 - co check
            checkedColor={colors.brandPrimary}
            uncheckedColor="gray"
            onChange={() => this.onRadioPress(item, itemID)}
          />
        ) : (
          <CheckBox
            iconSize={25}
            iconName="matMix"
            checked={item.checked === "1"} // 0 - chua check, 1 - co check
            checkedColor={colors.brandPrimary}
            uncheckedColor="gray"
            onChange={() => this.onCheckboxPress(item, itemID)}
          />
        )}

        <Body>
          <Text style={[config.styles.text.content, { marginLeft: 15 }]}>
            {item.content}
          </Text>
          {this.thongBaoKey.isView === "1" ? (
            <Text
              note
              style={[
                styles.vote,
                {
                  fontSize: 12,
                  fontWeight: "bold",
                  width: 70,
                  padding: 2,
                  textAlign: "center"
                }
              ]}
            >
              {item.total} <Text style={styles.vote}>{string.luotChon}</Text>
            </Text>
          ) : null}
        </Body>
      </ListItem>
    );
  };

  /**
   *
   * @param item
   * @param index
   * @returns {*}
   */
  renderQuestion = ({ item, index }) => {
    // item.type: 0 - chọn 1, 1 - chọn nhiều, 2 - tự luận
    // item.is_other: 0 - không có ĐA khác, 1 - có ĐA khác, 2 - Có lý do
    const type = item.type;
    const itemID = item.id;
    const isOther = item.is_other;

    const dapAnKhacView = (
      <ListItem style={{ borderBottomWidth: 0 }} button>
        {type === "0" ? (
          <CheckBox
            iconSize={25}
            iconName="matCircleMix"
            checked={
              item.last_answer_value !== null && item.last_answer_value !== ""
            }
            checkedColor={colors.brandPrimary}
            uncheckedColor="gray"
            onChange={() => this.onOtherRadioPress(item)}
          />
        ) : (
          <CheckBox
            iconSize={25}
            iconName="matMix"
            checked={
              item.last_answer_value !== null && item.last_answer_value !== ""
            }
            checkedColor={colors.brandPrimary}
            uncheckedColor="gray"
            onChange={() => this.onOtherCheckboxPress(item)}
          />
        )}

        <Body>
          <TextInput
            style={[
              styles.input,
              { marginHorizontal: 0, marginVertical: 0, marginLeft: 15 }
            ]}
            multiline={true}
            placeholderTextColor="gray"
            // placeholder={item.is_other_name}
            returnKeyType={"done"}
            underlineColorAndroid={"transparent"}
            borderWidth={0.5}
            borderColor={"gray"}
            value={item.last_answer_value}
            onChangeText={text => this.onOtherInputChange(item, text)}
          />
        </Body>
      </ListItem>
    );

    const yKienView = (
      <ListItem style={{ borderBottomWidth: 0 }} button>
        <Body>
          <TextInput
            style={[styles.input, { marginHorizontal: 0, marginVertical: 0 }]}
            multiline={true}
            placeholderTextColor="gray"
            // placeholder={item.is_other_name}
            returnKeyType={"done"}
            underlineColorAndroid={"transparent"}
            borderWidth={0.5}
            borderColor={"gray"}
            value={item.last_answer_value}
            onChangeText={text => this.onCommentInputChange(item, text)}
          />
        </Body>
      </ListItem>
    );

    const itemView = (
      <View>
        <FlatList
          scrollEnable={false}
          data={item.answer}
          renderItem={i =>
            this.renderAnswer({ item: i.item, index: i.index, type, itemID })
          }
          keyExtractor={(item, index) => item.id.toString()}
        />
        {isOther === "1" ? dapAnKhacView : null}
        {isOther === "2" ? yKienView : null}
      </View>
    );

    const inputView = (
      <TextInput
        style={styles.input}
        multiline={true}
        placeholderTextColor="gray"
        // placeholder={item.is_other_name}
        returnKeyType={"done"}
        underlineColorAndroid={"transparent"}
        borderWidth={0.5}
        borderColor={"gray"}
        value={item.last_answer_value}
        onChangeText={text => this.onInputChange(item, text)}
      />
    );

    return (
      <View style={styles.item} key={index} button>
        <Text style={styles.itemTitle}>{item.name}</Text>
        {type === "2" ? inputView : itemView}
      </View>
    );
  };

  render() {
    const { propsData } = this.state;
    let contentView = this.renderView(propsData);
    if (contentView === null) {
      const { data } = propsData;
      this.thongBaoKey = {
        ...this.thongBaoKey,
        expired: data.expired,
        type: data.type,
        isView: data.viewable
      };
      contentView = (
        <View style={[{ flex: 1, padding: 10 }, config.styles.directionColumn]}>
          <Text style={styles.title}>{data.name}</Text>
          <View style={styles.expiredView}>
            <Text style={{ flex: 1 }}>{string.ngayHetHan}</Text>
            {data.expired === 1 ? (
              <Text style={styles.expiredText}>{string.daHetHan}</Text>
            ) : (
              <Text style={{ flex: 1 }}>{formatDate2(data.end_date)}</Text>
            )}
          </View>

          <FlatList
            data={data.question}
            renderItem={this.renderQuestion}
            keyExtractor={(item, index) => item.id.toString()}
            refreshing={this.state.refreshing}
            onRefresh={this.refreshScreen}
            onEndReachedThreshold={0.3}
            onEndReached={this.onEndReached}
            ListFooterComponent={this.renderFooter(propsData)}
          />
        </View>
      );
    }
    const rightButtons = [
      this.thongBaoKey.expired || this.thongBaoKey.expired === 1
        ? {}
        : {
            icon: "send",
            iconType: "MaterialIcons",
            onPress: () => {
              this.showConfirmDialog();
            }
          }
    ];
    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          onClose={this.handleBackPress}
          title={string.chiTietKhaoSat}
          navigation={this.props.navigation}
          rightButtons={rightButtons}
        />
        <Content style={styles.content}>{contentView}</Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: "white",
    padding: 5
  },
  title: {
    fontWeight: "bold"
  },
  expiredView: {
    flexDirection: "row",
    marginVertical: 10
  },
  expiredText: {
    flex: 1,
    color: "#f00"
  },
  input: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginVertical: 10
  },
  vote: {
    color: "#7A75F4",
    marginLeft: 15,
    fontSize: 10,
    backgroundColor: "#E1DFFD"
  },
  item: {
    borderBottomWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingRight: 0
  },
  itemTitle: {
    ...config.styles.text.title,
    lineHeight: 20,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "white"
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  ChiTietKhaoSat
);
