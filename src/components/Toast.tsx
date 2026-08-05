import React from 'react';

export interface ToastMessage {
  id: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="overlay-panel bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm items-center z-[2000]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-gray-800/95 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-xl font-medium text-sm text-center break-keep w-full border border-gray-700/50 animate-bounce-short transition-all"
          dangerouslySetInnerHTML={{ __html: toast.message }}
        />
      ))}
    </div>
  );
};
