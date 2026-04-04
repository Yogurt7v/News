import {
  isAppError,
  getErrorMessage,
  getErrorStatus,
  AppError,
} from './error';

describe('error.ts', () => {
  describe('isAppError', () => {
    test('возвращает true для объекта с полем message', () => {
      const error: AppError = { message: 'Ошибка' };
      expect(isAppError(error)).toBe(true);
    });

    test('возвращает true для объекта с полем message и статусом', () => {
      const error: AppError = { message: 'Ошибка', status: 400 };
      expect(isAppError(error)).toBe(true);
    });

    test('возвращает false для null', () => {
      expect(isAppError(null)).toBe(false);
    });

    test('возвращает false для undefined', () => {
      expect(isAppError(undefined)).toBe(false);
    });

    test('возвращает false для примитива', () => {
      expect(isAppError('строка')).toBe(false);
      expect(isAppError(123)).toBe(false);
    });

    test('возвращает false для объекта без поля message', () => {
      expect(isAppError({ code: 'ERR_001' })).toBe(false);
    });

    test('возвращает true для стандартной ошибки Error (у неё есть message)', () => {
      expect(isAppError(new Error('test'))).toBe(true);
    });
  });

  describe('getErrorMessage', () => {
    test('возвращает message из AppError', () => {
      const error: AppError = { message: 'Ошибка валидации' };
      expect(getErrorMessage(error)).toBe('Ошибка валидации');
    });

    test('возвращает message из стандартной Error', () => {
      const error = new Error('Ошибка сети');
      expect(getErrorMessage(error)).toBe('Ошибка сети');
    });

    test('возвращает "Unknown error" для неизвестного формата', () => {
      expect(getErrorMessage({})).toBe('Unknown error');
      expect(getErrorMessage(123)).toBe('Unknown error');
      expect(getErrorMessage('строка')).toBe('Unknown error');
    });

    test('возвращает message из Error без поля message в объекте', () => {
      const error = new Error('Тайм-аут');
      expect(getErrorMessage(error)).toBe('Тайм-аут');
    });
  });

  describe('getErrorStatus', () => {
    test('возвращает статус из AppError', () => {
      const error: AppError = { message: 'Ошибка', status: 404 };
      expect(getErrorStatus(error)).toBe(404);
    });

    test('возвращает undefined для AppError без статуса', () => {
      const error: AppError = { message: 'Ошибка' };
      expect(getErrorStatus(error)).toBeUndefined();
    });

    test('возвращает статус из Error с полем status', () => {
      const error = new Error('Ошибка') as Error & { status: number };
      error.status = 500;
      expect(getErrorStatus(error)).toBe(500);
    });

    test('возвращает undefined для стандартной Error без статуса', () => {
      const error = new Error('Ошибка');
      expect(getErrorStatus(error)).toBeUndefined();
    });

    test('возвращает undefined для неизвестного формата', () => {
      expect(getErrorStatus('строка')).toBeUndefined();
      expect(getErrorStatus(123)).toBeUndefined();
    });
  });
});
