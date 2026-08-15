import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const protectedPath =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/favorites") ||
    path.startsWith("/stays");
  if (protectedPath && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }
  if (!user) return response;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,suspended_at")
    .eq("id", user.id)
    .single();
  if (profile?.suspended_at) {
    await supabase.auth.signOut();
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("reason", "suspended");
    return NextResponse.redirect(login);
  }
  if (path.startsWith("/admin") && profile?.role !== "admin")
    return NextResponse.redirect(new URL("/", request.url));
  if (
    path.startsWith("/dashboard") &&
    !(["owner", "broker", "admin"] as string[]).includes(profile?.role || "")
  )
    return NextResponse.redirect(new URL("/", request.url));
  return response;
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/favorites/:path*",
    "/stays/:path*",
  ],
};
