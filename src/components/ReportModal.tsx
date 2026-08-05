import React, { useState } from 'react';
import { Megaphone, AlertCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (status: 'yes' | 'no', nickname?: string, issueType?: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [reportStatus, setReportStatus] = useState<'yes' | 'no' | null>(null);
  const [nickname, setNickname] = useState('');
  const [issueType, setIssueType] = useState('엘리베이터 고장/미작동');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reportStatus) return;
    onSubmitReport(reportStatus, nickname, issueType);
    setReportStatus(null);
    setNickname('');
    setIssueType('엘리베이터 고장/미작동');
  };

  return (
    <div className="overlay-panel inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-[2000]">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Megaphone className="w-5 h-5 text-amber-500" />
          장애물/시설물 제보
        </h2>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2.5 text-gray-700">
            현재 위치의 휠체어 이동이 원활한가요?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReportStatus('yes')}
              className={`flex-1 py-3 rounded-xl font-bold transition border-2 ${
                reportStatus === 'yes'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              예 (원활)
            </button>
            <button
              type="button"
              onClick={() => setReportStatus('no')}
              className={`flex-1 py-3 rounded-xl font-bold transition border-2 ${
                reportStatus === 'no'
                  ? 'bg-red-500 text-white border-red-500 shadow-md'
                  : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              아니요 (불편)
            </button>
          </div>
        </div>

        {reportStatus === 'no' && (
          <div className="mb-5 bg-gray-50 p-3.5 rounded-xl border border-gray-200 animate-fadeIn">
            <label className="block text-xs font-semibold mb-2 text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> 아니요 선택 시 닉네임 필수
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
              className="w-full border border-gray-300 rounded-lg p-2.5 mb-3 bg-white text-sm outline-none focus:border-blue-500"
            />
            <label className="block text-xs font-semibold mb-1 text-gray-600">
              불편 사유
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm outline-none focus:border-blue-500"
            >
              <option value="엘리베이터 고장/미작동">엘리베이터 고장/미작동</option>
              <option value="높은 단차/계단 있음">높은 단차/계단 있음</option>
              <option value="점자블록/안내판 파손">점자블록/안내판 파손</option>
              <option value="경사로 가파름">경사로 가파름</option>
              <option value="기타 통행 방해물">기타 통행 방해물</option>
            </select>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={onClose}
            className="w-1/3 bg-gray-100 py-3.5 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="w-2/3 bg-blue-600 py-3.5 rounded-xl font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            제보 등록
          </button>
        </div>
      </div>
    </div>
  );
};
