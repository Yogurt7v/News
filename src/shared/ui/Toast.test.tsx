import { render, screen, act } from '@testing-library/react';
import { Toast, showToast, ToastContainer } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('отображает сообщение', () => {
    const onClose = jest.fn();
    render(<Toast message="Тестовое сообщение" onClose={onClose} />);

    expect(screen.getByText('Тестовое сообщение')).toBeInTheDocument();
  });

  test('отображает иконку success для типа success', () => {
    const onClose = jest.fn();
    render(<Toast message="Успех" type="success" onClose={onClose} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('отображает иконку error для типа error', () => {
    const onClose = jest.fn();
    render(<Toast message="Ошибка" type="error" onClose={onClose} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('применяет правильный класс для типа success', () => {
    const onClose = jest.fn();
    render(<Toast message="Успех" type="success" onClose={onClose} />);

    const container = screen.getByText('Успех').parentElement;
    expect(container).toHaveClass('bg-green-500');
  });

  test('применяет правильный класс для типа error', () => {
    const onClose = jest.fn();
    render(<Toast message="Ошибка" type="error" onClose={onClose} />);

    const container = screen.getByText('Ошибка').parentElement;
    expect(container).toHaveClass('bg-red-500');
  });

  test('применяет правильный класс для типа info', () => {
    const onClose = jest.fn();
    render(<Toast message="Информация" type="info" onClose={onClose} />);

    const container = screen.getByText('Информация').parentElement;
    expect(container).toHaveClass('bg-[#0071e3]');
  });

  test('вызывает onClose после истечения duration', async () => {
    const onClose = jest.fn();
    render(
      <Toast message="Сообщение" duration={3000} onClose={onClose} />
    );

    jest.advanceTimersByTime(3000);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('очищает таймер при размонтировании', () => {
    const onClose = jest.fn();
    const { unmount } = render(
      <Toast message="Сообщение" duration={3000} onClose={onClose} />
    );

    unmount();

    jest.advanceTimersByTime(3000);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('не вызывает onClose до истечения duration', () => {
    const onClose = jest.fn();
    render(
      <Toast message="Сообщение" duration={5000} onClose={onClose} />
    );

    jest.advanceTimersByTime(3000);

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ToastContainer', () => {
  test('не рендерит ничего когда toast null', () => {
    const onMount = jest.fn();
    const { container } = render(<ToastContainer onMount={onMount} />);

    expect(container.firstChild).toBeNull();
  });

  test('рендерит toast когда message установлен', () => {
    let callback: (
      message: string,
      type: 'success' | 'error' | 'info'
    ) => void;

    const onMount = jest.fn((cb) => {
      callback = cb;
    });

    render(<ToastContainer onMount={onMount} />);

    act(() => {
      callback!('Тестовое сообщение', 'success');
    });

    expect(screen.getByText('Тестовое сообщение')).toBeInTheDocument();
  });
});

describe('showToast', () => {
  test('не вызывает ничего если callback не зарегистрирован', () => {
    expect(() => showToast('Сообщение')).not.toThrow();
  });
});
