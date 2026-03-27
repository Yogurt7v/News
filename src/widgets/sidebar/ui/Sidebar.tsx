'use client';
import { useState, useEffect, useRef } from 'react';
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
import { SidebarHeader } from './SidebarHeader';
import { SidebarContent } from './SidebarContent';
import { SidebarFooter } from './SidebarFooter';
import { SidebarController } from './SidebarController';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';

interface ChannelInfo {
  username: string;
  title: string;
}

interface GroupWithChannels {
  id: string;
  name: string;
  channels: ChannelInfo[];
}

interface ConfirmData {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant: 'primary' | 'danger';
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

  const [confirmData, setConfirmData] = useState<ConfirmData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary',
  });

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingDown(
        currentScrollY > lastScrollY.current && currentScrollY > 50
      );
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentChannel = searchParams.get('channel');
  const currentGroupId = searchParams.get('group');

  const loadInitialData = async () => {
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
  };

  useEffect(() => {
    loadInitialData();
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
