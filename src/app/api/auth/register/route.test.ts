import 'whatwg-fetch';
import { POST } from './route';
import { AuthService } from '@/features/auth/services/auth.service';

// Мокаем AuthService
jest.mock('@/features/auth/services/auth.service', () => ({
  AuthService: {
    findByEmail: jest.fn(),
    register: jest.fn(),
  },
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен вернуть код 400 если нет почты или пароля', async () => {
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Email и пароль обязательны');
  });

  it('должен вернуть код 400 если пользователь уже существует', async () => {
    (AuthService.findByEmail as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: '123456',
        name: 'Test',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Пользователь уже существует');
  });

  it('должен вернуть код 201 если регистрация успешна', async () => {
    (AuthService.findByEmail as jest.Mock).mockResolvedValue(null);
    (AuthService.register as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      name: 'Test',
    });

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: '123456',
        name: 'Test',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.user.email).toBe('test@test.com');
    expect(json.user.name).toBe('Test');
  });

  it('должен вернуть код 500 если internal error', async () => {
    (AuthService.findByEmail as jest.Mock).mockRejectedValue(
      new Error('DB error')
    );

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: '123456',
        name: 'Test',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Внутренняя ошибка');
  });
});
