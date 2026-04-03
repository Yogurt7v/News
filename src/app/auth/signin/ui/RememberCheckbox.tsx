export function RememberCheckbox() {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 select-none">
      <div className="relative flex h-5 w-5 items-center justify-center">
        <input
          type="checkbox"
          name="remember"
          className="peer h-full w-full appearance-none rounded-md border-2 border-gray-200 bg-white transition-all 
             checked:border-[#0071e3] checked:bg-[#0071e3] 
             hover:border-[#0071e3]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20
             dark:border-[#3a3a3c] dark:bg-[#2a2a2c]"
        />
        <svg
          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <span className="text-[13px] font-medium text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200">
        Запомнить меня
      </span>
    </label>
  );
}
