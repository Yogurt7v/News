export interface MediaModalProps {
  media: { type: string; url: string; thumbnailUrl?: string }[];
  onClose: () => void;
}
