import { EntitlementPayload } from '@eyeposture/shared-types';
import { Buffer } from 'node:buffer';

/**
 * Portable, zero-dependency SHA-256 & HMAC implementation
 * Fully compatible with Node.js, Electron (Main & Renderer), and modern browsers.
 */
function sha256(data: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const len = data.length;
  const bitLen = len * 8;
  const padLen = (len % 64 < 56 ? 56 - (len % 64) : 120 - (len % 64)) + 8;
  const totalLen = len + padLen;
  const padded = new Uint8Array(totalLen);
  padded.set(data);
  padded[len] = 0x80;

  // Append bit length at end (64-bit big-endian)
  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 4, bitLen, false);

  const W = new Uint32Array(64);

  for (let i = 0; i < totalLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((W[t - 15] >>> 7) | (W[t - 15] << 25)) ^ ((W[t - 15] >>> 18) | (W[t - 15] << 14)) ^ (W[t - 15] >>> 3);
      const s1 = ((W[t - 2] >>> 17) | (W[t - 2] << 15)) ^ ((W[t - 2] >>> 19) | (W[t - 2] << 13)) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const result = new Uint8Array(32);
  const resView = new DataView(result.buffer);
  resView.setUint32(0, h0, false);
  resView.setUint32(4, h1, false);
  resView.setUint32(8, h2, false);
  resView.setUint32(12, h3, false);
  resView.setUint32(16, h4, false);
  resView.setUint32(20, h5, false);
  resView.setUint32(24, h6, false);
  resView.setUint32(28, h7, false);
  return result;
}

function hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  let k = key;
  if (k.length > 64) {
    k = sha256(k);
  }
  const keyPad = new Uint8Array(64);
  keyPad.set(k);

  const oKeyPad = new Uint8Array(64);
  const iKeyPad = new Uint8Array(64);

  for (let i = 0; i < 64; i++) {
    oKeyPad[i] = keyPad[i] ^ 0x5c;
    iKeyPad[i] = keyPad[i] ^ 0x36;
  }

  const inner = new Uint8Array(64 + message.length);
  inner.set(iKeyPad);
  inner.set(message, 64);
  const innerHash = sha256(inner);

  const outer = new Uint8Array(64 + 32);
  outer.set(oKeyPad);
  outer.set(innerHash, 64);
  return sha256(outer);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64: string;
  if (typeof btoa === 'function') {
    base64 = btoa(binary);
  } else {
    base64 = Buffer.from(binary, 'binary').toString('base64');
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  let binary: string;
  if (typeof atob === 'function') {
    binary = atob(base64);
  } else {
    binary = Buffer.from(base64, 'base64').toString('binary');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export class EntitlementSigner {
  private secretKeyBytes: Uint8Array;

  constructor(secretKey: string) {
    this.secretKeyBytes = stringToBytes(secretKey);
  }

  public sign(payload: EntitlementPayload): string {
    const header = { alg: 'HS256', typ: 'EYEPOSTURE-ENTITLEMENT' };
    const encodedHeader = toBase64Url(stringToBytes(JSON.stringify(header)));
    const encodedPayload = toBase64Url(stringToBytes(JSON.stringify(payload)));

    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const sigBytes = hmacSha256(this.secretKeyBytes, stringToBytes(dataToSign));
    const signature = toBase64Url(sigBytes);

    return `${dataToSign}.${signature}`;
  }

  public verify(token: string): { isValid: boolean; payload?: EntitlementPayload; error?: string } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Malformed token structure' };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const expectedSigBytes = hmacSha256(this.secretKeyBytes, stringToBytes(dataToVerify));
    const expectedSignature = toBase64Url(expectedSigBytes);

    // Constant-time string equality check
    let mismatch = signature.length !== expectedSignature.length ? 1 : 0;
    for (let i = 0; i < signature.length; i++) {
      if (signature.charCodeAt(i) !== expectedSignature.charCodeAt(i)) {
        mismatch |= 1;
      }
    }

    if (mismatch !== 0) {
      return { isValid: false, error: 'Invalid cryptographic signature' };
    }

    try {
      const payloadBytes = fromBase64Url(encodedPayload);
      const payloadJson = bytesToString(payloadBytes);
      const payload = JSON.parse(payloadJson) as EntitlementPayload;
      return { isValid: true, payload };
    } catch {
      return { isValid: false, error: 'Failed to decode payload' };
    }
  }
}
