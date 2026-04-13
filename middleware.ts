// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

// Роуты, которые не требуют авторизации
const publicRoutes = ['/login', '/register'];
const apiPublicRoutes = ['/api/auth/login', '/api/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Проверяем, публичный ли это роут
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isApiPublicRoute = apiPublicRoutes.some(route => pathname.startsWith(route));
  
  // Получаем токен из cookies
  const token = request.cookies.get('session')?.value;
  const isAuthenticated = token ? verifySessionToken(token) !== null : false;
  
  // Если пользователь авторизован и пытается зайти на страницу логина/регистрации
  if (isAuthenticated && (isPublicRoute || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Если пользователь не авторизован и пытается зайти на защищённый роут
  if (!isAuthenticated && !isPublicRoute && !isApiPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};