'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

interface ChannelInfo {
  username: string;
  title: string;
}

interface CreateGroupModalProps {
  allChannels: ChannelInfo[];
  onClose: () => void;
  onSubmit: (name: string, selected: ChannelInfo[]) => Promise<void>;
}

export function CreateGroupModal({
  allChannels,
  onClose,
  onSubmit,
}: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<ChannelInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleChannel = (ch: ChannelInfo) => {
    setSelected((prev) =>
      prev.some((c) => c.username === ch.username)
        ? prev.filter((c) => c.username !== ch.username)
        : [...prev, ch]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Введите название');
    setLoading(true);
    await onSubmit(name, selected);
    setLoading(false);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white dark:bg-[#1f1f22] w-full max-w-md rounded-[20px] shadow-[0_18px_50px_rgba(0,0,0,0.45)] border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">
              Новая папка чатов
            </p>
            <h3 className="mt-1 text-[18px] font-semibold text-gray-900 dark:text-gray-50 truncate">
              Создать папку
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

        <div className="px-6 pt-4 pb-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Название папки
          </label>
          <input
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100/90 dark:bg-white/5 text-sm text-gray-900 dark:text-gray-50 outline-none focus:ring-2 ring-offset-0 ring-[#229ED9] placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-shadow"
            placeholder="Например, Интересное"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="max-h-60 overflow-y-auto px-2 pb-2">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase px-4 py-2">
            Выберите каналы
          </p>
          {allChannels.map((ch) => (
            <label
              key={ch.username}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer transition-colors ${
                selected.some((c) => c.username === ch.username)
                  ? 'bg-[#229ED9]/10 dark:bg-[#229ED9]/20 border border-[#229ED9]/40'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#229ED9] focus:ring-[#229ED9]"
                checked={selected.some((c) => c.username === ch.username)}
                onChange={() => toggleChannel(ch)}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm text-gray-900 dark:text-gray-50 truncate">
                  {ch.title}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  @{ch.username}
                </span>
              </div>
            </label>
          ))}
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
            onClick={handleSave}
            disabled={loading}
            className="sm:flex-1 px-4 py-2.5 text-sm font-semibold rounded-full bg-[#229ED9] text-white shadow-sm hover:bg-[#1f8cc7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Создание...' : 'Создать папку'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
