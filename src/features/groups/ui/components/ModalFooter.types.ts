export interface ModalFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  isLoading?: boolean;
  variant?: 'primary' | 'danger';
}
