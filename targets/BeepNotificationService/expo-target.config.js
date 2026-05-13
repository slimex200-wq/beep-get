/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "notification-service",
  name: "BeepNotificationService",
  displayName: "Beep Get Notifications",
  bundleIdentifier: ".notificationservice",
  deploymentTarget: "16.0",
  frameworks: ["UserNotifications", "WidgetKit"],
  entitlements: {
    "com.apple.security.application-groups":
      config.ios.entitlements["com.apple.security.application-groups"],
  },
});
