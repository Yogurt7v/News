export interface ConfirmData {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant: 'primary' | 'danger';
}
