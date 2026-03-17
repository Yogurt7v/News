import {
  subscribeToChannel,
  unsubscribeFromChannel,
  getUserSubscriptions,
} from './actions';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';

jest.mock('@/shared/lib/pocketbase.server', () => ({
  getServerPocketBase: jest.fn(() =>
    Promise.resolve({
      authStore: { isValid: true, record: { id: 'test-user-id' } },
    })
  ),
}));

// Мокаем все обращения к базе данных
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn(),
    delete: jest.fn(),
    query: {
      subscriptions: {
        findMany: jest.fn(),
      },
    },
  },
}));

describe('Subscription actions', () => {
  // Перед каждым тестом очищаем все моки, чтобы тесты не влияли друг на друга
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserSubscriptions возвращает список каналов', async () => {
    // Настраиваем мок: когда вызовут db.query.subscriptions.findMany, вернуть этот массив
    const mockSubs = [
      { channelUsername: 'channel1', createdAt: new Date() },
      { channelUsername: 'channel2', createdAt: new Date() },
    ];
    (db.query.subscriptions.findMany as jest.Mock).mockResolvedValue(
      mockSubs
    );

    // Вызываем тестируемую функцию
    const result = await getUserSubscriptions();

    // Проверяем, что результат равен ожидаемому
    expect(result).toEqual(['channel1', 'channel2']);

    // Проверяем, что функция обратилась к базе с правильными параметрами
    expect(db.query.subscriptions.findMany).toHaveBeenCalledWith({
      where: expect.anything(),
      columns: { channelUsername: true, createdAt: true },
      orderBy: expect.anything(),
    });
  });

  test('subscribeToChannel добавляет подписку', async () => {
    // Создаём мок для insert: insert возвращает объект с методом values
    const insertMock = { values: jest.fn().mockResolvedValue(undefined) };
    (db.insert as jest.Mock).mockReturnValue(insertMock);

    await subscribeToChannel('@testchannel');

    // Проверяем, что insert был вызван с таблицей subscriptions
    expect(db.insert).toHaveBeenCalledWith(subscriptions);
    // Проверяем, что values был вызван с правильными данными
    expect(insertMock.values).toHaveBeenCalledWith({
      userId: 'test-user-id',
      channelUsername: 'testchannel',
    });
  });

  test('subscribeToChannel выбрасывает ошибку, если уже подписан', async () => {
    // Мокаем ошибку с кодом 23505 (нарушение уникальности)
    const insertMock = {
      values: jest.fn().mockRejectedValue({ code: '23505' }),
    };
    (db.insert as jest.Mock).mockReturnValue(insertMock);

    // Ожидаем, что вызов функции приведёт к ошибке с нужным текстом
    await expect(subscribeToChannel('testchannel')).rejects.toThrow(
      'Вы уже подписаны на этот канал'
    );
  });

  test('unsubscribeFromChannel удаляет подписку', async () => {
    const deleteMock = { where: jest.fn().mockResolvedValue(undefined) };
    (db.delete as jest.Mock).mockReturnValue(deleteMock);

    await unsubscribeFromChannel('testchannel');

    expect(db.delete).toHaveBeenCalledWith(subscriptions);
    expect(deleteMock.where).toHaveBeenCalled();
  });
});
