# Quick Start - Auto Admin Setup

## What Changed

The system now **automatically creates admin users** when someone signs up! No manual SQL needed.

## Setup Steps

### 1. Run the Auto-Admin Trigger SQL

Go to your Supabase SQL Editor and run the contents of **either**:

**Option A** - If you haven't run any schema yet:
- Copy and run everything from `supabase/schema.sql`

**Option B** - If you already ran the schema:
- Copy and run `supabase/auto-admin-trigger.sql`

This creates a database trigger that automatically adds new users to the `admin_users` table.

### 2. That's It!

Now when anyone signs up:
1. They create an account at `/signup`
2. Verify their email
3. Sign in at `/signin`
4. **Automatically have admin access!**

## How It Works

The database trigger (`handle_new_user()`) runs automatically when a new user signs up and:
- Creates a record in `admin_users` table
- Uses their email and full name from signup
- Assigns `admin` role by default
- Sets `is_active` to `true`

## Upgrading to Super Admin

If you need to make someone a super admin, run this SQL:

```sql
UPDATE public.admin_users
SET role = 'super_admin'
WHERE email = 'their-email@example.com';
```

## Testing

1. Go to `/signup`
2. Create a new account
3. Check your email and verify
4. Go to `/signin` and sign in
5. You should land on the dashboard with admin access!

## Roles

- **admin**: Standard admin access (default for new signups)
- **super_admin**: Full access, can manage other admins
- **support**: Limited access (customizable via permissions)
