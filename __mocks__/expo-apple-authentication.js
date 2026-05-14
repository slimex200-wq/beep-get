module.exports = {
  AppleAuthenticationScope: {
    FULL_NAME: "FULL_NAME",
    EMAIL: "EMAIL",
  },
  signInAsync: jest.fn().mockResolvedValue({
    identityToken: "apple-id-token",
    nonce: "apple-nonce",
    fullName: {
      givenName: "Beepy",
      middleName: null,
      familyName: "Tester",
    },
  }),
};
