module.exports = {
  AppleAuthenticationScope: {
    FULL_NAME: "FULL_NAME",
    EMAIL: "EMAIL",
  },
  signInAsync: jest.fn().mockResolvedValue({
    identityToken: "apple-id-token",
    authorizationCode: "apple-auth-code",
    nonce: "apple-nonce",
    fullName: {
      givenName: "Beepy",
      middleName: null,
      familyName: "Tester",
    },
  }),
};
