# Commercial Billing & Cryptographic Licensing

## 1. Zero-Trust Entitlement Model

EyePosture enforces strict server-authoritative licensing. The desktop client never relies on insecure flags like `isPro = true`. Instead, entitlements are cryptographically minted by the cloud backend and verified locally using public/shared cryptographic keys.

```
Desktop Client                    Cloud API                  SePay (VietQR & Webhook)
      │                               │                                 │
      ├────── Request Checkout ──────►│                                 │
      │                               ├────── Generate VietQR QR ───────►│
      │◄───── Return VietQR Code ─────┤ (qr.sepay.vn / Bank Details)   │
      │                               │                                 │
 [User scans VietQR with Bank App]    │                                 │
 [User completes bank transfer]       │                                 │
      │                               │◄───── Webhook (Payment "in") ───┤
      │                               │ (Verify Apikey & Idempotency)   │
      │                               │ (Set User Subscription to PRO)  │
      │                               │                                 │
      ├────── Fetch Entitlements ────►│                                 │
      │◄───── Signed Token ───────────┤                                 │
      │                               │                                 │
[Local Signature Verify]              │                                 │
[Cache in SQLite for Offline]         │                                 │
```

---

## 2. Cryptographically Signed Token Format

The entitlement token uses a compact, URL-safe three-part structure: `header.payload.signature`

### Payload Structure
```json
{
  "sub": "usr_94a2b1c8",
  "tier": "PRO",
  "features": [
    "basic_reminders",
    "basic_screen_time",
    "posture_full",
    "distance_full",
    "advanced_stats",
    "adaptive_reminders"
  ],
  "issuedAt": 1773500000000,
  "expiresAt": 1776100000000,
  "deviceLimit": 3,
  "deviceId": "win11_guid_82a10d"
}
```

### Verification Rules
1. **Signature Integrity**: Verified using constant-time comparison to prevent timing attacks.
2. **Device Hardware Binding**: The token contains the application's unique device GUID. If transferred to an unregistered machine, verification immediately fails.
3. **14-Day Offline Grace Period**: If the subscription expires while the user is disconnected from the internet, a 14-day grace period is granted before falling back to the FREE tier.
4. **Clock Manipulation Detection**: Tracks monotonic verification timestamps. If a user rolls back their system clock by more than 2 hours to fake an unexpired license, the license is invalidated.
5. **Graceful Downgrade**: If a license expires, Pro features are locked, but local user settings, statistics, and baseline calibrations are never deleted.

---

## 3. SePay Webhook Architecture & Idempotency

EyePosture utilizes **SePay Webhooks** (`POST /api/v1/webhooks/sepay`) for automated, real-time reconciliation of bank transfers (VietQR).

### SePay Webhook Inbound Payload Format
```json
{
  "id": 92704,
  "gateway": "MBBank",
  "transactionDate": "2026-09-15 12:30:00",
  "accountNumber": "0333222111",
  "code": null,
  "content": "EYEPOSTURE usr_94a2b1c8 ORD123456",
  "transferType": "in",
  "transferAmount": 59000,
  "accumulated": 5000000,
  "subAccount": null,
  "referenceCode": "MBVCB.12345678",
  "description": "Chuyen tien nang cap goi Pro"
}
```

### Security & Processing Pipeline
1. **API Key Authentication**: SePay sends an `Authorization: Apikey <SEPAY_API_KEY>` header. Requests without a valid API key are rejected with `401 Unauthorized`.
2. **Transaction Filtering**: Only transactions with `transferType === 'in'` (incoming deposits) are processed. Outbound transfers (`out`) are safely ignored.
3. **Idempotency Guarantee**: Each transaction ID (`sepay_${id}`) is recorded in an idempotency set. Replays or duplicate webhook retries respond with `{ success: true, idempotent: true }` without double-crediting.
4. **Content Syntax Parsing**: The transfer content (`content`) is parsed using regular expressions to extract the customer's `userId` (syntax: `EYEPOSTURE <userId> <orderCode>`).
5. **Dynamic Tier Duration**:
   - $\ge$ 490,000 VND: 1 Year PRO subscription.
   - $\ge$ 59,000 VND: 30 Days PRO subscription.
   - Family plan keywords: activates `FAMILY` tier.
6. **Token Issuance**: Once updated, the desktop client requests `/api/v1/entitlements` and receives an HMAC-SHA256 signed license token for offline use.
