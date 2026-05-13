import {
  ConfigPlugin,
  withEntitlementsPlist,
  withInfoPlist,
} from "expo/config-plugins";

const APP_GROUP = "group.com.beepget.shared";

const withAppGroupEntitlement: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (mod) => {
    mod.modResults["com.apple.security.application-groups"] = [APP_GROUP];
    return mod;
  });
};

const withWidgetBackground: ConfigPlugin = (config) => {
  return withInfoPlist(config, (mod) => {
    // Allow background processing for widget updates
    const modes = mod.modResults.UIBackgroundModes ?? [];
    if (!modes.includes("fetch")) modes.push("fetch");
    if (!modes.includes("remote-notification"))
      modes.push("remote-notification");
    mod.modResults.UIBackgroundModes = modes;
    return mod;
  });
};

export const withBeepWidgetIOS: ConfigPlugin = (config) => {
  config = withAppGroupEntitlement(config);
  config = withWidgetBackground(config);
  return config;
};
