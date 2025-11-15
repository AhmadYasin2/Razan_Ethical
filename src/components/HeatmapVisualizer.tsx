import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TrackingPoint, SessionData } from "../tracking/useUnifiedTracking";
import { Button } from "./ui/button";
import { Upload, X, Eye, Mouse } from "lucide-react";
import { useAppContext } from "./AppContext";

interface HeatmapVisualizerProps {
  onClose?: () => void;
}

export const HeatmapVisualizer: React.FC<HeatmapVisualizerProps> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: appState, setHeatmapSessionData } = useAppContext();
  const sessionData = appState.heatmapVisualizer.sessionData;
  const [showGaze, setShowGaze] = useState(true);
  const [showMouse, setShowMouse] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>("/");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load session data from file
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(
            event.target?.result as string
          ) as SessionData;
          setHeatmapSessionData(data);

          // Set initial page to first visited page
          if (data.sessionInfo.pagesVisited.length > 0) {
            setCurrentPage(data.sessionInfo.pagesVisited[0]);
          }

          console.log("✅ Session data loaded:", data);
        } catch (err) {
          console.error("❌ Failed to parse session data:", err);
          alert("Failed to load session data. Please check the file format.");
        }
      };
      reader.readAsText(file);
    },
    []
  );

  // Draw heatmap on canvas
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sessionData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter points for current page
    const gazePointsForPage = sessionData.gazePoints.filter(
      (p: TrackingPoint) => p.page === currentPage
    );
    const mousePointsForPage = sessionData.mousePoints.filter(
      (p: TrackingPoint) => p.page === currentPage
    );

    console.log(
      `Drawing ${gazePointsForPage.length} gaze points and ${mousePointsForPage.length} mouse points for ${currentPage}`
    );

    // Draw gaze heatmap (red to yellow gradient)
    if (showGaze) {
      gazePointsForPage.forEach((point: TrackingPoint) => {
        // Use absoluteX/Y but offset by current scroll to show relative position
        const x = point.absoluteX - window.scrollX;
        const y = point.absoluteY - window.scrollY;

        // Create radial gradient - MUCH DARKER with high opacity throughout
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
        gradient.addColorStop(0, "rgba(255, 0, 0, 1)"); // Solid red center
        gradient.addColorStop(0.2, "rgba(255, 50, 0, 0.95)"); // Nearly solid orange
        gradient.addColorStop(0.5, "rgba(255, 150, 0, 0.85)"); // Very opaque orange-yellow
        gradient.addColorStop(0.8, "rgba(255, 255, 0, 0.7)"); // Still quite opaque yellow
        gradient.addColorStop(1, "rgba(255, 255, 0, 0.3)"); // Darker edge (not transparent)

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw mouse heatmap (blue to cyan gradient)
    if (showMouse) {
      mousePointsForPage.forEach((point: TrackingPoint) => {
        const x = point.absoluteX - window.scrollX;
        const y = point.absoluteY - window.scrollY;

        // Create radial gradient - MUCH DARKER with high opacity throughout
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
        gradient.addColorStop(0, "rgba(59, 130, 246, 1)"); // Solid blue center
        gradient.addColorStop(0.2, "rgba(34, 211, 238, 0.9)"); // Nearly solid cyan
        gradient.addColorStop(0.5, "rgba(100, 180, 255, 0.8)"); // Very opaque light blue
        gradient.addColorStop(0.8, "rgba(147, 197, 253, 0.65)"); // Still quite opaque
        gradient.addColorStop(1, "rgba(200, 230, 255, 0.35)"); // Darker edge (not transparent)

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [sessionData, currentPage, showGaze, showMouse]);

  // Update canvas size and redraw on window resize or scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawHeatmap();
    };

    updateCanvas();

    window.addEventListener("resize", updateCanvas);
    window.addEventListener("scroll", drawHeatmap);

    return () => {
      window.removeEventListener("resize", updateCanvas);
      window.removeEventListener("scroll", drawHeatmap);
    };
  }, [drawHeatmap]);

  // Redraw when filters change
  useEffect(() => {
    drawHeatmap();
  }, [showGaze, showMouse, currentPage, drawHeatmap]);

  // Sync current page with actual location
  useEffect(() => {
    if (location.pathname !== currentPage) {
      setCurrentPage(location.pathname);
    }
  }, [location.pathname]);

  // Handle page change - navigate to that page
  const handlePageChange = (newPage: string) => {
    setCurrentPage(newPage);
    navigate(newPage);
  };

  if (!sessionData) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "28rem",
            width: "100%",
            margin: "0 16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid #334155",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
                margin: 0,
              }}
            >
              Load Session Data
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X style={{ width: "24px", height: "24px" }} />
              </button>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                color: "#cbd5e1",
                marginBottom: "16px",
                lineHeight: "1.5",
              }}
            >
              Upload a previously saved session JSON file to visualize the
              heatmap data across the website.
            </p>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #475569",
                borderRadius: "8px",
                padding: "32px",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#64748b")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#475569")
              }
            >
              <Upload
                style={{
                  width: "48px",
                  height: "48px",
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              />
              <span style={{ color: "#cbd5e1", fontSize: "1rem" }}>
                Click to upload session file
              </span>
              <span
                style={{
                  color: "#64748b",
                  fontSize: "0.875rem",
                  marginTop: "4px",
                }}
              >
                JSON format
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Heatmap canvas overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          mixBlendMode: "screen",
          zIndex: 40,
        }}
      />

      {/* Control panel */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          backgroundColor: "rgba(30, 41, 59, 0.95)",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
          border: "1px solid #334155",
          maxWidth: "24rem",
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "bold",
              color: "white",
              margin: 0,
            }}
          >
            Heatmap Controls
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X style={{ width: "20px", height: "20px" }} />
            </button>
          )}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "white",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showGaze}
                onChange={(e) => setShowGaze(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              <Eye style={{ width: "16px", height: "16px" }} />
              <span>Gaze (Red)</span>
            </label>
            <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              {sessionData.sessionInfo.totalGazePoints} pts
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "white",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showMouse}
                onChange={(e) => setShowMouse(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              <Mouse style={{ width: "16px", height: "16px" }} />
              <span>Mouse (Blue)</span>
            </label>
            <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              {sessionData.sessionInfo.totalMousePoints} pts
            </span>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#cbd5e1",
              marginBottom: "8px",
            }}
          >
            Page:
          </label>
          <select
            value={currentPage}
            onChange={(e) => handlePageChange(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "#334155",
              color: "white",
              borderRadius: "6px",
              padding: "8px 12px",
              border: "1px solid #475569",
              cursor: "pointer",
            }}
          >
            {sessionData.sessionInfo.pagesVisited.map((page: string) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            color: "#94a3b8",
            marginBottom: "16px",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            Duration: {sessionData.sessionInfo.duration}s
          </div>
          <div>
            Started:{" "}
            {new Date(sessionData.sessionInfo.startTime).toLocaleString()}
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid #334155",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
            Navigate to different pages to see their heatmaps. The visualization
            adjusts for scroll position.
          </p>
        </div>
      </div>
    </>
  );
};
