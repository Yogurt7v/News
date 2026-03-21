'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { subscribeToChannel } from '../actions.pb';
import { useDebounce } from '@/shared/lib/useDebounce';

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
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<
    Array<{ username: string; title: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500); // ждём полсекунды после ввода

  // Поиск каналов при изменении debouncedQuery
  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/telegram/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
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

  const handleSelect = (username: string) => {
    setQuery(username);
    setSuggestions([]);
    // вручную установим значение в форму
    const input = formRef.current?.elements.namedItem(
      'username'
    ) as HTMLInputElement;
    if (input) input.value = username;
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
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Начните вводить название или @username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((s) => (
              <li
                key={s.username}
                onClick={() => handleSelect(s.username)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-gray-500">@{s.username}</div>
              </li>
            ))}
          </ul>
        )}
        {isLoading && (
          <div className="text-xs text-gray-400 mt-1">Поиск...</div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Введите название канала, чтобы найти его.
        </p>
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
