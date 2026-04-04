import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const publicPages = ["/", "/login", "/register"];

export default async function middleware(request: NextRequest) {
  // Run next-intl middleware first to handle locale
  const intlResponse = intlMiddleware(request);

  // Refresh Supabase auth session
  const { user, supabaseResponse } = await updateSession(request);

  // Extract the pathname without locale prefix
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(
    /^\/(bg|en)/,
    ""
  ) || "/";

  const isPublicPage = publicPages.includes(pathnameWithoutLocale);

  // Redirect unauthenticated users to login
  if (!user && !isPublicPage) {
    const locale = pathname.match(/^\/(bg|en)/)?.[1] || routing.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathnameWithoutLocale === "/login" || pathnameWithoutLocale === "/register")) {
    const locale = pathname.match(/^\/(bg|en)/)?.[1] || routing.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // Merge cookies from supabase session refresh into the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/", "/(bg|en)/:path*"],
};
