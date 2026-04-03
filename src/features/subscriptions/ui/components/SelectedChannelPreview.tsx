import { ChannelSearchResult } from '@/entities';
import { ChannelTypeIcon } from './ChannelTypeIcon';
import { ParticipantCount } from './ParticipantCount';

interface SelectedChannelPreviewProps {
  channel: ChannelSearchResult;
  onSubscribe: () => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function SelectedChannelPreview({
  channel,
  onSubscribe,
  onBack,
  isLoading,
  error,
}: SelectedChannelPreviewProps) {
  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
          <ChannelTypeIcon type={channel.type} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {channel.title}
          </p>
          <p className="text-sm text-black/40 dark:text-white/40">
            @{channel.username || 'без username'}
          </p>
          <p className="text-xs text-black/30 dark:text-white/30 mt-1">
            <ParticipantCount count={channel.participantsCount} />
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center font-medium mb-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSubscribe}
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl bg-[#0071e3] hover:bg-[#005bb5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all"
        >
          {isLoading ? 'Подписка...' : 'Подписаться'}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground font-medium transition-all"
        >
          Назад
        </button>
      </div>
    </div>
  );
}
