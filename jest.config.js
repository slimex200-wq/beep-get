module.exports = {
  preset: "jest-expo/node",
  moduleNameMapper: {
    "^@/lib/supabase$": "<rootDir>/__mocks__/supabase.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-native-url-polyfill/auto$": "<rootDir>/__mocks__/react-native-url-polyfill.js",
    "^../../modules/beep-widget$": "<rootDir>/__mocks__/beep-widget.js",
    "^expo-apple-authentication$": "<rootDir>/__mocks__/expo-apple-authentication.js",
    "^expo-constants$": "<rootDir>/__mocks__/expo-constants.js",
    "^expo-contacts$": "<rootDir>/__mocks__/expo-contacts.js",
    "^expo-haptics$": "<rootDir>/__mocks__/expo-haptics.js",
    "^expo-iap$": "<rootDir>/__mocks__/expo-iap.js",
    "^expo-linking$": "<rootDir>/__mocks__/expo-linking.js",
    "^expo-notifications$": "<rootDir>/__mocks__/expo-notifications.js",
    "^expo-secure-store$": "<rootDir>/__mocks__/expo-secure-store.js",
    "^expo-video-thumbnails$": "<rootDir>/__mocks__/expo-video-thumbnails.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/ios/", "/android/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@supabase/.*|zustand)",
  ],
};
