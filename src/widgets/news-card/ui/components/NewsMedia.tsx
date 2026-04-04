import Image from 'next/image';
import type { NewsMediaProps, VideoPlayerProps } from './NewsMedia.types';

export function NewsMedia({ media, onClick }: NewsMediaProps) {
  const mainMedia = media.length > 0 ? media[0] : null;
  if (!mainMedia) return null;

  const isVideo = mainMedia.type === 'video';

  return (
    <div
      className="relative w-full aspect-video overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {isVideo ? (
        <VideoPlayer
          url={mainMedia.url}
          thumbnailUrl={mainMedia.thumbnailUrl}
        />
      ) : (
        <Image
          src={mainMedia.url}
          alt="News image"
          fill
          className="object-contain"
          loading="eager"
          unoptimized
          sizes="(max-width: 768px) 100vw, 672px"
        />
      )}

      {media.length > 1 && (
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
          1 / {media.length}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function VideoPlayer({ thumbnailUrl }: VideoPlayerProps) {
  return (
    <div className="relative w-full h-full">
      {thumbnailUrl ? (
        <>
          <Image
            src={thumbnailUrl}
            alt="Video thumbnail"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
            <PlayButton />
          </div>
        </>
      ) : (
        <>
          <PlayButton />
        </>
      )}
    </div>
  );
}

function PlayButton() {
  return (
    <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
      <svg
        className="w-7 h-7 text-[#0071e3] ml-1"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}
