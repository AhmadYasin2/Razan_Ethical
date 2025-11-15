import React from "react";

export const CalibrationIframe: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black flex justify-center items-center">
      <iframe
        src="/WebGazer/www/index.html"
        title="WebGazer Demo"
        className="w-full h-full border-0"
        allow="camera; microphone"
      />
    </div>
  );
};
