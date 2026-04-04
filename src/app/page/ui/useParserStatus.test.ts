import { renderHook, act } from '@testing-library/react';
import { useParserStatus } from './useParserStatus';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
  })),
}));

describe('useParserStatus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('возвращает начальное состояние', () => {
    const { result } = renderHook(() => useParserStatus());

    expect(result.current.parserStatus).toBe('idle');
    expect(result.current.currentLog).toBe('');
    expect(result.current.toastMessage).toBeNull();
  });

  test('runParser устанавливает статус loading', async () => {
    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValue({ done: true, value: new Uint8Array() }),
    };
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ done: true, savedCount: 5 }),
      body: {
        getReader: () => mockReader,
      },
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useParserStatus());

    await act(async () => {
      await result.current.runParser();
    });

    expect(result.current.parserStatus).toBe('loading');
    expect(result.current.currentLog).toContain('🚀');
  });
});
