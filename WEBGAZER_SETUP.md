# WebGazer Integration Summary

## ✅ Integration Complete

Your WebGazer eye-tracking system has been successfully integrated with the deceptive UX components. Here's what was set up:

## 📁 Files Created/Modified

### New Files

1. **`src/tracking/useDeceptiveUXTracking.ts`** (NEW)

   - Comprehensive hook for tracking user interactions with deceptive UX elements
   - Detects popups, urgency banners, and other manipulative patterns
   - Records gaze duration, click positions, and interaction types
   - Generates heatmap data for analysis

2. **`src/tracking/WEBGAZER_INTEGRATION.md`** (NEW)
   - Complete integration guide and API reference
   - Configuration options and best practices
   - Troubleshooting guide and examples

### Modified Files

1. **`src/tracking/useWebGazer.ts`** (ENHANCED)

   - Added gaze data callback support
   - Calibration methods (startCalibration, endCalibration)
   - Accuracy tracking
   - Improved error handling
   - Configuration options object

2. **`src/components/deceptive/AppPopup.tsx`** (INSTRUMENTED)

   - Integrated WebGazer eye-tracking
   - Real-time interaction logging
   - Gaze detection on buttons
   - Visual tracking indicator (Eye icon)
   - Data export on user actions

3. **`src/components/deceptive/UrgencyBanner.tsx`** (INSTRUMENTED)

   - WebGazer integration for pressure element tracking
   - Detects when user gazes at urgency timer
   - Records timer interactions
   - Auto-enabled tracking when component mounts
   - Real-time interaction metrics

4. **`src/components/pages/ResearchPage.tsx`** (COMPLETELY REDESIGNED)
   - Comprehensive research dashboard
   - 9-point calibration interface with visual feedback
   - Real-time gaze visualization on canvas overlay
   - Statistics panel with metrics
   - Heatmap display
   - Deceptive UX detection list
   - JSON data export functionality
   - Educational information panel

## 🎯 Key Features

### 1. Eye-Tracking Integration

- ✅ WebGazer loaded from `/public/WebGazer/webgazer.js`
- ✅ Automatic initialization and error handling
- ✅ Configurable regression and tracking models
- ✅ Real-time gaze data streaming

### 2. Calibration System

- ✅ 9-point calibration interface
- ✅ Visual calibration point markers
- ✅ Accuracy percentage reporting
- ✅ Manual calibration point recording

### 3. Deceptive UX Detection

- ✅ Automatic element identification
- ✅ Gaze duration tracking
- ✅ Click position logging
- ✅ Interaction type classification

### 4. Data Collection & Export

- ✅ Real-time gaze point collection
- ✅ Heatmap generation
- ✅ Scroll event tracking
- ✅ JSON export for analysis

### 5. User Interface

- ✅ Research dashboard with metrics
- ✅ Canvas overlay for gaze visualization
- ✅ Live statistics display
- ✅ Tracking indicators on components
- ✅ Clear instructions for users

## 🚀 How to Use

### Starting the Development Server

```powershell
cd "C:\Users\ahmad\Desktop\Razan"
npm run dev
```

### Accessing the Research Mode

1. Navigate to the Research page from the main menu
2. WebGazer will auto-initialize
3. Click "Start 9-Point Calibration"
4. Look at each calibration point and click when focused
5. Browse the site - interactions are automatically tracked
6. Click "Export Tracking Data" to download your data

### Testing Deceptive UX Tracking

1. Return to home page (triggers AppPopup)
2. WebGazer automatically activates on the popup
3. Click buttons or dismiss - interactions are logged
4. Check console for tracking data

## 📊 Data Structure

### Tracked Interactions

```typescript
interface ElementInteraction {
  elementId: string;
  elementType: string;
  gazeEntryTime: number;
  gazeExitTime: number | null;
  gazeDuration: number;
  interactionType: "hover" | "click" | "scroll" | "view";
  clickPosition?: { x: number; y: number };
  gazeStartPosition?: GazeData;
}
```

### Heatmap Data

```typescript
interface HeatmapPoint {
  x: number;
  y: number;
  weight: number; // Higher = more gaze focus
}
```

## 🔧 Configuration Options

### WebGazer Configuration

```typescript
const { ready, gazeData } = useWebGazer(true, onGazeUpdate, {
  regression: "ridge", // "ridge" | "weightedRidge" | "threadedRidge"
  tracker: "clmtrackr", // "clmtrackr" | "facemesh"
  showVideo: false, // Show webcam feed
  showPredictionPoints: true, // Show gaze prediction overlay
});
```

### Deceptive Element Selectors

Located in `useDeceptiveUXTracking.ts`:

```typescript
const deceptiveSelectors = [
  "[class*='deceptive']",
  "[class*='urgency']",
  "[class*='popup']",
  "[class*='banner']",
  "[class*='pressure']",
  "button:has(.animate-pulse)",
];
```

## 📈 What Gets Tracked

### On Deceptive Components

- ✅ Gaze entry/exit times
- ✅ Total gaze duration on element
- ✅ Click positions relative to gaze
- ✅ Element ID and type
- ✅ Interaction type classification

### Global Metrics

- ✅ Total gaze points collected
- ✅ Heatmap density mapping
- ✅ Scroll event timestamps
- ✅ Calibration accuracy
- ✅ Element interaction count

## 🎓 Research Applications

This integration enables:

1. **Deceptive Design Analysis**: Measure how urgency/pressure tactics affect user gaze
2. **UX Research**: Track attention patterns in e-commerce interfaces
3. **A/B Testing**: Compare gaze patterns between different designs
4. **Attention Metrics**: Identify which elements capture attention
5. **Manipulation Detection**: Quantify the effect of deceptive patterns

## 🔐 Privacy Features

- ✅ Client-side processing only (no data sent to servers)
- ✅ Visual tracking indicators (Eye icons)
- ✅ User consent via camera permission
- ✅ Data export and local control
- ✅ Easy opt-out mechanism

## 🐛 Troubleshooting

### WebGazer Not Loading

- Verify `/public/WebGazer/webgazer.js` exists
- Check browser console for errors
- Ensure camera permissions are granted
- Try refreshing the page

### Inaccurate Gaze

- Run 9-point calibration
- Check lighting conditions
- Ensure webcam is clear
- Try alternative tracker (facemesh)

### No Interactions Tracked

- Verify element has class containing 'deceptive', 'urgency', etc.
- Check browser console for tracking logs
- Ensure WebGazer is in "ready" state
- Verify gaze data is being received

## 📝 Next Steps

1. **Test the system**: Navigate to ResearchPage and calibrate
2. **Review tracking data**: Check exported JSON files
3. **Customize selectors**: Add more deceptive pattern detectors
4. **Analyze results**: Use exported data for research
5. **Extend tracking**: Add more metrics as needed

## 🔗 WebGazer Resources

- Official Site: https://webgazer.cs.brown.edu
- GitHub: https://github.com/brownhci/WebGazer
- API Docs: https://github.com/brownhci/WebGazer/wiki/Top-Level-API
- Paper: "WebGazer: Scalable Webcam Eye Tracking Using User Interactions"

## ✨ Integration Status

| Component        | Status          | Notes                        |
| ---------------- | --------------- | ---------------------------- |
| WebGazer Hook    | ✅ Complete     | Full API implemented         |
| UX Tracking Hook | ✅ Complete     | All metrics working          |
| AppPopup         | ✅ Instrumented | Auto-tracking enabled        |
| UrgencyBanner    | ✅ Instrumented | Pressure detection active    |
| ResearchPage     | ✅ Dashboard    | Full analytics UI            |
| Data Export      | ✅ Working      | JSON format                  |
| Build            | ✅ Success      | TypeScript compilation clean |

---

**All systems ready! Start by running `npm run dev` and navigate to the Research page.**
