export function AuthDivider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t dark:border-[#2a2a2c]"></span>
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white dark:bg-[#1c1c1e] px-2 text-gray-400">
          или
        </span>
      </div>
    </div>
  );
}
