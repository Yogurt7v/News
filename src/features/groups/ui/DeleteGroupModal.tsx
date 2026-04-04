import type { DeleteGroupModalProps } from './DeleteGroupModal.types';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ModalHeader,
  DeleteConfirmMessage,
  ModalFooter,
} from './components';

export function DeleteGroupModal({
  groupName,
  onClose,
  onConfirm,
}: DeleteGroupModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-[#1f1f22] w-full max-w-sm rounded-[20px] shadow-[0_18px_50px_rgba(0,0,0,0.45)] border border-black/5 dark:border-white/5 overflow-hidden animate-bounce-in">
        <ModalHeader
          label="Удаление папки"
          title={`Удалить «${groupName}»?`}
          onClose={onClose}
        />
        <DeleteConfirmMessage groupName={groupName} />
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleDelete}
          confirmLabel="Удалить"
          isLoading={loading}
          variant="danger"
        />
      </div>
    </div>,
    document.body
  );
}
