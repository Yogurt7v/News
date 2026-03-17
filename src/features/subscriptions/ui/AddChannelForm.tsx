'use client';

import { useActionState, useEffect, useRef } from 'react';
import { subscribeToChannel } from '../actions.pb';

interface AddChannelFormProps {
  onSuccess?: () => void;
}

export function AddChannelForm({ onSuccess }: AddChannelFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error?: string } | null, formData: FormData) => {
      try {
        const username = formData.get('username') as string;
        await subscribeToChannel(username);
        return { error: undefined };
      } catch (error: any) {
        return { error: error.message || 'Ошибка подписки' };
      }
    },
    null
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 p-1 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="relative">
        <label
          htmlFor="username"
          className="sr-only" // Скрываем визуально, оставляем для скринридеров
        >
          Имя канала
        </label>

        {/* Иконка @ внутри инпута в стиле TG */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none font-medium">
          @
        </div>

        <input
          type="text"
          name="username"
          id="username"
          placeholder="username_канала"
          required
          autoFocus
          className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-100 dark:bg-[#2a2a2c] border-transparent focus:border-[#229ED9] focus:ring-2 focus:ring-[#229ED9]/20 rounded-xl outline-none transition-all placeholder:text-gray-400 dark:text-white"
        />
      </div>

      {state?.error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
          <p className="text-xs text-red-500 font-medium leading-tight">
            {state.error}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#229ED9] hover:bg-[#1c8ec5] active:scale-[0.98] text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm shadow-blue-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Добавление...</span>
            </>
          ) : (
            'Подписаться'
          )}
        </button>

        <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">
          Telegram Channel
        </p>
      </div>
    </form>
  );
}
