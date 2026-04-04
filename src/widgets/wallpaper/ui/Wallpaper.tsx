'use client';

interface WallpaperProps {
  children: React.ReactNode;
}

export function Wallpaper({ children }: WallpaperProps) {
  return (
    <div className="relative min-h-screen bg-[#f5f5f7] dark:bg-black">
      {/* Light theme - subtle gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none dark:hidden bg-gradient-to-br from-white via-[#f8f9fa] to-[#f0f1f2]" />
      {/* Dark theme gradient */}
      <div
        className="fixed inset-0 z-0 pointer-events-none hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
            linear-gradient(180deg, #030712 0%, #0f172a 100%)
          `,
        }}
      />
      {/* Subtle noise texture for depth */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
