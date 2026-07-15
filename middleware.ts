import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except api, Next internals and static assets
  matcher: ['/', '/(pt|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
