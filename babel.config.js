module.exports = function (api) {
  api.cache(true);
  const plugins = [];
  if (process.env.NODE_ENV !== "test") {
    plugins.push([
      "module-resolver",
      {
        alias: {
          "@": "./src",
        },
      },
    ]);
  }
  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
