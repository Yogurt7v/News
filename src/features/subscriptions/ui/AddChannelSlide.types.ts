export interface AddChannelSlideProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentCount: number;
  maxCount: number;
}
