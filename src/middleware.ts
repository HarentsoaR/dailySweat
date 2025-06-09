import {NextRequest, NextResponse} from 'next/server';
import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

let locales = ['en', 'fr', 'es', 'it', 'zh'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({headers: negotiatorHeaders}).languages();

  try {
    return match(languages, locales, defaultLocale);
  } catch (e) {
    // If match throws an error (e.g., no suitable locale found), fallback to default.
    // This can happen if the browser's preferred languages are not in our `locales` list.
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|static|images).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};
