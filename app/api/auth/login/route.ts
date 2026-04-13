// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Проверяем учётные данные
    const user = await verifyCredentials(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }
    
    // Создаём токен
    const token = createSessionToken(user);
    
    const response = NextResponse.json(
      { success: true, user: { id: user.id, email: user.email } },
      { status: 200 }
    );
    
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    );
  }
}