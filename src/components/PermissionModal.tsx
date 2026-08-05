import React from 'react';
import { MapPin } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="overlay-panel inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-[2000]">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center border border-gray-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-100">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900">위치 권한이 필요합니다</h2>
        <p className="text-gray-600 text-sm mb-5 break-keep">
          현재 위치를 파악하고 실시간 음성 안내를 받으려면 브라우저의 위치(GPS) 권한을 <b>허용</b>해주세요.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 mb-5 text-left border border-gray-200/80">
          <strong className="text-blue-600 block mb-1">모바일 설정 방법:</strong>
          <ul class="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li>주소창 좌측 <b>자물쇠(또는 aA)</b> 아이콘 터치</li>
            <li>'권한' 또는 '웹사이트 설정' 선택</li>
            <li>'위치'를 <b>허용</b>으로 변경 후 새로고침</li>
          </ul>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
};
