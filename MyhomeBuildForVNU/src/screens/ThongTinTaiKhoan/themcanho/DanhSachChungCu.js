import React from "react";
import {
  BackHandler,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import {
  Body,
  Container,
  Content,
  ListItem,
  Radio,
  Right,
  Text
} from "native-base";
import AppComponent from "../../../../core/components/AppComponent";
import string from "../../../config/string";
import AppHeader from "../../../../core/components/AppHeader";
import { API, getApiUrl } from "../../../config/server";
import { parseJsonFromApi } from "../../../../core/helpers/apiHelper";
import Icon from "../../../component/Icon";
import colors from "../../../../core/config/colors";

class DanhSachChungCu extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      keyword: "",
      data: []
    };
  }

  selectedId = this.props.navigation.state.params.selectedId || null;

  onSelect = (selectedId, selectedName) => {
    this.props.navigation.state.params.onSelect(selectedId, selectedName);
    this.props.navigation.goBack();
  };

  componentWillMount = () => {
    this.getScreenData();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  };

  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  onSearch = () => {
    const { keyword } = this.state;
    if (keyword.trim() !== "") {
      this.setState({ page: 1 }, () => this.refreshScreen());
    }
  };

  getScreenData = () => {
    const { keyword } = this.state;
    this.getFromServer(getApiUrl(API.DANH_SACH_CHUNG_CU), {
      keyword: keyword || "",
      id: this.selectedId || "",
      page: this.state.page,
      page_size: this.state.pageSize
    }).then(response => {
      const propsData = parseJsonFromApi(response);
      let { data } = this.state;
      if (propsData.status === 1) {
        data =
          this.state.page === 1
            ? propsData.data
            : [...this.state.data, ...propsData.data];
      }

      this.setState({
        isLoading: false,
        refreshing: false,
        data,
        propsData
      });
    });
  };

  renderItem = ({ item }) => {
    return (
      <View>
        <ListItem
          style={{ height: this.itemHeight, marginLeft: 0 }}
          key={item.id}
          onPress={() => this.onSelect(item.id, item.name)}
        >
          <Body>
            <Text>{item.name}</Text>
            <Text note numberOfLines={1}>
              {item.address}
            </Text>
          </Body>
          <Right>
            <Radio
              onPress={() => this.onSelect(item.id, item.name)}
              selected={this.selectedId === item.id}
            />
          </Right>
        </ListItem>
      </View>
    );
  };

  render() {
    let { data, propsData } = this.state;
    let view = this.renderView(propsData);

    if (view === null) {
      view = (
        <FlatList
          data={data}
          renderItem={this.renderItem}
          keyExtractor={item => item.id.toString()}
          refreshing={this.state.refreshing}
          onRefresh={() => {
            this.refreshScreen();
          }}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={this.renderFooter(propsData)}
        />
      );
    }

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          title={string.chonChungCu}
          navigation={this.props.navigation}
        />
        <Content style={{ backgroundColor: "white" }}>
          <View style={styles.searchWrap}>
            <TouchableWithoutFeedback onPress={this.onSearch}>
              <Icon
                name="search"
                iconType="EvilIcons"
                style={{ fontSize: 23 }}
              />
            </TouchableWithoutFeedback>
            <TextInput
              value={this.state.keyword}
              onChangeText={keyword => this.setState({ keyword })}
              style={styles.searchInput}
              placeholder={string.timKiem}
              underlineColorAndroid="transparent"
              onSubmitEditing={this.onSearch}
            />
          </View>
          {view}
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 0.5,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  searchInput: {
    flex: 1,
    marginLeft: 10
  }
});

export default DanhSachChungCu;
