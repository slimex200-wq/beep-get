module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/lib/supabase$": "<rootDir>/__mocks__/supabase.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-native-url-polyfill/auto$": "<rootDir>/__mocks__/react-native-url-polyfill.js",
    "^../../modules/beep-widget$": "<rootDir>/__mocks__/beep-widget.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/ios/", "/android/"],
};
