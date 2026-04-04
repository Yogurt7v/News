import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from './ConfirmModal';

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Подтвердите действие',
    message: 'Вы уверены?',
    onConfirm: jest.fn(),
    onClose: jest.fn(),
  };

  test('не рендерит ничего когда isOpen=false', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        title="Заголовок"
        message="Сообщение"
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('рендерит заголовок и сообщение когда isOpen=true', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Подтвердите действие')).toBeInTheDocument();
    expect(screen.getByText('Вы уверены?')).toBeInTheDocument();
  });

  test('рендерит обе кнопки', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Отмена')).toBeInTheDocument();
    expect(screen.getByText('Подтвердить')).toBeInTheDocument();
  });

  test('вызывает onClose при клике на кнопку Отмена', () => {
    const onClose = jest.fn();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Отмена'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('вызывает onClose при клике на фон', () => {
    const onClose = jest.fn();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);

    const backdrop =
      screen.getByText('Вы уверены?').parentElement?.previousSibling;
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('вызывает onConfirm при клике на Подтвердить', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(
      <ConfirmModal
        {...defaultProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText('Подтвердить'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('применяет стили для variant=danger', () => {
    render(<ConfirmModal {...defaultProps} variant="danger" />);

    const confirmButton = screen.getByRole('button', {
      name: /подтвердить/i,
    });
    expect(confirmButton.className).toContain('bg-red-500');
  });

  test('применяет стили для variant=primary (по умолчанию)', () => {
    render(<ConfirmModal {...defaultProps} variant="primary" />);

    const confirmButton = screen.getByRole('button', {
      name: /подтвердить/i,
    });
    expect(confirmButton.className).toContain('bg-[');
  });
});
