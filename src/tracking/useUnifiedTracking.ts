import { useEffect, useCallback } from "react";
import { GazeData } from "./useWebGazer";
import { useTrackingContext } from "./TrackingContext";

export interface TrackingPoint {
  x: number;
  y: number;
  timestamp: number;
  type: "gaze" | "mouse";
  page: string; // URL path
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  // Absolute position considering scroll
  absoluteX: number;
  absoluteY: number;
}

export interface SessionData {
  gazePoints: TrackingPoint[];
  mousePoints: TrackingPoint[];
  sessionInfo: {
    startTime: number;
    endTime: number;
    duration: number;
    totalGazePoints: number;
    totalMousePoints: number;
    pagesVisited: string[];
  };
}

export function useUnifiedTracking(active: boolean, gazeData: GazeData | null) {
  const {
    gazePointsRef,
    mousePointsRef,
    pagesVisitedRef,
    exportData,
    clearData,
    getStats,
  } = useTrackingContext();

  // Helper to create tracking point with all context
  const createTrackingPoint = useCallback(
    (x: number, y: number, type: "gaze" | "mouse"): TrackingPoint => {
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      const page = window.location.pathname;

      // Track pages visited
      pagesVisitedRef.current.add(page);

      return {
        x,
        y,
        timestamp: Date.now(),
        type,
        page,
        scrollX,
        scrollY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        // Absolute position on the full page
        absoluteX: x + scrollX,
        absoluteY: y + scrollY,
      };
    },
    []
  );

  // Track gaze points
  useEffect(() => {
    if (!active || !gazeData) return;

    const point = createTrackingPoint(gazeData.x, gazeData.y, "gaze");
    gazePointsRef.current.push(point);

    // Debug logging every 100 points
    if (gazePointsRef.current.length % 100 === 0) {
      console.log(
        `📊 Tracking: ${gazePointsRef.current.length} gaze points, ${mousePointsRef.current.length} mouse points`
      );
    }

    // Limit stored points to prevent memory issues
    if (gazePointsRef.current.length > 50000) {
      gazePointsRef.current = gazePointsRef.current.slice(-40000);
    }
  }, [active, gazeData, createTrackingPoint, gazePointsRef, mousePointsRef]);

  // Track mouse movement
  useEffect(() => {
    if (!active) return;

    let lastMouseTime = 0;
    const MOUSE_THROTTLE = 50; // ms - capture mouse every 50ms

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseTime < MOUSE_THROTTLE) return;
      lastMouseTime = now;

      const point = createTrackingPoint(e.clientX, e.clientY, "mouse");
      mousePointsRef.current.push(point);

      // Limit stored points
      if (mousePointsRef.current.length > 50000) {
        mousePointsRef.current = mousePointsRef.current.slice(-40000);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [active, createTrackingPoint]);

  return {
    exportData,
    clearData,
    getStats,
  };
}
