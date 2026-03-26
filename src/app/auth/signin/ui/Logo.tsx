export function Logo() {
  return (
    <div className="flex justify-center mb-6">
      <div className="h-14 w-14 rounded-full bg-[#229ED9] flex items-center justify-center shadow-md shadow-blue-500/20">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="5" width="14" height="10" rx="2" />
          <rect
            x="6"
            y="8"
            width="14"
            height="10"
            rx="2"
            fill="currentColor"
            stroke="none"
          />
          <line
            x1="9"
            y1="12"
            x2="17"
            y2="12"
            stroke="#229ED9"
            strokeWidth="1.5"
          />
          <line
            x1="9"
            y1="15"
            x2="15"
            y2="15"
            stroke="#229ED9"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}
