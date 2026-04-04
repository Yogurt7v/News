import type { AddChannelSlideProps } from './AddChannelSlide.types';
import { useActionState, useEffect, useRef, useState } from 'react';
import { subscribeToChannel } from '@/features/subscriptions/actions.pb';
import { useDebounce } from '@/shared/lib/useDebounce';
import { ChannelSearchResult } from '@/entities';
import {
  AddChannelSlideHeader,
  ChannelSearchInput,
  ChannelSearchResults,
  SelectedChannelPreview,
  AddChannelButton,
  SecurityInfo,
} from './components';

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
  const [suggestions, setSuggestions] = useState<ChannelSearchResult[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] =
    useState<ChannelSearchResult | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
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
      setSelectedChannel(null);
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
      setSelectedChannel(null);
      onSuccess?.();
      onClose();
    }
  }, [state, onSuccess, onClose]);

  const handleSelect = (channel: ChannelSearchResult) => {
    setSelectedChannel(channel);
    setSelectedTitle(channel.title);
    setError(null);
  };

  const handleSubscribe = async () => {
    if (!selectedChannel) return;
    setIsSubscribing(true);
    setError(null);
    try {
      const username = selectedChannel.username || selectedChannel.title;
      await subscribeToChannel(username, selectedChannel.title);
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка подписки';
      setError(message);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleBack = () => {
    setSelectedChannel(null);
    setError(null);
    inputRef.current?.focus();
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
      <div className="fixed top-0 left-0 bottom-0 w-[400px] max-w-full z-[200] animate-slide-in-left">
        <div className="h-full flex flex-col bg-white/80 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border-l border-black/5 dark:border-white/5">
          <form action={formAction} className="h-full flex flex-col">
            <AddChannelSlideHeader onClose={onClose} />

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                <label className="block text-[11px] font-semibold tracking-wide text-black/40 dark:text-white/40 uppercase mb-2">
                  Название или username
                </label>
                <input
                  type="hidden"
                  name="username"
                  value={selectedChannel?.username || query}
                />
                <input
                  type="hidden"
                  name="channelTitle"
                  value={selectedTitle}
                />
                <ChannelSearchInput
                  value={query}
                  onChange={setQuery}
                  onClear={handleClear}
                  isLoading={isLoading}
                />
              </div>

              {error && !selectedChannel && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              {!selectedChannel && (
                <ChannelSearchResults
                  channels={suggestions}
                  onSelect={handleSelect}
                />
              )}

              {!isLoading &&
                !error &&
                suggestions.length === 0 &&
                query.length >= 2 &&
                !selectedChannel && (
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

              <SecurityInfo />
            </div>

            <div className="p-6 border-t border-black/5 dark:border-white/10 space-y-3">
              {selectedChannel ? (
                <SelectedChannelPreview
                  channel={selectedChannel}
                  onSubscribe={handleSubscribe}
                  onBack={handleBack}
                  isLoading={isSubscribing}
                  error={error}
                />
              ) : (
                <>
                  {state?.error && (
                    <p className="text-sm text-red-500 text-center font-medium">
                      {state.error}
                    </p>
                  )}
                  <AddChannelButton
                    disabled={!query}
                    isPending={isPending}
                  />
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
