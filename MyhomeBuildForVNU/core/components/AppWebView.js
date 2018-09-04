/**
 * Custom WebView with autoHeight
 *
 * @prop source: Same as WebView
 * @prop autoHeight: true|false
 * @prop defaultHeight: 100
 * @prop width: device Width
 * @prop ...props
 */

import React, { Component } from "react";
import { Dimensions, WebView, Platform } from "react-native";

const injectedScript = function() {
  function waitForBridge() {
    if (window.postMessage.length !== 1) {
      setTimeout(waitForBridge, 200);
    } else {
      let height = 0;
      if (document.documentElement.scrollHeight > document.body.scrollHeight) {
        height = document.documentElement.scrollHeight;
      } else {
        height = document.body.scrollHeight;
      }
      postMessage(height);
    }
  }

  waitForBridge();
};

// postMessage(
//         JSON.stringify({
//           height,
//           documentElement: {
//             clientHeight: document.documentElement.clientHeight,
//             scrollHeight: document.documentElement.scrollHeight,
//             offsetHeight: document.documentElement.offsetHeight
//           },
//           body: {
//             clientHeight: document.body.clientHeight,
//             scrollHeight: document.body.scrollHeight,
//             offsetHeight: document.body.offsetHeight
//           }
//         })
//       );

export default class AppWebView extends Component {
  state = {
    webViewHeight: Number
  };

  static defaultProps = {
    autoHeight: true
  };

  constructor(props) {
    super(props);
    this.state = {
      webViewHeight: this.props.defaultHeight
    };
    this._onMessage = this._onMessage.bind(this);
  }

  _onMessage(e) {
    const message = e.nativeEvent.data;

    if (!this.state.webViewHeight && message && !isNaN(Number(message))) {
      this.setState({
        webViewHeight: parseInt(message)
      });
    } else {
      if (this.props.onMessageCustom) {
        this.props.onMessageCustom(message);
      }
    }
  }

  stopLoading() {
    this.webView.stopLoading();
  }

  render() {
    const _w = this.props.width || Dimensions.get("window").width;
    const _h = this.props.autoHeight
      ? this.state.webViewHeight
      : this.props.defaultHeight;
    const injectedJavaScriptCustom =
      this.props.injectedJavaScriptCustom ||
      "window.postMessage = String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');";
    return (
      <WebView
        scalesPageToFit={Platform.OS === "android"}
        ref={ref => {
          this.webView = ref;
        }}
        injectedJavaScript={
          "(" + String(injectedScript) + ")();" + injectedJavaScriptCustom
        }
        scrollEnabled={this.props.scrollEnabled || false}
        onMessage={this._onMessage}
        javaScriptEnabled={true}
        automaticallyAdjustContentInsets={true}
        {...this.props}
        style={[{ width: _w }, this.props.style, { height: _h }]}
        renderError={e => {
          if (e === "WebKitErrorDomain") {
            return;
          }
        }}
      />
    );
  }
}
