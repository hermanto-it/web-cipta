import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot-password", "/admin/reset-password"]);

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  const envReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!envReady) {
    if (PUBLIC_ADMIN_PATHS.has(pathname)) {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "env_missing");
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (PUBLIC_ADMIN_PATHS.has(pathname)) {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id,is_active")
    .or(`user_id.eq.${user.id},email.eq.${user.email ?? ""}`)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "access_denied");
    return NextResponse.redirect(url);
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
