# Testing Strategy & Acceptance Test Suite

## 1. Automated Test Suites

EyePosture maintains automated unit and integration tests across all packages using Vitest:

```bash
# Run all 35+ automated tests
npm test
```

### Coverage by Package
- **`@eyeposture/i18n`**: Verifies translation resolution, fallbacks, parameter interpolation, and Vietnamese/English language switching.
- **`@eyeposture/database`**: In-memory SQLite driver tests verifying automated migrations, profile CRUD, settings persistence, event logging, 30–90 day retention purges, and Screen Wellness Score computations.
- **`@eyeposture/vision`**: Synthetic landmark harness tests validating distance ratios, head pitch/roll angles, slouching detection, calibration baselines, and temporal hysteresis smoothing.
- **`@eyeposture/reminder-engine`**: Validates 20-20-20 break timer, hydration countdowns, anti-fatigue cooldown escalation, quiet hours suppression, and resource governor mode switches.
- **`@eyeposture/billing`**: Validates cryptographic signature minting, tamper rejection, device GUID validation, 14-day offline grace periods, and clock rollback detection.
- **`@eyeposture/api`**: HTTP integration tests for registration, authentication, checkout session creation, signed entitlement issuance, and Stripe webhook idempotency.

---

## 2. Acceptance Test Matrix (Requirement 71)

| Test ID | Test Scenario | Verified Behavior |
| :--- | :--- | :--- |
| **A** | **First Launch** | Application initializes SQLite database, creates default profile, prompts calibration wizard. |
| **B** | **Camera Permission Denied** | Displays non-blocking notice; all timer-based reminders (breaks, hydration, screen-time) continue running normally. |
| **C** | **Camera Disconnected** | `ResourceGovernor` transitions to `IDLE` (0 FPS); recovers automatically when camera is reconnected. |
| **D** | **User Moves Too Close** | After 5s persistent lapse, triggers `TOO_CLOSE` alert; 1s glance is ignored. |
| **E** | **User Moves Back** | Distance alert automatically clears within 1.5s recovery window. |
| **F** | **User Slouches** | Sinking in chair or head pitch > 20° drops posture score below 70; triggers gentle reminder after 5s. |
| **G** | **User Fixes Posture** | Posture alert resolves immediately when spine and head align. |
| **H** | **Eye-Break Timer** | Triggers 20-20-20 rest overlay with 20s breathing countdown; supports Complete, Skip, and Snooze. |
| **I** | **Water Timer** | Periodic hydration reminders; logs water glasses drank towards daily target. |
| **J** | **Screen-Time Limit** | Fires notifications at 80%, 90%, and 100% daily allocation. |
| **K** | **Multiple Profiles** | Data, settings, and calibration baselines strictly isolated between adult and child profiles. |
| **M** | **Offline Mode** | Monitoring, reminders, and local statistics operate with zero internet connection. |
| **N** | **Subscription Expired** | Enters 14-day offline grace period before gracefully downgrading to Free without data loss. |
| **P** | **Webhook Duplication** | Idempotency layer detects duplicate Stripe events and ignores repeated execution. |
| **U** | **Laptop on Battery** | `ResourceGovernor` switches to `POWER_SAVER` mode (2 FPS) to conserve power. |
| **X** | **Fullscreen Application** | Suppresses intrusive posture and distance alerts while movies or games are playing. |
