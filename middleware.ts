import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Публичные пути
  const isPublicPath = pathname === '/login' || pathname === '/register';
  const isApiPath = pathname.startsWith('/api/auth');
  
  // Для отладки
  const token = request.cookies.get('session')?.value;
  console.log('Middleware - Path:', pathname, 'Has token:', !!token);
  
  // API запросы всегда пропускаем
  if (isApiPath) {
    return NextResponse.next();
  }
  
  // Если есть токен и пытаемся зайти на login/register -> на дашборд
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Если нет токена и пытаемся зайти на защищённую страницу -> на login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}