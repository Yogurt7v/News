'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CreateGroupModal } from '@/features/groups/ui/CreateGroupModal';
import { DeleteGroupModal } from '@/features/groups/ui/DeleteGroupModal';
import { AddChannelSlide } from '@/features/subscriptions/ui/AddChannelSlide';
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
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 p-6 animate-scale-in">
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-black/50 dark:text-white/50 mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-2xl bg-black/5 dark:bg-white/10 text-sm font-semibold hover:bg-black/10 dark:hover:bg-white/15 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-5 py-3 rounded-2xl text-sm font-semibold text-white transition-all ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                : 'bg-[#229ED9] hover:bg-[#1b8ec2] shadow-lg shadow-[#229ED9]/25'
            }`}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [groups, setGroups] = useState<GroupWithChannels[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [confirmData, setConfirmData] = useState<ConfirmModalProps>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary',
    onClose: () => setConfirmData((prev) => ({ ...prev, isOpen: false })),
  });

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingDown(
        currentScrollY > lastScrollY.current && currentScrollY > 50
      );
      setIsAtTop(currentScrollY < 20);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeConfirm = () =>
    setConfirmData((prev) => ({ ...prev, isOpen: false }));

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
    setConfirmData({
      isOpen: true,
      title: 'Выйти?',
      message: 'Вы уверены, что хотите выйти из аккаунта?',
      onConfirm: handleLogout,
      variant: 'danger',
      onClose: closeConfirm,
    });
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant: 'danger' | 'primary' = 'primary'
  ) => {
    setConfirmData({
      isOpen: true,
      title,
      message,
      onConfirm,
      variant,
      onClose: closeConfirm,
    });
  };

  const handleRenameGroup = async (id: string) => {
    if (!editName.trim()) return setEditingGroupId(null);
    try {
      await renameGroup(id, editName);
      setEditingGroupId(null);
      refreshData();
    } catch {
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
    <div className="h-full flex flex-col bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl text-foreground">
      <div className="p-5 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#229ED9] to-[#1b8ec2] flex items-center justify-center text-white shadow-lg shadow-[#229ED9]/30 group-hover:shadow-xl group-hover:shadow-[#229ED9]/40 transition-all">
              <span className="text-xl font-bold">N</span>
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">
                Будь в курсе
              </h2>
              <p className="text-xs text-black/40 dark:text-white/40">
                Ваша лента
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-11 h-11 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-all flex items-center justify-center active:scale-95"
          >
            <svg
              className="w-5 h-5 text-[#229ED9]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <button
          onClick={() => {
            router.push(pathname);
            setMobileOpen(false);
          }}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
            !currentChannel && !currentGroupId
              ? 'bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/30'
              : 'hover:bg-white/60 dark:hover:bg-white/5'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              !currentChannel && !currentGroupId
                ? 'bg-white/20'
                : 'bg-black/5 dark:bg-white/10'
            }`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </div>
          <span className="font-semibold">Все посты</span>
        </button>

        <div className="h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent my-4" />

        <div className="flex items-center justify-between px-2 mb-3">
          <p className="text-[11px] font-semibold tracking-wider text-black/40 dark:text-white/40 uppercase">
            Папки
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[11px] font-bold text-[#229ED9] hover:text-[#1b8ec2] transition-colors"
          >
            + Создать
          </button>
        </div>

        {groups.map((group) => (
          <div key={group.id} className="space-y-1">
            <div
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('group', group.id);
                params.delete('channel');
                router.push(`${pathname}?${params.toString()}`);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                currentGroupId === group.id
                  ? 'bg-[#229ED9]/10 border border-[#229ED9]/20'
                  : 'hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentGroupId === group.id
                    ? 'bg-[#229ED9]/20'
                    : 'bg-black/5 dark:bg-white/10'
                }`}
              >
                <span className="text-base">📁</span>
              </div>
              {editingGroupId === group.id ? (
                <input
                  autoFocus
                  className="flex-1 bg-white/60 dark:bg-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#229ED9]/50"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRenameGroup(group.id)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleRenameGroup(group.id)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 text-left font-medium truncate">
                  {group.name}
                </span>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingGroupId(group.id);
                    setEditName(group.name);
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-xs transition-all"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupToDelete({ id: group.id, name: group.name });
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-xs transition-all text-black/40 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {currentGroupId === group.id && group.channels.length > 0 && (
              <div className="ml-4 pl-4 border-l border-black/5 dark:border-white/5 space-y-0.5">
                {group.channels.map((ch) => (
                  <div
                    key={ch.username}
                    onClick={(e) => handleRemoveFromGroup(e, group.id, ch)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-sm text-black/60 dark:text-white/60 transition-all group-hover/ch:opacity-100"
                  >
                    <span className="truncate flex-1 text-left">
                      {ch.title}
                    </span>
                    <span className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100">
                      убрать
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent my-4" />

        <p className="text-[11px] font-semibold tracking-wider text-black/40 dark:text-white/40 uppercase px-2 mb-3">
          Каналы
        </p>

        {channels.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-black/20 dark:text-white/20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-medium text-black/40 dark:text-white/40">
              Нет подписок
            </p>
            <p className="text-xs text-black/30 dark:text-white/30 mt-1">
              Нажмите + чтобы добавить канал
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {channels.map((channel) => (
              <div
                key={channel.username}
                onClick={() => {
                  const p = new URLSearchParams();
                  p.set('channel', channel.username);
                  router.push(`${pathname}?${p.toString()}`);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${
                  currentChannel === channel.username
                    ? 'bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/30'
                    : 'hover:bg-white/60 dark:hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    currentChannel === channel.username
                      ? 'bg-white/20'
                      : 'bg-black/5 dark:bg-white/10'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    <path d="M9 9l6 3-6 3V9z" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="font-medium truncate block">
                    {channel.title}
                  </span>
                  {channel.username !== channel.title && (
                    <span
                      className={`text-xs truncate block ${
                        currentChannel === channel.username
                          ? 'text-white/60'
                          : 'text-black/40 dark:text-white/40'
                      }`}
                    >
                      @{channel.username}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => handleUnsubscribe(e, channel)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    currentChannel === channel.username
                      ? 'hover:bg-white/20 text-white/60 hover:text-white'
                      : 'hover:bg-red-500/10 text-black/30 dark:text-white/30 hover:text-red-500 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
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
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-black/5 dark:border-white/5">
        <button
          onClick={confirmLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all font-medium"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="16 17 21 12 16 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="21"
              y1="12"
              x2="9"
              y2="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Выйти
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-80 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className={`md:hidden fixed z-[100] w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all duration-300 ${
          isScrollingDown
            ? 'top-4 right-4 bg-white/20 backdrop-blur-md text-white/60 border border-white/20'
            : 'top-12 right-6 bg-[#229ED9] text-white shadow-[#229ED9]/40'
        }`}
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-[85%] max-w-[320px] shadow-2xl animate-slide-in-right">
            {sidebarContent}
          </aside>
        </div>
      )}

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

      <AddChannelSlide
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          setShowAddForm(false);
          refreshData();
        }}
      />
    </>
  );
}
