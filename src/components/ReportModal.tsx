import React, { useState } from 'react';
import { Megaphone, AlertCircle, MapPin, Navigation, Crosshair } from 'lucide-react';
import { Coordinates } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: Coordinates | null;
  startCoords: Coordinates | null;
  endCoords: Coordinates | null;
  startName?: string;
  endName?: string;
  onSubmitReport: (
    status: 'yes' | 'no',
    nickname: string,
    issueType: string,
    locationName: string,
    coords: Coordinates,
    description?: string
  ) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  currentCoords,
  startCoords,
  endCoords,
  startName,
  endName,
  onSubmitReport,
}) => {
  const [reportStatus, setReportStatus] = useState<'yes' | 'no'>('no');
  const [locationChoice, setLocationChoice] = useState<'current' | 'start' | 'end' | 'custom'>('current');
  const [customLocationName, setCustomLocationName] = useState('');
  const [nickname, setNickname] = useState('');
  const [issueType, setIssueType] = useState('엘리베이터 고장/미작동');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const getLocationCoordsAndName = (): { coords: Coordinates; name: string } => {
    if (locationChoice === 'start' && startCoords) {
      return { coords: startCoords, name: startName || '출발지' };
    }
    if (locationChoice === 'end' && endCoords) {
      return { coords: endCoords, name: endName || '도착지' };
    }
    if (currentCoords) {
      return {
        coords: currentCoords,
        name: customLocationName.trim() || '현재 위치 주변',
      };
    }
    return {
      coords: { lat: 37.5665, lng: 126.978 },
      name: customLocationName.trim() || '서울 중심 지역',
    };
  };

  const handleSubmit = () => {
    const { coords, name } = getLocationCoordsAndName();
    const finalLocationName = customLocationName.trim() || name;

    onSubmitReport(
      reportStatus,
      nickname.trim() || '익명 제보자',
      issueType,
      finalLocationName,
      coords,
      description.trim()
    );

    // Reset fields
    setReportStatus('no');
    setCustomLocationName('');
    setNickname('');
    setDescription('');
    setIssueType('엘리베이터 고장/미작동');
  };

  return (
    <div className="overlay-panel inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs z-[2000]">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto hide-scroll">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-extrabold flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-4 h-4" />
            </div>
            장애물/시설물 제보하기
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {/* 1. Location Selection */}
        <div className="mb-5 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
          <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            제보 위치 선택
          </label>

          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            <button
              type="button"
              onClick={() => setLocationChoice('current')}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                locationChoice === 'current'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              현재 위치 (GPS)
            </button>

            {startCoords && (
              <button
                type="button"
                onClick={() => setLocationChoice('start')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border truncate ${
                  locationChoice === 'start'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                출발지
              </button>
            )}

            {endCoords && (
              <button
                type="button"
                onClick={() => setLocationChoice('end')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border truncate ${
                  locationChoice === 'end'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                도착지
              </button>
            )}

            <button
              type="button"
              onClick={() => setLocationChoice('custom')}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                locationChoice === 'custom'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <i className="fa-solid fa-pen text-xs" />
              직접 명칭 입력
            </button>
          </div>

          <input
            type="text"
            value={customLocationName}
            onChange={(e) => setCustomLocationName(e.target.value)}
            placeholder="상세 위치명 입력 (예: 서울역 1번 출구 엘리베이터 앞)"
            className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 2. Status & Issue Type */}
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2 text-gray-800">
            해당 위치의 이동 상태
          </label>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setReportStatus('no')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border-2 flex items-center justify-center gap-1.5 ${
                reportStatus === 'no'
                  ? 'bg-red-500 text-white border-red-500 shadow-xs'
                  : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <i className="fa-solid fa-triangle-exclamation" />
              불편 / 장애물 있음
            </button>
            <button
              type="button"
              onClick={() => setReportStatus('yes')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border-2 flex items-center justify-center gap-1.5 ${
                reportStatus === 'yes'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <i className="fa-solid fa-circle-check" />
              원활 / 개선 완료
            </button>
          </div>

          <div className="space-y-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
            <div>
              <label className="block text-[11px] font-bold mb-1 text-gray-700">
                구분 항목
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-xs font-medium text-gray-900 outline-none focus:border-blue-500"
              >
                <option value="엘리베이터 고장/미작동">엘리베이터 고장/미작동</option>
                <option value="높은 단차/계단 있음">높은 단차/계단 있음</option>
                <option value="경사로 가파름/미설치">경사로 가파름/미설치</option>
                <option value="점자블록/안내판 파손">점자블록/안내판 파손</option>
                <option value="에스컬레이터 점검중">에스컬레이터 점검중</option>
                <option value="통행 방해물/무단주차">통행 방해물/무단주차</option>
                <option value="기타 편의시설 설치완료">기타 편의시설 설치완료</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-gray-700">
                상세 제보 내용
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="상세한 장애 요인이나 주의할 점을 적어주시면 이용자들에게 큰 도움이 됩니다."
                rows={2}
                className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-xs text-gray-900 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-gray-700">
                제보자 닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임 (미입력 시 '익명 제보자')"
                className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-xs text-gray-900 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="w-1/3 bg-gray-100 py-3 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-200 transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="w-2/3 bg-blue-600 py-3 rounded-xl font-bold text-xs text-white shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
          >
            <Megaphone className="w-4 h-4" />
            제보 등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

