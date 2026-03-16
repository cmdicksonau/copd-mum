const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export const DEFAULT_KDF_ITERATIONS = 250000;

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesGcmKey(passphrase, salt, iterations = DEFAULT_KDF_ITERATIONS) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJsonWithPassphrase(payload, passphrase, meta = {}) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesGcmKey(passphrase, salt, DEFAULT_KDF_ITERATIONS);
  const plaintext = TEXT_ENCODER.encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  return {
    v: 1,
    kdf: {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: DEFAULT_KDF_ITERATIONS,
      salt_b64: bytesToBase64(salt),
    },
    alg: {
      name: "AES-GCM",
      iv_b64: bytesToBase64(iv),
    },
    ct_b64: bytesToBase64(new Uint8Array(ciphertext)),
    meta,
  };
}

export async function decryptJsonWithPassphrase(envelope, passphrase) {
  const parsed = typeof envelope === "string" ? JSON.parse(envelope) : envelope;
  const salt = base64ToBytes(parsed.kdf.salt_b64);
  const iv = base64ToBytes(parsed.alg.iv_b64);
  const ciphertext = base64ToBytes(parsed.ct_b64);
  const key = await deriveAesGcmKey(passphrase, salt, parsed.kdf.iterations || DEFAULT_KDF_ITERATIONS);

  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return JSON.parse(TEXT_DECODER.decode(plaintext));
}

export async function encryptStringWithPassphrase(value, passphrase, meta = {}) {
  return encryptJsonWithPassphrase({ value }, passphrase, meta);
}

export async function decryptStringWithPassphrase(envelope, passphrase) {
  const data = await decryptJsonWithPassphrase(envelope, passphrase);
  return data.value;
}
