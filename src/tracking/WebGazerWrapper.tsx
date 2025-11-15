import { useEffect, ReactNode } from "react";
import { useAppContext } from "../components/AppContext";
import { useWebGazer } from "./useWebGazer";
import { useUnifiedTracking } from "./useUnifiedTracking";

interface WebGazerWrapperProps {
  children: ReactNode;
}

export const WebGazerWrapper: React.FC<WebGazerWrapperProps> = ({
  children,
}) => {
  const { state } = useAppContext();
  const isActive =
    state.webGazerSession.isActive && state.webGazerSession.isCalibrated;

  const { ready, gazeData } = useWebGazer(isActive, undefined, {
    showVideo: false,
    showPredictionPoints: false,
    regression: "ridge",
    tracker: "clmtrackr",
  });

  // Use unified tracking to capture gaze and mouse across ALL pages
  // This runs silently in the background while user browses the site
  useUnifiedTracking(ready && isActive, gazeData);

  useEffect(() => {
    if (isActive && ready && state.webGazerSession.modelData) {
      const wg = (window as any).webgazer;
      if (wg && wg.setRegression) {
        wg.setRegression(state.webGazerSession.modelData);
      }
    }
  }, [isActive, ready, state.webGazerSession.modelData]);

  return <>{children}</>;
};
