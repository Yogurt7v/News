'use client';

import { useState } from 'react';

interface CreateGroupModalProps {
  allChannels: string[];
  onClose: () => void;
  onSubmit: (name: string, selected: string[]) => Promise<void>;
}

export function CreateGroupModal({
  allChannels,
  onClose,
  onSubmit,
}: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleChannel = (ch: string) => {
    setSelected((prev) =>
      prev.includes(ch) ? prev.filter((i) => i !== ch) : [...prev, ch]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Введите название');
    setLoading(true);
    await onSubmit(name, selected);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b dark:border-white/10">
          <h3 className="text-xl font-bold">Новая группа</h3>
          <input
            autoFocus
            className="w-full mt-4 p-3 rounded-xl bg-gray-100 dark:bg-white/5 outline-none focus:ring-2 ring-blue-500"
            placeholder="Название папки (например, Интересное)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="max-h-60 overflow-y-auto p-2">
          <p className="text-xs font-bold text-gray-400 uppercase px-4 py-2">
            Выберите каналы
          </p>
          {allChannels.map((ch) => (
            <label
              key={ch}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selected.includes(ch)}
                onChange={() => toggleChannel(ch)}
              />
              <span className="flex-1">@{ch}</span>
            </label>
          ))}
        </div>

        <div className="p-4 flex gap-3 bg-gray-50 dark:bg-black/20">
          <button
            onClick={onClose}
            className="flex-1 p-3 font-medium hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 p-3 bg-[#229ED9] text-white font-bold rounded-xl hover:bg-[#1c8ec5] disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
