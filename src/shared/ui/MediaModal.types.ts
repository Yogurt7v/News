export interface MediaModalProps {
  media: { type: string; url: string }[];
  onClose: () => void;
}
