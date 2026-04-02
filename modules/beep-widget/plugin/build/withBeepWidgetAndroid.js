"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.withBeepWidgetAndroid = void 0;
const config_plugins_1 = require("expo/config-plugins");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const withWidgetManifest = (config) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (mod) => {
        const app = mod.modResults.manifest.application?.[0];
        if (!app)
            return mod;
        // Add widget receiver
        const receivers = app.receiver ?? [];
        const widgetReceiver = {
            $: {
                "android:name": "expo.modules.beepwidget.BeepWidgetReceiver",
                "android:exported": "true",
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
                "android:exported": "true",
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
        receivers.push(widgetReceiver, mediumReceiver);
        app.receiver = receivers;
        return mod;
    });
};
const withWidgetResources = (config) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        (mod) => {
            const projectRoot = mod.modRequest.projectRoot;
            const moduleSrcDir = path.join(projectRoot, "modules", "beep-widget", "android", "src", "main", "res");
            const dstResDir = path.join(mod.modRequest.platformProjectRoot, "app", "src", "main", "res");
            // Copy XML resources
            copyDirSync(path.join(moduleSrcDir, "xml"), path.join(dstResDir, "xml"));
            copyDirSync(path.join(moduleSrcDir, "layout"), path.join(dstResDir, "layout"));
            return mod;
        },
    ]);
};
function copyDirSync(src, dst) {
    if (!fs.existsSync(src))
        return;
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, dstPath);
        }
        else {
            fs.copyFileSync(srcPath, dstPath);
        }
    }
}
const withBeepWidgetAndroid = (config) => {
    config = withWidgetManifest(config);
    config = withWidgetResources(config);
    return config;
};
exports.withBeepWidgetAndroid = withBeepWidgetAndroid;
