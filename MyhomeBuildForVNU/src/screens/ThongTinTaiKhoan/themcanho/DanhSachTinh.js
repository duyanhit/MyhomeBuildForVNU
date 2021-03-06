import React from "react";
import { Body, Container, ListItem, Radio, Right, Text } from "native-base";
import AppComponent from "../../../../core/components/AppComponent";
import string from "../../../config/string";
import AppHeader from "../../../../core/components/AppHeader";
import { FlatList, View } from "react-native";
import metrics from "../../../../core/config/metrics";
import _ from "lodash";
import colors from "../../../../core/config/colors";

class DanhSachTinh extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isLoading: false
    };
  }

  propsData = this.props.navigation.state.params.propsData;
  itemHeight = 65;
  selectedId = this.props.navigation.state.params.selectedId || null;

  onSelect = (selectedId, selectedName) => {
    this.props.navigation.state.params.onSelect(selectedId, selectedName);
    this.props.navigation.goBack();
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

  tryToGetDataAgain = () => {
    this.setState({ isLoading: false });
  };

  render() {
    const propsData = this.propsData;
    let view = this.renderView(propsData);
    if (view === null) {
      let selectedIndex = 0;
      if (this.selectedId) {
        selectedIndex = _.findIndex(propsData.data, { id: this.selectedId });
        if (selectedIndex === -1) selectedIndex = 0;
        const numItemInScreen = Math.ceil(
          (metrics.DEVICE_HEIGHT - metrics.TOOLBAR_HEIGHT) / this.itemHeight
        );
        if (numItemInScreen / 2 > selectedIndex) {
          selectedIndex = 0;
        }
        const totalData = propsData.data.length;
        const maxIndex = totalData - numItemInScreen + 2;
        if (maxIndex < selectedIndex) {
          selectedIndex = maxIndex;
        }
      }
      view = (
        <FlatList
          initialScrollIndex={selectedIndex}
          getItemLayout={(data, index) => ({
            length: this.itemHeight,
            offset: this.itemHeight * index - metrics.TOOLBAR_HEIGHT,
            index
          })}
          data={propsData.data}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
        />
      );
    }

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          title={string.chonTinh}
          navigation={this.props.navigation}
        />
        {view}
      </Container>
    );
  }
}

export default DanhSachTinh;
