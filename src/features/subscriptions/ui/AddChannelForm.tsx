'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
// API helper function
const apiSubscribeToChannel = async (
  channelUsername: string,
  channelTitle?: string
) => {
  const res = await fetch('/api/subscriptions/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelUsername, channelTitle }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка при подписке');
  }
};
import { useDebounce } from '@/shared/lib/useDebounce';
import type {
  ChannelResult,
  AddChannelFormProps,
} from './AddChannelForm.types';

const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'channel') {
    return (
      <svg
        className="w-5 h-5 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    );
  }
  if (type === 'group') {
    return (
      <svg
        className="w-5 h-5 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    );
  }
  return (
    <svg
      className="w-5 h-5 text-purple-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
};

const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}М`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}К`;
  return count.toString();
};

export function AddChannelForm({ onSuccess }: AddChannelFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error?: string } | null, formData: FormData) => {
      try {
        const username = formData.get('username') as string;
        const title = formData.get('channelTitle') as string;
        await apiSubscribeToChannel(username, title);
        return { error: undefined };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Ошибка подписки';
        return { error: message };
      }
    },
    null
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [suggestions, setSuggestions] = useState<ChannelResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([]);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/telegram/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        const data = await res.json();
        if (data.error) {
          setError('Ошибка поиска: ' + data.error);
          setSuggestions([]);
        } else {
          setSuggestions(data);
        }
      } catch {
        setError('Ошибка соединения');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    search();
  }, [debouncedQuery]);

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
      setQuery('');
      setSuggestions([]);
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const handleSelect = (item: ChannelResult) => {
    const username = item.username || item.title;
    setQuery(username);
    setSelectedTitle(item.title);
    setSuggestions([]);

    const usernameInput = formRef.current?.elements.namedItem(
      'username'
    ) as HTMLInputElement;
    const titleInput = formRef.current?.elements.namedItem(
      'channelTitle'
    ) as HTMLInputElement;

    if (usernameInput) usernameInput.value = username;
    if (titleInput) titleInput.value = item.title;
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    const input = formRef.current?.elements.namedItem(
      'username'
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
    }
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="relative">
        <label
          htmlFor="username"
          className="block text-sm font-medium mb-1"
        >
          Имя канала
        </label>
        <div className="relative">
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Начните вводить название канала"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            autoComplete="off"
          />
          <input
            type="hidden"
            name="channelTitle"
            id="channelTitle"
            value={selectedTitle}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-auto">
            {suggestions.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <TypeIcon type={item.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      {item.isPrivate && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
                          Приватный
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.username ? (
                        <span className="text-xs text-gray-500">
                          @{item.username}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Без username
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatCount(item.participantsCount)} участников
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {!isLoading &&
          !error &&
          suggestions.length === 0 &&
          query.length >= 2 && (
            <p className="text-xs text-gray-400 mt-1">
              Начните вводить название для поиска каналов
            </p>
          )}
        {query.length < 2 && (
          <p className="text-xs text-gray-400 mt-1">
            Введите название канала для поиска
          </p>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
      >
        {isPending ? 'Добавление...' : 'Добавить канал'}
      </button>
    </form>
  );
}
