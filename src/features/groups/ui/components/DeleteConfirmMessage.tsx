import type { DeleteConfirmMessageProps } from './DeleteConfirmMessage.types';

export function DeleteConfirmIcon() {
  return (
    <div
      className="w-14 h-14 bg-red-100/80 dark:bg-red-500/15 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl animate-scale-in"
      style={{ animationDelay: '0.2s' }}
    >
      🗑️
    </div>
  );
}

export function DeleteConfirmMessage({
  groupName,
}: DeleteConfirmMessageProps) {
  return (
    <div className="px-6 pt-5 pb-4 text-center">
      <DeleteConfirmIcon />
      <p className="text-[14px] text-gray-600 dark:text-gray-300 animate-fade-in">
        Папка{' '}
        <span className="font-semibold text-black dark:text-white">
          «{groupName}»
        </span>{' '}
        будет удалена. Сами каналы останутся в общем списке.
      </p>
    </div>
  );
}
