import { useEffect, useState, useRef, useCallback } from "react";

export interface GazeData {
  x: number;
  y: number;
  timestamp: number;
}

export interface WebGazerConfig {
  regression?: "ridge" | "weightedRidge" | "threadedRidge";
  tracker?: "clmtrackr" | "facemesh";
  showVideo?: boolean;
  showPredictionPoints?: boolean;
  calibrationPoints?: number;
}

export function useWebGazer(
  active: boolean,
  onGazeUpdate?: (data: GazeData) => void,
  config?: WebGazerConfig
) {
  const [ready, setReady] = useState(false);
  const [gazeData, setGazeData] = useState<GazeData | null>(null);
  const [calibrationAccuracy, setCalibrationAccuracy] = useState<number | null>(
    null
  );
  const gazeListenerRef = useRef<((data: any) => void) | null>(null);

  const startCalibration = useCallback(
    (points: number = 9) => {
      const wg: any = (window as any).webgazer;
      if (!wg || !ready) return;

      console.log(`Starting ${points}-point calibration...`);
      // Trigger calibration UI - user needs to click on calibration points
      // This is handled by WebGazer's built-in calibration
    },
    [ready]
  );

  const endCalibration = useCallback(() => {
    const wg: any = (window as any).webgazer;
    if (!wg || !ready) return;

    // Calculate accuracy
    const accuracy = wg.getAccuracy?.();
    setCalibrationAccuracy(accuracy);
    console.log("Calibration accuracy:", accuracy);
  }, [ready]);

  const getAccuracy = useCallback(() => {
    const wg: any = (window as any).webgazer;
    return wg?.getAccuracy?.() || null;
  }, []);

  const recordDataPoint = useCallback(
    (x: number, y: number) => {
      const wg: any = (window as any).webgazer;
      if (!wg || !ready) return;

      // Record a data point for calibration
      wg.recordScreenPosition?.(x, y, "click");
    },
    [ready]
  );

  useEffect(() => {
    if (!active) return;

    console.log("🔵 WebGazer: Initializing...");

    const loadWebGazer = async () => {
      const g: any = (window as any).webgazer;

      // Check if WebGazer already exists (loaded via script tag in index.html)
      if (g) {
        console.log("✅ WebGazer found (globally loaded)");

        // If already initialized and ready
        if (g.isReady?.()) {
          console.log("✅ WebGazer already ready (from calibration)");

          // Apply config settings even if already ready
          // This ensures video/prediction points respect the config
          console.log("🟡 Applying config to existing WebGazer instance...");
          console.log("  - Show Video:", config?.showVideo ?? false);
          console.log(
            "  - Show Prediction Points:",
            config?.showPredictionPoints ?? false
          );

          g.showVideoPreview?.(config?.showVideo ?? false);
          g.showPredictionPoints?.(config?.showPredictionPoints ?? false);

          setReady(true);
          setupGazeListener(g);
          return;
        }

        // If exists but not ready, configure and start it
        console.log("🟡 Configuring WebGazer...");
        console.log("  - Regression:", config?.regression || "ridge");
        console.log("  - Tracker:", config?.tracker || "clmtrackr");
        console.log("  - Show Video:", config?.showVideo ?? false);
        console.log(
          "  - Show Prediction Points:",
          config?.showPredictionPoints ?? false
        );

        // Configure WebGazer
        g.setRegression?.(config?.regression || "ridge");
        g.setTracker?.(config?.tracker || "clmtrackr");
        g.showVideoPreview?.(config?.showVideo ?? false);
        g.showPredictionPoints?.(config?.showPredictionPoints ?? false);

        // Start tracking
        console.log("🟡 Starting tracking...");
        await g.begin?.();

        setupGazeListener(g);
        console.log("✅ WebGazer ready!");
        setReady(true);
        return;
      }

      // Fallback: Try loading dynamically if not already loaded
      console.log("🟡 WebGazer not found, attempting dynamic load...");
      const script = document.createElement("script");
      script.src = "/WebGazer/www/webgazer.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ Script loaded dynamically");
        const wg: any = (window as any).webgazer;
        if (!wg) {
          console.error("❌ WebGazer object not found after script load");
          return;
        }

        console.log("🟡 Configuring WebGazer...");
        console.log("  - Regression:", config?.regression || "ridge");
        console.log("  - Tracker:", config?.tracker || "clmtrackr");
        console.log("  - Show Video:", config?.showVideo ?? false);
        console.log(
          "  - Show Prediction Points:",
          config?.showPredictionPoints ?? false
        );

        // Configure WebGazer
        wg.setRegression?.(config?.regression || "ridge");
        wg.setTracker?.(config?.tracker || "clmtrackr");
        wg.showVideoPreview?.(config?.showVideo ?? false);
        wg.showPredictionPoints?.(config?.showPredictionPoints ?? false);

        // Start tracking
        console.log("🟡 Starting tracking...");
        wg.begin?.();

        setupGazeListener(wg);
        console.log("✅ WebGazer ready!");
        setReady(true);
      };

      // If the local file is missing, try loading from a reliable CDN as a fallback
      script.onerror = () => {
        console.warn(
          "⚠️ Failed to load local WebGazer script; attempting CDN fallback..."
        );

        const cdnScript = document.createElement("script");
        cdnScript.src = "https://unpkg.com/webgazer@3.4.0/dist/webgazer.js";
        cdnScript.async = true;
        cdnScript.onload = () => {
          console.log("✅ WebGazer loaded from CDN fallback");
          const wg: any = (window as any).webgazer;
          if (!wg) {
            console.error("❌ WebGazer object not found after CDN load");
            return;
          }

          wg.setRegression?.(config?.regression || "ridge");
          wg.setTracker?.(config?.tracker || "clmtrackr");
          wg.showVideoPreview?.(config?.showVideo ?? false);
          wg.showPredictionPoints?.(config?.showPredictionPoints ?? false);

          console.log("🟡 Starting tracking...");
          wg.begin?.();

          setupGazeListener(wg);
          console.log("✅ WebGazer ready!");
          setReady(true);
        };

        cdnScript.onerror = () => {
          console.error(
            "❌ Failed to load WebGazer from both local and CDN sources"
          );
        };

        document.body.appendChild(cdnScript);
      };

      document.body.appendChild(script);
    };

    const setupGazeListener = (wg: any) => {
      if (gazeListenerRef.current) {
        wg.removeGazeListener?.(gazeListenerRef.current);
      }

      gazeListenerRef.current = (data: any) => {
        if (!data) return;

        const gazePoint: GazeData = {
          x: data.x,
          y: data.y,
          timestamp: Date.now(),
        };

        setGazeData(gazePoint);
        onGazeUpdate?.(gazePoint);
      };

      wg.setGazeListener?.(gazeListenerRef.current);
    };

    loadWebGazer();

    return () => {
      try {
        const wg: any = (window as any).webgazer;
        if (wg && gazeListenerRef.current) {
          wg.removeGazeListener?.(gazeListenerRef.current);
        }
        wg?.pause?.();
      } catch (e) {
        console.error("Error cleaning up WebGazer:", e);
      }
    };
  }, [active]);

  return {
    ready,
    gazeData,
    calibrationAccuracy,
    startCalibration,
    endCalibration,
    getAccuracy,
    recordDataPoint,
  };
}
