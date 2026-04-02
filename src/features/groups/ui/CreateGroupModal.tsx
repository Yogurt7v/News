'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChannelInfo } from '@/entities';
import {
  ModalHeader,
  GroupNameInput,
  ChannelCheckboxList,
  ModalFooter,
} from './components';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-[#1f1f22] w-full max-w-md rounded-[20px] shadow-[0_18px_50px_rgba(0,0,0,0.45)] border border-black/5 dark:border-white/5 overflow-hidden animate-bounce-in">
        <ModalHeader
          label="Новая папка чатов"
          title="Создать папку"
          onClose={onClose}
        />
        <GroupNameInput value={name} onChange={setName} />
        <ChannelCheckboxList
          channels={allChannels}
          selected={selected}
          onToggle={toggleChannel}
        />
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSave}
          confirmLabel="Создать папку"
          isLoading={loading}
        />
      </div>
    </div>,
    document.body
  );
}
