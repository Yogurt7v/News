'use client';

import { useState } from 'react';

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

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-2xl shadow-2xl border dark:border-white/10 animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🗑️
          </div>
          <h3 className="text-xl font-bold mb-2">Удалить папку?</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Папка{' '}
            <span className="font-semibold text-black dark:text-white">
              «{groupName}»
            </span>{' '}
            будет удалена. Сами каналы останутся в общем списке.
          </p>
        </div>

        <div className="p-4 flex gap-3 bg-gray-50 dark:bg-black/20">
          <button
            onClick={onClose}
            className="flex-1 p-3 font-medium hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors text-sm"
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 p-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all text-sm"
          >
            {loading ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}
