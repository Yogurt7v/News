export function SecurityInfo() {
  return (
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
            Подписки синхронизируются с вашим аккаунтом.
          </p>
        </div>
      </div>
    </div>
  );
}
