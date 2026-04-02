interface GroupNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function GroupNameInput({ value, onChange }: GroupNameInputProps) {
  return (
    <div className="px-6 pt-4 pb-2">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Название папки
      </label>
      <input
        autoFocus
        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100/90 dark:bg-white/5 text-sm text-gray-900 dark:text-gray-50 outline-none focus:ring-2 ring-offset-0 ring-[#229ED9] focus:scale-[1.02] placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200"
        placeholder="Например, Интересное"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
