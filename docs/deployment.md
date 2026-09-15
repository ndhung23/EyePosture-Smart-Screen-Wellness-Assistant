# Deployment, Packaging & Auto-Updates

## 1. Desktop Application Production Build

To compile and bundle the production desktop application:

```bash
# 1. Build frontend distribution
npm run build -w @eyeposture/desktop

# 2. Package for Windows (NSIS Installer)
npx electron-builder build --win nsis --x64
```

Output directory: `apps/desktop/dist-electron/`

---

## 2. Secure Auto-Update Architecture

EyePosture uses cryptographic signature verification for all application updates:

1. **Update Manifest**: An encrypted `latest.yml` hosted on the update server includes the target version, SHA-512 checksum, and release signature.
2. **Download & Integrity Check**: The application verifies the downloaded binary hash against the published SHA-512 before executing the installer.
3. **Rollback Resilience**: If an update fails to launch, the Windows installer retains the previous binary version and rolls back automatically.

---

## 3. Backend API Deployment

The modular API backend (`apps/api`) runs under Node.js 22 LTS:

```bash
# Production environment variables
NODE_ENV=production
PORT=8080
JWT_SECRET=strong_random_jwt_secret_64_bytes
ENTITLEMENT_SECRET=strong_random_entitlement_secret_64_bytes
STRIPE_SECRET_KEY=sk_live_...
SEPAY_API_KEY=sepay_live_secret_key
SEPAY_ACCOUNT_NUMBER=0333222111
SEPAY_BANK_NAME=MBBank

# Start API server
node apps/api/dist/server.js
```
