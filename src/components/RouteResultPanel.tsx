import React, { useState } from 'react';
import { Bus, Train, Footprints, ChevronDown, Navigation, Accessibility, ArrowRight, ShieldCheck, ChevronUp, MapPin } from 'lucide-react';
import { TransitOption, AccessibilityFacility } from '../types';

interface RouteResultPanelProps {
  isOpen: boolean;
  onClose: () => void;
  options: TransitOption[];
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  onStartNavigation: () => void;
  onFocusFacility?: (facility: AccessibilityFacility) => void;
}

export const RouteResultPanel: React.FC<RouteResultPanelProps> = ({
  isOpen,
  onClose,
  options,
  selectedOptionId,
  onSelectOption,
  onStartNavigation,
  onFocusFacility,
}) => {
  const [showFacilityList, setShowFacilityList] = useState(true);

  if (!isOpen) return null;

  const currentOption = options.find((o) => o.id === selectedOptionId) || options[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'elevator':
        return <i className="fa-solid fa-elevator text-blue-600 text-sm" />;
      case 'escalator':
        return <i className="fa-solid fa-stairs text-indigo-600 text-sm" />;
      case 'slope':
        return <i className="fa-solid fa-angle-up text-emerald-600 text-sm" />;
      case 'obstacle':
        return <i className="fa-solid fa-triangle-exclamation text-red-500 text-sm" />;
      case 'braille':
        return <i className="fa-solid fa-braille text-amber-600 text-sm" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'elevator':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'escalator':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'slope':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'obstacle':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'braille':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="overlay-panel bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.18)] transition-transform duration-300 flex flex-col max-h-[80vh] max-w-lg mx-auto right-0 border-t border-gray-100">
      <div className="p-4 sm:p-5 flex flex-col h-full overflow-hidden">
        {/* Handle bar */}
        <div 
          className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 cursor-pointer hover:bg-gray-400 transition shrink-0" 
          onClick={onClose} 
        />

        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-blue-600" />
            추천 무장애 대중교통 경로
          </h3>
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 검증된 경로
          </span>
        </div>

        {/* Route options list */}
        <div className="overflow-y-auto hide-scroll flex-1 space-y-3 pr-1 pb-2">
          {options.map((opt) => {
            const isSelected = opt.id === selectedOptionId;
            return (
              <div
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className={`rounded-2xl p-4 cursor-pointer transition relative overflow-hidden border ${
                  isSelected
                    ? 'border-2 border-blue-500 bg-blue-50/30 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Left accent indicator */}
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${
                    isSelected ? 'bg-blue-600' : 'bg-transparent'
                  }`}
                />

                <div className="flex justify-between items-start mb-2 pl-2">
                  <div>
                    <span className={`${opt.badgeColor} text-white text-[11px] font-bold px-2 py-0.5 rounded mr-1.5 inline-block`}>
                      {opt.badge}
                    </span>
                    <span className="font-extrabold text-gray-900 text-lg">
                      약 {opt.timeMinutes}분
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-700 block">{opt.cost}</span>
                    {opt.arrivalTime && (
                      <span className="text-red-500 text-xs font-medium block">{opt.arrivalTime}</span>
                    )}
                  </div>
                </div>

                {/* Steps */}
                <div className="pl-2 text-sm text-gray-600 flex items-center gap-1.5 mb-2.5 flex-wrap">
                  {opt.steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <span className="flex items-center gap-1 font-medium text-gray-800">
                        {step.icon === 'foot' && <Footprints className="w-3.5 h-3.5 text-gray-500" />}
                        {step.icon === 'subway' && <Train className="w-3.5 h-3.5 text-blue-500" />}
                        {step.icon === 'bus' && <Bus className="w-3.5 h-3.5 text-green-500" />}
                        {step.text}
                      </span>
                      {idx < opt.steps.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Feature tags */}
                <div className="pl-2 flex gap-1.5 flex-wrap">
                  {opt.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-medium border border-gray-200/80"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Route Accessibility Facility & Obstacle Detailed Breakdown */}
          {currentOption && currentOption.facilities && currentOption.facilities.length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80">
              <div 
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setShowFacilityList(!showFacilityList)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <i className="fa-solid fa-wheelchair text-blue-600" />
                    경로 내 무장애 시설 및 장애물 현황 ({currentOption.facilities.length}개)
                  </span>
                </div>
                <button className="text-gray-500 text-xs flex items-center gap-1 font-medium">
                  {showFacilityList ? (
                    <>접기 <ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <>펼치기 <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>

              {showFacilityList && (
                <div className="mt-3 space-y-2 pt-2 border-t border-gray-200/60">
                  {currentOption.facilities.map((fac) => (
                    <div
                      key={fac.id}
                      onClick={() => onFocusFacility && onFocusFacility(fac)}
                      className="bg-white rounded-xl p-2.5 border border-gray-200 flex items-start gap-2.5 cursor-pointer hover:border-blue-300 hover:shadow-2xs transition group"
                    >
                      <div className="p-1.5 rounded-lg bg-gray-50 shrink-0 mt-0.5 border border-gray-100">
                        {getCategoryIcon(fac.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                            {fac.name}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border shrink-0 ${getCategoryBadgeClass(
                              fac.category
                            )}`}
                          >
                            {fac.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                          {fac.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onStartNavigation}
            className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl active:bg-blue-700 hover:bg-blue-700 transition shadow-md text-base flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5 fill-current" />
            선택 경로 안내 시작
          </button>
          <button
            onClick={onClose}
            className="w-14 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl active:bg-gray-200 hover:bg-gray-200 border border-gray-200 flex items-center justify-center transition"
            title="닫기"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
