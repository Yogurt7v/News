import { ChannelInfo } from '@/entities';

interface ChannelCheckboxProps {
  channel: ChannelInfo;
  isSelected: boolean;
  onToggle: () => void;
}

function ChannelCheckbox({
  channel,
  isSelected,
  onToggle,
}: ChannelCheckboxProps) {
  return (
    <label
      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01] ${isSelected ? 'bg-[#229ED9]/10 dark:bg-[#229ED9]/20 border border-[#229ED9]/40' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
    >
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-[#229ED9] focus:ring-[#229ED9]"
        checked={isSelected}
        onChange={onToggle}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm text-gray-900 dark:text-gray-50 truncate">
          {channel.title}
        </span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
          @{channel.username}
        </span>
      </div>
    </label>
  );
}

interface ChannelCheckboxListProps {
  channels: ChannelInfo[];
  selected: ChannelInfo[];
  onToggle: (channel: ChannelInfo) => void;
}

export function ChannelCheckboxList({
  channels,
  selected,
  onToggle,
}: ChannelCheckboxListProps) {
  return (
    <div className="max-h-60 overflow-y-auto px-2 pb-2">
      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase px-4 py-2">
        Выберите каналы
      </p>
      {channels.map((ch, i) => (
        <div
          key={ch.username}
          style={{ animationDelay: `${0.2 + i * 30}ms` }}
        >
          <ChannelCheckbox
            channel={ch}
            isSelected={selected.some((c) => c.username === ch.username)}
            onToggle={() => onToggle(ch)}
          />
        </div>
      ))}
    </div>
  );
}
