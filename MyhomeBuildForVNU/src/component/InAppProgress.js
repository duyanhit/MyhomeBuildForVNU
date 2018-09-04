import React, { Component } from "react";

import ProgressDialog from "../../core/components/ProgressDialog";
import string from "../config/string";

class InAppProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false
    };
    this.props.self(this);
  }

  openDialog = () => {
    this.setState({ dialogVisible: true });
  };

  closeDialog = () => {
    this.setState({ dialogVisible: false });
  };

  render() {
    return (
      <ProgressDialog
        visible={this.state.dialogVisible}
        message={string.vuiLongCho}
        transparent={false}
      />
    );
  }
}

export default InAppProgress;
