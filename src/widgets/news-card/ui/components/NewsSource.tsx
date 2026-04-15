import Image from 'next/image';
import type { NewsSourceProps } from './NewsSource.types';

export function NewsSource({
  channelTitle,
  source,
  avatar,
}: NewsSourceProps) {
  const displayTitle = channelTitle?.length > 0 ? channelTitle : source;
  const avatarLetter =
    displayTitle?.charAt(1) === '@'
      ? displayTitle.charAt(2).toUpperCase()
      : displayTitle?.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        <Image
          src={avatar}
          alt=""
          width={28}
          height={28}
          className="w-7 h-7 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0071e3] to-[#5856d6] flex items-center justify-center text-white text-xs font-bold">
          {avatarLetter}
        </div>
      )}
      <span className="text-sm font-semibold text-[#0071e3]">
        {displayTitle}
      </span>
    </div>
  );
}
