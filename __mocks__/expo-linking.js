module.exports = {
  createURL: jest.fn(() => "beepget://auth/callback"),
  openURL: jest.fn().mockResolvedValue(true),
  parse: jest.fn((url) => {
    const query = url.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    return {
      queryParams: Object.fromEntries(params.entries()),
    };
  }),
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};
