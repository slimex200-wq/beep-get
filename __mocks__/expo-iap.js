const purchase = {
  productId: "beepget.pack.school_desk",
  purchaseToken: "purchase-token",
  transactionId: "tx-1",
  purchaseState: "purchased",
};

module.exports = {
  initConnection: jest.fn().mockResolvedValue(true),
  fetchProducts: jest.fn().mockResolvedValue([
    { id: "beepget.pack.school_desk", type: "in-app", title: "School Desk" },
  ]),
  requestPurchase: jest.fn().mockImplementation(async () => {
    setTimeout(() => {
      module.exports.__emitPurchase(purchase);
    }, 0);
  }),
  finishTransaction: jest.fn().mockResolvedValue(undefined),
  purchaseUpdatedListener: jest.fn((listener) => {
    module.exports.__purchaseListener = listener;
    return { remove: jest.fn() };
  }),
  purchaseErrorListener: jest.fn((listener) => {
    module.exports.__errorListener = listener;
    return { remove: jest.fn() };
  }),
  __emitPurchase: (value) => module.exports.__purchaseListener?.(value),
  __emitError: (value) => module.exports.__errorListener?.(value),
};
