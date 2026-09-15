# Security Threat Model & Protections

## 1. Threat Matrix & Mitigations

| Threat | Risk Level | Architectural Mitigation |
| :--- | :--- | :--- |
| **Local License Tampering** | High | Entitlement payloads are cryptographically signed with HMAC-SHA256 / Ed25519. Tampering with any byte invalidates the signature. Client verifies constant-time signatures. |
| **System Clock Manipulation** | Medium | Monotonic timestamp verification in `LicenseVerifier`. If current system time is rolled back by > 2 hours compared to previously verified run, the token is flagged as manipulated. |
| **Client Secrets Leakage** | Critical | Strict rule: SePay API keys, JWT signing keys, and cloud database credentials are never bundled in desktop builds. Only public verification keys exist on the client. |
| **Biometric Surveillance / Interception** | Critical | 100% on-device Web Worker processing. Video frames are processed in volatile memory and discarded immediately after landmark inference. Zero network egress of frames. |
| **Fake Webhook Requests** | High | SePay Webhook authorization header (`Apikey <KEY>`) verified. Transaction IDs (`id` / `referenceCode`) tracked in idempotency set to reject replay attacks. Only incoming transfers (`transferType: 'in'`) are credited. |
| **SQL Injection** | Medium | All SQLite queries use parameterized prepared statements (`?` bindings) through `IDatabaseDriver`. No dynamic raw SQL string interpolation. |
| **Device Spoofing** | Medium | Tokens are bound to a persistent application-level device fingerprint generated upon installation (`deviceFingerprint`). Tokens cannot be transferred across PCs. |
| **API Abuse & Brute Force** | High | Password hashing using PBKDF2 with unique cryptographic salt per user. Rate limiting and JWT authentication required on protected endpoints. |

---

## 2. Secrets Management

- **Desktop Distribution**: Uses `.env` strictly for client-facing configuration (e.g. `VITE_API_URL`). Contains zero private API keys or database passwords.
- **Backend API Server**: Loads `JWT_SECRET`, `ENTITLEMENT_SECRET`, and `SEPAY_API_KEY` strictly through environment variables.
