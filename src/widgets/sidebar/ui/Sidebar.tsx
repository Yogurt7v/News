'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  getUserSubscriptions,
  unsubscribeFromChannel,
} from '@/features/subscriptions/actions';
import { AddChannelForm } from '@/features/subscriptions/ui/AddChannelForm';

export function Sidebar() {
  const [channels, setChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel');

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const list = await getUserSubscriptions();
        setChannels(list);
      } catch (error) {
        console.error('Ошибка загрузки подписок:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChannels();
  }, []);

  const refreshChannels = async () => {
    setLoading(true);
    try {
      const list = await getUserSubscriptions();
      setChannels(list);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (
    e: React.MouseEvent,
    channel: string
  ) => {
    e.stopPropagation(); // Чтобы не срабатывал клик по каналу
    try {
      await unsubscribeFromChannel(channel);
      await refreshChannels();
      if (currentChannel === channel) router.push(pathname);
    } catch (error) {
      console.error('Ошибка отписки:', error);
    }
  };

  const handleChannelClick = (channel: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('channel', channel);
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white transition-colors duration-200">
      {/* Шапка сайдбара в стиле TG */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-[#2a2a2c]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#229ED9] flex items-center justify-center text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 20L5 20C3.89543 20 3 19.1046 3 18L3 6C3 4.89543 3.89543 4 5 4L19 4C20.1046 4 21 4.89543 21 6L21 18C21 19.1046 20.1046 20 19 20Z" />
              <path d="M7 8H17M7 12H17M7 16H13" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-bold text-lg tracking-tight">Новости</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`p-2 rounded-full transition-colors ${showAddForm ? 'bg-blue-50 text-[#229ED9] dark:bg-blue-500/10' : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2c]'}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5V19M5 12H19" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Форма добавления */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 dark:bg-[#242426] border-b border-gray-100 dark:border-[#2a2a2c] animate-in slide-in-from-top duration-200">
          <AddChannelForm
            onSuccess={() => {
              setShowAddForm(false);
              refreshChannels();
            }}
          />
        </div>
      )}

      {/* Список каналов */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 py-3">
          <button
            onClick={() => {
              router.push(pathname);
              setMobileOpen(false);
            }}
            className={`w-full flex items-center px-3 py-3 mb-1 rounded-xl transition-all duration-200 ${
              !currentChannel
                ? 'bg-[#229ED9] text-white shadow-blue-500/20 shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2c]'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#3a3a3c] mr-3 flex items-center justify-center overflow-hidden">
              <span className="text-sm font-bold">ALL</span>
            </div>
            <span className="font-medium">Все новости</span>
          </button>

          {loading ? (
            <div className="flex flex-col gap-2 p-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 w-full bg-gray-100 dark:bg-[#2a2a2c] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {channels.map((ch) => (
                <li key={ch} className="relative group">
                  <button
                    onClick={() => handleChannelClick(ch)}
                    className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                      currentChannel === ch
                        ? 'bg-[#229ED9] text-white shadow-blue-500/20 shadow-lg'
                        : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2c]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center font-bold text-sm ${
                        currentChannel === ch
                          ? 'bg-white/20'
                          : 'bg-[#229ED9]/10 text-[#229ED9]'
                      }`}
                    >
                      {ch.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left truncate font-medium">
                      @{ch}
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleUnsubscribe(e, ch)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                      currentChannel === ch
                        ? 'text-white/70 hover:bg-white/20'
                        : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block w-72 shrink-0 border-r border-gray-100 dark:border-[#2a2a2c] h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Burger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#229ED9] text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-[80%] max-w-[300px] shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
