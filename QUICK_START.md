# WebGazer Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Development Server

```powershell
cd "C:\Users\ahmad\Desktop\Razan"
npm run dev
```

This will start the app at `http://localhost:3000` and open it automatically.

---

## 📍 Option 1: Use the Research Dashboard (Easiest)

### Access the Research Page

1. The app opens at home page
2. Navigate to the **Research** page at `http://localhost:3000/_ux` or `http://localhost:3000/research`
3. You'll see a comprehensive dashboard with:
   - 🎯 Calibration button
   - 📊 Real-time statistics
   - 🔴 Live gaze visualization (red dots on canvas overlay)
   - 📈 Heatmap and interaction tracking
   - 💾 Export button for data

### Calibrate Your Eye Tracker

1. **Click "Start 9-Point Calibration"**
2. You'll see a blue point appear on screen
3. **Look directly at the point** and wait a moment
4. **Click the "Calibration Point Captured" button**
5. Repeat for all 9 points (grid pattern across screen)
6. See your accuracy percentage displayed

### View Real-Time Tracking

- Your **gaze position** (X, Y coordinates) updates in real-time
- **Red dots** appear on the canvas overlay showing where you're looking
- Statistics panel shows:
  - Total gaze points collected
  - Element interactions tracked
  - Scroll events recorded

### Export Your Data

- **Click "Export Tracking Data"** when done
- Downloads a JSON file with all your gaze data
- Use for research/analysis

---

## 📍 Option 2: Use in Your Own Components

### Basic Setup (Copy-Paste Ready)

**In any React component:**

```tsx
import { useWebGazer } from "@/tracking/useWebGazer";
import { useDeceptiveUXTracking } from "@/tracking/useDeceptiveUXTracking";
import { useState } from "react";

export function MyComponent() {
  const { ready, gazeData } = useWebGazer(true);
  const { trackingData } = useDeceptiveUXTracking(ready, gazeData);

  return (
    <div>
      {ready ? (
        <div>
          <p>✓ Eye tracker active!</p>
          {gazeData && (
            <p>
              Looking at: ({gazeData.x.toFixed(0)}, {gazeData.y.toFixed(0)})
            </p>
          )}
          <p>Tracked interactions: {trackingData.interactions.length}</p>
        </div>
      ) : (
        <p>Initializing eye tracker...</p>
      )}
    </div>
  );
}
```

---

## 🎯 Example: Track a Button Click

```tsx
import { useWebGazer } from "@/tracking/useWebGazer";
import { useDeceptiveUXTracking } from "@/tracking/useDeceptiveUXTracking";

export function MyButton() {
  const { ready, gazeData } = useWebGazer(true);
  const { recordClickEvent } = useDeceptiveUXTracking(ready, gazeData);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget && gazeData) {
      // Record where user was looking when they clicked
      recordClickEvent(e.currentTarget, gazeData.x, gazeData.y);
      console.log("Button click recorded with gaze position!");
    }
  };

  return (
    <button onClick={handleClick} style={{ padding: "10px 20px" }}>
      Click Me (I Track Your Gaze!)
    </button>
  );
}
```

---

## 🎬 Example: Real-Time Gaze Updates

```tsx
import { useWebGazer, GazeData } from "@/tracking/useWebGazer";

export function GazeVisualizer() {
  const handleGazeUpdate = (data: GazeData) => {
    console.log("Current gaze:", data);
    // Update UI, draw on canvas, etc.
  };

  const { ready, gazeData } = useWebGazer(true, handleGazeUpdate);

  return (
    <div>
      <p>{ready ? "👁️ Tracking your eyes" : "⏳ Loading..."}</p>
      {gazeData && (
        <div
          style={{
            position: "fixed",
            left: gazeData.x,
            top: gazeData.y,
            width: "20px",
            height: "20px",
            backgroundColor: "red",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}
    </div>
  );
}
```

---

## 🔧 Example: Calibration Control

```tsx
import { useWebGazer } from "@/tracking/useWebGazer";
import { useState } from "react";

export function CalibrationControls() {
  const [calibrated, setCalibrated] = useState(false);

  const {
    ready,
    calibrationAccuracy,
    startCalibration,
    endCalibration,
    recordDataPoint,
    getAccuracy,
  } = useWebGazer(true);

  const handleCalibration = () => {
    startCalibration(9);
    // In real app, show 9 calibration points
    // For each point, call recordDataPoint(x, y)

    setTimeout(() => {
      endCalibration();
      const accuracy = getAccuracy();
      console.log("Calibration complete! Accuracy:", accuracy);
      setCalibrated(true);
    }, 30000); // 30 seconds for user to complete
  };

  return (
    <div>
      <button onClick={handleCalibration} disabled={!ready}>
        Start Calibration
      </button>
      {calibrationAccuracy && (
        <p>Accuracy: {(calibrationAccuracy * 100).toFixed(1)}%</p>
      )}
      {calibrated && <p>✓ Calibration complete!</p>}
    </div>
  );
}
```

---

## 🎨 Example: Track Deceptive Elements

```tsx
import { useWebGazer } from "@/tracking/useWebGazer";
import { useDeceptiveUXTracking } from "@/tracking/useDeceptiveUXTracking";

export function UrgencyBannerTracked() {
  const { ready, gazeData } = useWebGazer(true);
  const { trackingData, exportTrackingData } = useDeceptiveUXTracking(
    ready,
    gazeData
  );

  return (
    <div>
      {/* Your urgency banner */}
      <div className="urgency-banner">
        <p>⚡ FLASH SALE - Limited Time!</p>
      </div>

      {/* Show tracking stats */}
      <div>
        <p>Gaze interactions on banner: {trackingData.interactions.length}</p>
        <p>Total gaze points: {trackingData.heatmapData.length}</p>

        <button
          onClick={() => {
            const data = exportTrackingData();
            console.log("User attention data:", data);
            // Send to analytics
          }}
        >
          Export Analytics
        </button>
      </div>
    </div>
  );
}
```

---

## 📊 Example: Export and Analyze Data

```tsx
import { useWebGazer } from "@/tracking/useWebGazer";
import { useDeceptiveUXTracking } from "@/tracking/useDeceptiveUXTracking";

export function DataExporter() {
  const { ready, gazeData } = useWebGazer(true);
  const { trackingData, exportTrackingData } = useDeceptiveUXTracking(
    ready,
    gazeData
  );

  const handleExport = () => {
    const data = exportTrackingData();

    // Create downloadable JSON
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Download file
    const a = document.createElement("a");
    a.href = url;
    a.download = `gaze-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log("Exported data:", data);
  };

  return (
    <button onClick={handleExport}>
      💾 Download Gaze Data ({trackingData.interactions.length} interactions)
    </button>
  );
}
```

---

## 🔄 Example: Toggle Tracking On/Off

```tsx
import { useWebGazer } from "@/tracking/useWebGazer";
import { useState } from "react";

export function ToggleTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const { ready, gazeData } = useWebGazer(isTracking);

  return (
    <div>
      <button onClick={() => setIsTracking(!isTracking)}>
        {isTracking ? "⏹️ Stop Tracking" : "▶️ Start Tracking"}
      </button>

      {isTracking && (
        <div>
          <p>{ready ? "✓ Active" : "⏳ Loading..."}</p>
          {gazeData && (
            <p>
              Gaze: X={gazeData.x.toFixed(0)}, Y={gazeData.y.toFixed(0)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📚 Available Hooks

### `useWebGazer(active, onGazeUpdate?, config?)`

**Returns:**

```typescript
{
  ready: boolean,                    // Is WebGazer initialized?
  gazeData: GazeData | null,         // {x, y, timestamp}
  calibrationAccuracy: number | null, // 0-1 accuracy score
  startCalibration(points?: number),  // Begin calibration
  endCalibration(),                  // Complete calibration
  getAccuracy(),                     // Get current accuracy
  recordDataPoint(x, y)              // Record calibration point
}
```

### `useDeceptiveUXTracking(active, gazeData)`

**Returns:**

```typescript
{
  trackingData: {
    interactions: ElementInteraction[],
    totalGazeTime: number,
    heatmapData: Array<{x, y, weight}>,
    scrollEvents: Array<{timestamp, scrollY}>
  },
  recordClickEvent(element, x, y),
  clearTracking(),
  exportTrackingData()
}
```

---

## 🐛 Troubleshooting

### "WebGazer failed to load"

- Check that `/public/WebGazer/webgazer.js` exists
- Check browser console for errors
- Try refreshing the page
- Grant camera permission when prompted

### Inaccurate gaze tracking

- Run calibration with 9 points
- Ensure good lighting
- Check that webcam is clean
- Keep head relatively still

### No interactions being tracked

- Ensure element has class like `deceptive`, `urgency`, `popup`, etc.
- Check browser console for logs
- Verify `ready` state is true before using gaze data

---

## 🎓 Real-World Scenarios

### Scenario 1: A/B Testing Deceptive vs Clean Design

```tsx
// Show both designs, track where users look
const { trackingData: deceptiveTracking } = useDeceptiveUXTracking(
  ready,
  gazeData
);
// Compare heatmaps between versions
```

### Scenario 2: Measure Urgency Effect

```tsx
// Show urgency banner, measure gaze duration
if (gazeOnUrgencyBanner) {
  gazeDurationOnBanner += 1; // milliseconds
}
// Export metrics for analysis
```

### Scenario 3: Attention Heatmap

```tsx
// Collect all gaze points from users
const hotspots = trackingData.heatmapData
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 10); // Top 10 focus areas
```

---

## ✅ Checklist

- [ ] npm run dev is running
- [ ] Camera permission granted
- [ ] Navigated to Research page or imported hook
- [ ] Started calibration (if needed)
- [ ] Seeing gaze data in console/UI
- [ ] Ready to collect data!

---

## 📞 Need Help?

Check these files:

- **Implementation guide**: `WEBGAZER_INTEGRATION.md`
- **Setup details**: `WEBGAZER_SETUP.md`
- **API reference**: `useWebGazer.ts` and `useDeceptiveUXTracking.ts`
- **Live example**: Research page at `src/components/pages/ResearchPage.tsx`
