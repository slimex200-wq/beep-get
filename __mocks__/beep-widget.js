module.exports = {
  updateWidgetData: jest.fn(),
  reloadWidgets: jest.fn(),
  getWidgetData: jest.fn().mockResolvedValue(null),
};
