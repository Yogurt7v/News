export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: 'primary' | 'danger';
}
