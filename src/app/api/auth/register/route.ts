import { NextResponse } from 'next/server';
import { AuthService } from '@/features/auth/services/auth.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Более детальная валидация
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' }, // Поменял на message для совместимости с фронтом
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      );
    }

    // 2. Проверка существования пользователя
    const existingUser = await AuthService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким Email уже зарегистрирован' },
        { status: 400 }
      );
    }

    // 3. Регистрация (внутри AuthService пароль должен хешироваться!)
    const user = await AuthService.register({ email, password, name });

    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name },
        message: 'Регистрация прошла успешно',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'Произошла ошибка при создании аккаунта' },
      { status: 500 }
    );
  }
}
