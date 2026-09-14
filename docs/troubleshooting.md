# Troubleshooting Guide

## 1. Camera Locked or Unavailable

**Symptom**: The Monitor page displays "Camera is currently unavailable or disconnected".

**Root Causes & Solutions**:
1. **Another application has exclusive access**: Windows camera drivers frequently lock exclusively to apps like Zoom, Microsoft Teams, or Google Meet. Close conflicting video calls or select a secondary webcam in the dropdown.
2. **Windows Privacy Permissions**:
   - Open **Windows Settings > Privacy & Security > Camera**.
   - Verify **Let desktop apps access your camera** is set to **On**.
3. **Simulation Mode Fallback**: During testing or presentation, enable **Test Simulation Harness (Mock CV)** on the Monitor page to test all biometric states without a camera.

---

## 2. High CPU Load or Laptop Battery Drain

**Symptom**: Computer fan spins up during monitoring.

**Root Causes & Solutions**:
1. The `ResourceGovernor` automatically throttles inference to **2 FPS** when on battery power or when system CPU load exceeds 65%.
2. You can manually adjust the sensitivity level in **Settings > Posture** or pause monitoring via the tray context menu during heavy compilation or gaming sessions.

---

## 3. Clock Manipulation Warning

**Symptom**: License shows "Clock manipulation detected".

**Solution**:
EyePosture verifies that local system time progresses monotonically to prevent users from winding back computer clocks to bypass subscription expiration. Ensure Windows is configured to **Set time automatically** under **Date & Time Settings**.
