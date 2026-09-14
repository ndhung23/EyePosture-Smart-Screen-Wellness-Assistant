# Privacy Architecture & Local-First Commitment

## 1. Core Principles

EyePosture is built on the philosophy that ergonomic health tools must never compromise personal privacy.

### What Stays on This Computer (100% Local)
- **Webcam Video Stream**: Frames are streamed locally via WebRTC/DirectShow to a sandboxed background worker, analyzed for landmark vectors, and discarded in volatile memory within milliseconds.
- **Biometric Landmark Coordinates**: Eye-to-eye distances, head angles, and baseline calibration values are stored exclusively in local SQLite.
- **Posture & Distance Incident Logs**: Aggregated event timestamps and durations are saved locally for statistics.
- **Application Activity Breakdown**: Top process names (`Code.exe`, `chrome.exe`) and duration seconds are aggregated on-device.

### What May Be Synchronized (Optional Cloud Accounts)
- User account identity (email and name).
- Registered device metadata (Device Name, OS type, App version).
- Subscription status (Free vs Pro, current period expiration).

### What Is Strictly Never Collected
- **No Video Recordings or Photos**: The application contains zero code to record, capture, or store camera image files.
- **No Keystroke or Input Logging**: Keystrokes, text input, clipboard contents, and passwords are never monitored.
- **No Browsing History or URLs**: Only the window process name (`chrome.exe`) is inspected for screen-time calculation.
- **No Microphone or Audio Surveillance**: Microphone hardware is never initialized.
