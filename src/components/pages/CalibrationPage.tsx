import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

/** Minimal globals to keep TS calm */
declare global {
  interface Window {
    swal?: (opts: any) => Promise<any>;
    webgazer?: any;
  }
}

type Counts = Record<string, number>;

const DOTS = ["Pt1", "Pt2", "Pt3", "Pt4", "Pt5", "Pt6", "Pt7", "Pt8", "Pt9"];

const CalibrationPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 5 clicks per dot to complete
  const [counts, setCounts] = useState<Counts>(() =>
    DOTS.reduce((acc, id) => ((acc[id] = 0), acc), {} as Counts)
  );
  const totalCompleted = useMemo(
    () => DOTS.reduce((sum, id) => sum + (counts[id] >= 5 ? 1 : 0), 0),
    [counts]
  );

  /** Init WebGazer the React way */
  useEffect(() => {
    let canceled = false;

    const init = async () => {
      // Load only if present; your scripts are served from /public via index.html script tags
      const wg = window.webgazer;
      if (!wg) {
        console.log("⏳ Waiting for WebGazer to load...");
        // try again next frame until scripts load
        if (!canceled) requestAnimationFrame(init);
        return;
      }

      console.log("✅ WebGazer found, initializing calibration...");

      try {
        // begin if not already
        if (!wg.isReady || !wg.isReady()) {
          console.log("🟡 Starting WebGazer...");
          await wg.setRegression("ridge").saveDataAcrossSessions(true).begin();
          console.log("✅ WebGazer started successfully");
        } else {
          console.log("✅ WebGazer already running");
        }

        wg.showVideoPreview(true)
          .showPredictionPoints(true)
          .applyKalmanFilter(true);

        console.log("✅ Video preview enabled");

        // Canvas sizing like the demo
        const c = canvasRef.current;
        if (c) {
          c.width = window.innerWidth;
          c.height = window.innerHeight;
          c.style.position = "fixed";
          c.style.top = "0";
          c.style.left = "0";
        }

        // Show initial instruction (SweetAlert clone from the demo)
        if (window.swal) {
          await window.swal({
            title: "Calibration",
            text: "Click each of the 9 points 5 times. Each dot goes yellow after 5 clicks. Then we’ll measure accuracy.",
            buttons: { cancel: false, confirm: true },
          });
        }
      } catch {
        // ignore; we’ll still render the UI so the user can retry
      }
    };

    init();
    const onResize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      canceled = true;
      window.removeEventListener("resize", onResize);
      try {
        // don’t end() here; let the model persist across sessions
        // window.webgazer?.end();
      } catch {}
    };
  }, []);

  /** Helpers: store/stop collecting points for accuracy like the demo does */
  const storePointsOn = useCallback(() => {
    try {
      if (window.webgazer?.params) window.webgazer.params.storingPoints = true;
    } catch {}
  }, []);
  const storePointsOff = useCallback(() => {
    try {
      if (window.webgazer?.params) window.webgazer.params.storingPoints = false;
    } catch {}
  }, []);

  /** Precision calc ported 1:1 from the demo */
  const calculatePrecision = useCallback((past50: [number[], number[]]) => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const [x50, y50] = past50;

    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;

    const precisionPercentages = new Array<number>(50);
    for (let i = 0; i < 50; i++) {
      const xDiff = centerX - x50[i];
      const yDiff = centerY - y50[i];
      const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
      const half = windowHeight / 2;

      let precision = 0;
      if (distance <= half && distance > -1) {
        precision = 100 - (distance / half) * 100;
      } else if (distance > half) {
        precision = 0;
      } else if (distance > -1) {
        precision = 100;
      }
      precisionPercentages[i] = precision;
    }

    const avg = precisionPercentages.reduce((a, b) => a + b, 0) / 50;
    return Math.round(avg);
  }, []);

  /** After 9 dots complete: accuracy flow, then redirect */
  const runAccuracyAndFinish = useCallback(async () => {
    // Clear the canvas like the demo
    const cv = canvasRef.current;
    if (cv) cv.getContext("2d")?.clearRect(0, 0, cv.width, cv.height);

    if (window.swal) {
      await window.swal({
        title: "Calculating measurement",
        text: "Don’t move your mouse. Stare at the middle dot for 5 seconds while we measure accuracy.",
        closeOnEsc: false,
        allowOutsideClick: false,
        closeModal: true,
      });
    }

    // Gather last 50 points
    storePointsOn();
    await new Promise((r) => setTimeout(r, 5000));
    storePointsOff();

    const wg = window.webgazer;
    let precision = 0;
    try {
      const past50 = wg?.getStoredPoints?.() as [number[], number[]];
      if (past50 && past50[0]?.length >= 50) {
        precision = calculatePrecision(past50);
      }
    } catch {
      precision = 0;
    }

    // Update a small label like the navbar in the demo
    const accEl = document.getElementById("Accuracy");
    if (accEl) accEl.innerHTML = `<a>Accuracy | ${precision}%</a>`;

    if (window.swal) {
      const confirm = await window.swal({
        title: `Your accuracy measure is ${precision}%`,
        allowOutsideClick: false,
        buttons: { cancel: "Recalibrate", confirm: true },
      });

      if (!confirm) {
        // Recalibrate: reset counts and UI
        setCounts(DOTS.reduce((acc, id) => ((acc[id] = 0), acc), {} as Counts));
        return;
      }
    }

    try {
      wg?.saveDataAcrossSessions?.(true);
    } catch {}

    // ✅ Hide video preview and prediction points after calibration
    // Camera keeps running in background for predictions
    console.log("🔒 Hiding video preview and prediction points...");
    try {
      wg?.showVideoPreview?.(false);
      wg?.showPredictionPoints?.(false);
      console.log("✅ Video and prediction points hidden");
    } catch (e) {
      console.error("Error hiding video elements:", e);
    }

    localStorage.setItem("webgazerCalibrated", "true");
    navigate("/research");
  }, [calculatePrecision, navigate, storePointsOff, storePointsOn]);

  /** Click handler for each dot, recreating the demo’s 5-click logic */
  const onDotClick = useCallback(
    (id: string) => {
      setCounts((prev) => {
        const next = { ...prev };
        const cur = Math.min(5, (next[id] || 0) + 1);
        next[id] = cur;
        return next;
      });
    },
    [setCounts]
  );

  /** Derived helpers for dot styles the same way the demo does it */
  const dotStyle = (id: string): React.CSSProperties => {
    const c = counts[id] || 0;
    const opacity = Math.min(1, 0.2 * c + 0.2);
    const bg = c >= 5 ? "yellow" : "red"; // yellow after 5 clicks
    const display =
      totalCompleted >= 8 && id === "Pt5"
        ? undefined // show middle once 8 are done
        : id === "Pt5"
        ? "none"
        : undefined;
    return {
      backgroundColor: bg,
      opacity,
      display,
      pointerEvents: c >= 5 ? "none" : "auto",
    };
  };

  /** When all 9 done, run accuracy once */
  useEffect(() => {
    if (totalCompleted >= 9) {
      // hide all except middle like the demo
      // and then run accuracy flow
      runAccuracyAndFinish();
    }
  }, [totalCompleted, runAccuracyAndFinish]);

  return (
    <div
      style={{
        background: "#fff",
        color: "#000",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* The plotting canvas the demo sizes to window */}
      <canvas
        ref={canvasRef}
        id="plotting_canvas"
        width={500}
        height={500}
        style={{
          cursor: "crosshair",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />

      {/* Simple top bar with Accuracy like the demo */}
      <nav
        id="webgazerNavbar"
        className="navbar navbar-expand-lg navbar-default navbar-fixed-top"
        style={{ position: "relative", zIndex: 5 }}
      >
        <div className="container-fluid">
          <ul className="nav navbar-nav">
            <li id="Accuracy">
              <a>Not yet Calibrated</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* 9 calibration dots */}
      <div
        className="calibrationDiv"
        style={{ position: "relative", zIndex: 10 }}
      >
        {DOTS.map((id) => (
          <input
            key={id}
            id={id}
            type="button"
            className="Calibration"
            onClick={() => onDotClick(id)}
            style={dotStyle(id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CalibrationPage;
