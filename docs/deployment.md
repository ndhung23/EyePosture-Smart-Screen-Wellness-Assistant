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
SEPAY_BANK_NAME=BIDV
SEPAY_ACCOUNT_NUMBER=4661398013
PAYMENT_BANK_ACCOUNT_NAME=NGUYEN DUY HUNG
SEPAY_WEBHOOK_SECRET=your_sepay_webhook_secret
SECRET_KEY=your_sepay_secret_key
MERCHANT_ID=your_merchant_id

# Build & Start API server
npm run build:api
npm run start:api
```

---

## 4. One-Click Cloud Deployments

### Option A: Deploy on Render.com (Recommended for Background Webhooks)
Render provides a persistent Node.js Web Service ideal for 24/7 Webhooks and Admin Dashboard.

1. Fork or push this repository to GitHub.
2. Sign in to [Render.com](https://render.com) and click **New > Blueprint** (or **New > Web Service**).
3. Connect your repository. Render will automatically detect [`render.yaml`](file:///d:/FPT/SE/Ky_7/EXE101/Project/render.yaml):
   - **Build Command**: `npm install && npm run build:api`
   - **Start Command**: `npm run start:api`
4. In Environment Variables, fill in your SePay credentials (`SEPAY_WEBHOOK_SECRET`, `SECRET_KEY`, `MERCHANT_ID`).
5. Click **Deploy**. Your API and Admin Hub will be live at `https://eyeposture-api.onrender.com/admin`.

### Option B: Deploy on Vercel (Recommended for Serverless & Instant CDN)
Vercel hosts the API and Web Admin Dashboard using high-speed serverless functions configured via [`vercel.json`](file:///d:/FPT/SE/Ky_7/EXE101/Project/vercel.json) and [`api/index.js`](file:///d:/FPT/SE/Ky_7/EXE101/Project/api/index.js).

1. Push this repository to GitHub.
2. Sign in to [Vercel.com](https://vercel.com) and click **Add New > Project**.
3. Import your repository. Vercel will auto-detect the monorepo configuration:
   - **Build Command**: `npm run build:api`
   - **Output Directory**: (Leave blank / default)
4. Under **Environment Variables**, add:
   - `SEPAY_BANK_NAME`: `BIDV`
   - `SEPAY_ACCOUNT_NUMBER`: `4661398013`
   - `PAYMENT_BANK_ACCOUNT_NAME`: `NGUYEN DUY HUNG`
   - `SEPAY_WEBHOOK_SECRET`: your secret key
5. Click **Deploy**. Your Admin Dashboard will be live at `https://your-project.vercel.app/admin`.

