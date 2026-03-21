'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { subscribeToChannel } from '@/features/subscriptions/actions.pb';
import { useDebounce } from '@/shared/lib/useDebounce';

interface ChannelResult {
  id: string;
  title: string;
  username: string | null;
  participantsCount: number;
  type: 'channel' | 'group';
  isPrivate: boolean;
}

interface AddChannelSlideProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'channel') {
    return (
      <svg
        className="w-5 h-5 text-blue-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
        <path d="M9 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg
      className="w-5 h-5 text-green-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
};

const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}М`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}К`;
  return count.toString();
};

export function AddChannelSlide({
  isOpen,
  onClose,
  onSuccess,
}: AddChannelSlideProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error?: string } | null, formData: FormData) => {
      try {
        const username = formData.get('username') as string;
        const title = formData.get('channelTitle') as string;
        await subscribeToChannel(username, title);
        return { error: undefined };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Ошибка подписки';
        return { error: message };
      }
    },
    null
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [suggestions, setSuggestions] = useState<ChannelResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedTitle('');
      setSuggestions([]);
      setError(null);
    }
  }, [isOpen]);

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
          setError('Ошибка поиска');
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
      setQuery('');
      setSelectedTitle('');
      setSuggestions([]);
      onSuccess?.();
      onClose();
    }
  }, [state, onSuccess, onClose]);

  const handleSelect = (item: ChannelResult) => {
    const username = item.username || item.title;
    setQuery(username);
    setSelectedTitle(item.title);
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.value = username;
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedTitle('');
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[199] bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 w-[400px] max-w-full z-[200] animate-slide-in">
        <div className="h-full flex flex-col bg-white/80 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border-l border-black/5 dark:border-white/5">
          <form action={formAction} className="h-full flex flex-col">
            <div className="p-6 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-black/40 dark:text-white/40 uppercase">
                    Добавить канал
                  </p>
                  <h2 className="text-xl font-bold mt-1 text-foreground">
                    Подписка на канал
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-all flex items-center justify-center active:scale-95"
                >
                  <svg
                    className="w-5 h-5 text-black/60 dark:text-white/60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-black/40 dark:text-white/40 uppercase mb-2">
                  Название или username
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Введите название канала..."
                    onChange={(e) => setQuery(e.target.value)}
                    required
                    className="w-full px-4 py-4 pr-12 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 focus:border-[#229ED9]/50 focus:ring-2 focus:ring-[#229ED9]/20 outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
                    autoComplete="off"
                  />
                  <input
                    type="hidden"
                    name="channelTitle"
                    id="channelTitle"
                    value={selectedTitle}
                  />
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!isLoading && query && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold tracking-wide text-black/40 dark:text-white/40 uppercase">
                    Найдено: {suggestions.length}
                  </p>
                  <div className="space-y-2">
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="w-full p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <TypeIcon type={item.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate text-foreground">
                                {item.title}
                              </span>
                              {item.isPrivate && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium">
                                  Приватный
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-black/40 dark:text-white/40">
                              {item.username ? (
                                <span>@{item.username}</span>
                              ) : (
                                <span className="italic opacity-60">
                                  Без username
                                </span>
                              )}
                              <span>
                                {formatCount(item.participantsCount)}{' '}
                                участников
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isLoading &&
                !error &&
                suggestions.length === 0 &&
                query.length >= 2 && (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-black/30 dark:text-white/30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-black/60 dark:text-white/60">
                      Ничего не найдено
                    </p>
                    <p className="text-xs text-black/30 dark:text-white/30 mt-1">
                      Попробуйте другой запрос
                    </p>
                  </div>
                )}

              <div className="p-4 rounded-2xl bg-[#229ED9]/5 border border-[#229ED9]/10">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-[#229ED9]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#229ED9]">
                      Безопасность
                    </p>
                    <p className="text-xs text-black/40 dark:text-white/40 mt-0.5 leading-relaxed">
                      Мы не храним ваши данные. Подписки синхронизируются с
                      вашим аккаунтом.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-black/5 dark:border-white/10 space-y-3">
              {state?.error && (
                <p className="text-sm text-red-500 text-center font-medium">
                  {state.error}
                </p>
              )}
              <button
                type="submit"
                disabled={isPending || !query}
                className="w-full py-4 rounded-2xl bg-[#229ED9] hover:bg-[#1b8ec2] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg shadow-[#229ED9]/25 active:scale-[0.98]"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Добавление...
                  </span>
                ) : (
                  'Добавить канал'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
