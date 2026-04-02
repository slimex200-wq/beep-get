"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withBeepWidgetIOS_1 = require("./withBeepWidgetIOS");
const withBeepWidgetAndroid_1 = require("./withBeepWidgetAndroid");
const withBeepWidget = (config) => {
    config = (0, withBeepWidgetIOS_1.withBeepWidgetIOS)(config);
    config = (0, withBeepWidgetAndroid_1.withBeepWidgetAndroid)(config);
    return config;
};
exports.default = withBeepWidget;
