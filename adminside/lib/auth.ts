import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Get the current authenticated admin user from the request
 * Returns null if user is not authenticated or not an admin
 */
export async function getAuthenticatedAdmin(request?: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log('❌ No authenticated user');
    return null;
  }

  // Verify the user is an admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('id, user_id, role, email')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError) {
    console.error('❌ Error checking admin status:', adminError);
    return null;
  }

  if (!adminUser) {
    console.log('❌ User is not an admin');
    return null;
  }

  console.log('✅ Admin authenticated:', adminUser.email, '- Role:', adminUser.role);

  return {
    id: user.id,
    email: user.email!,
    role: adminUser.role,
    adminUserId: adminUser.id,
  };
}

/**
 * Verify that the current user is an admin
 * Throws an error if not authenticated or not an admin
 */
export async function requireAdmin(request?: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);

  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  return admin;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string, request?: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  return admin?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: string[], request?: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  return admin ? roles.includes(admin.role) : false;
}
