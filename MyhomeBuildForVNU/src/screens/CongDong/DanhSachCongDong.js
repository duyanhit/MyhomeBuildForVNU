import React from "react";
import { connect } from "react-redux";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image
} from "react-native";
import { Thumbnail } from "native-base";
import { uniqBy } from "lodash";

import AppComponent from "../../../core/components/AppComponent";
import string from "../../config/string";
import colors from "../../config/colors";
import settings from "../../../core/config/metrics";
import { screenNames } from "../../config/screen";
import { assets } from "../../../assets";

const width = settings.DEVICE_WIDTH;

class DanhSachCongDong extends AppComponent {
  onSelect = id => {
    this.props.navigation.state.params.returnData(id);
  };

  renderItem = itemData => {
    return (
      <TouchableOpacity
        onPress={() => this.onSelect(itemData.item.apartment_id)}
        style={styles.viewItem}
      >
        <Thumbnail source={{ uri: itemData.item.apartment_image }} />
        <View style={styles.textView}>
          <Text style={styles.textCongDong}>{string.congDong}</Text>
          <Text style={styles.apartmentName} numberOfLines={2}>
            {itemData.item.apartment_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  keyExtractor = (item, index) => item.id;

  render() {
    const { accountInfo } = this.props;
    let data = _.uniqBy(accountInfo.home, "apartment_id");
    if (data.length > 1) {
      data = [
        {
          apartment_id: "",
          apartment_name: string.tatCa
        },
        ...data
      ];
    }
    return (
      <View>
        <TouchableOpacity
          onPress={this.navigateToScreen(screenNames.TaoBaiViet, {
            onGoBack: () => this.props.refreshScreen()
          })}
        >
          <View style={styles.viewPost}>
            <View style={[styles.imageAvatar, { marginRight: 10 }]}>
              <Image
                style={[styles.imageAvatar, { position: "absolute" }]}
                source={assets.avatarDefault}
              />
              <Image
                style={styles.imageAvatar}
                source={{ uri: accountInfo.avatar || undefined }}
              />
            </View>
            <Text>{string.banMuonDangGi}</Text>
          </View>
        </TouchableOpacity>
        {data &&
          data.length > 1 && (
            <View style={styles.viewListApartment}>
              <Text style={{ marginLeft: 10 }}>
                <Text>{`${string.congDong}: `}</Text>
                <Text style={styles.textNameApartment}>{`(${this.state.nameCC ||
                  string.tatCa})`}</Text>
              </Text>
              <FlatList
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
                horizontal
                data={data}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({ nameCC: item.apartment_name }, () =>
                          this.props.onSelect(item.apartment_id)
                        );
                      }}
                    >
                      <View style={{ width: 80 }}>
                        <View overflow="hidden" style={styles.viewApartment}>
                          <Image
                            style={[
                              styles.avatarApartment,
                              { position: "absolute" }
                            ]}
                            source={assets.congDongDefault}
                          />
                          <Image
                            style={styles.avatarApartment}
                            source={
                              item.apartment_id === ""
                                ? assets.icAllCongDong
                                : { uri: item.apartment_image || undefined }
                            }
                          />
                        </View>
                        <Text
                          style={styles.textApartmentName}
                          numberOfLines={1}
                        >
                          {item.apartment_name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(v, i) => i.toString()}
              />
            </View>
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewItem: {
    width: 0.3 * (width - 90),
    marginVertical: 20,
    marginHorizontal: 20,
    alignItems: "center"
  },
  textView: {
    justifyContent: "center",
    alignItems: "center"
  },
  textCongDong: {
    fontSize: 12,
    color: "gray"
  },
  apartmentName: {
    textAlign: "center"
  },
  imageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  viewPost: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 5,
    borderBottomColor: colors.windowBackground,
    backgroundColor: "#fff"
  },
  viewListApartment: {
    borderBottomWidth: 5,
    borderBottomColor: colors.windowBackground,
    paddingVertical: 10,
    backgroundColor: "#fff"
  },
  textNameApartment: {
    fontSize: 14,
    fontWeight: "bold"
  },
  viewApartment: {
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    width: 60
  },
  avatarApartment: {
    height: 52,
    width: 52,
    borderRadius: 26
  },
  textApartmentName: {
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 10,
    textAlign: "center"
  }
});

export default connect(state => ({ accountInfo: state.accountReducer }))(
  DanhSachCongDong
);
