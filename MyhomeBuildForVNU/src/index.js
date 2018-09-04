import React from "react";

import AppRoot from "../core/components/AppRoot";
import Router from "./navigation";
import allReducers from "./reducers";
import Notification from "./Notification";

export default class App extends React.Component {
  render() {
    return (
      <AppRoot
        router={Router}
        reducers={allReducers} // có thể bằng undefined
        notification={Notification} // có thể bằng undefined
      />
    );
  }
}
