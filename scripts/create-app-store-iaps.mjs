import crypto from "node:crypto";
import fs from "node:fs";

const products = [
  { name: "School Desk", productId: "beepget.pack.school_desk" },
  { name: "Cherry Dot", productId: "beepget.pack.cherry_dot" },
  { name: "Photo Booth Blink", productId: "beepget.pack.photo_booth_blink" },
  { name: "Night Signal", productId: "beepget.pack.night_signal" },
];

const appId = required("ASC_APP_ID");
const issuerId = required("APP_STORE_CONNECT_ISSUER_ID");
const keyId = required("APP_STORE_CONNECT_KEY_ID");
const privateKey =
  process.env.APP_STORE_CONNECT_PRIVATE_KEY ??
  fs.readFileSync(required("APP_STORE_CONNECT_PRIVATE_KEY_PATH"), "utf8");
const token = createAppStoreConnectToken({ issuerId, keyId, privateKey });

const existing = await listExistingIaps(appId, token);
const existingProductIds = new Set(existing.map((item) => item.attributes?.productId));

for (const product of products) {
  if (existingProductIds.has(product.productId)) {
    console.log(`skip existing ${product.productId}`);
    continue;
  }

  const response = await ascFetch("/v2/inAppPurchases", token, {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "inAppPurchases",
        attributes: {
          name: product.name,
          productId: product.productId,
          inAppPurchaseType: "NON_CONSUMABLE",
          familySharable: false,
        },
        relationships: {
          app: {
            data: {
              type: "apps",
              id: appId,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    console.error(`failed ${product.productId}`);
    console.error(JSON.stringify(response.payload, null, 2));
    process.exitCode = 1;
    continue;
  }

  console.log(`created ${product.productId}: ${response.payload.data?.id}`);
}

async function listExistingIaps(appId, jwt) {
  const items = [];
  let path = `/v1/apps/${encodeURIComponent(appId)}/inAppPurchasesV2?limit=200`;
  while (path) {
    const response = await ascFetch(path, jwt);
    if (!response.ok) {
      console.error("Could not list existing IAPs. Check ASC_APP_ID and API key permissions.");
      console.error(JSON.stringify(response.payload, null, 2));
      process.exit(1);
    }
    items.push(...(response.payload.data ?? []));
    path = response.payload.links?.next
      ? response.payload.links.next.replace("https://api.appstoreconnect.apple.com", "")
      : null;
  }
  return items;
}

async function ascFetch(path, jwt, init = {}) {
  const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });
  return {
    ok: response.ok,
    status: response.status,
    payload: await response.json().catch(() => ({})),
  };
}

function createAppStoreConnectToken({ issuerId, keyId, privateKey }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 900,
    aud: "appstoreconnect-v1",
  };
  const signingInput = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
  const signature = crypto.sign("sha256", Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });
  return `${signingInput}.${base64Url(signature)}`;
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function base64UrlJson(value) {
  return base64Url(Buffer.from(JSON.stringify(value)));
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
