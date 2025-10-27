import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

import { logger } from "@/lib/logger";

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "ADMIN",
  },
  pages: {
    signIn: "/login",
  },
});

function resolveApiTag(pathname: string) {
  if (pathname.startsWith("/api/integrations/sheets")) {
    return "[SHEETS]" as const;
  }

  return "[BOOKING]" as const;
}

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const tag = resolveApiTag(pathname);
    event.waitUntil(
      logger.info(tag, "API request received", {
        method: request.method,
        pathname,
        search: search || undefined,
      })
    );

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return authMiddleware(request, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
