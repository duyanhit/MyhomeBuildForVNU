import React from "react";
import { Body, Container, ListItem, Radio, Right, Text } from "native-base";
import AppComponent from "../../../../core/components/AppComponent";
import string from "../../../config/string";
import AppHeader from "../../../../core/components/AppHeader";
import metrics from "../../../../core/config/metrics";
import { BackHandler, FlatList, View } from "react-native";
import colors from "../../../../core/config/colors";

class DanhSachTang extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isLoading: false
    };
  }

  propsData = [];
  itemHeight = 65;
  selectedId = this.props.navigation.state.params.selectedId || null;

  componentWillMount = () => {
    for (let i = 1; i <= 100; i++) {
      this.propsData.push({
        name: string.tang + " " + i,
        id: i.toString()
      });
    }
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  };

  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  onSelect = (selectedId, selectedName) => {
    this.props.navigation.state.params.onSelect(selectedId, selectedName);
    this.props.navigation.goBack();
  };

  tryToGetDataAgain = () => {
    this.setState({ isLoading: false });
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
    let initIndex = 0;
    if (this.selectedId) {
      initIndex = this.selectedId - 1;
    }
    const numItemInScreen = Math.ceil(
      (metrics.DEVICE_HEIGHT - metrics.TOOLBAR_HEIGHT) / this.itemHeight
    );
    if (numItemInScreen / 2 > initIndex) {
      initIndex = 0;
    }
    const totalData = this.propsData.length;
    const maxIndex = totalData - numItemInScreen + 2;
    if (maxIndex < initIndex) {
      initIndex = maxIndex;
    }

    const view = (
      <FlatList
        style={{ backgroundColor: "white" }}
        initialScrollIndex={initIndex}
        getItemLayout={(data, index) => ({
          length: this.itemHeight,
          offset: this.itemHeight * index - metrics.TOOLBAR_HEIGHT,
          index
        })}
        data={this.propsData}
        renderItem={this.renderItem}
        keyExtractor={item => item.id.toString()}
      />
    );

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          title={string.chonTang}
          navigation={this.props.navigation}
        />
        {view}
      </Container>
    );
  }
}

export default DanhSachTang;
