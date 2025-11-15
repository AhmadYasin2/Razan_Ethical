# WebGazer System Architecture & Flow

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Your React App                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────────┐  ┌──────────────┐
   │ ResearchPage
   │ (Dashboard)│  │  AppPopup   │  │ UrgencyBanner│
   └─────────┘  │ (Tracking)   │  │ (Tracking)   │
        │       └──────────────┘  └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌──────────────────┐      ┌──────────────────────┐
   │  useWebGazer Hook│      │useDeceptiveUXTracking│
   │                  │      │      Hook            │
   │ • Initialize WG  │      │                      │
   │ • Calibration    │      │ • Detect elements    │
   │ • Gaze stream    │      │ • Track interactions │
   │ • Accuracy       │      │ • Generate heatmap   │
   └────────┬─────────┘      └──────────┬───────────┘
            │                           │
            └───────────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │   WebGazer.js  │
                    │ (/public/      │
                    │  WebGazer/)    │
                    │                │
                    │ • Face detect  │
                    │ • Eye track    │
                    │ • Prediction   │
                    └───────┬────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  User's Webcam   │
                    └──────────────────┘
```

---

## 🔄 Data Flow

### 1. Initialization Flow

```
Component Mount
    ↓
useWebGazer(true)
    ↓
Load /public/WebGazer/webgazer.js
    ↓
Initialize face tracking + eye detection
    ↓
Request camera permission
    ↓
wg.begin() → Start tracking
    ↓
setReady(true) → Ready state
```

### 2. Gaze Data Flow

```
Webcam Feed
    ↓
WebGazer processes frame
    ↓
Detects face & eyes
    ↓
Predicts gaze point (x, y)
    ↓
Calls gazeListener callback
    ↓
onGazeUpdate(gazeData) → Your component
    ↓
Update UI / Track interactions / Draw overlay
```

### 3. Deceptive Element Detection Flow

```
Gaze data received
    ↓
getElementAtGazePoint(x, y)
    ↓
Find element under cursor
    ↓
Check selectors:
  • [class*='deceptive']
  • [class*='urgency']
  • [class*='popup']
    ↓
If matched:
  • Record start time
  • Calculate duration
  • Store interaction data
    ↓
updateTrackingData()
```

### 4. Data Export Flow

```
exportTrackingData()
    ↓
Compile:
  • All interactions
  • Heatmap points
  • Scroll events
  • Timestamps
    ↓
Create JSON blob
    ↓
User downloads file
    ↓
Analysis/Research
```

---

## 📁 File Structure

```
src/
├── tracking/
│   ├── useWebGazer.ts                 ← Main eye-tracking hook
│   ├── useDeceptiveUXTracking.ts       ← Deceptive element detection
│   ├── WEBGAZER_INTEGRATION.md         ← Full documentation
│   └── USAGE_EXAMPLES.tsx              ← Code examples
├── components/
│   ├── deceptive/
│   │   ├── AppPopup.tsx               ← Tracked popup
│   │   └── UrgencyBanner.tsx           ← Tracked urgency banner
│   └── pages/
│       └── ResearchPage.tsx            ← Dashboard with calibration
└── ...

public/
└── WebGazer/
    ├── webgazer.js                     ← Main library
    ├── webgazer.js.map
    └── src/
        ├── facemesh.mjs
        ├── mat.mjs
        ├── pupil.mjs
        └── ...

root/
├── QUICK_START.md                      ← This guide
├── WEBGAZER_SETUP.md                   ← Setup summary
└── ...
```

---

## 🎯 Component Relationships

### Research Page (Dashboard)

```
ResearchPage
├── Canvas Overlay
│   └── Draws gaze points in real-time
├── Calibration Section
│   ├── Start button
│   ├── 9 calibration points
│   └── Accuracy display
├── Real-time Gaze Display
│   ├── X coordinate
│   └── Y coordinate
├── Statistics Panel
│   ├── Total gaze points
│   ├── Interactions tracked
│   └── Scroll events
├── Heatmap View
│   └── Shows focus areas
├── Deceptive Elements List
│   └── Detected interactions
└── Export/Clear Buttons
    ├── Export data as JSON
    └── Clear tracking session
```

### AppPopup (with Tracking)

```
AppPopup
├── Eye tracker auto-enabled
├── Record interactions on:
│   ├── Download button click
│   └── Dismiss button click
├── Visual indicator
│   └── Eye icon (when tracking)
└── Debug info (dev only)
    └── Interaction count
```

### UrgencyBanner (with Tracking)

```
UrgencyBanner
├── Eye tracker auto-enabled
├── Detect gaze on timer
├── Log pressure element views
├── Record scroll interactions
├── Visual indicator
│   └── Eye icon (when tracking)
└── Debug info (dev only)
    └── Interaction count
```

---

## 💾 Data Structure

### GazeData

```typescript
{
  x: number; // Screen X coordinate (px)
  y: number; // Screen Y coordinate (px)
  timestamp: number; // Unix timestamp (ms)
}
```

### ElementInteraction

```typescript
{
  elementId: string;                      // Element ID/class
  elementType: string;                    // HTML tag name
  gazeEntryTime: number;                  // When gaze entered (ms)
  gazeExitTime: number | null;            // When gaze left (ms)
  gazeDuration: number;                   // Total duration (seconds)
  interactionType: "hover" | "click" | "scroll" | "view";
  clickPosition?: { x: number; y: number }; // Where user clicked
  gazeStartPosition?: GazeData;           // Initial gaze position
  gazeEndPosition?: GazeData;             // Final gaze position
}
```

### TrackingData

```typescript
{
  interactions: ElementInteraction[];
  totalGazeTime: number;
  heatmapData: Array<{ x: number; y: number; weight: number }>;
  scrollEvents: Array<{ timestamp: number; scrollY: number }>;
}
```

---

## 🔑 Key Functions

### useWebGazer API

| Function             | Input                  | Output           | Purpose                    |
| -------------------- | ---------------------- | ---------------- | -------------------------- |
| `useWebGazer()`      | `active: boolean`      | Hook return      | Initialize tracking        |
| `startCalibration()` | `points?: number`      | `void`           | Begin calibration sequence |
| `recordDataPoint()`  | `x: number, y: number` | `void`           | Save calibration point     |
| `endCalibration()`   | none                   | `void`           | Complete calibration       |
| `getAccuracy()`      | none                   | `number \| null` | Get accuracy score (0-1)   |

### useDeceptiveUXTracking API

| Function               | Input           | Output         | Purpose             |
| ---------------------- | --------------- | -------------- | ------------------- |
| `recordClickEvent()`   | `element, x, y` | `void`         | Log click with gaze |
| `clearTracking()`      | none            | `void`         | Reset all data      |
| `exportTrackingData()` | none            | `TrackingData` | Get data for export |

---

## 🚀 Typical Workflow

### For Research Page

```
1. User navigates to /research
2. useWebGazer initializes automatically
3. "Start Calibration" button appears
4. User clicks button → showCalibrationPoints()
5. User looks at point + clicks 9 times
6. getAccuracy() returns score
7. System shows real-time gaze visualization
8. User navigates site (interactions recorded)
9. "Export" button clicked
10. JSON downloaded with all data
```

### For Deceptive Component

```
1. Component mounts (AppPopup/UrgencyBanner)
2. useWebGazer activates automatically
3. useDeceptiveUXTracking watches for gaze
4. User looks at element → duration counted
5. User clicks button → position recorded
6. User leaves component → data saved
7. exportTrackingData() captured at key events
8. Data sent to analytics/console
```

---

## 📊 Metrics You Get

### User Attention

- **Gaze duration on element** (seconds)
- **Number of gaze fixations** on element
- **Heatmap density** (where users look most)

### User Behavior

- **Click coordinates** vs **gaze position**
- **Interaction patterns** (hover → click → scroll)
- **Scroll speed** and **scroll distance**

### UI Effectiveness

- **How many users notice** a deceptive element
- **How long users look** at urgency banners
- **Click-through rate** from gaze to action

---

## 🔐 Privacy & Security

```
User Webcam
    ↓
[Client-side processing ONLY]
    ↓
Face detection (local)
    ↓
Eye tracking (local)
    ↓
Gaze prediction (local)
    ↓
NO DATA SENT TO SERVER
    ↓
User controls export
```

---

## ⚙️ Configuration Options

```typescript
// Custom configuration
const { ready } = useWebGazer(true, undefined, {
  regression: "ridge", // Prediction model
  tracker: "clmtrackr", // Face tracker
  showVideo: false, // Show webcam feed
  showPredictionPoints: true, // Show gaze overlay
});
```

**Regression models:**

- `"ridge"` - Default, balanced
- `"weightedRidge"` - Better accuracy
- `"threadedRidge"` - Uses web workers

**Trackers:**

- `"clmtrackr"` - Faster, less accurate
- `"facemesh"` - More accurate, slower

---

## 🎓 Learning Path

1. **Start**: Use Research Page dashboard
2. **Explore**: Check exported JSON data
3. **Learn**: Read WEBGAZER_INTEGRATION.md
4. **Build**: Add hooks to your components
5. **Analyze**: Build your own analytics

---

## 🆘 Common Issues

| Issue                      | Solution                                           |
| -------------------------- | -------------------------------------------------- |
| "WebGazer not loading"     | Check `/public/WebGazer/webgazer.js` exists        |
| "Camera permission denied" | Grant permission in browser settings               |
| "Inaccurate tracking"      | Run 9-point calibration                            |
| "No data exported"         | Ensure interactions occurred on tracked elements   |
| "Slow performance"         | Reduce prediction point rendering, use ridge model |

---

**Ready to start? Run `npm run dev` and navigate to the Research page!** 🚀
