import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('возвращает начальное значение без задержки', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  test('не изменяет значение до истечения таймера', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');
  });

  test('возвращает обновлённое значение после истечения задержки', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  test('сбрасывает таймер при повторном изменении значения', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'first', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    rerender({ value: 'second', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('second');
  });

  test('работает с разными типами данных', () => {
    const { result: stringResult } = renderHook(() =>
      useDebounce('test', 100)
    );
    expect(stringResult.current).toBe('test');

    const { result: numberResult } = renderHook(() =>
      useDebounce(123, 100)
    );
    expect(numberResult.current).toBe(123);

    const { result: arrayResult } = renderHook(() =>
      useDebounce([1, 2, 3], 100)
    );
    expect(arrayResult.current).toEqual([1, 2, 3]);
  });
});
