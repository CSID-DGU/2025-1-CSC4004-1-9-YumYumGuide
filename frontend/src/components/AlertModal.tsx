import React from 'react';

interface AlertModalProps {
  open: boolean;
  type?: 'alert' | 'confirm'; // alert: 확인 1개, confirm: 예/아니오
  icon?: React.ReactNode;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function AlertModal({
  open,
  type = 'alert',
  icon,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: AlertModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl px-6 py-8 w-[260px] flex flex-col items-center shadow-xl">
        {icon && <div className="text-4xl mb-2">{icon}</div>}
        <div className="font-bold text-lg mb-1 text-center">{title}</div>
        {message && <div className="text-gray-500 text-sm mb-6 text-center">{message}</div>}
        <div className="flex gap-3 w-full mt-2">
          {type === 'confirm' && (
            <button
              className="flex-1 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`flex-1 py-2 rounded-full bg-green-400 text-white font-semibold`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 