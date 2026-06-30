import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes that don't require auth
  const publicPaths = ['/auth/login'];
  const isPublicPath = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // If logged in but needs setup
  if (user && !isPublicPath && request.nextUrl.pathname !== '/auth/setup') {
    const { data: profile } = await supabase
      .from('users')
      .select('force_password_change, force_avatar_upload')
      .eq('id', user.id)
      .single();

    if (profile && (profile.force_password_change || profile.force_avatar_upload)) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/setup';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

