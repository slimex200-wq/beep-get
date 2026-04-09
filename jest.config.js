module.exports = {
  preset: "jest-expo/node",
  moduleNameMapper: {
    "^@/lib/supabase$": "<rootDir>/__mocks__/supabase.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-native-url-polyfill/auto$": "<rootDir>/__mocks__/react-native-url-polyfill.js",
    "^../../modules/beep-widget$": "<rootDir>/__mocks__/beep-widget.js",
    "^expo-contacts$": "<rootDir>/__mocks__/expo-contacts.js",
    "^expo-haptics$": "<rootDir>/__mocks__/expo-haptics.js",
    "^expo-secure-store$": "<rootDir>/__mocks__/expo-secure-store.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/ios/", "/android/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@supabase/.*|zustand)",
  ],
};
