# EyePosture Architecture Specification

## 1. System Vision & Architectural Philosophy

EyePosture is architected as an offline-first commercial desktop Screen Wellness Assistant. It decouples the core computer vision inference, reminder state machines, local database storage, and cryptographic licensing into reusable, headless packages under a modular monorepo.

The architecture strictly adheres to unidirectional dependency layering:

```
┌─────────────────────────────────────────────────────────────┐
│                 Desktop UI (React 18 + Vite)                │
│    Dashboard │ Monitor │ Breaks │ ScreenTime │ Stats │ ...   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Application Services Layer                 │
│   ProfileService │ NotificationPolicy │ ResourceGovernor     │
└──────────────┬───────────────────────┬──────────────────────┘
               │                       │
┌──────────────▼─────────────┐ ┌───────▼──────────────────────┐
│    Computer Vision Engine   │ │     Smart Reminder Engine    │
│  - MediaPipe Landmarker    │ │  - 20-20-20 Eye Breaks       │
│  - DistanceEstimator       │ │  - Hydration Countdown       │
│  - PostureEstimator        │ │  - Anti-Fatigue Backoff      │
│  - Temporal Smoothing      │ │  - Fullscreen Suppression    │
└──────────────┬─────────────┘ └──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    Local SQLite Database                    │
│   - Schema Migrations │ Summarized Events │ Retention Purge │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Package Separation & Boundaries

1. **`@eyeposture/shared-types`**:
   The single source of truth for domain models, DTOs, Enums, and interfaces across desktop, API, and vision.

2. **`@eyeposture/i18n`**:
   Zero hard-coded strings in business logic. Full typed translation dictionaries for English (`en`) and Vietnamese (`vi`).

3. **`@eyeposture/database`**:
   Local-first SQLite storage powered by `sql.js` (WebAssembly/Pure JS) with automated migrations and zero native toolchain compilation dependencies. Never stores raw camera frames; aggregates summarized ergonomic incidents.

4. **`@eyeposture/vision`**:
   Modular computer vision pipeline. Features `DistanceEstimator` (inter-pupillary distance scale against calibrated baseline), `PostureEstimator` (pitch, roll, yaw, vertical slouch drift), and `TemporalFilter` (exponential moving average & hysteresis state machines). Includes a deterministic synthetic landmark harness for automated test execution without physical cameras.

5. **`@eyeposture/reminder-engine`**:
   Event-driven smart reminder coordinator with `BreakTimer` (20-20-20), `HydrationTimer`, `NotificationPolicyEngine` (quiet hours, fullscreen suppression, 3-in-5-min cooldown escalation), and `ResourceGovernor` (dynamic FPS adjustment: 2–8 FPS based on battery and CPU load).

6. **`@eyeposture/billing`**:
   Zero-trust entitlement verification. Handles portable HMAC-SHA256 signatures, device hardware GUID binding, 14-day offline grace periods, and system clock rollback detection.

7. **`@eyeposture/api`**:
   Modular REST service providing JWT authentication, user registration, device registration, signed entitlement minting, and SePay & Stripe webhook handling.

8. **`@eyeposture/desktop`**:
   Desktop frontend built with React 18, Vite, Lucide icons, and modern design tokens, running inside an Electron desktop shell with system tray, minimize-to-tray, and power monitoring.
