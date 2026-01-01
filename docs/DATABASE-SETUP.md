# Database Setup Guide

## ✅ Architecture Decision: Use 1 Supabase Project

Both your **frontend** (client app) and **adminside** (admin panel) should connect to the **SAME Supabase project**.

### Why 1 Project?

✅ **Benefits:**
- Same data for both apps (orders, users, messages, companies)
- Row Level Security (RLS) handles permissions automatically
- Simpler to maintain and deploy
- Lower costs
- No data synchronization issues
- Shared authentication system

❌ **Problems with 2 Projects:**
- Need to sync data between databases
- Double the cost
- Complex authentication setup
- Data inconsistency risks
- Harder to maintain

---

## 🚀 Setup Instructions

### Step 1: Create ONE Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a **single new project**
3. Name it something like "accountent-platform"

### Step 2: Run the SQL Script

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `complete-schema.sql`
4. Paste and **Run** the script
5. ✅ Done! All tables, policies, and functions are created

### Step 3: Configure Both Apps

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
COMPANIES_HOUSE_API_KEY=your-companies-house-key
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
```

#### Adminside (.env)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  # SAME URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key                # SAME KEY
```

**Important:** Both apps use the **SAME** Supabase URL and keys!

---

## 🔒 How Security Works

### Row Level Security (RLS)

The database automatically shows different data based on who's logged in:

#### Regular Users (Frontend):
- See only their own orders
- See only their own saved companies
- Can send messages for their own orders
- Cannot see admin data

#### Admin Users (Adminside):
- See ALL orders from all users
- See ALL companies
- Can send admin messages
- Have admin permissions

### User Type Detection

When users sign up, the system checks `raw_user_meta_data->>'user_type'`:

- `user_type: 'admin'` → Creates `admin_users` record (for admin panel)
- `user_type: null` or anything else → Creates `profiles` record (for regular users)

**Implementation Example:**

```typescript
// Frontend signup (regular user)
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      full_name: name,
      user_type: 'client' // or don't include this field
    }
  }
})

// Adminside signup (admin user)
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      full_name: name,
      user_type: 'admin' // Important!
    }
  }
})
```

---

## 📊 Database Tables

### Core Tables

1. **admin_users** - Admin panel users (accountants, support staff)
2. **profiles** - Regular client users
3. **companies** - Saved companies from Companies House
4. **services** - Service catalog (filing, registration, etc.)
5. **subscription_plans** - Monthly/yearly accounting packages
6. **subscriptions** - Active user subscriptions
7. **orders** - Service orders and purchases
8. **messages** - Chat between clients and admins
9. **user_preferences** - User settings and preferences
10. **notifications** - User notifications

### Key Features

- ✅ Full RLS policies for security
- ✅ Automatic timestamp updates (`updated_at`)
- ✅ Indexes for fast queries
- ✅ Foreign key constraints
- ✅ JSON fields for flexible data
- ✅ Seed data included (services & plans)

---

## 🛠️ Common Operations

### Check if User is Admin

```typescript
// Client-side
const { data: adminUser } = await supabase
  .from('admin_users')
  .select('*')
  .eq('user_id', userId)
  .single()

const isAdmin = !!adminUser && adminUser.is_active
```

### Query Orders (Automatically Filtered by RLS)

```typescript
// Frontend - only sees own orders
const { data: orders } = await supabase
  .from('orders')
  .select('*')

// Adminside - sees ALL orders (if logged in as admin)
const { data: allOrders } = await supabase
  .from('orders')
  .select('*')
```

### Save a Company

```typescript
const { data: company } = await supabase
  .from('companies')
  .insert({
    company_number: '12345678',
    company_name: 'Example Ltd',
    user_id: userId, // Must match auth.uid()
    is_favorite: true
  })
```

---

## 🔄 Migrations

When you need to update the schema:

1. Go to Supabase SQL Editor
2. Run your migration SQL
3. Update both apps if needed (they use the same database)

Example migration:
```sql
-- Add new column
ALTER TABLE public.orders
ADD COLUMN priority text DEFAULT 'normal';

-- Create new index
CREATE INDEX idx_orders_priority ON public.orders(priority);
```

---

## 🎯 Best Practices

1. **Always use RLS** - Never disable Row Level Security
2. **Test policies** - Verify users can only access their data
3. **Use indexes** - Already created for common queries
4. **Backup regularly** - Use Supabase's backup features
5. **Monitor usage** - Check Supabase dashboard for performance
6. **Use transactions** - For complex operations that need to succeed/fail together

---

## 🐛 Troubleshooting

### Users can't see their data
- Check if RLS policies are enabled
- Verify user is authenticated
- Check `auth.uid()` matches the `user_id` in the table

### Admin can't see all orders
- Verify admin user exists in `admin_users` table
- Check `is_active = true`
- Ensure admin is logged in

### Duplicate key errors
- Check unique constraints
- For companies: each user can only save a company once

---

## 📞 Need Help?

- Check Supabase documentation: https://supabase.com/docs
- RLS guide: https://supabase.com/docs/guides/auth/row-level-security
- Postgres functions: https://www.postgresql.org/docs/

---

## ✨ You're All Set!

Your database is now configured to support both:
- 🎨 **Frontend** - Client-facing application
- 🔧 **Adminside** - Admin panel for managing orders and clients

Both apps share the same data, with security handled automatically by RLS! 🎉
