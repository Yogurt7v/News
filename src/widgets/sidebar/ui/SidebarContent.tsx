'use client';

import { ChannelsList } from './ChannelsList';
import { GroupsList } from './GroupsList';

interface ChannelInfo {
  username: string;
  title: string;
}

interface GroupWithChannels {
  id: string;
  name: string;
  channels: ChannelInfo[];
}

interface SidebarContentProps {
  channels: ChannelInfo[];
  groups: GroupWithChannels[];
  currentChannel: string | null;
  currentGroupId: string | null;
  editingGroupId: string | null;
  editName: string;
  searchParams: URLSearchParams;
  pathname: string;
  onAllPostsClick: () => void;
  onCreateGroupClick: () => void;
  onChannelClick: (username: string) => void;
  onUnsubscribe: (e: React.MouseEvent, channel: ChannelInfo) => void;
  onGroupClick: (groupId: string) => void;
  onEditStart: (groupId: string, name: string) => void;
  onEditChange: (name: string) => void;
  onEditSubmit: (groupId: string) => void;
  onDeleteClick: (groupId: string, name: string) => void;
  onRemoveChannel: (
    e: React.MouseEvent,
    groupId: string,
    channel: ChannelInfo
  ) => void;
}

export function SidebarContent({
  channels,
  groups,
  currentChannel,
  currentGroupId,
  editingGroupId,
  editName,
  searchParams,
  onAllPostsClick,
  onCreateGroupClick,
  onChannelClick,
  onUnsubscribe,
  onGroupClick,
  onEditStart,
  onEditChange,
  onEditSubmit,
  onDeleteClick,
  onRemoveChannel,
}: SidebarContentProps) {
  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
      <button
        onClick={onAllPostsClick}
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
              : 'bg-gray-100 dark:bg-gray-800'
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

      <p className="text-[11px] font-semibold tracking-wider text-black/40 dark:text-white/40 uppercase px-2 mb-3">
        Каналы
      </p>

      <ChannelsList
        channels={channels}
        currentChannel={currentChannel}
        onChannelClick={onChannelClick}
        onUnsubscribe={onUnsubscribe}
      />

      <div className="h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent my-4" />

      <div className="flex items-center justify-between px-2 mb-3">
        <p className="text-[11px] font-semibold tracking-wider text-black/40 dark:text-white/40 uppercase">
          Папки
        </p>
        <button
          onClick={onCreateGroupClick}
          className="text-[11px] font-bold text-[#229ED9] hover:text-[#1b8ec2] transition-colors"
        >
          + Создать
        </button>
      </div>

      <GroupsList
        groups={groups}
        currentGroupId={currentGroupId}
        editingGroupId={editingGroupId}
        editName={editName}
        searchParams={searchParams}
        onGroupClick={onGroupClick}
        onEditStart={onEditStart}
        onEditChange={onEditChange}
        onEditSubmit={onEditSubmit}
        onDeleteClick={onDeleteClick}
        onRemoveChannel={onRemoveChannel}
      />
    </nav>
  );
}
