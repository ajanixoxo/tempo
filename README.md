# Tempo — Presentation & Event Timing System

Tempo is a presentation and event timer application designed for operators managing church services, conferences, seminars, workshops, academic events, and stage productions.

It features dual-screen operation over HDMI: a comprehensive **Controller Dashboard** for the operator's laptop and an independent **Audience Display** optimized for external televisions and projectors.

---

## Key Capabilities

1. **Drift-Free Timestamp Engine:**
   - Accurate elapsed and remaining time calculated directly from monotonic timestamps (`Date.now()`).
   - Zero drift even when the operator tab is minimized or inactive.
   - Preserves state across browser refreshes and recovery.

2. **Unlimited Timer Configurations:**
   - **Countdown:** Set hours, minutes, and seconds. Automatically marks completed when hitting zero. Supports optional overtime into negative time (`-00:15`).
   - **Count-up:** Starts at zero, supports optional target duration with visual alert while continuing to run.

3. **Live Time Adjustments:**
   - Add or subtract time live (+10s, +30s, +1m, +5m, -10s, -30s, -1m, or custom delta) without pausing or resetting the running timer.

4. **Real-Time Cross-Window Sync:**
   - High-performance, zero-latency communication using the browser `BroadcastChannel` API with local storage event fallback.
   - Instant synchronization of timer state, active timers, display settings, and stage messages.

5. **Independent Audience Display (`/display`):**
   - 6 Display Modes:
     - **Timer Only** (Giant digital readout for maximum visibility)
     - **Timer with Title**
     - **Timer with Message**
     - **Clock Only** (Real-world local clock)
     - **Timer & Clock**
     - **Custom** (Operator selects visible elements)
   - **Customizable Font Sizing to Any Size:** Real-time font scaling slider, direct percentage input, and presets (`100%`, `140%`, `180%`, `220%`, `280%`).
   - One-key fullscreen toggle (`F`).
   - Stage Display Font Shortcuts: `+` / `-` to scale font size up/down, `0` to reset.
   - Auto-hides mouse cursor on external displays during presentations.

6. **Stage Messaging System:**
   - Broadcast custom announcements (e.g., "Please return to your seats", "Next session starts in 2 minutes") as bottom banners or full-screen overlays without interrupting running timers.

7. **Customization & Alert Thresholds:**
   - Configurable warning thresholds (e.g. 5m warning, 1m urgent).
   - Urgent flashing and overtime alerts.
   - Customizable background color, timer text color, accent color, and typography.
   - 12-hour (AM/PM) or 24-hour clock formats with optional seconds and date.

8. **Keyboard Shortcuts:**
   - `Space`: Start / Pause / Resume active timer
   - `R`: Reset active timer
   - `▲ Up Arrow`: Add 1 minute (+60s)
   - `▼ Down Arrow`: Subtract 1 minute (-60s)
   - `F`: Toggle Fullscreen on audience display

---

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict mode, no `any`, interfaces)
- **Styling:** Tailwind CSS v3
- **State Management:** Zustand
- **Icons:** Lucide React
- **Sync:** Browser BroadcastChannel API + LocalStorage fallback
- **Testing:** Vitest

---

## HDMI Dual-Screen Workflow

1. Connect your laptop to the TV or projector using an HDMI cable.
2. In Windows Display Settings (or press `Win + P`), select **Extend**.
3. Open Tempo in your laptop browser at `http://localhost:3000/controller`.
4. Click **Open Display Window** in the top navigation bar.
5. Move the newly opened `/display` window to your external TV or projector.
6. Press `F` (or click the fullscreen icon) to enter fullscreen presentation mode.
7. Control all timers, adjust durations live, and broadcast messages from your laptop controller!

---

## Development & Testing Commands

```bash
# Start development server
npm run dev

# Run automated unit & integration tests
npm test

# Build for production
npm run build

# Start production server
npm start
```
