import React from 'react';
import { MapPin, Flag, Navigation, Route, Loader2 } from 'lucide-react';

interface SearchPanelProps {
  startInput: string;
  setStartInput: (val: string) => void;
  endInput: string;
  setEndInput: (val: string) => void;
  onSearchPlace: (type: 'start' | 'end') => void;
  onGetCurrentLocation: () => void;
  onFindRoute: () => void;
  isLoading: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  startInput,
  setStartInput,
  endInput,
  setEndInput,
  onSearchPlace,
  onGetCurrentLocation,
  onFindRoute,
  isLoading,
}) => {
  return (
    <div className="overlay-panel top-0 left-0 w-full p-4 bg-gradient-to-b from-white/95 to-transparent pointer-events-none">
      <div className="bg-white rounded-2xl shadow-lg p-3.5 flex flex-col gap-3 border border-gray-100 pointer-events-auto max-w-lg mx-auto backdrop-blur-sm">
        {/* 출발지 입력 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            placeholder="출발지 (입력 후 Enter 또는 지도 터치)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition"
            onKeyDown={(e) => e.key === 'Enter' && onSearchPlace('start')}
          />
          <button
            onClick={onGetCurrentLocation}
            className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg shadow-xs flex items-center justify-center active:bg-blue-100 hover:bg-blue-100/80 transition shrink-0"
            title="내 위치"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* 도착지 입력 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            placeholder="도착지 (입력 후 Enter 또는 지도 터치)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-red-500 focus:bg-white transition"
            onKeyDown={(e) => e.key === 'Enter' && onSearchPlace('end')}
          />
        </div>

        {/* 경로 탐색 버튼 */}
        <button
          onClick={onFindRoute}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl active:bg-blue-700 hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-70 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              무장애 경로 분석 중...
            </>
          ) : (
            <>
              <Route className="w-5 h-5" />
              무장애 경로 탐색
            </>
          )}
        </button>
      </div>
    </div>
  );
};
