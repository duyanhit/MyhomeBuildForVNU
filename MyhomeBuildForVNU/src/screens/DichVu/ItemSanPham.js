import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from "native-base";
import Stars from "react-native-stars";

import { screenNames } from "../../config/screen";
import { assets } from "../../../assets";
import { moneyFormat } from "../../../core/helpers/numberHelper";
import metrics from "../../../core/config/metrics";
import AppComponent from "../../../core/components/AppComponent";
import config from "../../../core/config";

class ItemSanPham extends AppComponent {
  constructor(props) {
    super(props);
    this.number = props.horizontal ? 2.5 : 2;
    this.width = 0;
  }

  componentWillMount = () => {
    this.width = metrics.DEVICE_WIDTH / this.number - 12;
  };

  render() {
    const { item, onPress, onLongPress } = this.props;
    let distance;
    if (item && item.distance) {
      distance = item.distance;
      distance = parseFloat(distance.toString());
      distance = Math.round(distance * 10) / 10;
    }

    return (
      <TouchableOpacity
        onPress={
          onPress ||
          this.navigateToScreen(
            screenNames.ChiTietSanPham,
            { id: item.id },
            true
          )
        }
        onLongPress={onLongPress}
      >
        <View style={[styles.container, { width: this.width }]}>
          <View>
            <Image
              source={assets.sanPhamdefault}
              style={[
                styles.image,
                { position: "absolute", width: this.width, height: this.width }
              ]}
            />
            <Image
              style={[styles.image, { width: this.width, height: this.width }]}
              source={{ uri: item.image || undefined }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.detail}>
            <Text numberOfLines={2} style={styles.name}>
              {item.name}
            </Text>

            <Text style={config.styles.text.priceText}>
              {moneyFormat(Number(item.price))}
            </Text>

            <View style={styles.viewStarAndDistance}>
              <View style={styles.viewStar}>
                <Stars
                  value={Number(item.star)}
                  count={5}
                  spacing={3}
                  starSize={8}
                  emptyStar={assets.starEmpty}
                  halfStar={assets.starHalf}
                  fullStar={assets.starFull}
                />
                {item.total_rate !== "0" ? (
                  <Text style={styles.textTotalRate}> ({item.total_rate})</Text>
                ) : null}
              </View>
              {item &&
                item.distance &&
                item.distance !== "0" && (
                  <View style={styles.viewDistance}>
                    <Icon name="ios-pin" style={styles.locationIcon} />
                    <Text style={styles.distance}>
                      {" " + distance + " km"}
                    </Text>
                  </View>
                )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white"
  },
  image: {
    backgroundColor: "white"
  },
  detail: {
    padding: 5,
    alignItems: "flex-start"
  },
  name: {
    fontSize: 14,
    height: 40
  },
  viewStarAndDistance: {
    flexDirection: "row",
    alignItems: "center"
  },
  viewStar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  viewDistance: {
    flexDirection: "row",
    alignItems: "center"
  },
  locationIcon: {
    color: "#1d75bd",
    fontSize: 12
  },
  distance: {
    fontSize: 12,
    fontWeight: "100"
  },
  textTotalRate: { fontSize: 9, color: "gray" }
});

export default ItemSanPham;
