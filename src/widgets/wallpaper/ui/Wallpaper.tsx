'use client';

interface WallpaperProps {
  children: React.ReactNode;
}

export function Wallpaper({ children }: WallpaperProps) {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #111827 100%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
