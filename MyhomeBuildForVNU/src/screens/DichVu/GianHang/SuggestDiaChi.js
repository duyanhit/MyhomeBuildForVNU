import React from "react";
import { FlatList, View } from "react-native";
import { ListItem, Spinner, Text } from "native-base";

import AppComponent from "../../../../core/components/AppComponent";
import metrics from "../../../../core/config/metrics";

class SuggestDiaChi extends AppComponent {
  state = {
    ...this.state,
    visible: false,
    isLoading: false,
    data: [],
    isOpen: false
  };

  latlngMap = {
    latitude: 21.020965181930173,
    longitude: 105.82116397768182,
    latitudeDelta: 0.0961423217173234,
    longitudeDelta: 0.2636719378938892
  };

  onRegionChangeComplete = result => {
    this.location = result;
    this.latlngMap = {
      latitudeDelta: result.latitudeDelta,
      longitudeDelta: result.longitudeDelta,
      latitude: result.latitude,
      longitude: result.longitude
    };
  };

  open = location => {
    this.location = location;
    if (location) {
      this.latlngMap = {
        ...this.latlngMap,
        ...this.location
      };
    }
    this.setState({ visible: true });
  };

  close = () => {
    this.setState({ visible: false });
  };

  getAddress = text => {
    this.getFromServer(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      {
        input: text,
        key: "AIzaSyCLV1SW82jibElhZe3v-_q4EQaSdNCpBIo"
      }
    ).then(response => {
      this.setState({ isLoading: false, data: response.predictions });
    });
  };

  onFocus = text => {
    if (text) {
      this.setState({ isLoading: true, isOpen: true });
      this.getAddress(text);
    } else {
      this.setState({ msg: "Tìm kiếm địa chỉ", isOpen: true });
    }
  };

  onEndEditing = text => {
    const { data } = this.state;
    if (this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
    let dong = {};
    if (!(data && data.length)) dong = { isOpen: false };
    this.setState({ isLoading: false, msg: "", ...dong });
  };

  onChangeText = text => {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
    let dataState = {};
    if (text) {
      dataState = { msg: "", isLoading: true };
    } else {
      dataState = { msg: "Tìm kiếm địa chỉ", isLoading: false };
    }
    this.setState(dataState);
    if (text) {
      this.timeOut = setTimeout(this.getAddress.bind(this, text), 1500);
    }
  };

  onSelect = item => {
    this.props.onSelect(item);
    if (this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
    this.setState({ isLoading: false, msg: "", isOpen: false });
  };

  renderItem = ({ item }) => {
    const { description } = item;
    return (
      <ListItem
        onPress={this.onSelect.bind(this, item)}
        button
        style={{ marginLeft: 0, paddingRight: 0, paddingHorizontal: 15 }}
      >
        <Text>{description}</Text>
      </ListItem>
    );
  };

  render() {
    const { isLoading, data, isOpen, msg } = this.state;
    if (!isOpen) return null;
    let viewMain = null;
    if (isLoading) viewMain = <Spinner />;
    else if (msg) {
      viewMain = (
        <View style={{ padding: 10 }}>
          <Text note style={{ fontStyle: "italic" }}>
            {msg}
          </Text>
        </View>
      );
    } else if (data && data.length) {
      viewMain = (
        <FlatList
          data={data || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.renderItem}
        />
      );
    } else {
      viewMain = (
        <View style={{ padding: 10 }}>
          <Text note style={{ fontStyle: "italic" }}>
            Không tìm thấy địa chỉ
          </Text>
        </View>
      );
    }
    return (
      <View
        style={{
          position: "absolute",
          backgroundColor: "#eee",
          width: metrics.DEVICE_WIDTH - 30,
          alignSelf: "center"
        }}
      >
        {viewMain}
      </View>
    );
  }
}

export default SuggestDiaChi;
