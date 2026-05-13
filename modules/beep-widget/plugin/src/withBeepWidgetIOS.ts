import {
  ConfigPlugin,
  withEntitlementsPlist,
  withInfoPlist,
  withDangerousMod,
} from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

const APP_GROUP = "group.com.beepget.shared";
const WIDGET_EXTENSION_NAME = "BeepWidgetExtension";
const NOTIFICATION_EXTENSION_NAME = "BeepNotificationService";

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

const withWidgetExtensionFiles: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const moduleSrcDir = path.join(
        projectRoot,
        "modules",
        "beep-widget",
        "ios"
      );

      // Copy widget extension files to ios/ directory
      const widgetDstDir = path.join(
        mod.modRequest.platformProjectRoot,
        WIDGET_EXTENSION_NAME
      );
      const notifDstDir = path.join(
        mod.modRequest.platformProjectRoot,
        NOTIFICATION_EXTENSION_NAME
      );

      copyDirSync(path.join(moduleSrcDir, "BeepWidget"), widgetDstDir);
      copyDirSync(
        path.join(moduleSrcDir, "NotificationService"),
        notifDstDir
      );
      copySharedWidgetData(moduleSrcDir, widgetDstDir);
      copySharedWidgetData(moduleSrcDir, notifDstDir);

      return mod;
    },
  ]);
};

function copySharedWidgetData(moduleSrcDir: string, dstDir: string): void {
  const src = path.join(moduleSrcDir, "BeepWidgetData.swift");
  if (!fs.existsSync(src)) return;
  fs.copyFileSync(src, path.join(dstDir, "BeepWidgetData.swift"));
}

function copyDirSync(src: string, dst: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

export const withBeepWidgetIOS: ConfigPlugin = (config) => {
  config = withAppGroupEntitlement(config);
  config = withWidgetBackground(config);
  config = withWidgetExtensionFiles(config);
  return config;
};
