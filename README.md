# EyePosture - Smart Screen Wellness Assistant

EyePosture is an intelligent, local-first desktop application engineered to help computer users develop healthier screen habits. It actively estimates eye-to-screen distance, monitors ergonomic sitting posture, orchestrates 20-20-20 eye-rest cycles, provides timely hydration prompts, tracks screen time limits, and protects user privacy by processing all camera frames strictly on-device.

---

## Key Highlights

- **Local-First Privacy**: 100% on-device Computer Vision inference. No video feeds, images, or raw biometric data are ever transmitted or saved.
- **Smart Adaptive Reminders**: State-machine-based notification policy with anti-fatigue backoff, fullscreen suppression (games/movies), and quiet hours.
- **Resource Governor**: Dynamically scales inference frequency (2–8 FPS) based on battery mode, CPU load, and user idle state to preserve battery and maintain low thermal overhead.
- **Offline Entitlement Architecture**: Cryptographically signed licenses (HMAC-SHA256 / Ed25519) with 14-day offline grace period and clock tampering detection.
- **SQLite Data Layer**: Automated schema migrations, 30–90 day event retention purges, and instant data sovereignty controls.
- **Internationalization (i18n)**: Native bilingual support for English and Vietnamese (`en` / `vi`).
- **Synthetic Test Harness**: Fully testable computer vision pipeline with synthetic landmark mocks—no webcam required for automated testing.

---

## Monorepo Architecture

```
/apps
  /desktop              # React 18 + Vite + Electron desktop application
  /api                  # Modular Express/Node Cloud API (Auth, Licensing, Stripe Webhooks)
/packages
  /shared-types         # Domain models, DTOs, and system enums
  /i18n                 # English & Vietnamese translation dictionaries & helper
  /database             # SQLite storage engine, schema migrations, and repositories
  /vision               # VisionEngine, DistanceEstimator, PostureEstimator, Temporal Filters
  /reminder-engine      # BreakTimer (20-20-20), HydrationTimer, Policy, Resource Governor
  /billing              # BillingProvider, EntitlementSigner, and LicenseVerifier
/docs                   # Comprehensive engineering, security, and commercial documentation
```

---

## Quickstart & Development

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `10+`

### Installation & Testing
```bash
# Install dependencies across all monorepo workspaces
npm install

# Run automated unit and integration tests (35+ test suites)
npm test

# Launch desktop app development server
npm run dev -w @eyeposture/desktop
```

---

## Documentation Index
- [System Architecture](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/architecture.md)
- [Computer Vision Engine](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/vision.md)
- [Database Schema & Migrations](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/database.md)
- [Billing & Cryptographic Licensing](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/billing.md)
- [Security Threat Model](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/security.md)
- [Privacy Model & Guarantees](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/privacy.md)
- [Cloud API Reference](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/api.md)
- [Deployment & Packaging](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/deployment.md)
- [Testing & Acceptance Checklist](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/testing.md)
- [Troubleshooting](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/troubleshooting.md)
- [Commercial Licensing](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/commercial-license.md)
- [Third-Party Notices](file:///d:/FPT/SE/Ky_7/EXE101/Project/docs/THIRD_PARTY_NOTICES.md)
