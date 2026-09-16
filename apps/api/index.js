var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/billing/dist/types.js
var require_types = __commonJS({
  "packages/billing/dist/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// packages/billing/dist/crypto/signer.js
var require_signer = __commonJS({
  "packages/billing/dist/crypto/signer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EntitlementSigner = void 0;
    function sha256(data) {
      const K = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ];
      let h0 = 1779033703, h1 = 3144134277, h2 = 1013904242, h3 = 2773480762;
      let h4 = 1359893119, h5 = 2600822924, h6 = 528734635, h7 = 1541459225;
      const len = data.length;
      const bitLen = len * 8;
      const padLen = (len % 64 < 56 ? 56 - len % 64 : 120 - len % 64) + 8;
      const totalLen = len + padLen;
      const padded = new Uint8Array(totalLen);
      padded.set(data);
      padded[len] = 128;
      const view = new DataView(padded.buffer);
      view.setUint32(totalLen - 4, bitLen, false);
      const W = new Uint32Array(64);
      for (let i = 0; i < totalLen; i += 64) {
        for (let t = 0; t < 16; t++) {
          W[t] = view.getUint32(i + t * 4, false);
        }
        for (let t = 16; t < 64; t++) {
          const s0 = (W[t - 15] >>> 7 | W[t - 15] << 25) ^ (W[t - 15] >>> 18 | W[t - 15] << 14) ^ W[t - 15] >>> 3;
          const s1 = (W[t - 2] >>> 17 | W[t - 2] << 15) ^ (W[t - 2] >>> 19 | W[t - 2] << 13) ^ W[t - 2] >>> 10;
          W[t] = W[t - 16] + s0 + W[t - 7] + s1 | 0;
        }
        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        for (let t = 0; t < 64; t++) {
          const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
          const ch = e & f ^ ~e & g;
          const temp1 = h + S1 + ch + K[t] + W[t] | 0;
          const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
          const maj = a & b ^ a & c ^ b & c;
          const temp2 = S0 + maj | 0;
          h = g;
          g = f;
          f = e;
          e = d + temp1 | 0;
          d = c;
          c = b;
          b = a;
          a = temp1 + temp2 | 0;
        }
        h0 = h0 + a | 0;
        h1 = h1 + b | 0;
        h2 = h2 + c | 0;
        h3 = h3 + d | 0;
        h4 = h4 + e | 0;
        h5 = h5 + f | 0;
        h6 = h6 + g | 0;
        h7 = h7 + h | 0;
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
    function hmacSha256(key, message) {
      let k = key;
      if (k.length > 64) {
        k = sha256(k);
      }
      const keyPad = new Uint8Array(64);
      keyPad.set(k);
      const oKeyPad = new Uint8Array(64);
      const iKeyPad = new Uint8Array(64);
      for (let i = 0; i < 64; i++) {
        oKeyPad[i] = keyPad[i] ^ 92;
        iKeyPad[i] = keyPad[i] ^ 54;
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
    function toBase64Url(bytes) {
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      let base64;
      if (typeof btoa === "function") {
        base64 = btoa(binary);
      } else if (typeof globalThis !== "undefined" && globalThis.Buffer) {
        base64 = globalThis.Buffer.from(binary, "binary").toString("base64");
      } else {
        base64 = "";
      }
      return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    function fromBase64Url(str) {
      let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      let binary;
      if (typeof atob === "function") {
        binary = atob(base64);
      } else if (typeof globalThis !== "undefined" && globalThis.Buffer) {
        binary = globalThis.Buffer.from(base64, "base64").toString("binary");
      } else {
        binary = "";
      }
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    function stringToBytes(str) {
      return new TextEncoder().encode(str);
    }
    function bytesToString(bytes) {
      return new TextDecoder().decode(bytes);
    }
    var EntitlementSigner2 = class {
      secretKeyBytes;
      constructor(secretKey) {
        this.secretKeyBytes = stringToBytes(secretKey);
      }
      sign(payload) {
        const header = { alg: "HS256", typ: "EYEPOSTURE-ENTITLEMENT" };
        const encodedHeader = toBase64Url(stringToBytes(JSON.stringify(header)));
        const encodedPayload = toBase64Url(stringToBytes(JSON.stringify(payload)));
        const dataToSign = `${encodedHeader}.${encodedPayload}`;
        const sigBytes = hmacSha256(this.secretKeyBytes, stringToBytes(dataToSign));
        const signature = toBase64Url(sigBytes);
        return `${dataToSign}.${signature}`;
      }
      verify(token) {
        const parts = token.split(".");
        if (parts.length !== 3) {
          return { isValid: false, error: "Malformed token structure" };
        }
        const [encodedHeader, encodedPayload, signature] = parts;
        const dataToVerify = `${encodedHeader}.${encodedPayload}`;
        const expectedSigBytes = hmacSha256(this.secretKeyBytes, stringToBytes(dataToVerify));
        const expectedSignature = toBase64Url(expectedSigBytes);
        let mismatch = signature.length !== expectedSignature.length ? 1 : 0;
        for (let i = 0; i < signature.length; i++) {
          if (signature.charCodeAt(i) !== expectedSignature.charCodeAt(i)) {
            mismatch |= 1;
          }
        }
        if (mismatch !== 0) {
          return { isValid: false, error: "Invalid cryptographic signature" };
        }
        try {
          const payloadBytes = fromBase64Url(encodedPayload);
          const payloadJson = bytesToString(payloadBytes);
          const payload = JSON.parse(payloadJson);
          return { isValid: true, payload };
        } catch {
          return { isValid: false, error: "Failed to decode payload" };
        }
      }
    };
    exports2.EntitlementSigner = EntitlementSigner2;
  }
});

// packages/billing/dist/verifier/license-verifier.js
var require_license_verifier = __commonJS({
  "packages/billing/dist/verifier/license-verifier.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LicenseVerifier = exports2.PRO_FEATURES = exports2.FREE_FEATURES = void 0;
    var signer_js_1 = require_signer();
    exports2.FREE_FEATURES = [
      "basic_reminders",
      "basic_eye_break",
      "basic_hydration",
      "basic_screen_time",
      "single_profile"
    ];
    exports2.PRO_FEATURES = [
      ...exports2.FREE_FEATURES,
      "posture_full",
      "distance_full",
      "advanced_stats",
      "adaptive_reminders",
      "multi_profiles",
      "custom_voice",
      "app_exclusion"
    ];
    var LicenseVerifier = class {
      signer;
      lastVerifiedTimestamp = 0;
      offlineGracePeriodMs = 14 * 24 * 60 * 60 * 1e3;
      // 14 days
      constructor(publicKeyOrSecret) {
        this.signer = new signer_js_1.EntitlementSigner(publicKeyOrSecret);
      }
      verifyToken(token, currentDeviceId, now = Date.now()) {
        if (this.lastVerifiedTimestamp > 0 && now < this.lastVerifiedTimestamp - 2 * 3600 * 1e3) {
          return {
            isValid: false,
            tier: "FREE",
            isOfflineGrace: false,
            daysRemaining: 0,
            features: exports2.FREE_FEATURES,
            error: "Clock manipulation detected. System time is earlier than previous verification."
          };
        }
        const verifyRes = this.signer.verify(token);
        if (!verifyRes.isValid || !verifyRes.payload) {
          return {
            isValid: false,
            tier: "FREE",
            isOfflineGrace: false,
            daysRemaining: 0,
            features: exports2.FREE_FEATURES,
            error: verifyRes.error ?? "Invalid signature"
          };
        }
        const payload = verifyRes.payload;
        if (payload.deviceId && payload.deviceId !== currentDeviceId) {
          return {
            isValid: false,
            tier: "FREE",
            isOfflineGrace: false,
            daysRemaining: 0,
            features: exports2.FREE_FEATURES,
            error: "License is registered to a different device"
          };
        }
        this.lastVerifiedTimestamp = now;
        const msRemaining = payload.expiresAt - now;
        const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 3600 * 1e3)));
        if (msRemaining >= 0) {
          return {
            isValid: true,
            tier: payload.tier,
            isOfflineGrace: false,
            daysRemaining,
            features: payload.features ?? exports2.PRO_FEATURES
          };
        }
        const msPastExpiry = Math.abs(msRemaining);
        if (msPastExpiry <= this.offlineGracePeriodMs) {
          return {
            isValid: true,
            tier: payload.tier,
            isOfflineGrace: true,
            daysRemaining: 0,
            features: payload.features ?? exports2.PRO_FEATURES,
            error: "Subscription expired. Operating in 14-day offline grace period."
          };
        }
        return {
          isValid: false,
          tier: "FREE",
          isOfflineGrace: false,
          daysRemaining: 0,
          features: exports2.FREE_FEATURES,
          error: "Subscription expired and grace period elapsed."
        };
      }
    };
    exports2.LicenseVerifier = LicenseVerifier;
  }
});

// packages/billing/dist/providers/billing-provider.js
var require_billing_provider = __commonJS({
  "packages/billing/dist/providers/billing-provider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StripeBillingProvider = exports2.MockBillingProvider = void 0;
    var MockBillingProvider2 = class {
      async createCheckoutSession(options) {
        return {
          sessionId: `mock_sess_${crypto.randomUUID()}`,
          checkoutUrl: `https://billing.eyeposture.com/mock-checkout?user=${options.userId}&tier=${options.tier}`
        };
      }
      async cancelSubscription(subscriptionId) {
        return true;
      }
      async getSubscriptionStatus(userId) {
        return {
          tier: "PRO",
          status: "ACTIVE",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1e3
        };
      }
    };
    exports2.MockBillingProvider = MockBillingProvider2;
    var StripeBillingProvider = class {
      stripeApiKey;
      constructor(stripeApiKey) {
        this.stripeApiKey = stripeApiKey;
      }
      async createCheckoutSession(options) {
        return {
          sessionId: `cs_${crypto.randomUUID()}`,
          checkoutUrl: `https://checkout.stripe.com/pay/cs_${options.userId}`
        };
      }
      async cancelSubscription(subscriptionId) {
        return true;
      }
      async getSubscriptionStatus(userId) {
        return {
          tier: "PRO",
          status: "ACTIVE",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1e3
        };
      }
    };
    exports2.StripeBillingProvider = StripeBillingProvider;
  }
});

// packages/billing/dist/providers/sepay-provider.js
var require_sepay_provider = __commonJS({
  "packages/billing/dist/providers/sepay-provider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SePayBillingProvider = void 0;
    function getEnv() {
      if (typeof globalThis !== "undefined" && globalThis.process?.env) {
        return globalThis.process.env;
      }
      return {};
    }
    var SePayBillingProvider2 = class _SePayBillingProvider {
      config;
      // Standard plan pricing in VND
      static PRICES_VND = {
        FREE: { month: 0, year: 0 },
        PRO: { month: 59e3, year: 499e3 },
        FAMILY: { month: 99e3, year: 899e3 }
      };
      constructor(config) {
        const env = getEnv();
        this.config = {
          apiKey: config?.apiKey || env.SEPAY_WEBHOOK_SECRET || env.SECRET_KEY || env.SEPAY_API_KEY || "sepay_api_key_eyeposture_demo",
          accountNumber: config?.accountNumber || env.PAYMENT_BANK_ACCOUNT || env.PAYMENT_BANK_VIRTUAL_ACCOUNT || env.SEPAY_ACCOUNT_NUMBER || "4661398013",
          bankName: config?.bankName || env.PAYMENT_BANK_CODE || env.SEPAY_BANK_NAME || "BIDV",
          accountHolder: config?.accountHolder || env.PAYMENT_BANK_ACCOUNT_NAME || env.SEPAY_ACCOUNT_HOLDER || "NGUYEN DUY HUNG",
          transferPrefix: config?.transferPrefix || "EYEPOSTURE"
        };
      }
      /**
       * Generates a VietQR URL using the official SePay QR image service
       */
      generateVietQrUrl(params) {
        const acc = params.accountNumber || this.config.accountNumber;
        const bank = params.bankName || this.config.bankName;
        const amount = Math.max(0, Math.round(params.amount));
        const des = encodeURIComponent(params.content.trim());
        return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}`;
      }
      /**
       * Creates a VietQR payment code & details for desktop app
       */
      createQrPayment(options) {
        const tier = options.tier || "PRO";
        const interval = options.interval || "month";
        const amount = _SePayBillingProvider.PRICES_VND[tier]?.[interval] ?? 59e3;
        const orderCode = `ORD${Date.now().toString().slice(-6)}`;
        const transferContent = `${this.config.transferPrefix} ${options.userId} ${orderCode}`;
        const qrUrl = this.generateVietQrUrl({
          amount,
          content: transferContent
        });
        return {
          qrUrl,
          accountNumber: this.config.accountNumber,
          bankName: this.config.bankName,
          accountHolder: this.config.accountHolder,
          amount,
          transferContent,
          orderCode
        };
      }
      /**
       * Implements IBillingProvider.createCheckoutSession
       */
      async createCheckoutSession(options) {
        const qrPayment = this.createQrPayment({
          userId: options.userId,
          tier: options.tier,
          interval: options.interval
        });
        return {
          sessionId: qrPayment.orderCode,
          checkoutUrl: qrPayment.qrUrl
        };
      }
      async cancelSubscription(_subscriptionId) {
        return true;
      }
      async getSubscriptionStatus(_userId) {
        return {
          tier: "PRO",
          status: "ACTIVE",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1e3
        };
      }
      /**
       * Parses the payment content from the bank transaction string
       * e.g., "EYEPOSTURE usr_94a2b1c8 ORD123456" -> userId = "usr_94a2b1c8"
       */
      parsePaymentContent(content) {
        if (!content) {
          return { userId: null, orderCode: null, tier: "PRO" };
        }
        const clean = content.trim();
        const prefix = this.config.transferPrefix || "EYEPOSTURE";
        const regex = new RegExp(`(?:${prefix}|EP)[_\\s]+([a-zA-Z0-9_-]+)(?:[_\\s]+(ORD[0-9]+))?`, "i");
        const match = clean.match(regex);
        if (match) {
          const userId = match[1];
          const orderCode = match[2] || null;
          const tier = /family/i.test(clean) ? "FAMILY" : "PRO";
          return { userId, orderCode, tier };
        }
        return { userId: null, orderCode: null, tier: "PRO" };
      }
      /**
       * Verifies the SePay Webhook authorization header
       * SePay sends header format: "Authorization: Apikey <API_KEY>"
       */
      verifyApiKey(authHeader) {
        if (!authHeader)
          return false;
        const cleanHeader = authHeader.trim();
        const env = getEnv();
        const validKeys = Array.from(new Set([
          this.config.apiKey,
          env.SEPAY_WEBHOOK_SECRET,
          env.SECRET_KEY,
          env.SEPAY_API_KEY
        ].filter(Boolean)));
        for (const key of validKeys) {
          if (cleanHeader === key)
            return true;
          if (cleanHeader === `Apikey ${key}`)
            return true;
          if (cleanHeader === `Bearer ${key}`)
            return true;
        }
        return false;
      }
    };
    exports2.SePayBillingProvider = SePayBillingProvider2;
  }
});

// packages/billing/dist/index.js
var require_dist = __commonJS({
  "packages/billing/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_types(), exports2);
    __exportStar(require_signer(), exports2);
    __exportStar(require_license_verifier(), exports2);
    __exportStar(require_billing_provider(), exports2);
    __exportStar(require_sepay_provider(), exports2);
  }
});

// apps/api/src/admin/dashboard-styles.ts
function getDashboardStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');

    :root {
      --bg-main: #090d16;
      --bg-sidebar: #0d121f;
      --bg-card: rgba(18, 24, 38, 0.7);
      --border-card: rgba(255, 255, 255, 0.07);
      --accent-teal: #14b8a6;
      --accent-cyan: #06b6d4;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-main);
      color: #f1f5f9;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

    h1, h2, h3, h4, .brand-font {
      font-family: 'Outfit', sans-serif;
    }

    /* Custom Glassmorphism */
    .glass-sidebar {
      background: rgba(13, 18, 31, 0.85);
      backdrop-filter: blur(16px);
      border-right: 1px solid var(--border-card);
    }

    .glass-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-card);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .glass-card:hover {
      border-color: rgba(20, 184, 166, 0.3);
      box-shadow: 0 10px 30px -10px rgba(20, 184, 166, 0.15);
    }

    .gradient-teal {
      background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
    }

    .gradient-orange {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    }

    .gradient-purple {
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    }

    .gradient-text {
      background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Active Sidebar Item */
    .nav-item {
      transition: all 0.2s ease;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%);
      border-left: 3px solid #14b8a6;
      color: #2dd4bf;
      font-weight: 600;
    }

    .nav-item:not(.active):hover {
      background: rgba(255, 255, 255, 0.04);
      color: #f8fafc;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #090d16;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }

    /* Chart Containers */
    .chart-box {
      position: relative;
      height: 260px;
      width: 100%;
    }

    .chart-box-sm {
      position: relative;
      height: 220px;
      width: 100%;
    }
  `;
}
var init_dashboard_styles = __esm({
  "apps/api/src/admin/dashboard-styles.ts"() {
    "use strict";
  }
});

// apps/api/src/admin/dashboard-scripts.ts
function getDashboardScripts() {
  return `
    let rawDevices = [];
    let rawUsers = [];
    let rawStats = null;
    let currentTab = 'dashboard';
    let revenueChartInstance = null;
    let userChartInstance = null;
    let tierChartInstance = null;

    document.addEventListener('DOMContentLoaded', () => {
      initNavigation();
      loadAllData();
      setInterval(loadAllData, 30000); // T\u1EF1 \u0111\u1ED9ng l\xE0m m\u1EDBi m\u1ED7i 30s
    });

    function initNavigation() {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const target = item.getAttribute('data-tab');
          switchTab(target);
        });
      });

      // Filter buttons in Users tab
      const filterBtns = document.querySelectorAll('.user-filter-btn');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('bg-teal-500/20', 'text-teal-300', 'border-teal-500/40'));
          filterBtns.forEach(b => b.classList.add('text-slate-400', 'border-slate-800'));
          btn.classList.add('bg-teal-500/20', 'text-teal-300', 'border-teal-500/40');
          btn.classList.remove('text-slate-400', 'border-slate-800');
          filterUsers(btn.getAttribute('data-filter'));
        });
      });
    }

    function switchTab(tabId) {
      currentTab = tabId;
      document.querySelectorAll('.nav-item').forEach(el => {
        if (el.getAttribute('data-tab') === tabId) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });

      // Hide all panels
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));

      // Show selected panel
      const targetPanel = document.getElementById('panel-' + tabId);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }

      // Update breadcrumb
      const breadcrumb = document.getElementById('top-breadcrumb');
      if (breadcrumb) {
        const titles = {
          dashboard: 'T\u1ED5ng Quan & Bi\u1EC3u \u0110\u1ED3 Th\u1ED1ng K\xEA',
          users: 'Chi Ti\u1EBFt Ng\u01B0\u1EDDi D\xF9ng \u0110ang S\u1EED D\u1EE5ng',
          devices: 'Qu\u1EA3n L\xFD Thi\u1EBFt B\u1ECB Ph\u1EA7n C\u1EE9ng',
          sepay: 'C\u1ED5ng SePay VietQR & Webhook'
        };
        breadcrumb.innerText = titles[tabId] || 'Qu\u1EA3n Tr\u1ECB';
      }

      // Re-render charts if dashboard is shown
      if (tabId === 'dashboard') {
        setTimeout(renderCharts, 50);
      }
    }

    async function loadAllData() {
      const refreshIcon = document.getElementById('refresh-icon');
      if (refreshIcon) refreshIcon.classList.add('animate-spin');

      try {
        const [devRes, userRes, statsRes] = await Promise.all([
          fetch('/api/v1/admin/devices').then(r => r.json()).catch(() => ({ devices: [] })),
          fetch('/api/v1/admin/users').then(r => r.json()).catch(() => ({ users: [] })),
          fetch('/api/v1/admin/stats').then(r => r.json()).catch(() => null)
        ]);

        rawDevices = devRes.devices || [];
        rawUsers = userRes.users || [];
        rawStats = statsRes;

        updateKpiCounters();
        renderCharts();
        renderUsersList(rawUsers);
        renderDevicesTable(rawDevices);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        showToast('L\u1ED7i \u0111\u1ED3ng b\u1ED9 d\u1EEF li\u1EC7u Cloud API', true);
      } finally {
        if (refreshIcon) {
          setTimeout(() => refreshIcon.classList.remove('animate-spin'), 600);
        }
      }
    }

    function updateKpiCounters() {
      const totalDev = rawDevices.length;
      const blockedDev = rawDevices.filter(d => d.isBlocked).length;
      const activeDev = totalDev - blockedDev;
      const proCount = rawUsers.filter(u => u.subscription?.tier === 'PRO' || u.subscription?.tier === 'FAMILY').length;
      const totalUsers = rawUsers.length;

      // Badges in sidebar
      const badgeUsers = document.getElementById('sidebar-user-count');
      if (badgeUsers) badgeUsers.innerText = totalUsers;
      const badgeDev = document.getElementById('sidebar-device-count');
      if (badgeDev) badgeDev.innerText = totalDev;

      // Dashboard KPI cards
      const elTotalRev = document.getElementById('kpi-revenue');
      const elUsers = document.getElementById('kpi-total-users');
      const elActiveDev = document.getElementById('kpi-active-devices');
      const elProRate = document.getElementById('kpi-pro-rate');

      const totalRev = rawStats?.totalRevenueVnd || (proCount * 59000);
      if (elTotalRev) elTotalRev.innerText = totalRev.toLocaleString('vi-VN') + ' \u0111';
      if (elUsers) elUsers.innerText = totalUsers;
      if (elActiveDev) elActiveDev.innerText = activeDev + ' / ' + totalDev;

      const rate = totalUsers > 0 ? Math.round((proCount / totalUsers) * 100) : 0;
      if (elProRate) elProRate.innerText = rate + '%';
    }

    function renderCharts() {
      if (typeof Chart === 'undefined') return;

      // 1. Revenue Chart (Doanh s\u1ED1 theo tu\u1EA7n/th\xE1ng)
      const ctxRev = document.getElementById('chart-revenue');
      if (ctxRev) {
        const days = ['Th\u1EE9 2', 'Th\u1EE9 3', 'Th\u1EE9 4', 'Th\u1EE9 5', 'Th\u1EE9 6', 'Th\u1EE9 7', 'Ch\u1EE7 Nh\u1EADt'];
        const dataRev = rawStats?.revenueHistory || [295000, 413000, 354000, 590000, 708000, 885000, 1180000];

        if (revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(ctxRev, {
          type: 'line',
          data: {
            labels: days,
            datasets: [{
              label: 'Doanh S\u1ED1 (VN\u0110)',
              data: dataRev,
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(20, 184, 166, 0.12)',
              borderWidth: 2.5,
              pointBackgroundColor: '#2dd4bf',
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.35,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ' ' + ctx.raw.toLocaleString('vi-VN') + ' \u0111'
                }
              }
            },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
              y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                  color: '#94a3b8',
                  font: { size: 10 },
                  callback: (val) => (val >= 1000 ? (val / 1000) + 'k' : val)
                }
              }
            }
          }
        });
      }

      // 2. User Growth Chart
      const ctxUser = document.getElementById('chart-users');
      if (ctxUser) {
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const userGrowth = rawStats?.userGrowth || [12, 19, 25, 32, 45, 58, Math.max(70, rawUsers.length * 10)];
        const activeTrend = rawStats?.activeTrend || [8, 15, 20, 26, 38, 50, Math.max(60, rawUsers.length * 8)];

        if (userChartInstance) userChartInstance.destroy();
        userChartInstance = new Chart(ctxUser, {
          type: 'bar',
          data: {
            labels: days,
            datasets: [
              {
                label: 'Ng\u01B0\u1EDDi D\xF9ng M\u1EDBi',
                data: userGrowth,
                backgroundColor: '#38bdf8',
                borderRadius: 4
              },
              {
                label: 'Active Users',
                data: activeTrend,
                backgroundColor: '#14b8a6',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#cbd5e1', boxWidth: 10, font: { size: 10 } }
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
            }
          }
        });
      }

      // 3. Tier Distribution (Free vs Pro vs Family)
      const ctxTier = document.getElementById('chart-tier');
      if (ctxTier) {
        const freeCount = rawUsers.filter(u => !u.subscription || u.subscription.tier === 'FREE').length || 1;
        const proCount = rawUsers.filter(u => u.subscription?.tier === 'PRO').length;
        const famCount = rawUsers.filter(u => u.subscription?.tier === 'FAMILY').length;

        if (tierChartInstance) tierChartInstance.destroy();
        tierChartInstance = new Chart(ctxTier, {
          type: 'doughnut',
          data: {
            labels: ['G\xF3i Mi\u1EC5n Ph\xED (Free)', 'G\xF3i Chuy\xEAn Nghi\u1EC7p (Pro)', 'G\xF3i Gia \u0110\xECnh (Family)'],
            datasets: [{
              data: [freeCount, Math.max(proCount, 1), famCount],
              backgroundColor: ['#64748b', '#14b8a6', '#8b5cf6'],
              borderColor: '#090d16',
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#cbd5e1', boxWidth: 8, font: { size: 10 }, padding: 12 }
              }
            }
          }
        });
      }
    }

    function renderUsersList(users) {
      const container = document.getElementById('users-cards-container');
      if (!container) return;

      if (!users || !users.length) {
        container.innerHTML = '<div class="p-8 text-center text-slate-500 text-xs">Ch\u01B0a c\xF3 ng\u01B0\u1EDDi d\xF9ng n\xE0o \u0111\u0103ng k\xFD tr\xEAn h\u1EC7 th\u1ED1ng.</div>';
        return;
      }

      container.innerHTML = users.map(user => {
        const isBlocked = Boolean(user.isBlocked);
        const sub = user.subscription || { tier: 'FREE' };
        const tier = sub.tier || 'FREE';
        const userDevices = rawDevices.filter(d => d.userId === user.id);

        let tierBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">FREE</span>';
        if (tier === 'PRO') {
          tierBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">\u2605 PRO LICENSE</span>';
        } else if (tier === 'FAMILY') {
          tierBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">\u2726 FAMILY PASS</span>';
        }

        const deviceLimit = tier === 'FAMILY' ? 5 : tier === 'PRO' ? 3 : 1;
        const initialLetter = (user.name || user.email || 'U').charAt(0).toUpperCase();

        // Render devices of this user
        let devicesHtml = '';
        if (userDevices.length === 0) {
          devicesHtml = '<div class="text-[11px] text-slate-500 italic">Ch\u01B0a li\xEAn k\u1EBFt m\xE1y t\xEDnh n\xE0o.</div>';
        } else {
          devicesHtml = userDevices.map(d => {
            const devBlocked = Boolean(d.isBlocked);
            return \`
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 rounded bg-slate-800 text-slate-300">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/></svg>
                  </div>
                  <div>
                    <div class="font-medium text-slate-200 text-xs flex items-center gap-1.5">
                      \${d.deviceName || 'Windows PC'}
                      \${devBlocked
                        ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">M\xC1Y B\u1ECA CH\u1EB6N</span>'
                        : '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">M\xC1Y ONLINE</span>'
                      }
                    </div>
                    <div class="text-[10px] text-slate-500 font-mono">\${d.deviceFingerprint} \u2022 \${d.os || 'Win 11'}</div>
                  </div>
                </div>
                <div>
                  \${devBlocked
                    ? \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', false)" class="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition">M\u1EDF M\xE1y</button>\`
                    : \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', true)" class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold transition">Kh\xF3a M\xE1y</button>\`
                  }
                </div>
              </div>
            \`;
          }).join('');
        }

        return \`
          <div class="glass-card rounded-xl p-5 space-y-4">
            <!-- Header User Card -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center font-extrabold text-slate-950 text-base shadow-md">
                  \${initialLetter}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-sm text-slate-100">\${user.name || 'Ng\u01B0\u1EDDi D\xF9ng'}</h3>
                    \${tierBadge}
                    \${isBlocked
                      ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30">T\xC0I KHO\u1EA2N B\u1ECA KH\xD3A</span>'
                      : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">HO\u1EA0T \u0110\u1ED8NG</span>'
                    }
                  </div>
                  <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>\${user.email}</span>
                    <span>\u2022</span>
                    <span class="text-[11px] text-slate-500">Gia nh\u1EADp: \${new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <!-- Quick Action Buttons -->
              <div class="flex items-center gap-2">
                \${tier === 'FREE'
                  ? \`<button onclick="quickUpgradeUser('\${user.id}', 'PRO')" class="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      C\u1EA5p Pro Ngay
                    </button>\`
                  : ''
                }
                \${isBlocked
                  ? \`<button onclick="toggleUserBlock('\${user.id}', false)" class="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 11V7a5 5 0 0 1 9.9-1"/><rect width="18" height="11" x="3" y="11" rx="2"/></svg>
                      M\u1EDF Kh\xF3a T\xE0i Kho\u1EA3n
                    </button>\`
                  : \`<button onclick="toggleUserBlock('\${user.id}', true)" class="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Kh\xF3a T\xE0i Kho\u1EA3n
                    </button>\`
                }
              </div>
            </div>

            <!-- Detail Device List for this user -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span class="font-medium text-slate-300 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/></svg>
                  M\xE1y t\xEDnh \u0111ang s\u1EED d\u1EE5ng:
                </span>
                <span class="text-[11px] font-mono text-teal-300 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/40">
                  \${userDevices.length} / \${deviceLimit} m\xE1y (Seat quota)
                </span>
              </div>
              <div class="space-y-1.5">
                \${devicesHtml}
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderDevicesTable(devices) {
      const tbody = document.getElementById('devices-table-body');
      if (!tbody) return;

      if (!devices || !devices.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-slate-500">Ch\u01B0a c\xF3 thi\u1EBFt b\u1ECB n\xE0o \u0111\u0103ng k\xFD v\u1EDBi h\u1EC7 th\u1ED1ng.</td></tr>';
        return;
      }

      tbody.innerHTML = devices.map(d => {
        const isBlocked = d.isBlocked;
        return \`
          <tr class="hover:bg-slate-800/30 transition">
            <td class="py-3 px-4">
              <div class="flex items-center gap-2.5">
                <div class="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/></svg>
                </div>
                <div>
                  <div class="font-semibold text-slate-200">\${d.deviceName || 'Windows PC'}</div>
                  <div class="text-[10px] text-slate-400">\${d.os || 'Windows 11'} \u2022 v\${d.appVersion || '1.0.0'}</div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4">
              <div class="font-medium text-slate-300">\${d.userEmail}</div>
              <div class="text-[10px] text-slate-500">\${d.userName}</div>
            </td>
            <td class="py-3 px-4">
              <span class="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">\${d.deviceFingerprint}</span>
            </td>
            <td class="py-3 px-4">
              \${isBlocked
                ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">\u25CF B\u1ECA CH\u1EB6N</span>'
                : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">\u25CF HO\u1EA0T \u0110\u1ED8NG</span>'
              }
            </td>
            <td class="py-3 px-4 text-slate-400 text-[11px]">
              \${new Date(d.lastActiveAt).toLocaleString('vi-VN')}
            </td>
            <td class="py-3 px-4 text-right">
              \${isBlocked
                ? \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', false)" class="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition inline-flex items-center gap-1">
                    M\u1EDF Kh\xF3a M\xE1y
                  </button>\`
                : \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', true)" class="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition inline-flex items-center gap-1">
                    Ch\u1EB7n M\xE1y N\xE0y
                  </button>\`
              }
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filterUsers(type) {
      if (type === 'all') {
        renderUsersList(rawUsers);
      } else if (type === 'pro') {
        renderUsersList(rawUsers.filter(u => u.subscription?.tier === 'PRO' || u.subscription?.tier === 'FAMILY'));
      } else if (type === 'free') {
        renderUsersList(rawUsers.filter(u => !u.subscription || u.subscription.tier === 'FREE'));
      } else if (type === 'blocked') {
        renderUsersList(rawUsers.filter(u => u.isBlocked));
      }
    }

    function searchAll(query) {
      const q = (query || '').toLowerCase().trim();
      if (!q) {
        renderUsersList(rawUsers);
        renderDevicesTable(rawDevices);
        return;
      }

      // Filter users
      const matchedUsers = rawUsers.filter(u =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q)
      );
      renderUsersList(matchedUsers);

      // Filter devices
      const matchedDevs = rawDevices.filter(d =>
        (d.deviceName || '').toLowerCase().includes(q) ||
        (d.userEmail || '').toLowerCase().includes(q) ||
        (d.deviceFingerprint || '').toLowerCase().includes(q)
      );
      renderDevicesTable(matchedDevs);
    }

    async function toggleDeviceBlock(fingerprint, shouldBlock) {
      const actionText = shouldBlock ? 'CH\u1EB6N M\xC1Y' : 'M\u1EDE KH\xD3A M\xC1Y';
      if (!confirm('X\xE1c nh\u1EADn ' + actionText + ' (' + fingerprint + ')?')) return;

      const endpoint = shouldBlock ? '/api/v1/admin/devices/block' : '/api/v1/admin/devices/unblock';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceFingerprint: fingerprint })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(shouldBlock ? '\u0110\xE3 ch\u1EB7n m\xE1y th\xE0nh c\xF4ng' : '\u0110\xE3 m\u1EDF kh\xF3a m\xE1y th\xE0nh c\xF4ng', false);
          loadAllData();
        } else {
          showToast(data.error || 'Thao t\xE1c th\u1EA5t b\u1EA1i', true);
        }
      } catch (err) {
        showToast('L\u1ED7i m\u1EA1ng khi c\u1EADp nh\u1EADt thi\u1EBFt b\u1ECB', true);
      }
    }

    async function toggleUserBlock(userId, shouldBlock) {
      const actionText = shouldBlock ? 'KH\xD3A T\xC0I KHO\u1EA2N' : 'M\u1EDE KH\xD3A T\xC0I KHO\u1EA2N';
      if (!confirm('X\xE1c nh\u1EADn ' + actionText + '?')) return;

      const endpoint = shouldBlock ? '/api/v1/admin/users/block' : '/api/v1/admin/users/unblock';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(shouldBlock ? '\u0110\xE3 kh\xF3a t\xE0i kho\u1EA3n' : '\u0110\xE3 m\u1EDF kh\xF3a t\xE0i kho\u1EA3n', false);
          loadAllData();
        } else {
          showToast(data.error || 'Thao t\xE1c th\u1EA5t b\u1EA1i', true);
        }
      } catch (err) {
        showToast('L\u1ED7i m\u1EA1ng khi c\u1EADp nh\u1EADt t\xE0i kho\u1EA3n', true);
      }
    }

    async function quickUpgradeUser(userId, tier) {
      if (!confirm('C\u1EA5p ngay quy\u1EC1n ' + tier + ' cho t\xE0i kho\u1EA3n n\xE0y?')) return;
      try {
        const res = await fetch('/api/v1/admin/users/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, tier, days: 365 })
        });
        if (res.ok) {
          showToast('\u0110\xE3 n\xE2ng c\u1EA5p g\xF3i ' + tier + ' th\xE0nh c\xF4ng!', false);
          loadAllData();
        } else {
          showToast('N\xE2ng c\u1EA5p th\u1EA5t b\u1EA1i', true);
        }
      } catch (err) {
        showToast('L\u1ED7i khi n\xE2ng c\u1EA5p t\xE0i kho\u1EA3n', true);
      }
    }

    async function simulateSepayWebhook() {
      const email = document.getElementById('sim-email')?.value?.trim();
      if (!email) {
        alert('Vui l\xF2ng nh\u1EADp Email ng\u01B0\u1EDDi d\xF9ng c\u1EA7n k\xEDch ho\u1EA1t b\u1EA3n quy\u1EC1n SePay!');
        return;
      }

      try {
        const res = await fetch('/api/v1/billing/webhook/sepay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Apikey demo_webhook_secret'
          },
          body: JSON.stringify({
            id: Date.now(),
            gateway: 'BIDV',
            transactionDate: new Date().toISOString(),
            accountNumber: '4661398013',
            subAccount: null,
            transferType: 'in',
            transferAmount: 59000,
            accumulated: 10000000,
            code: 'SEPAY' + Math.floor(Math.random() * 900000 + 100000),
            content: 'EYEPOSTURE ' + email,
            referenceCode: 'BIDV_' + Date.now(),
            description: 'Nang cap EyePosture Pro 1 thang'
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast('B\u1EAFn Webhook SePay th\xE0nh c\xF4ng! G\xF3i PRO \u0111\xE3 \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t!', false);
          loadAllData();
        } else {
          showToast(data.error || 'Webhook t\u1EEB ch\u1ED1i x\u1EED l\xFD', true);
        }
      } catch (err) {
        showToast('Kh\xF4ng th\u1EC3 g\u1EEDi webhook gi\u1EA3 l\u1EADp', true);
      }
    }

    function showToast(msg, isError) {
      const toast = document.getElementById('toast');
      const box = document.getElementById('toast-box');
      const icon = document.getElementById('toast-icon');
      const text = document.getElementById('toast-msg');

      if (!toast) return;

      text.innerText = msg;
      if (isError) {
        box.className = 'glass-card border border-rose-500/40 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs text-rose-200 bg-slate-900/95';
        icon.innerText = '\u2715';
      } else {
        box.className = 'glass-card border border-teal-500/40 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs text-teal-200 bg-slate-900/95';
        icon.innerText = '\u2713';
      }

      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');

      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 3500);
    }
  `;
}
var init_dashboard_scripts = __esm({
  "apps/api/src/admin/dashboard-scripts.ts"() {
    "use strict";
  }
});

// apps/api/src/admin/dashboard-html.ts
function getAdminDashboardHtml() {
  const styles = getDashboardStyles();
  const scripts = getDashboardScripts();
  return `<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EyePosture Admin Dashboard - Th\u1ED1ng K\xEA & Qu\u1EA3n Tr\u1ECB Ng\u01B0\u1EDDi D\xF9ng</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" href="/EyePosture.png">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    ${styles}
  </style>
</head>
<body class="bg-slate-950 text-slate-100 flex min-h-screen antialiased selection:bg-teal-500/30">

  <!-- ================= LEFT SIDEBAR ================= -->
  <aside class="w-64 glass-sidebar flex flex-col justify-between shrink-0 fixed top-0 bottom-0 left-0 z-30">
    <div>
      <!-- Brand Logo & Title -->
      <div class="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <img src="/EyePosture.png" alt="EyePosture Icon" class="w-10 h-10 rounded-xl object-contain shadow-lg shadow-teal-500/20 border border-teal-500/30 bg-slate-900" />
        <div>
          <div class="font-extrabold text-base tracking-tight brand-font flex items-center gap-1.5">
            EyePosture <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">HUB</span>
          </div>
          <div class="text-[11px] text-slate-400">Qu\u1EA3n Tr\u1ECB & Doanh Thu</div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="p-3 space-y-1 text-xs">
        <div class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">B\u1EA3ng \u0110i\u1EC1u Khi\u1EC3n</div>
        
        <!-- Tab 1: Dashboard (Bi\u1EC3u \u0111\u1ED3 th\u1ED1ng k\xEA & Doanh s\u1ED1) -->
        <a href="#dashboard" data-tab="dashboard" class="nav-item active flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>Dashboard & Doanh S\u1ED1</span>
          </div>
          <span class="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-mono">LIVE</span>
        </a>

        <!-- Tab 2: Users (Chi ti\u1EBFt ng\u01B0\u1EDDi \u0111ang s\u1EED d\u1EE5ng) -->
        <a href="#users" data-tab="users" class="nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Chi Ti\u1EBFt Ng\u01B0\u1EDDi D\xF9ng</span>
          </div>
          <span id="sidebar-user-count" class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">0</span>
        </a>

        <div class="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ph\u1EA7n C\u1EE9ng & C\u1ED5ng Ti\u1EC1n</div>

        <!-- Tab 3: Thi\u1EBFt B\u1ECB -->
        <a href="#devices" data-tab="devices" class="nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
            <span>Qu\u1EA3n L\xFD Thi\u1EBFt B\u1ECB</span>
          </div>
          <span id="sidebar-device-count" class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">0</span>
        </a>

        <!-- Tab 4: SePay VietQR -->
        <a href="#sepay" data-tab="sepay" class="nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            <span>C\u1ED5ng SePay VietQR</span>
          </div>
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </a>
      </nav>
    </div>

    <!-- Sidebar Footer: Admin Profile -->
    <div class="p-3 border-t border-slate-800/80 bg-slate-900/50">
      <div class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div class="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center font-bold text-slate-950 text-xs">
          H
        </div>
        <div class="overflow-hidden">
          <div class="font-bold text-xs text-slate-200 truncate">Nguyen Duy Hung</div>
          <div class="text-[10px] text-teal-400 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Super Admin
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- ================= RIGHT CONTENT AREA ================= -->
  <main class="flex-1 pl-64 flex flex-col min-w-0">
    
    <!-- Top Header Bar -->
    <header class="h-16 glass-card border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <span id="top-breadcrumb" class="font-bold text-sm text-slate-100 brand-font">T\u1ED5ng Quan & Bi\u1EC3u \u0110\u1ED3 Th\u1ED1ng K\xEA</span>
        <span class="text-xs text-slate-500">\u2022</span>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> SePay & Cloud API: Online
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Global Search Input -->
        <div class="relative w-64 md:w-80">
          <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" oninput="searchAll(this.value)" placeholder="T\xECm ng\u01B0\u1EDDi d\xF9ng, m\xE1y t\xEDnh, email..." class="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition">
        </div>

        <!-- Refresh Button -->
        <button onclick="loadAllData()" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition">
          <svg id="refresh-icon" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
          <span>L\xE0m m\u1EDBi</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <div class="p-6 space-y-6">

      <!-- ================= 1. PANEL DASHBOARD ================= -->
      <section id="panel-dashboard" class="tab-panel space-y-6">
        
        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Doanh s\u1ED1 SePay -->
          <div class="glass-card rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-medium">T\u1ED5ng Doanh S\u1ED1 (SePay)</span>
              <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-100 brand-font" id="kpi-revenue">0 \u0111</div>
            <div class="text-[11px] text-emerald-400 flex items-center gap-1">
              <span>\u2191 T\u1EF1 \u0111\u1ED9ng k\xEDch ho\u1EA1t qua VietQR BIDV</span>
            </div>
          </div>

          <!-- Card 2: Ng\u01B0\u1EDDi d\xF9ng -->
          <div class="glass-card rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-medium">T\u1ED5ng Ng\u01B0\u1EDDi D\xF9ng</span>
              <div class="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-100 brand-font" id="kpi-total-users">0</div>
            <div class="text-[11px] text-slate-400">T\xE0i kho\u1EA3n \u0111\u0103ng k\xFD h\u1EC7 th\u1ED1ng</div>
          </div>

          <!-- Card 3: M\xE1y ho\u1EA1t \u0111\u1ED9ng -->
          <div class="glass-card rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-medium">Thi\u1EBFt B\u1ECB \u0110ang Ch\u1EA1y</span>
              <div class="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-100 brand-font" id="kpi-active-devices">0</div>
            <div class="text-[11px] text-teal-400">M\xE1y t\xEDnh online / T\u1ED5ng s\u1ED1 m\xE1y</div>
          </div>

          <!-- Card 4: T\u1EF7 l\u1EC7 Pro -->
          <div class="glass-card rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-medium">T\u1EF7 L\u1EC7 B\u1EA3n Quy\u1EC1n PRO</span>
              <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-100 brand-font" id="kpi-pro-rate">0%</div>
            <div class="text-[11px] text-amber-400">Chuy\u1EC3n \u0111\u1ED5i kh\xE1ch h\xE0ng tr\u1EA3 ph\xED</div>
          </div>
        </div>

        <!-- Bi\u1EC3u \u0111\u1ED3 1: Doanh s\u1ED1 SePay VN\u0110 (Large Chart) -->
        <div class="glass-card rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-sm text-slate-100 brand-font">Bi\u1EC3u \u0110\u1ED3 Doanh S\u1ED1 VietQR Theo Ng\xE0y (VN\u0110)</h3>
              <p class="text-xs text-slate-400">D\xF2ng ti\u1EC1n thanh to\xE1n t\u1EF1 \u0111\u1ED9ng ghi nh\u1EADn qua Webhook SePay</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <span class="text-xs text-slate-300 font-medium">Doanh thu VN\u0110</span>
            </div>
          </div>
          <div class="chart-box">
            <canvas id="chart-revenue"></canvas>
          </div>
        </div>

        <!-- Bi\u1EC3u \u0111\u1ED3 2 & 3: Th\u1ED1ng k\xEA Ng\u01B0\u1EDDi D\xF9ng & Ph\xE2n B\u1ED5 G\xF3i (2 Columns) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Ng\u01B0\u1EDDi d\xF9ng m\u1EDBi vs Active -->
          <div class="glass-card rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-sm text-slate-100 brand-font">Bi\u1EC3u \u0110\u1ED3 Th\u1ED1ng K\xEA Ng\u01B0\u1EDDi D\xF9ng</h3>
                <p class="text-xs text-slate-400">T\u0103ng tr\u01B0\u1EDFng ng\u01B0\u1EDDi d\xF9ng m\u1EDBi & t\xE0i kho\u1EA3n ho\u1EA1t \u0111\u1ED9ng</p>
              </div>
            </div>
            <div class="chart-box-sm">
              <canvas id="chart-users"></canvas>
            </div>
          </div>

          <!-- Ph\xE2n b\u1ED5 g\xF3i c\u01B0\u1EDBc -->
          <div class="glass-card rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-sm text-slate-100 brand-font">C\u01A1 C\u1EA5u B\u1EA3n Quy\u1EC1n (Tier Distribution)</h3>
                <p class="text-xs text-slate-400">T\u1EF7 l\u1EC7 c\xE1c g\xF3i Free, Pro v\xE0 Family</p>
              </div>
            </div>
            <div class="chart-box-sm flex items-center justify-center">
              <canvas id="chart-tier"></canvas>
            </div>
          </div>
        </div>

      </section>

      <!-- ================= 2. PANEL USERS (Chi Ti\u1EBFt Ng\u01B0\u1EDDi \u0110ang S\u1EED D\u1EE5ng) ================= -->
      <section id="panel-users" class="tab-panel space-y-4 hidden">
        
        <!-- Filter Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 glass-card rounded-xl">
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-slate-400 font-medium mr-1">B\u1ED9 l\u1ECDc:</span>
            <button data-filter="all" class="user-filter-btn px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 font-medium transition">T\u1EA5t C\u1EA3</button>
            <button data-filter="pro" class="user-filter-btn px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 hover:bg-slate-800/60 transition">G\xF3i Pro / Family</button>
            <button data-filter="free" class="user-filter-btn px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 hover:bg-slate-800/60 transition">G\xF3i Mi\u1EC5n Ph\xED</button>
            <button data-filter="blocked" class="user-filter-btn px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 hover:bg-slate-800/60 transition">\u0110ang B\u1ECB Kh\xF3a</button>
          </div>
          <div class="text-xs text-slate-400">
            Qu\u1EA3n l\xFD quy\u1EC1n s\u1EED d\u1EE5ng, s\u1ED1 m\xE1y li\xEAn k\u1EBFt & c\u1EA5p ph\xE9p b\u1EA3n quy\u1EC1n
          </div>
        </div>

        <!-- Users Detail Cards Container -->
        <div id="users-cards-container" class="space-y-4">
          <div class="p-8 text-center text-slate-500 text-xs">\u0110ang t\u1EA3i danh s\xE1ch ng\u01B0\u1EDDi d\xF9ng...</div>
        </div>

      </section>

      <!-- ================= 3. PANEL DEVICES ================= -->
      <section id="panel-devices" class="tab-panel space-y-4 hidden">
        <div class="overflow-x-auto rounded-xl border border-slate-800/80">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3.5 px-4 font-bold">Thi\u1EBFt B\u1ECB / M\xE1y T\xEDnh</th>
                <th class="py-3.5 px-4 font-bold">Ch\u1EE7 S\u1EDF H\u1EEFu</th>
                <th class="py-3.5 px-4 font-bold">M\xE3 Ph\u1EA7n C\u1EE9ng (Fingerprint)</th>
                <th class="py-3.5 px-4 font-bold">Tr\u1EA1ng Th\xE1i</th>
                <th class="py-3.5 px-4 font-bold">Ho\u1EA1t \u0110\u1ED9ng G\u1EA7n Nh\u1EA5t</th>
                <th class="py-3.5 px-4 font-bold text-right">Thao T\xE1c Qu\u1EA3n Tr\u1ECB</th>
              </tr>
            </thead>
            <tbody id="devices-table-body" class="divide-y divide-slate-800/50 bg-slate-900/30">
              <tr>
                <td colspan="6" class="text-center py-10 text-slate-500">\u0110ang t\u1EA3i d\u1EEF li\u1EC7u ph\u1EA7n c\u1EE9ng...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ================= 4. PANEL SEPAY VIETQR ================= -->
      <section id="panel-sepay" class="tab-panel space-y-5 hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div class="text-[11px] text-slate-400 uppercase">Ng\xE2n h\xE0ng th\u1EE5 h\u01B0\u1EDFng</div>
            <div class="font-bold text-sm text-slate-200">BIDV (Ng\xE2n h\xE0ng \u0110\u1EA7u t\u01B0 & Ph\xE1t tri\u1EC3n Vi\u1EC7t Nam)</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div class="text-[11px] text-slate-400 uppercase">S\u1ED1 t\xE0i kho\u1EA3n</div>
            <div class="font-mono font-bold text-sm text-teal-300">4661398013</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div class="text-[11px] text-slate-400 uppercase">Ch\u1EE7 t\xE0i kho\u1EA3n</div>
            <div class="font-bold text-sm text-slate-200">NGUYEN DUY HUNG</div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-teal-950/20 border border-teal-500/30 space-y-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h3 class="font-bold text-sm text-teal-200">Ki\u1EC3m tra & M\xF4 ph\u1ECFng Webhook SePay (Sandbox Test)</h3>
          </div>
          <p class="text-xs text-slate-400">
            Khi ng\u01B0\u1EDDi d\xF9ng qu\xE9t m\xE3 VietQR BIDV thanh to\xE1n th\xE0nh c\xF4ng, SePay s\u1EBD g\u1EEDi POST t\u1EDBi 
            <code class="bg-slate-900 px-2 py-0.5 rounded text-teal-300 font-mono text-[11px]">/api/v1/billing/webhook/sepay</code>.
            B\u1EA1n c\xF3 th\u1EC3 th\u1EED nghi\u1EC7m t\xEDnh n\u0103ng n\xE0y tr\u1EF1c ti\u1EBFp ngay t\u1EA1i \u0111\xE2y:
          </p>
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <input type="text" id="sim-email" placeholder="Nh\u1EADp Email ng\u01B0\u1EDDi d\xF9ng c\u1EA7n k\xEDch ho\u1EA1t Pro..." class="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs flex-1 focus:outline-none focus:border-teal-500">
            <button onclick="simulateSepayWebhook()" class="px-5 py-2 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition">
              B\u1EAFn Webhook SePay Gi\u1EA3 L\u1EADp (59.000\u0111)
            </button>
          </div>
        </div>
      </section>

    </div>
  </main>

  <!-- Toast Notification Popup -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none">
    <div class="glass-card border border-teal-500/40 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs text-slate-100 bg-slate-900/95" id="toast-box">
      <span id="toast-icon">\u2713</span>
      <span id="toast-msg">Th\xE0nh c\xF4ng</span>
    </div>
  </div>

  <script>
    ${scripts}
  </script>
</body>
</html>`;
}
var init_dashboard_html = __esm({
  "apps/api/src/admin/dashboard-html.ts"() {
    "use strict";
    init_dashboard_styles();
    init_dashboard_scripts();
  }
});

// apps/api/src/server.ts
var server_exports = {};
__export(server_exports, {
  EyePostureApiServer: () => EyePostureApiServer,
  default: () => server_default,
  handleServerless: () => handleServerless
});
function loadEnvFile() {
  const envCandidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env")
  ];
  for (const p of envCandidates) {
    if (fs.existsSync(p)) {
      try {
        const text = fs.readFileSync(p, "utf-8");
        for (const line of text.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch {
      }
      break;
    }
  }
}
function handleServerless(req, res) {
  if (!serverlessInstance) {
    serverlessInstance = new EyePostureApiServer();
  }
  return serverlessInstance.handleRequest(req, res);
}
var http, crypto2, fs, path, os, import_billing, EyePostureApiServer, serverlessInstance, modRef, server_default;
var init_server = __esm({
  "apps/api/src/server.ts"() {
    "use strict";
    http = __toESM(require("http"));
    crypto2 = __toESM(require("crypto"));
    fs = __toESM(require("fs"));
    path = __toESM(require("path"));
    os = __toESM(require("os"));
    import_billing = __toESM(require_dist());
    init_dashboard_html();
    loadEnvFile();
    EyePostureApiServer = class {
      server = null;
      jwtSecret;
      entitlementSigner;
      billingProvider = new import_billing.MockBillingProvider();
      sepayProvider;
      sepayApiKey;
      // In-memory data store for the modular monolith service
      users = /* @__PURE__ */ new Map();
      devices = /* @__PURE__ */ new Map();
      userSubscriptions = /* @__PURE__ */ new Map();
      processedWebhookEvents = /* @__PURE__ */ new Set();
      // Idempotency
      constructor(config = {}) {
        loadEnvFile();
        this.jwtSecret = config.jwtSecret ?? process.env.JWT_SECRET ?? "default_jwt_secret_eyeposture";
        const entitlementSecret = config.entitlementSecret ?? process.env.ENTITLEMENT_SECRET ?? "default_entitlement_secret_eyeposture";
        this.entitlementSigner = new import_billing.EntitlementSigner(entitlementSecret);
        this.sepayApiKey = config.sepayApiKey ?? process.env.SEPAY_WEBHOOK_SECRET ?? process.env.SECRET_KEY ?? process.env.SEPAY_API_KEY ?? "sepay_api_key_eyeposture_demo";
        this.sepayProvider = new import_billing.SePayBillingProvider({
          apiKey: this.sepayApiKey,
          accountNumber: config.sepayAccountNumber ?? process.env.PAYMENT_BANK_ACCOUNT ?? process.env.PAYMENT_BANK_VIRTUAL_ACCOUNT ?? process.env.SEPAY_ACCOUNT_NUMBER,
          bankName: config.sepayBankName ?? process.env.PAYMENT_BANK_CODE ?? process.env.SEPAY_BANK_NAME,
          accountHolder: process.env.PAYMENT_BANK_ACCOUNT_NAME ?? process.env.SEPAY_ACCOUNT_HOLDER
        });
        this.loadPersistedDevices();
      }
      loadPersistedDevices() {
        try {
          const candidates = [
            path.join(process.cwd(), "data/devices.json"),
            "/tmp/eyeposture_devices.json",
            path.join(os.tmpdir(), "eyeposture_devices.json")
          ];
          for (const p of candidates) {
            if (fs.existsSync(p)) {
              const list = JSON.parse(fs.readFileSync(p, "utf8"));
              if (Array.isArray(list)) {
                for (const d of list) {
                  if (d && d.id) this.devices.set(d.id, d);
                }
              }
              break;
            }
          }
        } catch {
        }
      }
      savePersistedDevices() {
        try {
          const list = Array.from(this.devices.values());
          const target = process.env.VERCEL ? "/tmp/eyeposture_devices.json" : path.join(os.tmpdir(), "eyeposture_devices.json");
          fs.writeFileSync(target, JSON.stringify(list, null, 2), "utf8");
        } catch {
        }
      }
      // --- Auth Utilities ---
      hashPassword(password, salt) {
        return crypto2.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
      }
      createJwt(payload) {
        const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
        const expPayload = { ...payload, exp: Math.floor(Date.now() / 1e3) + 7 * 86400 };
        const encodedPayload = Buffer.from(JSON.stringify(expPayload)).toString("base64url");
        const signature = crypto2.createHmac("sha256", this.jwtSecret).update(`${header}.${encodedPayload}`).digest("base64url");
        return `${header}.${encodedPayload}.${signature}`;
      }
      verifyJwt(token) {
        try {
          const [header, payload, signature] = token.split(".");
          const expected = crypto2.createHmac("sha256", this.jwtSecret).update(`${header}.${payload}`).digest("base64url");
          if (signature !== expected) return { valid: false };
          const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
          if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1e3)) return { valid: false };
          return { valid: true, userId: decoded.userId, email: decoded.email };
        } catch {
          return { valid: false };
        }
      }
      extractBearerToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          return authHeader.substring(7);
        }
        return null;
      }
      parseBody(req) {
        return new Promise((resolve2) => {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              resolve2(body ? JSON.parse(body) : {});
            } catch {
              resolve2({});
            }
          });
        });
      }
      sendJson(res, statusCode, data) {
        res.writeHead(statusCode, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        });
        res.end(JSON.stringify(data));
      }
      // --- Request Handler ---
      async handleRequest(req, res) {
        const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        let pathname = url.searchParams.get("__url") || req.headers["x-invoke-path"] || req.headers["x-matched-path"] || req.headers["x-forwarded-uri"] || req.headers["x-original-url"] || url.pathname;
        if (pathname.includes("?")) {
          pathname = pathname.split("?")[0];
        }
        if (pathname === "/api/index.js" || pathname === "/api/index" || pathname === "/api/serverless.js") {
          const alt = url.searchParams.get("__url") || req.headers["x-invoke-path"] || req.headers["x-matched-path"];
          if (alt && !alt.includes("/api/index")) {
            pathname = alt.split("?")[0];
          } else {
            pathname = "/";
          }
        }
        if (pathname.length > 1 && pathname.endsWith("/")) {
          pathname = pathname.slice(0, -1);
        }
        const method = req.method;
        if (method === "OPTIONS") {
          res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          });
          res.end();
          return;
        }
        if (pathname === "/api/v1/health") {
          this.sendJson(res, 200, { status: "ok", service: "EyePosture Cloud API", timestamp: Date.now() });
          return;
        }
        if ((pathname === "/favicon.ico" || pathname === "/EyePosture.ico") && method === "GET") {
          const candidates = [
            path.resolve(process.cwd(), "EyePosture.ico"),
            path.resolve(process.cwd(), "public/EyePosture.ico"),
            path.resolve(process.cwd(), "apps/api/public/EyePosture.ico"),
            path.resolve(__dirname, "EyePosture.ico"),
            path.resolve(__dirname, "../EyePosture.ico"),
            path.resolve(__dirname, "../../EyePosture.ico"),
            path.resolve(__dirname, "public/EyePosture.ico"),
            path.resolve(__dirname, "../public/EyePosture.ico"),
            path.resolve(__dirname, "../../public/EyePosture.ico")
          ];
          for (const p of candidates) {
            if (fs.existsSync(p)) {
              const buf = fs.readFileSync(p);
              res.writeHead(200, {
                "Content-Type": "image/x-icon",
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*"
              });
              res.end(buf);
              return;
            }
          }
          res.writeHead(204);
          res.end();
          return;
        }
        if ((pathname === "/EyePosture.png" || pathname === "/icon.png") && method === "GET") {
          const candidates = [
            path.resolve(process.cwd(), "EyePosture.png"),
            path.resolve(process.cwd(), "public/EyePosture.png"),
            path.resolve(process.cwd(), "apps/api/public/EyePosture.png"),
            path.resolve(__dirname, "EyePosture.png"),
            path.resolve(__dirname, "../EyePosture.png"),
            path.resolve(__dirname, "../../EyePosture.png"),
            path.resolve(__dirname, "public/EyePosture.png"),
            path.resolve(__dirname, "../public/EyePosture.png"),
            path.resolve(__dirname, "../../public/EyePosture.png")
          ];
          for (const p of candidates) {
            if (fs.existsSync(p)) {
              const buf = fs.readFileSync(p);
              res.writeHead(200, {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*"
              });
              res.end(buf);
              return;
            }
          }
          res.writeHead(204);
          res.end();
          return;
        }
        if ((pathname === "/" || pathname === "/admin" || pathname === "/admin/dashboard") && method === "GET") {
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(getAdminDashboardHtml());
          return;
        }
        if (pathname === "/api/v1/auth/register" && method === "POST") {
          const body = await this.parseBody(req);
          const { email, password, name } = body;
          if (!email || !password || !name) {
            this.sendJson(res, 400, { error: "Missing email, password, or name" });
            return;
          }
          for (const u of this.users.values()) {
            if (u.email.toLowerCase() === email.toLowerCase()) {
              this.sendJson(res, 409, { error: "Email already registered" });
              return;
            }
          }
          const id = crypto2.randomUUID();
          const salt = crypto2.randomBytes(16).toString("hex");
          const passwordHash = this.hashPassword(password, salt);
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const user = { id, email, name, role: "USER", createdAt: now, updatedAt: now };
          this.users.set(id, { ...user, passwordHash, salt });
          this.userSubscriptions.set(id, {
            tier: "FREE",
            status: "ACTIVE",
            expiresAt: Date.now() + 365 * 24 * 3600 * 1e3
          });
          const token = this.createJwt({ userId: id, email });
          this.sendJson(res, 201, { user, token });
          return;
        }
        if (pathname === "/api/v1/auth/login" && method === "POST") {
          const body = await this.parseBody(req);
          const { email, password } = body;
          let matchedUser;
          for (const u of this.users.values()) {
            if (u.email.toLowerCase() === (email || "").toLowerCase()) {
              matchedUser = u;
              break;
            }
          }
          if (!matchedUser) {
            this.sendJson(res, 401, { error: "Invalid credentials" });
            return;
          }
          const hash = this.hashPassword(password, matchedUser.salt);
          if (hash !== matchedUser.passwordHash) {
            this.sendJson(res, 401, { error: "Invalid credentials" });
            return;
          }
          if (matchedUser.isBlocked) {
            this.sendJson(res, 403, { error: "Account has been suspended by administrator" });
            return;
          }
          const token = this.createJwt({ userId: matchedUser.id, email: matchedUser.email });
          const { passwordHash, salt, ...safeUser } = matchedUser;
          this.sendJson(res, 200, { user: safeUser, token });
          return;
        }
        const bearer = this.extractBearerToken(req);
        const authResult = bearer ? this.verifyJwt(bearer) : { valid: false };
        if (pathname === "/api/v1/me" && method === "GET") {
          if (!authResult.valid || !authResult.userId) {
            this.sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const user = this.users.get(authResult.userId);
          if (!user) {
            this.sendJson(res, 404, { error: "User not found" });
            return;
          }
          const { passwordHash, salt, ...safeUser } = user;
          this.sendJson(res, 200, { user: safeUser });
          return;
        }
        if (pathname === "/api/v1/devices" && method === "GET") {
          if (!authResult.valid || !authResult.userId) {
            this.sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const userDevices = Array.from(this.devices.values()).filter(
            (d) => d.userId === authResult.userId
          );
          this.sendJson(res, 200, { devices: userDevices });
          return;
        }
        if ((pathname === "/api/v1/devices/telemetry" || pathname === "/api/v1/devices/heartbeat") && method === "POST") {
          const body = await this.parseBody(req);
          const fingerprint = body.deviceFingerprint || body.fingerprint || "win_anon_pc";
          const deviceName = body.deviceName || body.name || "Desktop PC";
          const deviceOs = body.os || "Windows 11";
          const appVersion = body.appVersion || "1.0.0";
          let existing = Array.from(this.devices.values()).find(
            (d) => d.deviceFingerprint === fingerprint
          );
          if (existing) {
            existing.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
            if (deviceName) existing.deviceName = deviceName;
            if (deviceOs) existing.os = deviceOs;
            if (appVersion) existing.appVersion = appVersion;
            existing.status = existing.isBlocked ? "BLOCKED" : "ACTIVE";
            this.savePersistedDevices();
            this.sendJson(res, 200, {
              success: true,
              status: existing.status,
              isBlocked: Boolean(existing.isBlocked),
              device: existing
            });
            return;
          }
          const id = crypto2.randomUUID();
          const newDev = {
            id,
            userId: body.userId || `device_${fingerprint.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`,
            deviceFingerprint: fingerprint,
            deviceName,
            os: deviceOs,
            appVersion,
            status: "ACTIVE",
            isBlocked: false,
            lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.devices.set(id, newDev);
          this.savePersistedDevices();
          this.sendJson(res, 201, {
            success: true,
            status: "ACTIVE",
            isBlocked: false,
            device: newDev
          });
          return;
        }
        if (pathname === "/api/v1/devices" && method === "POST") {
          if (!authResult.valid || !authResult.userId) {
            this.sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const body = await this.parseBody(req);
          const fingerprint = body.deviceFingerprint || body.fingerprint || crypto2.randomUUID();
          const existing = Array.from(this.devices.values()).find(
            (d) => d.userId === authResult.userId && d.deviceFingerprint === fingerprint
          );
          if (existing) {
            existing.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
            if (body.deviceName || body.name) existing.deviceName = body.deviceName || body.name;
            if (body.appVersion) existing.appVersion = body.appVersion;
            this.sendJson(res, 200, { device: existing });
            return;
          }
          const sub = this.userSubscriptions.get(authResult.userId);
          const tier = sub?.tier || "FREE";
          const limit = tier === "FAMILY" ? 5 : tier === "PRO" ? 3 : 1;
          const currentDevices = Array.from(this.devices.values()).filter(
            (d) => d.userId === authResult.userId
          );
          if (currentDevices.length >= limit) {
            this.sendJson(res, 409, {
              error: `Device seat limit reached (${limit} devices max for ${tier} tier). Please unlink an unused machine.`,
              deviceLimit: limit,
              currentCount: currentDevices.length
            });
            return;
          }
          const id = crypto2.randomUUID();
          const device = {
            id,
            userId: authResult.userId,
            deviceFingerprint: fingerprint,
            deviceName: body.deviceName || body.name || "Windows PC",
            os: body.os || "Windows 11",
            appVersion: body.appVersion || "1.0.0",
            status: "ACTIVE",
            isBlocked: false,
            lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.devices.set(id, device);
          this.sendJson(res, 201, { device });
          return;
        }
        if (pathname === "/api/v1/devices" && method === "DELETE") {
          if (!authResult.valid || !authResult.userId) {
            this.sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const deviceId = url.searchParams.get("id") || url.searchParams.get("deviceId");
          const fingerprint = url.searchParams.get("deviceFingerprint");
          let targetId = null;
          for (const [id, dev] of this.devices.entries()) {
            if (dev.userId === authResult.userId) {
              if (deviceId && id === deviceId || fingerprint && dev.deviceFingerprint === fingerprint) {
                targetId = id;
                break;
              }
            }
          }
          if (targetId) {
            this.devices.delete(targetId);
            this.sendJson(res, 200, { success: true, message: "Device unlinked successfully" });
            return;
          }
          this.sendJson(res, 404, { error: "Device not found" });
          return;
        }
        if (pathname === "/api/v1/subscription" && method === "GET") {
          if (!authResult.valid || !authResult.userId) {
            this.sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const sub = this.userSubscriptions.get(authResult.userId) ?? {
            tier: "FREE",
            status: "ACTIVE",
            expiresAt: Date.now() + 365 * 24 * 3600 * 1e3
          };
          this.sendJson(res, 200, { subscription: sub });
          return;
        }
        if (pathname === "/api/v1/subscription/checkout" && method === "POST") {
          if (!authResult.valid || !authResult.userId) {
            this.sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const body = await this.parseBody(req);
          if (body.provider === "sepay" || body.currency === "VND") {
            const qrPayment = this.sepayProvider.createQrPayment({
              userId: authResult.userId,
              tier: body.tier || "PRO",
              interval: body.interval || "month"
            });
            this.sendJson(res, 200, {
              provider: "sepay",
              ...qrPayment,
              checkoutUrl: qrPayment.qrUrl,
              sessionId: qrPayment.orderCode
            });
            return;
          }
          const session = await this.billingProvider.createCheckoutSession({
            userId: authResult.userId,
            tier: body.tier || "PRO",
            interval: body.interval || "month",
            successUrl: body.successUrl || "https://eyeposture.com/success",
            cancelUrl: body.cancelUrl || "https://eyeposture.com/cancel"
          });
          this.sendJson(res, 200, session);
          return;
        }
        if (pathname === "/api/v1/entitlements" && method === "GET") {
          if (!authResult.valid || !authResult.userId) {
            this.sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const user = this.users.get(authResult.userId);
          if (user?.isBlocked) {
            this.sendJson(res, 403, { error: "Account has been suspended by administrator" });
            return;
          }
          const deviceId = url.searchParams.get("deviceId") || "default_device";
          const dev = Array.from(this.devices.values()).find(
            (d) => d.userId === authResult.userId && (d.deviceFingerprint === deviceId || d.id === deviceId)
          );
          if (dev?.isBlocked) {
            this.sendJson(res, 403, { error: "This device has been blocked by administrator" });
            return;
          }
          const sub = this.userSubscriptions.get(authResult.userId) ?? {
            tier: "FREE",
            status: "ACTIVE",
            expiresAt: Date.now() + 365 * 24 * 3600 * 1e3
          };
          const payload = {
            sub: authResult.userId,
            tier: sub.tier,
            features: sub.tier === "FREE" ? ["basic_reminders"] : import_billing.PRO_FEATURES,
            issuedAt: Date.now(),
            expiresAt: sub.expiresAt,
            deviceLimit: sub.tier === "FAMILY" ? 5 : 3,
            deviceId
          };
          const signedToken = this.entitlementSigner.sign(payload);
          this.sendJson(res, 200, { entitlementToken: signedToken, payload });
          return;
        }
        if (pathname === "/api/v1/webhooks/sepay" && method === "POST") {
          const authHeader = req.headers.authorization || req.headers["apikey"];
          if (!this.sepayProvider.verifyApiKey(authHeader)) {
            this.sendJson(res, 401, { error: "Unauthorized: Invalid SePay API key" });
            return;
          }
          const body = await this.parseBody(req);
          const eventId = `sepay_${body.id || body.referenceCode || Date.now()}`;
          if (this.processedWebhookEvents.has(eventId)) {
            this.sendJson(res, 200, { success: true, idempotent: true });
            return;
          }
          this.processedWebhookEvents.add(eventId);
          if (body.transferType !== "in") {
            this.sendJson(res, 200, { success: true, ignored: true, reason: "transferType is not in" });
            return;
          }
          const parsed = this.sepayProvider.parsePaymentContent(body.content);
          const userId = parsed.userId;
          if (userId && this.users.has(userId)) {
            const isYearly = body.transferAmount >= 49e4;
            const durationMs = isYearly ? 365 * 86400 * 1e3 : 30 * 86400 * 1e3;
            const tier = parsed.tier || (body.transferAmount >= 99e3 && /family/i.test(body.content) ? "FAMILY" : "PRO");
            this.userSubscriptions.set(userId, {
              tier,
              status: "ACTIVE",
              expiresAt: Date.now() + durationMs
            });
          }
          this.sendJson(res, 200, { success: true, processed: true, userId });
          return;
        }
        if (pathname === "/api/v1/webhooks/stripe" && method === "POST") {
          const body = await this.parseBody(req);
          const eventId = body.id || crypto2.randomUUID();
          if (this.processedWebhookEvents.has(eventId)) {
            this.sendJson(res, 200, { received: true, idempotent: true });
            return;
          }
          this.processedWebhookEvents.add(eventId);
          const { userId, tier, status, currentPeriodEnd } = body.data || {};
          if (userId) {
            this.userSubscriptions.set(userId, {
              tier: tier || "PRO",
              status: status || "ACTIVE",
              expiresAt: currentPeriodEnd || Date.now() + 30 * 86400 * 1e3
            });
          }
          this.sendJson(res, 200, { received: true, processed: true });
          return;
        }
        if (pathname === "/api/v1/sync" && method === "POST") {
          if (!authResult.valid || !authResult.userId) {
            this.sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const body = await this.parseBody(req);
          this.sendJson(res, 200, {
            synced: true,
            serverTimestamp: Date.now(),
            acceptedItems: (body.items || []).length
          });
          return;
        }
        if (pathname === "/api/v1/admin/devices" && method === "GET") {
          const allDevices = Array.from(this.devices.values()).map((d) => {
            const u = this.users.get(d.userId);
            return {
              id: d.id,
              userId: d.userId,
              userEmail: u?.email || `${d.deviceName || "M\xE1y Desktop"} (Client)`,
              userName: u?.name || "M\xE1y Kh\xE1ch Desktop",
              deviceName: d.deviceName,
              deviceFingerprint: d.deviceFingerprint,
              os: d.os,
              appVersion: d.appVersion,
              status: d.status || (d.isBlocked ? "BLOCKED" : "ACTIVE"),
              isBlocked: Boolean(d.isBlocked),
              lastActiveAt: d.lastActiveAt,
              createdAt: d.createdAt
            };
          });
          this.sendJson(res, 200, { total: allDevices.length, devices: allDevices });
          return;
        }
        if (pathname === "/api/v1/admin/users" && method === "GET") {
          const allUsers = Array.from(this.users.values()).map((u) => {
            const sub = this.userSubscriptions.get(u.id);
            const userDevs = Array.from(this.devices.values()).filter((d) => d.userId === u.id);
            return {
              id: u.id,
              email: u.email,
              name: u.name,
              role: u.role,
              isBlocked: Boolean(u.isBlocked),
              status: u.status || (u.isBlocked ? "BLOCKED" : "ACTIVE"),
              subscription: sub || { tier: "FREE", status: "ACTIVE", expiresAt: null },
              deviceCount: userDevs.length,
              createdAt: u.createdAt
            };
          });
          this.sendJson(res, 200, { total: allUsers.length, users: allUsers });
          return;
        }
        if (pathname === "/api/v1/admin/devices/block" && method === "POST") {
          const body = await this.parseBody(req);
          const query = body.deviceId || body.deviceFingerprint;
          const target = Array.from(this.devices.values()).find(
            (d) => d.id === query || d.deviceFingerprint === query
          );
          if (!target) {
            this.sendJson(res, 404, { error: "Device not found" });
            return;
          }
          target.isBlocked = true;
          target.status = "BLOCKED";
          this.savePersistedDevices();
          this.sendJson(res, 200, { success: true, message: "Device blocked successfully", device: target });
          return;
        }
        if (pathname === "/api/v1/admin/devices/unblock" && method === "POST") {
          const body = await this.parseBody(req);
          const query = body.deviceId || body.deviceFingerprint;
          const target = Array.from(this.devices.values()).find(
            (d) => d.id === query || d.deviceFingerprint === query
          );
          if (!target) {
            this.sendJson(res, 404, { error: "Device not found" });
            return;
          }
          target.isBlocked = false;
          target.status = "ACTIVE";
          this.savePersistedDevices();
          this.sendJson(res, 200, { success: true, message: "Device unblocked successfully", device: target });
          return;
        }
        if (pathname === "/api/v1/admin/users/block" && method === "POST") {
          const body = await this.parseBody(req);
          let targetUser = this.users.get(body.userId);
          if (!targetUser && body.email) {
            targetUser = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === body.email.toLowerCase());
          }
          if (!targetUser) {
            this.sendJson(res, 404, { error: "User not found" });
            return;
          }
          targetUser.isBlocked = true;
          targetUser.status = "BLOCKED";
          this.sendJson(res, 200, { success: true, message: "User account suspended", userId: targetUser.id });
          return;
        }
        if (pathname === "/api/v1/admin/users/unblock" && method === "POST") {
          const body = await this.parseBody(req);
          let targetUser = this.users.get(body.userId);
          if (!targetUser && body.email) {
            targetUser = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === body.email.toLowerCase());
          }
          if (!targetUser) {
            this.sendJson(res, 404, { error: "User not found" });
            return;
          }
          targetUser.isBlocked = false;
          targetUser.status = "ACTIVE";
          this.sendJson(res, 200, { success: true, message: "User account restored", userId: targetUser.id });
          return;
        }
        if (pathname === "/api/v1/admin/stats" && method === "GET") {
          const allUsers = Array.from(this.users.values());
          const allDevices = Array.from(this.devices.values());
          const proUsers = allUsers.filter((u) => {
            const sub = this.userSubscriptions.get(u.id);
            return sub?.tier === "PRO" || sub?.tier === "FAMILY";
          });
          const totalRevenueVnd = proUsers.length * 59e3 + 49e4;
          const stats = {
            totalUsers: allUsers.length,
            totalDevices: allDevices.length,
            activeDevices: allDevices.filter((d) => !d.isBlocked).length,
            blockedDevices: allDevices.filter((d) => d.isBlocked).length,
            proUsersCount: proUsers.length,
            totalRevenueVnd,
            revenueHistory: [295e3, 413e3, 354e3, 59e4, 708e3, 885e3, Math.max(totalRevenueVnd, 118e4)],
            userGrowth: [12, 19, 25, 32, 45, 58, Math.max(70, allUsers.length * 10)],
            activeTrend: [8, 15, 20, 26, 38, 50, Math.max(60, allUsers.length * 8)]
          };
          this.sendJson(res, 200, stats);
          return;
        }
        if (pathname === "/api/v1/admin/users/upgrade" && method === "POST") {
          const body = await this.parseBody(req);
          const { userId, tier = "PRO", days = 365 } = body;
          const user = this.users.get(userId);
          if (!user) {
            this.sendJson(res, 404, { error: "User not found" });
            return;
          }
          this.userSubscriptions.set(userId, {
            tier: tier || "PRO",
            status: "ACTIVE",
            expiresAt: Date.now() + days * 86400 * 1e3
          });
          this.sendJson(res, 200, {
            success: true,
            userId,
            tier,
            expiresAt: Date.now() + days * 86400 * 1e3
          });
          return;
        }
        this.sendJson(res, 404, { error: "Endpoint not found" });
      }
      listen(port = 0) {
        return new Promise((resolve2) => {
          this.server = http.createServer((req, res) => {
            this.handleRequest(req, res).catch((err) => {
              this.sendJson(res, 500, { error: "Internal Server Error", message: String(err) });
            });
          });
          this.server.listen(port, () => {
            const address = this.server?.address();
            const assignedPort = typeof address === "object" && address ? address.port : port;
            resolve2(assignedPort);
          });
        });
      }
      close() {
        return new Promise((resolve2) => {
          if (this.server) {
            this.server.close(() => resolve2());
          } else {
            resolve2();
          }
        });
      }
    };
    serverlessInstance = null;
    handleServerless.default = handleServerless;
    handleServerless.handleServerless = handleServerless;
    handleServerless.EyePostureApiServer = EyePostureApiServer;
    modRef = typeof globalThis.module !== "undefined" ? globalThis.module : null;
    if (modRef && modRef.exports) {
      modRef.exports = handleServerless;
      modRef.exports.default = handleServerless;
      modRef.exports.handleServerless = handleServerless;
      modRef.exports.EyePostureApiServer = EyePostureApiServer;
    }
    server_default = handleServerless;
  }
});

// api/serverless.js
var { EyePostureApiServer: EyePostureApiServer2 } = (init_server(), __toCommonJS(server_exports));
var serverInstance = null;
function getServer() {
  if (!serverInstance) {
    serverInstance = new EyePostureApiServer2();
  }
  return serverInstance;
}
async function handler(req, res) {
  const server = getServer();
  return server.handleRequest(req, res);
}
handler.default = handler;
module.exports = handler;
module.exports.default = handler;
