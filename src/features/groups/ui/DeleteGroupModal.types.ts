export interface DeleteGroupModalProps {
  groupName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}
