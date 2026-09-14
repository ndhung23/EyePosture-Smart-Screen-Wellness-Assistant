# Commercial Billing & Cryptographic Licensing

## 1. Zero-Trust Entitlement Model

EyePosture enforces strict server-authoritative licensing. The desktop client never relies on insecure flags like `isPro = true`. Instead, entitlements are cryptographically minted by the cloud backend and verified locally using public/shared cryptographic keys.

```
Desktop Client                    Cloud API                  Payment Provider (Stripe)
      │                               │                                 │
      ├────── Request Checkout ──────►│                                 │
      │                               ├────── Create Checkout ─────────►│
      │◄───── Return Checkout URL ────┤                                 │
      │                               │                                 │
      │                               │◄───── Webhook (Payment Done) ───┤
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

## 3. Stripe Webhook Idempotency

Webhooks from the payment gateway (`/api/v1/webhooks/stripe`) process:
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `payment_failed`

Each webhook event ID is recorded in an idempotency cache to prevent double-crediting or duplicate processing.
