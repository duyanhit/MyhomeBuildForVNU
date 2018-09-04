import React from "react";
import IconVec from "@expo/vector-icons";

const Icon = props => {
  let { name, style, iconType } = props;

  name = name || "500px";
  style = style || {};
  iconType = iconType || "Entypo";

  const IconC = IconVec[iconType];
  const propsC = { name, style };

  return <IconC {...propsC} />;
};

export default Icon;
