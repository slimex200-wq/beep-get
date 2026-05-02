import {
  ConfigPlugin,
  withAndroidManifest,
  withDangerousMod,
  withProjectBuildGradle,
} from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

const MIN_ANDROID_SDK = 26;

const withWidgetMinSdk: ConfigPlugin = (config) => {
  return withProjectBuildGradle(config, (mod) => {
    const marker = 'apply plugin: "com.facebook.react.rootproject"';
    const snippet = `

// Beep widget uses Glance/AppWidget APIs through the local native module.
def beepWidgetMinSdk = ${MIN_ANDROID_SDK}
if (rootProject.ext.has("minSdkVersion") && rootProject.ext.minSdkVersion < beepWidgetMinSdk) {
  rootProject.ext.minSdkVersion = beepWidgetMinSdk
}
`;

    mod.modResults.contents = mod.modResults.contents.replace(
      /\n\/\/ Beep widget uses Glance\/AppWidget APIs through the local native module\.\ndef beepWidgetMinSdk = \d+\nif \(rootProject\.ext\.has\("minSdkVersion"\) && rootProject\.ext\.minSdkVersion < beepWidgetMinSdk\) \{\n  rootProject\.ext\.minSdkVersion = beepWidgetMinSdk\n\}\n/g,
      "\n"
    );
    mod.modResults.contents = mod.modResults.contents.replace(marker, `${snippet}${marker}`);

    return mod;
  });
};

const withWidgetManifest: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (!app) return mod;

    // Add widget receiver
    const receivers = (app.receiver ?? []).filter((receiver: any) => {
      const name = receiver?.$?.["android:name"];
      return (
        name !== "expo.modules.beepwidget.BeepWidgetReceiver" &&
        name !== "expo.modules.beepwidget.BeepWidgetMediumReceiver"
      );
    });
    const widgetReceiver = {
      $: {
        "android:name": "expo.modules.beepwidget.BeepWidgetReceiver",
        "android:exported": "true" as const,
      },
      "intent-filter": [
        {
          action: [
            { $: { "android:name": "android.appwidget.action.APPWIDGET_UPDATE" } },
          ],
        },
      ],
      "meta-data": [
        {
          $: {
            "android:name": "android.appwidget.provider",
            "android:resource": "@xml/beep_widget_small_info",
          },
        },
      ],
    };

    const mediumReceiver = {
      $: {
        "android:name": "expo.modules.beepwidget.BeepWidgetMediumReceiver",
        "android:exported": "true" as const,
      },
      "intent-filter": [
        {
          action: [
            { $: { "android:name": "android.appwidget.action.APPWIDGET_UPDATE" } },
          ],
        },
      ],
      "meta-data": [
        {
          $: {
            "android:name": "android.appwidget.provider",
            "android:resource": "@xml/beep_widget_medium_info",
          },
        },
      ],
    };

    receivers.push(widgetReceiver as any, mediumReceiver as any);
    app.receiver = receivers;

    return mod;
  });
};

const withWidgetResources: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "android",
    (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const moduleSrcDir = path.join(
        projectRoot,
        "modules",
        "beep-widget",
        "android",
        "src",
        "main",
        "res"
      );
      const dstResDir = path.join(
        mod.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res"
      );

      // Copy XML resources
      copyDirSync(path.join(moduleSrcDir, "xml"), path.join(dstResDir, "xml"));
      copyDirSync(
        path.join(moduleSrcDir, "layout"),
        path.join(dstResDir, "layout")
      );

      return mod;
    },
  ]);
};

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

export const withBeepWidgetAndroid: ConfigPlugin = (config) => {
  config = withWidgetMinSdk(config);
  config = withWidgetManifest(config);
  config = withWidgetResources(config);
  return config;
};
