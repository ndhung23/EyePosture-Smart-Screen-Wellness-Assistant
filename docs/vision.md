# Computer Vision Architecture & Pipeline

## 1. Ergonomic Landmark Topology

EyePosture processes landmark coordinates using MediaPipe FaceMesh / FaceLandmarker geometry:

- **Left Eye Inner & Outer**: Indices 133 and 33
- **Right Eye Inner & Outer**: Indices 362 and 263
- **Forehead (Glabella)**: Index 10
- **Chin**: Index 152
- **Nose Tip**: Index 1

---

## 2. Mathematical Formulations

### 2.1. Distance Estimation
Distance is estimated as a scale ratio relative to a personalized calibrated baseline:

1. **Facial Scale Factor ($S$)**:
   $$S = 0.4 \cdot d(\text{LeftEyeInner}, \text{RightEyeInner}) + 0.3 \cdot d(\text{LeftEyeOuter}, \text{RightEyeOuter}) + 0.3 \cdot d(\text{Chin}, \text{Forehead})$$

2. **Distance Scale Ratio ($R$)**:
   $$R = \frac{S}{\text{BaselineScale}}$$
   - When $R > 1.25$, the face is closer than the ergonomic comfort zone.
   - Estimated Distance: $\text{EstCm} = \frac{60}{R}$ (normalized around 60 cm).

### 2.2. Posture Angles
- **Roll ($\theta_{\text{roll}}$)**: Head tilt sideways
  $$\theta_{\text{roll}} = \text{atan2}(y_{\text{rightEye}} - y_{\text{leftEye}}, x_{\text{rightEye}} - x_{\text{leftEye}}) \times \frac{180}{\pi}$$
- **Pitch ($\theta_{\text{pitch}}$)**: Looking downward (forward head slouch)
  $$\theta_{\text{pitch}} = \text{atan2}(z_{\text{chin}} - z_{\text{forehead}}, y_{\text{chin}} - y_{\text{forehead}}) \times \frac{180}{\pi}$$
- **Slouching Drift ($\Delta Y$)**:
  $$\Delta Y = \text{CenterY} - \text{BaselineY}$$
  In normalized screen space (where $Y$ increases downwards), $\Delta Y > 0.05$ indicates slumping downward in the seat.

### 2.3. Screen Wellness Posture Score
Scores start at 100 and apply continuous penalties based on deviations from baseline:
$$\text{Score} = 100 - (\text{PitchPenalty} + \text{RollPenalty} + \text{YawPenalty} + \text{SlouchPenalty})$$
- 90–100: **Good**
- 70–89: **Acceptable**
- < 70: **Poor**

### 2.4. Eye Blink & Ocular Fatigue Estimation (ErgoBlink Integration)
To mitigate Computer Vision Syndrome (CVS) and ocular surface desiccation caused by reduced blinking during screen focus, EyePosture incorporates the Eye Aspect Ratio (EAR) formulation (Soukupová & Čech, 2016; Chin et al., ErgoBlink):

1. **Eye Aspect Ratio (EAR)**:
   $$\text{EAR} = \frac{||\text{EyelidTop} - \text{EyelidBottom}||}{||\text{EyeOuter} - \text{EyeInner}||}$$
   - **Open Eye**: $\text{EAR} \approx 0.25 - 0.35$
   - **Closed / Blinking Eye**: $\text{EAR} < 0.22$
   - Debounced state machine requires $\ge 2$ consecutive frames below threshold to prevent eyelid flutter or image noise false alarms.

2. **Blinks Per Minute (BPM)**:
   Calculated across a 60-second sliding window. Typical healthy blinking rate is **15–20 BPM**; computer work drops it to **4–7 BPM**. Rates $< 10\text{ BPM}$ incur eye strain penalties.

3. **Prolonged Stare Detection**:
   $$\text{SecondsSinceLastBlink} \ge 7\text{s} \implies \text{Emit Prolonged Stare Alert}$$
   Alerts user through non-intrusive micro-prompts or chimes to blink consciously.

---

## 3. Temporal Smoothing & Hysteresis

To eliminate false alarms caused by temporary motion (such as glancing at a keyboard or drinking water):

1. **Exponential Moving Average (EMA)**:
   $$\bar{x}_t = \alpha x_t + (1 - \alpha)\bar{x}_{t-1}, \quad \alpha = 0.25$$

2. **State Machine Transitions**:
   $$\text{SAFE} \xrightarrow{\ge 5\text{s Too Close}} \text{TOO\_CLOSE} \xrightarrow{\text{Back Up}} \text{RECOVERING} \xrightarrow{1.5\text{s}} \text{SAFE}$$

A 1-second lapse remains in `TOO_CLOSE_PENDING` and never alerts the user unless sustained for the full configured delay (default: 5 seconds).

---

## 4. Resource Governor

The `ResourceGovernor` optimizes CPU and battery efficiency:

| Environment Condition | Operating Mode | Target FPS | Camera State |
| :--- | :--- | :--- | :--- |
| Plugged into AC & Active | `BALANCED` | 5 FPS | Active |
| High Performance Mode | `PERFORMANCE` | 8 FPS | Active |
| On Laptop Battery or CPU > 65% | `POWER_SAVER` | 2 FPS | Active |
| User Idle (>3 min away) | `IDLE` | 0 FPS | Suspended / Paused |
| Camera Disconnected / Busy | `IDLE` | 0 FPS | Off (Graceful Fallback) |

---

## 5. Synthetic Testing Without Physical Webcam

The synthetic harness (`SyntheticVisionHarness`) generates mathematical landmark vectors representing:
- `createUprightLandmarks()`: Standard ergonomic baseline.
- `createSlouchedLandmarks()`: 22° pitch down, 0.09 vertical slump.
- `createTooCloseLandmarks()`: 1.45x scale ratio (~40 cm).
- `createHeadTiltedLandmarks()`: 16° lateral roll.
- `createBlinkingLandmarks()`: Eyelids closed (aperture ratio 0.15, EAR < 0.15).
- `createProlongedStareLandmarks()`: Wide open eyelids without blinking.

All automated unit tests run against these deterministic models without accessing physical camera hardware.
