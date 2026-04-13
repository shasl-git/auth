import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth';

// Публичные маршруты, которые доступны без авторизации
const publicRoutes = ['/login', '/register'];
// Публичные API маршруты
const apiPublicRoutes = ['/api/auth/login', '/api/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Для отладки (можно удалить после проверки)
  console.log('Middleware check:', { pathname });
  
  // Проверяем, является ли текущий маршрут публичным
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isApiPublicRoute = apiPublicRoutes.some(route => pathname.startsWith(route));
  
  // Получаем токен из cookies
  const token = request.cookies.get('session')?.value;
  
  // Проверяем, валидный ли токен
  let isAuthenticated = false;
  if (token) {
    const payload = verifySessionToken(token);
    isAuthenticated = !!payload; // true если токен валидный
  }
  
  // СЛУЧАЙ 1: Пользователь авторизован и пытается зайти на страницу логина/регистрации
  if (isAuthenticated && (isPublicRoute || pathname === '/')) {
    console.log('Redirecting authenticated user from', pathname, 'to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // СЛУЧАЙ 2: Пользователь НЕ авторизован и пытается зайти на защищённую страницу
  if (!isAuthenticated && !isPublicRoute && !isApiPublicRoute && pathname !== '/') {
    console.log('Redirecting unauthenticated user from', pathname, 'to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // СЛУЧАЙ 3: Все остальные случаи - пропускаем запрос
  return NextResponse.next();
}

// Конфигурация, какие пути должен обрабатывать middleware
export const config = {
  matcher: [
    // Пропускаем статические файлы и изображения
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};