import { renderHook } from '@testing-library/react';
import { useNewsSubscription } from './useNewsSubscription';

const mockCollection = {
  subscribe: jest.fn().mockResolvedValue(undefined),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
};

jest.mock('pocketbase', () => {
  return jest.fn().mockImplementation(() => ({
    collection: jest.fn().mockReturnValue(mockCollection),
  }));
});

describe('useNewsSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('не вызывает subscribe когда enabled=false', () => {
    const onNewNews = jest.fn();

    renderHook(() =>
      useNewsSubscription({
        pbUrl: 'http://localhost:8090',
        onNewNews,
        enabled: false,
      })
    );

    expect(mockCollection.subscribe).not.toHaveBeenCalled();
  });

  test('не вызывает subscribe когда pbUrl пустой', () => {
    const onNewNews = jest.fn();

    renderHook(() =>
      useNewsSubscription({
        pbUrl: '',
        onNewNews,
        enabled: true,
      })
    );

    expect(mockCollection.subscribe).not.toHaveBeenCalled();
  });

  test('вызывает subscribe при монтировании', () => {
    const onNewNews = jest.fn();

    renderHook(() =>
      useNewsSubscription({
        pbUrl: 'http://localhost:8090',
        onNewNews,
        enabled: true,
      })
    );

    expect(mockCollection.subscribe).toHaveBeenCalled();
  });

  test('вызывает unsubscribe при размонтировании', () => {
    const onNewNews = jest.fn();
    const { unmount } = renderHook(() =>
      useNewsSubscription({
        pbUrl: 'http://localhost:8090',
        onNewNews,
        enabled: true,
      })
    );

    unmount();

    expect(mockCollection.unsubscribe).toHaveBeenCalledWith('*');
  });
});
