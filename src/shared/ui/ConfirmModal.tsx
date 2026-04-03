'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: 'primary' | 'danger';
}

export function ConfirmModal({
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
                : 'bg-[#0071e3] hover:bg-[#005bb5] shadow-lg shadow-[#0071e3]/25'
            }`}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}
