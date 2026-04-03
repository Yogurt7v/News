import { useState } from 'react';
import { GroupInfo, ChannelInfo } from '../types';

interface GroupListItemProps {
  group: GroupInfo;
  isActive: boolean;
  isEditing: boolean;
  editName: string;
  onClick: () => void;
  onEditStart: () => void;
  onEditChange: (name: string) => void;
  onEditSubmit: () => void;
  onDelete: () => void;
  showChannels?: boolean;
  channels?: ChannelInfo[];
  onRemoveChannel?: (channel: ChannelInfo) => void;
}

export function GroupListItem({
  group,
  isActive,
  isEditing,
  editName,
  onClick,
  onEditStart,
  onEditChange,
  onEditSubmit,
  onDelete,
  showChannels = false,
  channels = [],
  onRemoveChannel,
}: GroupListItemProps) {
  return (
    <div key={group.id} className="space-y-1">
      <div
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
          isActive
            ? 'bg-[#0071e3]/10 border border-[#0071e3]/20'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-[#0071e3]/20' : 'bg-gray-100 dark:bg-gray-800'}`}
        >
          <span className="text-base">📁</span>
        </div>

        {isEditing ? (
          <input
            autoFocus
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#0071e3]/50"
            value={editName}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onEditSubmit}
            onKeyDown={(e) => e.key === 'Enter' && onEditSubmit()}
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
              onEditStart();
            }}
            className="w-7 h-7 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xs transition-all"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-xs transition-all text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      </div>

      {showChannels && channels.length > 0 && (
        <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
          {channels.map((ch) => (
            <div
              key={ch.username}
              onClick={() => onRemoveChannel?.(ch)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 transition-all group-hover/ch:opacity-100"
            >
              <span className="truncate flex-1 text-left">{ch.title}</span>
              <span className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100">
                убрать
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
