// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const maxWorkers = Number(process.env.METRO_MAX_WORKERS);

if (Number.isInteger(maxWorkers) && maxWorkers > 0) {
  config.maxWorkers = maxWorkers;
}

module.exports = config;
