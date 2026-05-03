function createMockChain(result = { data: null, error: null }) {
  const chain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    upsert: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    gt: jest.fn(() => chain),
    in: jest.fn(() => chain),
    lte: jest.fn(() => chain),
    gte: jest.fn(() => chain),
    order: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(result)),
    then: (resolve) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

const mockFrom = jest.fn(() => createMockChain());
const createMockStorageBucket = () => ({
  createSignedUploadUrl: jest.fn().mockResolvedValue({
    data: { signedUrl: "https://upload.example", token: "upload-token", path: "object.mp4" },
    error: null,
  }),
  createSignedUrl: jest.fn().mockResolvedValue({
    data: { signedUrl: "https://signed.example" },
    error: null,
  }),
  uploadToSignedUrl: jest.fn().mockResolvedValue({
    data: { path: "object.mp4", fullPath: "blink-originals/object.mp4" },
    error: null,
  }),
  upload: jest.fn().mockResolvedValue({ data: { path: "object.mp4" }, error: null }),
});

module.exports = {
  supabase: {
    from: mockFrom,
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: jest.fn(() => createMockStorageBucket()),
    },
    auth: {
      signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithIdToken: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: jest.fn(),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
  createMockChain,
};
