export interface NewsMediaProps {
  media: { type: string; url: string; thumbnailUrl?: string }[];
  onClick: () => void;
}

export interface VideoPlayerProps {
  url: string;
  thumbnailUrl?: string;
}
