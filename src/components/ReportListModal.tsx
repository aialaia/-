import React, { useState } from 'react';
import { Megaphone, MapPin, ThumbsUp, Search, Filter, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { ObstacleReport } from '../types';

interface ReportListModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ObstacleReport[];
  onFocusReportOnMap: (report: ObstacleReport) => void;
  onLikeReport: (id: string) => void;
  onOpenNewReport: () => void;
}

export const ReportListModal: React.FC<ReportListModalProps> = ({
  isOpen,
  onClose,
  reports,
  onFocusReportOnMap,
  onLikeReport,
  onOpenNewReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'no' | 'yes'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'likes'>('latest');

  if (!isOpen) return null;

  const totalCount = reports.length;
  const obstacleCount = reports.filter((r) => r.status === 'no').length;
  const resolvedCount = reports.filter((r) => r.status === 'yes').length;

  const filteredReports = reports
    .filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      return (
        r.locationName.toLowerCase().includes(query) ||
        (r.issueType && r.issueType.toLowerCase().includes(query)) ||
        (r.description && r.description.toLowerCase().includes(query)) ||
        (r.nickname && r.nickname.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  return (
    <div className="overlay-panel inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs z-[2000]">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">시민 제보 모아보기</h2>
              <p className="text-[11px] text-gray-500">실시간 장애물 및 무장애 시설 제보 현황</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenNewReport();
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
            >
              + 제보 쓰기
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-2 my-3 shrink-0">
          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200/80 text-center">
            <span className="text-[10px] font-bold text-gray-500 block">전체 제보</span>
            <span className="text-sm font-black text-gray-900">{totalCount}건</span>
          </div>
          <div className="bg-red-50 p-2.5 rounded-2xl border border-red-100 text-center">
            <span className="text-[10px] font-bold text-red-600 block flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3" /> 불편/장애
            </span>
            <span className="text-sm font-black text-red-700">{obstacleCount}건</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100 text-center">
            <span className="text-[10px] font-bold text-emerald-600 block flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 원활/개선
            </span>
            <span className="text-sm font-black text-emerald-700">{resolvedCount}건</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-2 mb-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="위치명, 제보내용 또는 작성자 검색"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs gap-2 overflow-x-auto hide-scroll py-0.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  filterStatus === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterStatus('no')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  filterStatus === 'no'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                불편/장애물만
              </button>
              <button
                onClick={() => setFilterStatus('yes')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  filterStatus === 'yes'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                원활/개선만
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  sortBy === 'latest' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
                }`}
              >
                최신순
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setSortBy('likes')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  sortBy === 'likes' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
                }`}
              >
                공감순
              </button>
            </div>
          </div>
        </div>

        {/* Report Cards List */}
        <div className="flex-1 overflow-y-auto hide-scroll space-y-2.5 pr-1">
          {filteredReports.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <i className="fa-solid fa-inbox text-gray-300 text-2xl mb-2 block" />
              <p className="text-xs font-semibold text-gray-500">조건에 일치하는 제보 내역이 없습니다.</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isObstacle = report.status === 'no';

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl p-3.5 border border-gray-200 hover:border-blue-300 transition shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 flex items-center gap-1 ${
                          isObstacle
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <i className={`fa-solid ${isObstacle ? 'fa-triangle-exclamation' : 'fa-circle-check'}`} />
                        {isObstacle ? '불편/장애물' : '원활/개선됨'}
                      </span>

                      {report.issueType && (
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full truncate">
                          {report.issueType}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xs font-extrabold text-gray-900 group-hover:text-blue-600 transition mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{report.locationName}</span>
                  </h3>

                  {report.description && (
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-2 bg-gray-50/70 p-2 rounded-xl border border-gray-100">
                      {report.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                    <span className="text-gray-500 font-medium text-[10px]">
                      제보자: <strong className="text-gray-700">{report.nickname || '익명'}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onLikeReport(report.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2 py-1 rounded-lg border border-gray-200 transition"
                      >
                        <ThumbsUp className="w-3 h-3 text-amber-500" />
                        도움돼요 {report.likes ? `(${report.likes})` : ''}
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onFocusReportOnMap(report);
                        }}
                        className="flex items-center gap-0.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                      >
                        지도 이동
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
