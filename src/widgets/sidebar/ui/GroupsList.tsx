'use client';

import { ChannelInfo, GroupWithChannels } from '@/entities';

interface GroupsListProps {
  groups: GroupWithChannels[];
  currentGroupId: string | null;
  editingGroupId: string | null;
  editName: string;
  searchParams: URLSearchParams;
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

export function GroupsList({
  groups,
  currentGroupId,
  editingGroupId,
  editName,
  searchParams,
  onGroupClick,
  onEditStart,
  onEditChange,
  onEditSubmit,
  onDeleteClick,
  onRemoveChannel,
}: GroupsListProps) {
  const pathname = '';

  return (
    <>
      {groups.map((group) => (
        <div key={group.id} className="space-y-1">
          <div
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('group', group.id);
              params.delete('channel');
              onGroupClick(group.id);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
              currentGroupId === group.id
                ? 'bg-[#229ED9]/10 border border-[#229ED9]/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                currentGroupId === group.id
                  ? 'bg-[#229ED9]/20'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <span className="text-base">📁</span>
            </div>
            {editingGroupId === group.id ? (
              <input
                autoFocus
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#229ED9]/50"
                value={editName}
                onChange={(e) => onEditChange(e.target.value)}
                onBlur={() => onEditSubmit(group.id)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && onEditSubmit(group.id)
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
                  onEditStart(group.id, group.name);
                }}
                className="w-7 h-7 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xs transition-all"
              >
                ✎
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(group.id, group.name);
                }}
                className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-xs transition-all text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          </div>

          {currentGroupId === group.id && group.channels.length > 0 && (
            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
              {group.channels.map((ch) => (
                <div
                  key={ch.username}
                  onClick={(e) => onRemoveChannel(e, group.id, ch)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 transition-all group-hover/ch:opacity-100"
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
    </>
  );
}
