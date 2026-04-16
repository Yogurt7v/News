'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CreateGroupModal } from '@/features/groups/ui/CreateGroupModal';
import { DeleteGroupModal } from '@/features/groups/ui/DeleteGroupModal';
import { AddChannelSlide } from '@/features/subscriptions/ui/AddChannelSlide';

const apiUnsubscribeFromChannel = async (channelUsername: string) => {
  const res = await fetch(
    `/api/subscriptions/unsubscribe?channelUsername=${encodeURIComponent(channelUsername)}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка при отписке');
  }
};

const apiGetUserSubscriptions = async () => {
  const res = await fetch('/api/subscriptions/my');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка при получении подписок');
  }
  return res.json();
};

const apiGetUserGroups = async () => {
  const res = await fetch('/api/groups');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка при получении групп');
  }
  return res.json();
};

const apiCreateGroup = async (name: string) => {
  const res = await fetch('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка при создании группы');
  }
  return res.json();
};

const apiDeleteGroup = async (groupId: string) => {
  const res = await fetch(`/api/groups/${groupId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка при удалении группы');
  }
};

const apiAddChannelToGroup = async (
  groupId: string,
  channelUsername: string,
  channelTitle?: string
) => {
  const res = await fetch(`/api/groups/${groupId}/channels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelUsername, channelTitle }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error.error || 'Ошибка при добавлении канала в группу'
    );
  }
};

const apiRemoveChannelFromGroup = async (
  groupId: string,
  channelUsername: string
) => {
  const res = await fetch(
    `/api/groups/${groupId}/channels?channelUsername=${encodeURIComponent(channelUsername)}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка при удалении канала из группы');
  }
};

const apiRenameGroup = async (groupId: string, name: string) => {
  const res = await fetch(`/api/groups/${groupId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка при переименовании группы');
  }
};
import { SidebarHeader } from './SidebarHeader';
import { SidebarContent } from './SidebarContent';
import { SidebarFooter } from './SidebarFooter';
import { SidebarController } from './SidebarController';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';

import { ChannelInfo, GroupWithChannels } from './types';
import type { ConfirmData } from './Sidebar.types';

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

  const [confirmData, setConfirmData] = useState<ConfirmData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary',
  });

  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScrollY =
        document.querySelector('main')?.scrollTop || window.scrollY;
      const down = currentScrollY > lastScrollY && currentScrollY > 50;
      setIsScrollingDown(down);
      lastScrollY = currentScrollY;
    };

    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('scroll', handleScroll, { passive: true });
      return () => main.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentChannel = searchParams.get('channel');
  const currentGroupId = searchParams.get('group');

  const loadInitialData = async () => {
    try {
      const [channelsList, groupsList] = await Promise.all([
        apiGetUserSubscriptions(),
        apiGetUserGroups(),
      ]);
      setChannels(channelsList);
      setGroups(groupsList);
    } catch (e) {
      console.error('Failed to refresh sidebar data:', e);
    }
  };

  useEffect(() => {
    (async () => {
      await loadInitialData();
    })();
  }, []);

  const refreshData = async () => {
    await loadInitialData();
  };

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
    });
  };

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
    });
  };

  const handleRenameGroup = async (id: string) => {
    if (!editName.trim()) return setEditingGroupId(null);
    try {
      await apiRenameGroup(id, editName);
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
        await apiUnsubscribeFromChannel(channel.username);
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
        await apiRemoveChannelFromGroup(groupId, channel.username);
        refreshData();
      }
    );
  };

  const createGroupWithChannels = async (
    name: string,
    selectedChannels: ChannelInfo[]
  ) => {
    const newGroup = await apiCreateGroup(name);
    for (const ch of selectedChannels) {
      await apiAddChannelToGroup(newGroup.id, ch.username, ch.title);
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 backdrop-blur-xl text-foreground border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader onAddClick={() => setShowAddForm(true)} />
      <SidebarContent
        channels={channels}
        groups={groups}
        currentChannel={currentChannel}
        currentGroupId={currentGroupId}
        editingGroupId={editingGroupId}
        editName={editName}
        searchParams={searchParams}
        pathname={pathname}
        onAllPostsClick={() => {
          router.push(pathname);
          setMobileOpen(false);
        }}
        onCreateGroupClick={() => setIsCreateModalOpen(true)}
        onChannelClick={(username) => {
          const p = new URLSearchParams();
          p.set('channel', username);
          router.push(`${pathname}?${p.toString()}`);
          setMobileOpen(false);
        }}
        onUnsubscribe={handleUnsubscribe}
        onGroupClick={(groupId) => {
          const params = new URLSearchParams(searchParams);
          params.set('group', groupId);
          params.delete('channel');
          router.push(`${pathname}?${params.toString()}`);
          setMobileOpen(false);
        }}
        onEditStart={(groupId, name) => {
          setEditingGroupId(groupId);
          setEditName(name);
        }}
        onEditChange={setEditName}
        onEditSubmit={handleRenameGroup}
        onDeleteClick={(groupId, name) =>
          setGroupToDelete({ id: groupId, name })
        }
        onRemoveChannel={handleRemoveFromGroup}
      />
      <SidebarFooter onLogout={confirmLogout} />
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-80 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      <SidebarController
        isOpen={mobileOpen}
        isScrollingDown={isScrollingDown}
        onMenuClick={() => setMobileOpen(true)}
        onClose={() => setMobileOpen(false)}
      >
        {sidebarContent}
      </SidebarController>

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
            await apiDeleteGroup(groupToDelete.id);
            if (currentGroupId === groupToDelete.id) router.push(pathname);
            setGroupToDelete(null);
            refreshData();
          }}
        />
      )}

      <AddChannelSlide
        isOpen={showAddForm}
        currentCount={channels.length}
        maxCount={10}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          setShowAddForm(false);
          refreshData();
        }}
      />
    </>
  );
}
