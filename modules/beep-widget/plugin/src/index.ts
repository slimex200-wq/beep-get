import { ConfigPlugin } from "expo/config-plugins";
import { withBeepWidgetIOS } from "./withBeepWidgetIOS";
import { withBeepWidgetAndroid } from "./withBeepWidgetAndroid";

const withBeepWidget: ConfigPlugin = (config) => {
  config = withBeepWidgetIOS(config);
  config = withBeepWidgetAndroid(config);
  return config;
};

export default withBeepWidget;
