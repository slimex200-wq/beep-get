import "react-native-url-polyfill/auto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SECURE_STORE_CHUNK_SIZE = 1800;
const SECURE_STORE_CHUNK_MARKER = "__beepget_chunked_v1__:";

type AuthStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    const chunkCount = readChunkCount(value);
    if (!chunkCount) return value;

    const chunks = await Promise.all(
      Array.from({ length: chunkCount }, (_, index) =>
        SecureStore.getItemAsync(getChunkKey(key, index)),
      ),
    );
    if (chunks.some((chunk) => chunk == null)) return null;
    return chunks.join("");
  },
  setItem: async (key: string, value: string) => {
    await removeChunkedItem(key);
    if (value.length <= SECURE_STORE_CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunks = value.match(new RegExp(`.{1,${SECURE_STORE_CHUNK_SIZE}}`, "g")) ?? [];
    await Promise.all(
      chunks.map((chunk, index) => SecureStore.setItemAsync(getChunkKey(key, index), chunk)),
    );
    await SecureStore.setItemAsync(key, `${SECURE_STORE_CHUNK_MARKER}${chunks.length}`);
  },
  removeItem: (key: string) => removeChunkedItem(key),
};

const memoryWebStorage = new Map<string, string>();

const WebStorageAdapter: AuthStorage = {
  getItem: async (key: string) => {
    const storage = getWebStorage();
    return storage ? storage.getItem(key) : memoryWebStorage.get(key) ?? null;
  },
  setItem: async (key: string, value: string) => {
    const storage = getWebStorage();
    if (storage) {
      storage.setItem(key, value);
      return;
    }
    memoryWebStorage.set(key, value);
  },
  removeItem: async (key: string) => {
    const storage = getWebStorage();
    if (storage) {
      storage.removeItem(key);
      return;
    }
    memoryWebStorage.delete(key);
  },
};

function getWebStorage() {
  const maybeWindow = globalThis as typeof globalThis & {
    localStorage?: {
      getItem: (key: string) => string | null;
      setItem: (key: string, value: string) => void;
      removeItem: (key: string) => void;
    };
  };
  return maybeWindow.localStorage ?? null;
}

function getChunkKey(key: string, index: number) {
  return `${key}.__chunk.${index}`;
}

function readChunkCount(value: string | null): number | null {
  if (!value?.startsWith(SECURE_STORE_CHUNK_MARKER)) return null;
  const count = Number(value.slice(SECURE_STORE_CHUNK_MARKER.length));
  return Number.isInteger(count) && count > 0 ? count : null;
}

async function removeChunkedItem(key: string) {
  const value = await SecureStore.getItemAsync(key);
  const chunkCount = readChunkCount(value);
  if (chunkCount) {
    await Promise.all(
      Array.from({ length: chunkCount }, (_, index) =>
        SecureStore.deleteItemAsync(getChunkKey(key, index)),
      ),
    );
  }
  await SecureStore.deleteItemAsync(key);
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const missingSupabaseError = new Error(
  "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
);

function createMissingSupabaseClient(): SupabaseClient {
  const result = { data: null, error: missingSupabaseError };
  const chain = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    upsert: () => chain,
    eq: () => chain,
    gt: () => chain,
    in: () => chain,
    lte: () => chain,
    gte: () => chain,
    order: () => chain,
    limit: () => chain,
    single: async () => result,
    then: (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
      signInWithOAuth: async () => result,
      signInWithIdToken: async () => result,
      exchangeCodeForSession: async () => result,
      signOut: async () => ({ error: null }),
    },
    functions: {
      invoke: async () => result,
    },
    from: () => chain,
    rpc: async () => result,
    storage: {
      from: () => ({
        createSignedUploadUrl: async () => result,
        createSignedUrl: async () => result,
        uploadToSignedUrl: async () => result,
        upload: async () => result,
      }),
    },
    channel: () => ({
      on: function () {
        return this;
      },
      subscribe: function () {
        return this;
      },
    }),
    removeChannel: () => undefined,
  } as unknown as SupabaseClient;
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage:
          Platform.OS === "web" ||
          typeof SecureStore.getItemAsync !== "function" ||
          typeof SecureStore.setItemAsync !== "function" ||
          typeof SecureStore.deleteItemAsync !== "function"
            ? WebStorageAdapter
            : ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: "pkce",
      },
    })
  : createMissingSupabaseClient();
