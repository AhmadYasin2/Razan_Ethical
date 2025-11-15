import { useEffect, useRef, useCallback } from "react";
import { GazeData } from "./useWebGazer";

interface HeatmapPoint {
  x: number;
  y: number;
  timestamp: number;
  intensity: number;
}

export function useHeatmapTracking(active: boolean, gazeData: GazeData | null) {
  const heatmapPointsRef = useRef<HeatmapPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const addHeatmapPoint = useCallback((x: number, y: number) => {
    const point: HeatmapPoint = {
      x,
      y,
      timestamp: Date.now(),
      intensity: 1,
    };

    const existingIndex = heatmapPointsRef.current.findIndex(
      (p) => Math.abs(p.x - x) < 20 && Math.abs(p.y - y) < 20
    );

    if (existingIndex !== -1) {
      heatmapPointsRef.current[existingIndex].intensity += 0.5;
      heatmapPointsRef.current[existingIndex].timestamp = Date.now();
    } else {
      heatmapPointsRef.current.push(point);
    }

    if (heatmapPointsRef.current.length > 5000) {
      heatmapPointsRef.current = heatmapPointsRef.current.slice(-4000);
    }
  }, []);

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    heatmapPointsRef.current.forEach((point) => {
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        30 * Math.min(point.intensity, 3)
      );

      const alpha = Math.min(0.3 * point.intensity, 0.6);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(255, 165, 0, ${alpha * 0.6})`);
      gradient.addColorStop(1, "rgba(255, 255, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - 40, point.y - 40, 80, 80);
    });
  }, []);

  useEffect(() => {
    if (!active || !gazeData) return;

    addHeatmapPoint(gazeData.x, gazeData.y);
  }, [active, gazeData, addHeatmapPoint]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const interval = setInterval(drawHeatmap, 100);

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, drawHeatmap]);

  const getHeatmapData = useCallback(() => {
    return heatmapPointsRef.current.map((p) => ({
      x: p.x,
      y: p.y,
      intensity: p.intensity,
      timestamp: p.timestamp,
    }));
  }, []);

  const clearHeatmap = useCallback(() => {
    heatmapPointsRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  return {
    canvasRef,
    getHeatmapData,
    clearHeatmap,
    pointCount: heatmapPointsRef.current.length,
  };
}
