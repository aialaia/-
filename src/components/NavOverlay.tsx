import React from 'react';
import { Radio, Volume2, AlertTriangle } from 'lucide-react';

interface NavOverlayProps {
  isNavigating: boolean;
  directionText: string;
  subText: string;
  onStopNavigation: () => void;
  onOpenReportModal: () => void;
}

export const NavOverlay: React.FC<NavOverlayProps> = ({
  isNavigating,
  directionText,
  subText,
  onStopNavigation,
  onOpenReportModal,
}) => {
  if (!isNavigating) return null;

  return (
    <>
      {/* Navigation Top Info Banner */}
      <div className="overlay-panel top-4 left-4 right-4 bg-green-600 text-white rounded-2xl shadow-xl p-4 flex flex-col items-center border-2 border-green-500 max-w-lg mx-auto z-[1001]">
        <div className="flex w-full justify-between items-center mb-1.5">
          <div className="text-xs font-semibold opacity-90 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-green-200" />
            실시간 무장애 안내 중
          </div>
          <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
            <Volume2 className="w-3.5 h-3.5" /> 음성 켜짐
          </div>
        </div>
        <div className="text-2xl font-extrabold mb-1 tracking-tight text-center">
          {directionText}
        </div>
        <div className="text-sm text-green-100 font-medium text-center">
          {subText}
        </div>
      </div>

      {/* Navigation Bottom Actions */}
      <div className="overlay-panel bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg flex gap-3 z-[1001]">
        <button
          onClick={onStopNavigation}
          className="flex-1 bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg text-lg active:bg-red-600 hover:bg-red-600 transition"
        >
          안내 종료
        </button>
        <button
          onClick={onOpenReportModal}
          className="w-16 bg-amber-400 text-gray-900 font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center text-xl active:bg-amber-500 hover:bg-amber-500 transition"
          title="장애물 제보"
        >
          <AlertTriangle className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};
