// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Простая валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      );
    }

    // Создаём пользователя
    const user = await createUser(email, password);
    
    // Создаём сессионный токен
    const token = createSessionToken(user);
    
    // Создаём ответ с установкой cookie
    const response = NextResponse.json(
      { success: true, user: { id: user.id, email: user.email } },
      { status: 201 }
    );
    
    // Устанавливаем httpOnly cookie (безопаснее)
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: '/',
    });
    
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}