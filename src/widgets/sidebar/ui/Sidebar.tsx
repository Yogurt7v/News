'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getUserSubscriptions } from '@/features/subscriptions/actions';
import { AddChannelForm } from '@/features/subscriptions/ui/AddChannelForm';
import {
  createGroupWithChannels,
  deleteGroup,
  getUserGroups,
} from '@/features/groups/actions';
import { CreateGroupModal } from '@/features/groups/ui/CreateGroupModal';
import { DeleteGroupModal } from '@/features/groups/ui/DeleteGroupModal';

export function Sidebar() {
  const [channels, setChannels] = useState<string[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentChannel = searchParams.get('channel');
  const currentGroupId = searchParams.get('groupId');

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

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleGroupClick = (groupId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('group', groupId);
    params.delete('channel');
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
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
        {/* Все посты (Reset) */}
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

        {/* Папки */}
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
          <div
            key={group.id}
            onClick={() => handleGroupClick(group.id)}
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${currentGroupId === group.id ? 'bg-blue-50 dark:bg-[#229ED9]/10 text-[#229ED9]' : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2c]'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📁</span>
              <span className="font-medium text-[15px] truncate max-w-[140px]">
                {group.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-500">
                {group.channels?.length || 0}
              </span> */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGroupToDelete({ id: group.id, name: group.name });
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <div className="my-3 border-t dark:border-white/5 mx-2" />

        {/* Плоский список каналов */}
        <p className="px-2 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Каналы
        </p>
        {channels.map((channel) => (
          <div
            key={channel}
            onClick={() => {
              const p = new URLSearchParams();
              p.set('channel', channel);
              router.push(`${pathname}?${p.toString()}`);
              setMobileOpen(false);
            }}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${currentChannel === channel ? 'bg-[#229ED9] text-white shadow-md' : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2c]'}`}
          >
            <span className="text-[14px] font-medium truncate">
              @{channel}
            </span>
          </div>
        ))}
      </nav>

      {/* Модалки */}
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
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-72 shrink-0 border-r border-gray-100 dark:border-[#2a2a2c] h-screen sticky top-0 bg-white dark:bg-[#1c1c1e]">
        {sidebarContent}
      </aside>

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

      {mobileOpen && (
        <div className="fixed inset-0 z-100 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-[80%] max-w-75 shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
