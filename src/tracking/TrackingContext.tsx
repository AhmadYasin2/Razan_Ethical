import React, { createContext, useContext, useRef, ReactNode } from "react";
import { TrackingPoint, SessionData } from "./useUnifiedTracking";

interface TrackingContextType {
  gazePointsRef: React.MutableRefObject<TrackingPoint[]>;
  mousePointsRef: React.MutableRefObject<TrackingPoint[]>;
  startTimeRef: React.MutableRefObject<number>;
  pagesVisitedRef: React.MutableRefObject<Set<string>>;
  exportData: () => SessionData;
  clearData: () => void;
  getStats: () => {
    gazePointCount: number;
    mousePointCount: number;
    pagesVisited: string[];
  };
}

const TrackingContext = createContext<TrackingContextType | undefined>(
  undefined
);

export const useTrackingContext = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error("useTrackingContext must be used within TrackingProvider");
  }
  return context;
};

export const TrackingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const gazePointsRef = useRef<TrackingPoint[]>([]);
  const mousePointsRef = useRef<TrackingPoint[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const pagesVisitedRef = useRef<Set<string>>(new Set());

  const exportData = (): SessionData => {
    const endTime = Date.now();
    return {
      gazePoints: gazePointsRef.current,
      mousePoints: mousePointsRef.current,
      sessionInfo: {
        startTime: startTimeRef.current,
        endTime,
        duration: Math.floor((endTime - startTimeRef.current) / 1000),
        totalGazePoints: gazePointsRef.current.length,
        totalMousePoints: mousePointsRef.current.length,
        pagesVisited: Array.from(pagesVisitedRef.current),
      },
    };
  };

  const clearData = () => {
    gazePointsRef.current = [];
    mousePointsRef.current = [];
    pagesVisitedRef.current.clear();
    startTimeRef.current = Date.now();
  };

  const getStats = () => {
    return {
      gazePointCount: gazePointsRef.current.length,
      mousePointCount: mousePointsRef.current.length,
      pagesVisited: Array.from(pagesVisitedRef.current),
    };
  };

  return (
    <TrackingContext.Provider
      value={{
        gazePointsRef,
        mousePointsRef,
        startTimeRef,
        pagesVisitedRef,
        exportData,
        clearData,
        getStats,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};
