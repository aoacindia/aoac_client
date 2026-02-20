import React from "react";

interface LoadingOverlayProps {
  currentStep?: string;
}

export default function LoadingOverlay({ currentStep }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-lg bg-white px-6 py-4 text-center shadow-lg">
        <div className="text-sm font-medium text-gray-900">Processing...</div>
        {currentStep && (
          <div className="mt-1 text-xs text-gray-500">{currentStep}</div>
        )}
      </div>
    </div>
  );
}

