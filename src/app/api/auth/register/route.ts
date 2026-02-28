import { NextResponse } from 'next/server';
import { AuthService } from '@/features/auth/services/auth.service';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    const existingUser = await AuthService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь уже существует' },
        { status: 400 }
      );
    }

    const user = await AuthService.register({ email, password, name });
    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка' },
      { status: 500 }
    );
  }
}
