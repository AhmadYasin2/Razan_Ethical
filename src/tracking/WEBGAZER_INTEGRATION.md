# WebGazer Integration Guide

## Overview

This document outlines the integration of WebGazer eye-tracking with the deceptive UX components in the Razan e-commerce application. The system tracks user gaze patterns to analyze how deceptive design patterns (urgency banners, app popups) affect user behavior.

## Architecture

### Core Files

1. **`src/tracking/useWebGazer.ts`** - Enhanced WebGazer hook

   - Manages WebGazer initialization and configuration
   - Provides gaze data callbacks
   - Calibration management
   - Accuracy tracking

2. **`src/tracking/useDeceptiveUXTracking.ts`** - Deceptive UX tracking hook

   - Tracks element interactions
   - Generates heatmap data
   - Monitors scroll events
   - Records click positions relative to gaze

3. **`src/components/pages/ResearchPage.tsx`** - Research dashboard

   - 9-point calibration interface
   - Real-time gaze visualization
   - Statistics and analytics
   - Data export functionality

4. **`src/components/deceptive/AppPopup.tsx`** - Instrumented app popup

   - Eye-tracking enabled
   - Interaction logging
   - Gaze detection on call-to-action buttons

5. **`src/components/deceptive/UrgencyBanner.tsx`** - Instrumented urgency banner
   - Eye-tracking on high-pressure elements
   - Timer interaction tracking
   - Pressure element detection

## WebGazer Configuration

### Loading from Public Folder

WebGazer is loaded from `/public/WebGazer/webgazer.js`:

```typescript
const script = document.createElement("script");
script.src = "/WebGazer/webgazer.js"; // Points to public folder
```

### Configuration Options

```typescript
useWebGazer(active, onGazeUpdate, {
  regression: "ridge" | "weightedRidge" | "threadedRidge",
  tracker: "clmtrackr" | "facemesh",
  showVideo: boolean,
  showPredictionPoints: boolean,
});
```

## Usage Examples

### Basic Gaze Tracking

```typescript
import { useWebGazer } from "@/tracking/useWebGazer";

function MyComponent() {
  const { ready, gazeData } = useWebGazer(true);

  return (
    <div>
      {ready && gazeData && (
        <p>
          Gaze position: ({gazeData.x}, {gazeData.y})
        </p>
      )}
    </div>
  );
}
```

### With Callback

```typescript
const handleGazeUpdate = (data: GazeData) => {
  console.log("Gaze update:", data);
  // Update visualization, track element under cursor, etc.
};

const { ready, gazeData } = useWebGazer(true, handleGazeUpdate);
```

### Calibration

```typescript
const { ready, startCalibration, endCalibration, getAccuracy } =
  useWebGazer(true);

// Start calibration
startCalibration(9); // 9-point calibration

// Record calibration points
recordDataPoint(x, y);

// End and get accuracy
endCalibration();
const accuracy = getAccuracy(); // Returns 0-1
```

## Deceptive UX Tracking

### Tracked Interactions

The `useDeceptiveUXTracking` hook automatically detects and tracks:

- **Element selectors**: `[class*='deceptive']`, `[class*='urgency']`, `[class*='popup']`, `[class*='banner']`
- **Interaction types**: `hover`, `click`, `scroll`, `view`
- **Metrics**: gaze duration, entry/exit time, click position, gaze path

### Tracking Data Structure

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
  gazeEndPosition?: GazeData;
}

interface UXTrackingData {
  interactions: ElementInteraction[];
  totalGazeTime: number;
  heatmapData: Array<{ x: number; y: number; weight: number }>;
  scrollEvents: Array<{ timestamp: number; scrollY: number }>;
}
```

## Integration with Existing Components

### AppPopup Component

```typescript
// Enable WebGazer tracking when popup shows
const { ready, gazeData } = useWebGazer(trackingEnabled);

// Track deceptive interactions
const { trackingData, recordClickEvent, exportTrackingData } =
  useDeceptiveUXTracking(trackingEnabled && ready, gazeData);

// Export data on user action
const data = exportTrackingData();
console.log("Popup interaction data:", data);
```

### UrgencyBanner Component

```typescript
// Auto-enable tracking
useEffect(() => {
  setTrackingEnabled(true);
}, []);

// Detect gaze on high-pressure elements
useEffect(() => {
  if (gazeReady && gazeData && bannerRef.current) {
    const bannerRect = bannerRef.current.getBoundingClientRect();
    const isGazeOnBanner = /* check if gaze is within banner */;
    if (isGazeOnBanner) {
      console.log("User gaze on urgency pressure element");
    }
  }
}, [gazeData, gazeReady]);
```

## ResearchPage Dashboard

The ResearchPage provides:

1. **Calibration Interface**

   - 9-point calibration grid
   - Real-time calibration point markers
   - Accuracy reporting

2. **Real-time Visualization**

   - Canvas overlay showing gaze points
   - Crosshair cursor
   - Dynamic point trails

3. **Analytics**

   - Total gaze points collected
   - Element interactions tracked
   - Scroll event count
   - Calibration accuracy

4. **Heatmap**

   - Aggregate gaze point density
   - Visual representation of focus areas
   - Export-ready data format

5. **Deceptive UX Detection**

   - Real-time detection of manipulative elements
   - Duration metrics
   - User interaction logging

6. **Data Export**
   - JSON export of all tracking data
   - Timestamp included
   - Ready for analysis

## API Reference

### useWebGazer

```typescript
interface UseWebGazerReturn {
  ready: boolean; // WebGazer initialized
  gazeData: GazeData | null; // Current gaze position
  calibrationAccuracy: number | null; // 0-1 accuracy metric
  startCalibration(points?: number): void; // Begin calibration
  endCalibration(): void; // Complete calibration
  getAccuracy(): number | null; // Get current accuracy
  recordDataPoint(x: number, y: number): void; // Record calibration point
}
```

### useDeceptiveUXTracking

```typescript
interface UseDeceptiveUXTrackingReturn {
  trackingData: UXTrackingData; // Aggregated tracking data
  recordClickEvent(element: HTMLElement, x: number, y: number): void; // Record click with gaze
  clearTracking(): void; // Reset all tracking data
  exportTrackingData(): ExportData; // Export for analysis
}
```

## WebGazer.js Public Files

The WebGazer library is located in `/public/WebGazer/`:

```
/public/WebGazer/
├── webgazer.js              // Main library (compiled)
├── webgazer.js.map          // Source map
├── src/                     // Source files
│   ├── index.mjs
│   ├── facemesh.mjs
│   ├── mat.mjs
│   └── ...
├── www/                     # Example implementations
│   ├── calibration.html
│   ├── collision.html
│   ├── heatmap.html
│   └── js/
└── README.md
```

## Calibration Best Practices

1. **9-Point Calibration**

   - Most common calibration method
   - Covers full screen area
   - Provides good accuracy for typical use

2. **User Instructions**

   - "Look directly at the point"
   - "Click when you've focused on it"
   - Clear visual feedback on progress

3. **Accuracy Improvement**
   - Ensure good lighting conditions
   - Stable head position
   - Normal glasses/contacts usage

## Testing & Debugging

### Console Logging

```typescript
// Enable verbose logging
console.log("WebGazer ready:", ready);
console.log("Current gaze:", gazeData);
console.log("Tracked interactions:", trackingData.interactions);
console.log("Heatmap points:", trackingData.heatmapData.length);
```

### Browser DevTools

- **Elements**: Inspect deceptive UX components for class markers
- **Performance**: Monitor gaze update frequency
- **Console**: Check for WebGazer initialization messages

### Research Page Debug Info

The ResearchPage shows:

- Interaction count
- Gaze point count
- Accuracy percentage
- Real-time statistics

## Performance Considerations

1. **Gaze Update Frequency**

   - Approximately 30-60 updates per second
   - Use debouncing for expensive operations
   - Canvas clearing interval: 500ms

2. **Memory Management**

   - Heatmap data limited to recent points
   - Interaction history kept in memory
   - Export and clear periodically

3. **Browser Support**
   - Chrome/Chromium: ✓ Full support
   - Firefox: ✓ Full support
   - Safari: ✓ Full support (requires permission)
   - Edge: ✓ Full support

## Privacy & Ethics

### User Consent

- WebGazer requires explicit camera permission
- Display tracking indicator when active
- Provide clear opt-in/opt-out controls

### Data Usage

- All processing occurs client-side
- No video data transmitted to servers
- Users can export and delete their data

### Regulatory Compliance

- Complies with eye-tracking research ethics
- Transparent about tracking purpose
- Proper data handling procedures

## Troubleshooting

### WebGazer Not Loading

```typescript
// Check if script loaded
const wg = (window as any).webgazer;
if (!wg) {
  console.error("WebGazer failed to load");
  // Verify /public/WebGazer/webgazer.js exists
}
```

### Inaccurate Gaze Data

1. Recalibrate with 9-point calibration
2. Check lighting conditions
3. Verify camera permissions
4. Try different regression models

### Missing Deceptive Elements

Update selector patterns in `useDeceptiveUXTracking`:

```typescript
const deceptiveSelectors = [
  "[class*='deceptive']",
  "[class*='urgency']",
  "[class*='popup']",
  // Add more patterns
];
```

## Future Enhancements

- [ ] Machine learning-based urgency detection
- [ ] Multi-user heatmap aggregation
- [ ] Real-time A/B testing interface
- [ ] Advanced metrics (fixation duration, saccades)
- [ ] Visual attention prediction
- [ ] Deceptive pattern classification

## References

- [WebGazer.js Documentation](https://webgazer.cs.brown.edu)
- [WebGazer GitHub](https://github.com/brownhci/WebGazer)
- [API Docs](https://github.com/brownhci/WebGazer/wiki/Top-Level-API)
