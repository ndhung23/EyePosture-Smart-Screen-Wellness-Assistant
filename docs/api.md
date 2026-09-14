# Cloud API Reference (v1)

Base URL: `https://api.eyeposture.com/api/v1`

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new cloud user account.
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Jane Doe"
}

// Response (201 Created)
{
  "user": {
    "id": "usr_uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "USER",
    "createdAt": "2026-09-14T10:00:00.000Z"
  },
  "token": "jwt_access_token"
}
```

### `POST /api/v1/auth/login`
Authenticates existing credentials.
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

// Response (200 OK)
{
  "user": { "id": "usr_uuid", "email": "user@example.com", "name": "Jane Doe" },
  "token": "jwt_access_token"
}
```

---

## 2. Entitlement & Billing Endpoints

### `GET /api/v1/entitlements?deviceId=win11_guid`
Headers: `Authorization: Bearer <token>`
Returns a digitally signed entitlement token for local desktop verification.
```json
// Response (200 OK)
{
  "entitlementToken": "header.payload.signature",
  "payload": {
    "sub": "usr_uuid",
    "tier": "PRO",
    "features": ["posture_full", "distance_full", "advanced_stats"],
    "issuedAt": 1773500000000,
    "expiresAt": 1776100000000,
    "deviceLimit": 3,
    "deviceId": "win11_guid"
  }
}
```

### `POST /api/v1/subscription/checkout`
Headers: `Authorization: Bearer <token>`
Creates a Stripe checkout session.
```json
// Request
{
  "tier": "PRO",
  "interval": "month",
  "successUrl": "https://app/success",
  "cancelUrl": "https://app/cancel"
}

// Response (200 OK)
{
  "sessionId": "cs_test_12345",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_12345"
}
```

### `POST /api/v1/webhooks/stripe`
Processes idempotent asynchronous payment gateway updates.
```json
// Request
{
  "id": "evt_stripe_999",
  "type": "subscription_created",
  "data": {
    "userId": "usr_uuid",
    "tier": "PRO",
    "status": "ACTIVE",
    "currentPeriodEnd": 1776100000000
  }
}
```
