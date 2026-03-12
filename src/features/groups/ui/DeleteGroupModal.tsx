'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

interface DeleteGroupModalProps {
  groupName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteGroupModal({
  groupName,
  onClose,
  onConfirm,
}: DeleteGroupModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white dark:bg-[#1f1f22] w-full max-w-sm rounded-[20px] shadow-[0_18px_50px_rgba(0,0,0,0.45)] border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">
              Удаление папки
            </p>
            <h3 className="mt-1 text-[18px] font-semibold text-gray-900 dark:text-gray-50 truncate">
              Удалить «{groupName}»?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-gray-500 hover:text-gray-900 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-5 pb-4 text-center">
          <div className="w-14 h-14 bg-red-100/80 dark:bg-red-500/15 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
            🗑️
          </div>
          <p className="text-[14px] text-gray-600 dark:text-gray-300">
            Папка{' '}
            <span className="font-semibold text-black dark:text-white">
              «{groupName}»
            </span>{' '}
            будет удалена. Сами каналы останутся в общем списке.
          </p>
        </div>

        <div className="px-4 py-4 flex flex-col sm:flex-row gap-2 sm:gap-3 bg-gray-50/80 dark:bg-black/30 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="sm:flex-1 px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100 rounded-full bg-white/80 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="sm:flex-1 px-4 py-2.5 text-sm font-semibold rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
