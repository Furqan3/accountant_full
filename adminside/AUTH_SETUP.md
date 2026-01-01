# Authentication Setup Guide

This guide will help you set up Supabase authentication for the admin dashboard.

## Prerequisites

1. A Supabase account (create one at [supabase.com](https://supabase.com))
2. Node.js installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: accountent-admin (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Set Up Environment Variables

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the schema

This will create:
- All necessary tables (admin_users, profiles, orders, messages, user_preferences)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

## Step 4: Create Your First Admin User

The system is now configured to **automatically create admin users** when someone signs up!

### Sign Up Through the App

1. Start your development server: `npm run dev`
2. Go to `/signup` and create an account
3. Check your email and verify your account
4. Sign in at `/signin` - you're now an admin!

**Note**: New users are automatically created with the `admin` role. If you need to upgrade someone to `super_admin`, run this SQL:

```sql
UPDATE public.admin_users
SET role = 'super_admin'
WHERE email = 'their-email@example.com';
```

## Step 5: Test Authentication

1. Start your development server: `npm run dev`
2. Go to `/signin`
3. Sign in with your admin credentials
4. You should be redirected to `/dashboard`

## Admin Roles

The system supports three admin roles:

- **super_admin**: Full access, can manage other admins
- **admin**: Standard admin access
- **support**: Limited access (can be customized via permissions)

## Permissions

Each admin user has a `permissions` JSON field that controls access to different sections:

```json
{
  "dashboard": true,
  "orders": true,
  "messages": true,
  "search": true
}
```

You can modify these permissions in the admin_users table.

## Security Features

- **Row Level Security (RLS)**: Automatically enforces data access rules
- **Admin-only routes**: Middleware protects all routes except signin/signup
- **Password requirements**: Minimum 6 characters
- **Email verification**: Required for all new accounts
- **Session management**: Automatic session refresh

## Troubleshooting

### "You don't have admin access" error

This means the user is authenticated but not in the admin_users table. Add them using the SQL command in Step 4.

### Environment variables not loading

Make sure your `.env.local` file is in the root directory and restart your development server.

### RLS policy errors

If you're getting permission denied errors, check that:
1. The user exists in admin_users table
2. The user's is_active field is true
3. The RLS policies are properly set up (re-run the schema if needed)

## Next Steps

- Customize the permissions system
- Set up email templates in Supabase
- Configure authentication providers (Google, GitHub, etc.)
- Set up password reset functionality
