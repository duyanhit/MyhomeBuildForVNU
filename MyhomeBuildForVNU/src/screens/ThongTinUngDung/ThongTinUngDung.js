import React from "react";
import { Container } from "native-base";
import { ScrollView } from "react-native";

import AppHeader from "../../../core/components/AppHeader";
import string from "../../config/string";
import { getFromServer } from "../../../core/actions";
import { API, getApiUrl } from "../../config/server";
import AppWebView from "../../../core/components/AppWebView";
import AppComponent from "../../../core/components/AppComponent";
import { parseJsonFromApi } from "../../../core/helpers/apiHelper";
import colors from "../../config/colors";

class ThongTinUngDung extends AppComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      link: ""
    };
  }

  componentWillMount = () => {
    getFromServer(getApiUrl(API.THONG_TIN_UNG_DUNG)).then(response => {
      const propsData = parseJsonFromApi(response);
      if (propsData.status === 1) {
        this.setState({
          isLoading: false,
          propsData,
          link: propsData.data.link
        });
      } else if (propsData.status !== 0 && !propsData.networkError) {
        this.showAlertDialog(propsData.message);
        this.setState({ isLoading: false });
      }
    });
  };

  render() {
    const { propsData, link } = this.state;
    let contentView = this.renderView(propsData);
    if (!contentView) {
      contentView = (
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppWebView source={{ uri: link }} />
        </ScrollView>
      );
    }

    return (
      <Container style={{ backgroundColor: colors.windowBackground }}>
        <AppHeader
          left
          title={string.dieuKhoanVaChinhSach}
          navigation={this.props.navigation}
        />
        {contentView}
      </Container>
    );
  }
}

export default ThongTinUngDung;
