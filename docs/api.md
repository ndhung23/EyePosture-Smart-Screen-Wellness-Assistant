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
Creates a checkout session or VietQR payment code.
```json
// Request (SePay VietQR)
{
  "provider": "sepay",
  "tier": "PRO",
  "interval": "month"
}

// Response (200 OK)
{
  "provider": "sepay",
  "qrUrl": "https://qr.sepay.vn/img?acc=0333222111&bank=MBBank&amount=59000&des=EYEPOSTURE%20usr_123%20ORD123456",
  "accountNumber": "0333222111",
  "bankName": "MBBank",
  "accountHolder": "EYEPOSTURE CORP",
  "amount": 59000,
  "transferContent": "EYEPOSTURE usr_123 ORD123456",
  "orderCode": "ORD123456",
  "sessionId": "ORD123456",
  "checkoutUrl": "https://qr.sepay.vn/img?..."
}
```

### `POST /api/v1/webhooks/sepay`
Headers: `Authorization: Apikey <SEPAY_API_KEY>`
Processes automated bank transfer webhook from SePay.
```json
// Request
{
  "id": 92704,
  "gateway": "MBBank",
  "transactionDate": "2026-09-15 12:30:00",
  "accountNumber": "0333222111",
  "content": "EYEPOSTURE usr_uuid ORD123456",
  "transferType": "in",
  "transferAmount": 59000,
  "accumulated": 5000000,
  "referenceCode": "MBVCB.12345678"
}

// Response (200 OK)
{
  "success": true,
  "processed": true,
  "userId": "usr_uuid"
}
```

### `POST /api/v1/webhooks/stripe`
Fallback asynchronous Stripe payment gateway webhook.

---

## Device & Seat Management

### `GET /api/v1/devices`
Headers: `Authorization: Bearer <token>`
Returns the list of all registered computers/devices belonging to the authenticated user.

### `POST /api/v1/devices`
Headers: `Authorization: Bearer <token>`
Registers a new computer. Enforces seat limits (Free: 1, Pro: 3, Family: 5). Returns `409 Conflict` if the limit is exceeded.
```json
// Request
{
  "deviceFingerprint": "win11_guid_82a10d",
  "deviceName": "Hung Work Laptop",
  "os": "Windows 11",
  "appVersion": "1.0.0"
}
```

### `DELETE /api/v1/devices?deviceFingerprint=<GUID>`
Headers: `Authorization: Bearer <token>`
Unlinks an old machine to free up a slot for a new device.

---

## Admin Management (Block / Unblock)

### `GET /api/v1/admin/devices`
Returns all machines across all users with their current status (`ACTIVE` or `BLOCKED`).

### `POST /api/v1/admin/devices/block`
Blocks a specific machine from receiving signed licenses (`403 Forbidden`).
```json
{ "deviceId": "win11_guid_82a10d" }
```

### `POST /api/v1/admin/devices/unblock`
Unblocks/restores a machine back to `ACTIVE` status.
```json
{ "deviceId": "win11_guid_82a10d" }
```

### `POST /api/v1/admin/users/block`
Suspends an entire account (blocks login and all associated devices).
```json
{ "userId": "usr_uuid" }
```

### `POST /api/v1/admin/users/unblock`
Restores a suspended user account.
```json
{ "userId": "usr_uuid" }
```
