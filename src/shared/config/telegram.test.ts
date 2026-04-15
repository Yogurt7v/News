import { getChannelsList } from './telegram';

describe('telegram.ts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getChannelsList', () => {
    test('возвращает пустой массив когда TELEGRAM_CHANNELS не установлена', () => {
      delete process.env.TELEGRAM_CHANNELS;
      const result = getChannelsList();
      expect(result).toEqual([]);
    });

    test('возвращает массив с одним каналом', () => {
      process.env.TELEGRAM_CHANNELS = '@channel1';
      const result = getChannelsList();
      expect(result).toEqual(['@channel1']);
    });

    test('возвращает массив с несколькими каналами через запятую', () => {
      process.env.TELEGRAM_CHANNELS = '@channel1, @channel2, @channel3';
      const result = getChannelsList();
      expect(result).toEqual(['@channel1', '@channel2', '@channel3']);
    });

    test('отфильтровывает пустые строки', () => {
      process.env.TELEGRAM_CHANNELS = 'chan1,,chan2,  ,chan3';
      const result = getChannelsList();
      expect(result).toEqual(['chan1', 'chan2', 'chan3']);
    });

    test('обрезает пробелы вокруг имён каналов', () => {
      process.env.TELEGRAM_CHANNELS = '  @channel1  ,  @channel2  ';
      const result = getChannelsList();
      expect(result).toEqual(['@channel1', '@channel2']);
    });

    test('работает с каналами без @', () => {
      process.env.TELEGRAM_CHANNELS = 'channel1,channel2';
      const result = getChannelsList();
      expect(result).toEqual(['channel1', 'channel2']);
    });
  });

  describe('telegramConfig', () => {
    test('использует значения из переменных окружения', async () => {
      process.env.TELEGRAM_API_ID = '12345';
      process.env.TELEGRAM_API_HASH = 'abc123hash';
      process.env.TELEGRAM_PHONE_NUMBER = '+79001234567';
      process.env.TELEGRAM_SESSION_STRING = 'session123';

      jest.resetModules();
      const { telegramConfig: config } = await import('./telegram');

      expect(config.apiId).toBe(12345);
      expect(config.apiHash).toBe('abc123hash');
      expect(config.phoneNumber).toBe('+79001234567');
      expect(config.sessionString).toBe('session123');
    });

    test('использует значения по умолчанию когда переменные не установлены', async () => {
      delete process.env.TELEGRAM_API_ID;
      delete process.env.TELEGRAM_API_HASH;
      delete process.env.TELEGRAM_PHONE_NUMBER;
      delete process.env.TELEGRAM_SESSION_STRING;

      jest.resetModules();
      const { telegramConfig: config } = await import('./telegram');

      expect(config.apiId).toBe(0);
      expect(config.apiHash).toBe('');
      expect(config.phoneNumber).toBe('');
      expect(config.sessionString).toBe('');
    });
  });
});
