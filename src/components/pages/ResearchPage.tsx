import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWebGazer, type GazeData } from "../../tracking/useWebGazer";
import { useUnifiedTracking } from "../../tracking/useUnifiedTracking";
import { useAppContext } from "../AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Square as StopIcon,
  Play,
  Upload,
} from "lucide-react";

const ResearchPage: React.FC = () => {
  const {
    state,
    startWebGazerSession,
    endWebGazerSession,
    setWebGazerCalibrated,
    openHeatmapVisualizer,
  } = useAppContext(); // ✅ inside component

  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stats, setStats] = useState({
    totalGazePoints: 0,
    totalMousePoints: 0,
    sessionDuration: 0,
  }); // Activate WebGazer only when session is active + calibrated
  const { ready, gazeData } = useWebGazer(
    state.webGazerSession.isActive && state.webGazerSession.isCalibrated,
    undefined, // No callback needed, tracking happens in useUnifiedTracking
    {
      showVideo: false,
      showPredictionPoints: false,
      regression: "ridge",
      tracker: "clmtrackr",
    }
  );

  // Use unified tracking for both gaze and mouse
  const { exportData, clearData, getStats } = useUnifiedTracking(
    state.webGazerSession.isActive && state.webGazerSession.isCalibrated,
    gazeData
  );

  // Keep stats synced with tracking data
  useEffect(() => {
    if (!state.webGazerSession.isActive) return;

    const interval = setInterval(() => {
      const trackingStats = getStats();
      setStats((prev) => ({
        ...prev,
        totalGazePoints: trackingStats.gazePointCount,
        totalMousePoints: trackingStats.mousePointCount,
      }));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [state.webGazerSession.isActive, getStats]);

  // Session duration ticker
  useEffect(() => {
    if (!state.webGazerSession.startTime) return;
    const interval = setInterval(() => {
      const duration = Math.floor(
        (Date.now() - state.webGazerSession.startTime!) / 1000
      );
      setStats((prev) => ({ ...prev, sessionDuration: duration }));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.webGazerSession.startTime]);

  // Flow A: handle return from external calibration page
  useEffect(() => {
    const calibrated = localStorage.getItem("webgazerCalibrated") === "true";

    if (calibrated) {
      // consume the flag once
      localStorage.removeItem("webgazerCalibrated");

      // Start session if not already active
      if (!state.webGazerSession.isActive) {
        startWebGazerSession();
      }

      // Mark calibrated if not already
      if (!state.webGazerSession.isCalibrated) {
        setWebGazerCalibrated();
      }
    }
  }, [
    state.webGazerSession.isActive,
    state.webGazerSession.isCalibrated,
    startWebGazerSession,
    setWebGazerCalibrated,
  ]);

  const handleStartSession = useCallback(() => {
    startWebGazerSession(); // Set isActive = true
    navigate("/calibration"); // ✅ Proper SPA route
  }, [startWebGazerSession, navigate]);

  const handleEndSession = useCallback(() => {
    // Export all tracking data
    const sessionData = exportData();

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webgazer-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    clearData();
    endWebGazerSession();
    setStats({ totalGazePoints: 0, totalMousePoints: 0, sessionDuration: 0 });
    navigate("/");
  }, [exportData, clearData, endWebGazerSession, navigate]);

  // Canvas size once
  useEffect(() => {
    const c = canvasRef.current;
    if (c) {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }
  }, []);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <div className="px-4 p-4 text-gray-100 bg-slate-900 min-h-screen">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 pointer-events-none z-40"
      />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Eye className="inline-block" /> UX Research Mode
        </h1>
        <p className="text-slate-400 mb-8">
          Gaze tracking and deceptive UX analysis.
        </p>

        <div className="mb-8 p-4 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-3">
          {state.webGazerSession.isActive ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-green-400 font-semibold">
                Tracking Active
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              <span className="text-yellow-400">Tracking Inactive</span>
            </>
          )}
        </div>

        {!state.webGazerSession.isActive ? (
          <Button
            onClick={handleStartSession}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 mb-8"
          >
            <Play className="h-4 w-4" /> Start Session
          </Button>
        ) : (
          <Button
            onClick={handleEndSession}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2 mb-8"
          >
            <StopIcon className="h-4 w-4" /> End Session
          </Button>
        )}

        {state.webGazerSession.isActive && gazeData && (
          <div className="mb-8 p-6 rounded-lg bg-slate-800 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Live Gaze</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400">X px</p>
                <p className="text-2xl font-mono text-green-400">
                  {gazeData.x.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Y px</p>
                <p className="text-2xl font-mono text-green-400">
                  {gazeData.y.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {state.webGazerSession.isActive && (
          <div className="mb-8 p-6 rounded-lg bg-slate-800 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Session Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-700/60 rounded">
                <p className="text-slate-400 text-sm">Duration</p>
                <p className="text-xl font-mono text-blue-400">
                  {formatTime(stats.sessionDuration)}
                </p>
              </div>
              <div className="p-4 bg-slate-700/60 rounded">
                <p className="text-slate-400 text-sm">Gaze Points</p>
                <p className="text-xl font-bold text-red-400">
                  {stats.totalGazePoints}
                </p>
              </div>
              <div className="p-4 bg-slate-700/60 rounded">
                <p className="text-slate-400 text-sm">Mouse Points</p>
                <p className="text-xl font-bold text-blue-400">
                  {stats.totalMousePoints}
                </p>
              </div>
            </div>
          </div>
        )}

        {!state.webGazerSession.isActive && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Load Session Data
            </h2>
            <p className="text-slate-400 mb-4">
              Upload a previously saved session file to visualize heatmap data
              across the entire website.
            </p>
            <Button
              onClick={openHeatmapVisualizer}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" /> Load & Visualize Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchPage;
