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

/**
 * useEthicalUXTracking
 * A transparent attention-tracking hook intended for ethical research and UX improvements.
 * It focuses on elements explicitly marked opt-in for tracking (e.g. class `ethical` or
 * data attribute `data-ethical="true"`) rather than implicitly targeting pressure/urgency UI.
 */
export function useEthicalUXTracking(
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

  const getElementAtGazePoint = useCallback(
    (x: number, y: number): HTMLElement | null => {
      return document.elementFromPoint(x, y) as HTMLElement | null;
    },
    []
  );

  const updateHeatmap = useCallback((x: number, y: number) => {
    const existingPoint = heatmapRef.current.find(
      (p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10
    );
    if (existingPoint) {
      existingPoint.weight += 1;
    } else {
      heatmapRef.current.push({ x, y, weight: 1 });
    }
  }, []);

  const trackElementInteraction = useCallback(
    (
      element: HTMLElement,
      interactionType: ElementInteraction["interactionType"]
    ) => {
      const elementId =
        element.id ||
        element.className ||
        (element.getAttribute("data-ethical") ? "ethical-element" : "");
      if (!elementId) return;

      const existingInteraction = elementGazeMapRef.current.get(elementId);

      if (
        existingInteraction &&
        existingInteraction.interactionType === interactionType
      ) {
        existingInteraction.gazeExitTime = Date.now();
        existingInteraction.gazeDuration =
          (existingInteraction.gazeExitTime -
            existingInteraction.gazeEntryTime) /
          1000;
      } else {
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

  const recordClickEvent = useCallback(
    (element: HTMLElement, x: number, y: number) => {
      const elementId =
        element.id ||
        element.className ||
        (element.getAttribute("data-ethical") ? "ethical-element" : "");
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

  useEffect(() => {
    if (!active || !gazeData) return;

    const element = getElementAtGazePoint(gazeData.x, gazeData.y);
    if (!element) return;

    updateHeatmap(gazeData.x, gazeData.y);

    // Only consider elements that explicitly opted-in to ethical tracking
    const ethicalSelectors = ["[class*='ethical']", "[data-ethical='true']"];
    const isEthicalElement = ethicalSelectors.some((selector) =>
      element.closest(selector)
    );

    if (isEthicalElement) {
      trackElementInteraction(element, "view");
    }
  }, [
    gazeData,
    active,
    getElementAtGazePoint,
    updateHeatmap,
    trackElementInteraction,
  ]);

  useEffect(() => {
    if (!active) return;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollRef.current > 100) {
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

  const exportTrackingData = useCallback(
    () => ({ timestamp: Date.now(), ...trackingData }),
    [trackingData]
  );

  return { trackingData, recordClickEvent, clearTracking, exportTrackingData };
}
