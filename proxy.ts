import { getSupabaseServer } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === "/auth" || pathname === "/") {
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith("/dashboard")) {
    const supabase = await getSupabaseServer();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
