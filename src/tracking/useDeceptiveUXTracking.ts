import { useEffect, useState, useRef, useCallback } from "react";
import { GazeData } from "./useWebGazer";

export interface ElementInteraction {
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

export interface UXTrackingData {
  interactions: ElementInteraction[];
  totalGazeTime: number;
  heatmapData: Array<{ x: number; y: number; weight: number }>;
  scrollEvents: Array<{ timestamp: number; scrollY: number }>;
}

export function useDeceptiveUXTracking(
  active: boolean,
  gazeData: GazeData | null
) {
  const [trackingData, setTrackingData] = useState<UXTrackingData>({
    interactions: [],
    totalGazeTime: 0,
    heatmapData: [],
    scrollEvents: [],
  });

  const elementGazeMapRef = useRef<Map<string, ElementInteraction>>(new Map());
  const heatmapRef = useRef<Array<{ x: number; y: number; weight: number }>>(
    []
  );
  const lastScrollRef = useRef<number>(0);

  // Track which element is under the gaze point
  const getElementAtGazePoint = useCallback(
    (x: number, y: number): HTMLElement | null => {
      return document.elementFromPoint(x, y) as HTMLElement | null;
    },
    []
  );

  // Update heatmap with current gaze point
  const updateHeatmap = useCallback((x: number, y: number) => {
    // Add gaze point to heatmap with a weight
    const existingPoint = heatmapRef.current.find(
      (p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10
    );

    if (existingPoint) {
      existingPoint.weight += 1;
    } else {
      heatmapRef.current.push({ x, y, weight: 1 });
    }
  }, []);

  // Track interaction with a specific element
  const trackElementInteraction = useCallback(
    (
      element: HTMLElement,
      interactionType: ElementInteraction["interactionType"]
    ) => {
      const elementId = element.id || element.className;
      if (!elementId) return;

      const existingInteraction = elementGazeMapRef.current.get(elementId);

      if (
        existingInteraction &&
        existingInteraction.interactionType === interactionType
      ) {
        // Update existing interaction
        existingInteraction.gazeExitTime = Date.now();
        existingInteraction.gazeDuration =
          (existingInteraction.gazeExitTime -
            existingInteraction.gazeEntryTime) /
          1000;
      } else {
        // Create new interaction
        const newInteraction: ElementInteraction = {
          elementId,
          elementType: element.tagName,
          gazeEntryTime: Date.now(),
          gazeExitTime: null,
          gazeDuration: 0,
          interactionType,
          gazeStartPosition: gazeData || undefined,
        };

        elementGazeMapRef.current.set(elementId, newInteraction);
      }
    },
    [gazeData]
  );

  // Record a click event
  const recordClickEvent = useCallback(
    (element: HTMLElement, x: number, y: number) => {
      const elementId = element.id || element.className;
      const interaction: ElementInteraction = {
        elementId,
        elementType: element.tagName,
        gazeEntryTime: Date.now(),
        gazeExitTime: Date.now(),
        gazeDuration: 0,
        interactionType: "click",
        clickPosition: { x, y },
        gazeStartPosition: gazeData || undefined,
      };

      const existingInteractions = Array.from(
        elementGazeMapRef.current.values()
      );
      setTrackingData((prev) => ({
        ...prev,
        interactions: [...existingInteractions, interaction],
      }));
    },
    [gazeData]
  );

  // Update tracking data periodically
  useEffect(() => {
    if (!active || !gazeData) return;

    const element = getElementAtGazePoint(gazeData.x, gazeData.y);
    if (!element) return;

    updateHeatmap(gazeData.x, gazeData.y);

    // Identify deceptive UX elements
    const deceptiveSelectors = [
      "[class*='deceptive']",
      "[class*='urgency']",
      "[class*='popup']",
      "[class*='banner']",
      "[class*='pressure']",
      "button:has(.animate-pulse)",
    ];

    const isDeceptiveElement = deceptiveSelectors.some((selector) =>
      element.closest(selector)
    );

    if (isDeceptiveElement) {
      trackElementInteraction(element, "view");
    }
  }, [
    gazeData,
    active,
    getElementAtGazePoint,
    updateHeatmap,
    trackElementInteraction,
  ]);

  // Track scroll events
  useEffect(() => {
    if (!active) return;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollRef.current > 100) {
        // Debounce scroll events
        setTrackingData((prev) => ({
          ...prev,
          scrollEvents: [
            ...prev.scrollEvents,
            { timestamp: now, scrollY: window.scrollY },
          ],
        }));
        lastScrollRef.current = now;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [active]);

  // Update heatmap in tracking data
  useEffect(() => {
    setTrackingData((prev) => ({
      ...prev,
      heatmapData: heatmapRef.current,
      interactions: Array.from(elementGazeMapRef.current.values()),
    }));
  }, [gazeData]);

  const clearTracking = useCallback(() => {
    elementGazeMapRef.current.clear();
    heatmapRef.current = [];
    setTrackingData({
      interactions: [],
      totalGazeTime: 0,
      heatmapData: [],
      scrollEvents: [],
    });
  }, []);

  const exportTrackingData = useCallback(() => {
    return {
      timestamp: Date.now(),
      ...trackingData,
    };
  }, [trackingData]);

  return {
    trackingData,
    recordClickEvent,
    clearTracking,
    exportTrackingData,
  };
}
