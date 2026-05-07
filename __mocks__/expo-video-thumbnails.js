module.exports = {
  getThumbnailAsync: jest.fn(async (_uri, options = {}) => ({
    height: 360,
    uri: `file:///tmp/blink-thumb-${options.time ?? 0}.jpg`,
    width: 480,
  })),
};
