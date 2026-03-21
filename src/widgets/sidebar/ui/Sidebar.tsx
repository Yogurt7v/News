'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AddChannelForm } from '@/features/subscriptions/ui/AddChannelForm';
import { CreateGroupModal } from '@/features/groups/ui/CreateGroupModal';
import { DeleteGroupModal } from '@/features/groups/ui/DeleteGroupModal';
import {
  unsubscribeFromChannel,
  getUserSubscriptions,
  getUserGroups,
  createGroup,
  deleteGroup,
  addChannelToGroup,
  removeChannelFromGroup,
  renameGroup,
} from '@/features/subscriptions/actions.pb';

interface ChannelInfo {
  username: string;
  title: string;
}

interface GroupWithChannels {
  id: string;
  name: string;
  channels: ChannelInfo[];
}

// --- Универсальный UI компонент модалки ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: 'primary' | 'danger';
}

function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  variant = 'primary',
}: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2a2a2c] p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold mb-2 text-[#1c1c1e] dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#2a2a2c] text-sm font-semibold hover:bg-gray-200 dark:hover:bg-[#3a3a3c] transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#229ED9] hover:bg-[#1b8ec2]'}`}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ SIDEBAR ---
export function Sidebar() {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [groups, setGroups] = useState<GroupWithChannels[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Состояния для редактирования и удаления
  const [editingGroupId, setEditingGroupId] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Состояние кастомной модалки подтверждения
  const [confirmData, setConfirmData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary',
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentChannel = searchParams.get('channel');
  const currentGroupId = searchParams.get('group');

  const refreshData = useCallback(async () => {
    try {
      const [channelsList, groupsList] = await Promise.all([
        getUserSubscriptions(),
        getUserGroups(),
      ]);
      setChannels(channelsList);
      setGroups(groupsList);
    } catch (e) {
      console.error('Failed to refresh sidebar data:', e);
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/signin');
    router.refresh();
  };

  const confirmLogout = () => {
    openConfirm(
      'Выйти?',
      'Вы уверены, что хотите выйти из аккаунта?',
      handleLogout,
      'danger'
    );
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- ЛОГИКА ---

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant: 'danger' | 'primary' = 'primary'
  ) => {
    setConfirmData({ isOpen: true, title, message, onConfirm, variant });
  };

  const handleRenameGroup = async (id: string) => {
    if (!editName.trim()) return setEditingGroupId(null);
    try {
      await renameGroup(id, editName);
      setEditingGroupId(null);
      refreshData();
    } catch (e) {
      openConfirm('Ошибка', 'Не удалось переименовать папку', () => {});
    }
  };

  const handleUnsubscribe = (
    e: React.MouseEvent,
    channel: ChannelInfo
  ) => {
    e.stopPropagation();
    openConfirm(
      'Отписаться?',
      `Вы уверены, что хотите отписаться от "${channel.title}"?`,
      async () => {
        await unsubscribeFromChannel(channel.username);
        if (currentChannel === channel.username) router.push(pathname);
        refreshData();
      },
      'danger'
    );
  };

  const handleRemoveFromGroup = (
    e: React.MouseEvent,
    groupId: string,
    channel: ChannelInfo
  ) => {
    e.stopPropagation();
    openConfirm(
      'Убрать из папки?',
      `Убрать "${channel.title}" из этой папки? (Подписка останется)`,
      async () => {
        await removeChannelFromGroup(groupId, channel.username);
        refreshData();
      }
    );
  };

  const createGroupWithChannels = async (
    name: string,
    selectedChannels: ChannelInfo[]
  ) => {
    const newGroup = await createGroup(name);
    for (const ch of selectedChannels) {
      await addChannelToGroup(newGroup.id, ch.username, ch.title);
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white transition-colors duration-200">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-[#2a2a2c]">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="w-10 h-10 rounded-full bg-[#229ED9] flex items-center justify-center text-white shadow-sm font-bold">
            N
          </div>
          <h2 className="font-bold text-lg tracking-tight">Новости</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2c] transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5V19M5 12H19" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-50 dark:bg-[#242426] border-b dark:border-[#2a2a2c]">
          <AddChannelForm
            onSuccess={() => {
              setShowAddForm(false);
              refreshData();
            }}
          />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {/* Все посты */}
        <div
          onClick={() => {
            router.push(pathname);
            setMobileOpen(false);
          }}
          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${!currentChannel && !currentGroupId ? 'bg-[#229ED9] text-white shadow-md' : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2c]'}`}
        >
          <span className="text-xl">📱</span>
          <span className="font-semibold text-[15px]">Все посты</span>
        </div>

        <div className="my-3 border-t dark:border-white/5 mx-2" />

        {/* ПАПКИ */}
        <div className="px-2 mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Папки
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[11px] text-[#229ED9] font-bold hover:underline"
          >
            СОЗДАТЬ
          </button>
        </div>

        {groups.map((group) => (
          <div key={group.id} className="group/folder">
            <div
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('group', group.id);
                params.delete('channel');
                router.push(`${pathname}?${params.toString()}`);
                setMobileOpen(false);
              }}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${currentGroupId === group.id ? 'bg-blue-50 dark:bg-[#229ED9]/10 text-[#229ED9]' : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2c]'}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">📁</span>
                {editingGroupId === group.id ? (
                  <input
                    autoFocus
                    className="bg-white dark:bg-[#2a2a2c] border border-blue-500 rounded px-1 text-[15px] w-full outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRenameGroup(group.id)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleRenameGroup(group.id)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="font-medium text-[15px] truncate">
                    {group.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingGroupId(group.id);
                    setEditName(group.name);
                  }}
                  className="p-1 hover:text-blue-500 text-gray-400"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupToDelete({ id: group.id, name: group.name });
                  }}
                  className="p-1 hover:text-red-500 text-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Каналы внутри папки (аккордеон) */}
            {currentGroupId === group.id &&
              group.channels?.map((ch: ChannelInfo) => (
                <div
                  key={ch.username}
                  className="ml-9 mr-2 p-2 flex items-center justify-between text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg group/ch"
                >
                  <span className="truncate" title={ch.username}>
                    {ch.title}
                  </span>
                  <button
                    onClick={(e) => handleRemoveFromGroup(e, group.id, ch)}
                    className="opacity-0 group-ch/hover:opacity-100 text-[10px] hover:text-red-500 transition-opacity"
                  >
                    убрать
                  </button>
                </div>
              ))}
          </div>
        ))}

        <div className="my-3 border-t dark:border-white/5 mx-2" />

        {/* КАНАЛЫ (Плоский список) */}
        <p className="px-2 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Каналы
        </p>
        {channels.map((channel) => (
          <div
            key={channel.username}
            onClick={() => {
              const p = new URLSearchParams();
              p.set('channel', channel.username);
              router.push(`${pathname}?${p.toString()}`);
              setMobileOpen(false);
            }}
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${currentChannel === channel.username ? 'bg-[#229ED9] text-white shadow-md' : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2c]'}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[14px] font-medium truncate">
                {channel.title}
              </span>
              {/* {channel.username !== channel.title && (
                <span className="text-[12px] text-gray-400 truncate shrink-0">
                  @{channel.username}
                </span>
              )} */}
            </div>
            <button
              onClick={(e) => handleUnsubscribe(e, channel)}
              className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity ${currentChannel === channel.username ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2c] ">
        <button
          onClick={confirmLogout}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#2a2a2c] hover:bg-gray-200 dark:hover:bg-[#343437] text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2 text-sm font-medium transition"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Выйти
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-72 shrink-0 border-r border-gray-100 dark:border-[#2a2a2c] h-screen sticky top-0 bg-white dark:bg-[#1c1c1e]">
        {sidebarContent}
      </aside>

      {/* Моб. кнопка */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#229ED9] text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {/* Моб. меню */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-[85%] max-w-[300px] shadow-2xl animate-in slide-in-from-left duration-300 bg-white dark:bg-[#1c1c1e]">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ВСЕ МОДАЛКИ */}
      <ConfirmModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ ...confirmData, isOpen: false })}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={confirmData.onConfirm}
        variant={confirmData.variant}
      />

      {isCreateModalOpen && (
        <CreateGroupModal
          allChannels={channels}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (name, selected) => {
            await createGroupWithChannels(name, selected);
            setIsCreateModalOpen(false);
            refreshData();
          }}
        />
      )}

      {groupToDelete && (
        <DeleteGroupModal
          groupName={groupToDelete.name}
          onClose={() => setGroupToDelete(null)}
          onConfirm={async () => {
            await deleteGroup(groupToDelete.id);
            if (currentGroupId === groupToDelete.id) router.push(pathname);
            setGroupToDelete(null);
            refreshData();
          }}
        />
      )}
    </>
  );
}
