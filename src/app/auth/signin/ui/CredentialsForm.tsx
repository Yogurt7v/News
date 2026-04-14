import type { CredentialsFormProps } from './CredentialsForm.types';
import Link from 'next/link';

export function CredentialsForm({
  onSubmit,
  loading,
  isNavigating,
  error,
  onBack,
}: CredentialsFormProps) {
  const isLoading = loading || isNavigating;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0071e3] outline-none transition-all"
      />

      <input
        name="password"
        type="password"
        placeholder="Пароль"
        required
        className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-gray-50 dark:bg-[#2a2a2c] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0071e3] outline-none transition-all"
      />

      <div className="flex items-center justify-end px-1 py-1">
        <Link
          href="/auth/forgot-password"
          className="text-[12px] font-medium text-[#0071e3] hover:text-[#005bb5] transition-colors"
        >
          Забыли?
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl animate-in shake-in duration-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-[#0071e3] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#005bb5] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
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
        ) : (
          'Войти'
        )}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-[#2a2a2c] bg-white dark:bg-[#2a2a2c] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#343437] transition active:scale-[0.98]"
      >
        Назад
      </button>
    </form>
  );
}

// function RememberCheckbox() {
//   return (
//     <label className="group flex cursor-pointer items-center gap-2.5 select-none">
//       <div className="relative flex h-5 w-5 items-center justify-center">
//         <input
//           type="checkbox"
//           name="remember"
//           className="peer h-full w-full appearance-none rounded-md border-2 border-gray-200 bg-white transition-all
//              checked:border-[#0071e3] checked:bg-[#0071e3]
//              hover:border-[#0071e3]/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20
//              dark:border-[#3a3a3c] dark:bg-[#2a2a2c]"
//         />
//         <svg
//           className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="4"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <polyline points="20 6 9 17 4 12" />
//         </svg>
//       </div>

//       <span className="text-[13px] font-medium text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200">
//         Запомнить меня
//       </span>
//     </label>
//   );
// }
