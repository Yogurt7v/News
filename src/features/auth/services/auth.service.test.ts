import { AuthService } from './auth.service';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';

// Мокаем db
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest
          .fn()
          .mockResolvedValue([{ id: 1, email: 'test@test.com' }]),
      }),
    }),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Поиск по email', () => {
    it('должен вызвать db.query.users.findFirst с правильным email', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.findByEmail('test@test.com');
      expect(result).toEqual(mockUser);
      expect(db.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
    });

    it('должен вернуть null if если пользователь не найден', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await AuthService.findByEmail('notfound@test.com');
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('пароль должен быть захеширован и помещён в юзера', async () => {
      const insertMock = {
        returning: jest
          .fn()
          .mockResolvedValue([
            { id: '1', email: 'test@test.com', name: 'Test' },
          ]),
      };
      (db.insert as jest.Mock).mockReturnValue(insertMock);

      const user = await AuthService.register({
        email: 'test@test.com',
        password: '123456',
        name: 'Test',
      });

      expect(user.id).toBe('1');
      expect(db.insert).toHaveBeenCalledWith(users);

      // Проверим, что пароль был захеширован (не равен исходному)
      const insertCall = (db.insert as jest.Mock).mock.calls[0][0];
      expect(insertCall.password).not.toBe('123456');
      expect(insertCall.password).toHaveLength(60); // длина хеша bcrypt
    });

    it('создание юзера без поля Имя', async () => {
      const insertMock = {
        returning: jest
          .fn()
          .mockResolvedValue([
            { id: '1', email: 'test@test.com', name: null },
          ]),
      };
      (db.insert as jest.Mock).mockReturnValue(insertMock);

      const user = await AuthService.register({
        email: 'test@test.com',
        password: '123456',
      });

      expect(user.name).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('должен вернуть true если пароль верен', async () => {
      const hashed = await bcrypt.hash('123456', 10);
      const user = { password: hashed };
      const result = await AuthService.validatePassword(user, '123456');
      expect(result).toBe(true);
    });

    it('должен вернуть false если пароль не верен', async () => {
      const hashed = await bcrypt.hash('123456', 10);
      const user = { password: hashed };
      const result = await AuthService.validatePassword(user, 'wrong');
      expect(result).toBe(false);
    });

    it('должен вернуть true если у пользователя нет пароля (OAuth)', async () => {
      const user = { password: null };
      const result = await AuthService.validatePassword(user, '123456');
      expect(result).toBe(false);
    });
  });
});
