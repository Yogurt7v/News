'use client';

interface WallpaperProps {
  children: React.ReactNode;
}

export function Wallpaper({ children }: WallpaperProps) {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 z-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "url('/wallpapers/grid.svg')",
          backgroundSize: '60px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          filter: 'blur(10px)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
