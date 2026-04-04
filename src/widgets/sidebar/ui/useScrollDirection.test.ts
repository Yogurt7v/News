import { renderHook, act } from '@testing-library/react';
import { useScrollDirection } from './useScrollDirection';

describe('useScrollDirection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.scrollY = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
    window.scrollY = 0;
  });

  test('возвращает false при начальной загрузке', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBe(false);
  });

  test('возвращает false при прокрутке менее чем на 50px', () => {
    const { result } = renderHook(() => useScrollDirection());

    window.scrollY = 30;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    jest.advanceTimersByTime(100);

    expect(result.current).toBe(false);
  });

  test('возвращает true при прокрутке вниз более чем на 50px', () => {
    const { result } = renderHook(() => useScrollDirection());

    window.scrollY = 100;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    jest.advanceTimersByTime(100);

    expect(result.current).toBe(true);
  });

  test('возвращает false при прокрутке вверх более чем на 50px', () => {
    window.scrollY = 100;

    const { result } = renderHook(() => useScrollDirection());

    window.scrollY = 30;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    jest.advanceTimersByTime(100);

    expect(result.current).toBe(false);
  });

  test('очищает слушатель при размонтировании', () => {
    const removeEventListenerSpy = jest.spyOn(
      window,
      'removeEventListener'
    );
    const { unmount } = renderHook(() => useScrollDirection());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });
});
