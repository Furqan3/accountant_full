# 🚀 Quick Start Guide

## What You're Building

An **accounting services platform** where:
- **Clients** search for UK companies, order services, and pay with Stripe
- **Admins** manage orders, chat with clients, and process requests

---

## ✅ Your Current Setup (Good!)

```
accountent/
├── frontend/      ✅ Client app (Next.js 16)
└── adminside/     ✅ Admin panel (Next.js 16)
```

**This is the RIGHT architecture!** ✅

---

## 🗄️ Database Setup (30 seconds)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: `accountent-platform`
4. Wait 2 minutes for setup

### Step 2: Run SQL Script
1. Open Supabase Dashboard → SQL Editor
2. Copy all of `complete-schema.sql`
3. Paste and click **RUN**
4. ✅ Done! Database is ready

### Step 3: Get API Keys
1. Supabase → Settings → API
2. Copy:
   - Project URL
   - `anon` `public` key

---

## 🔧 Configure Your Apps

### Frontend
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
COMPANIES_HOUSE_API_KEY=your-companies-house-key
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
```

### Adminside
```bash
cd adminside
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  # SAME AS FRONTEND
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key                # SAME AS FRONTEND
```

**Important:** Use the **SAME** Supabase credentials for both apps!

---

## 🏃 Run Locally

```bash
# Terminal 1 - Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000

# Terminal 2 - Adminside
cd adminside
npm install
npm run dev
# → http://localhost:3001
```

---

## 🧪 Test the System

### 1. Create Client Account (Frontend)
1. Go to `http://localhost:3000`
2. Sign up with email/password
3. Check Supabase → Table Editor → `profiles` table
4. ✅ You should see your profile

### 2. Create Admin Account (Adminside)

**Update the signup code to mark as admin:**

```typescript
// adminside/app/(auth)/signup/page.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      user_type: 'admin' // ← Add this!
    }
  }
})
```

1. Go to `http://localhost:3001`
2. Sign up with different email
3. Check Supabase → `admin_users` table
4. ✅ You should see your admin account

### 3. Create Test Order
1. Login as client (frontend)
2. Search for a company
3. Add services to cart
4. Checkout
5. Login as admin (adminside)
6. ✅ You should see the order in admin dashboard

---

## 🌐 Deploy to Production

### Frontend (Client App)
```bash
cd frontend
vercel --prod
```
- Domain: `app.accountent.com`

### Adminside (Admin Panel)
```bash
cd adminside
vercel --prod
```
- Domain: `admin.accountent.com`

**Add environment variables in Vercel dashboard for each project!**

---

## 🔐 Important: User Type Detection

The database needs to know if a signup is for admin or client:

### Frontend Signup (Regular Client)
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      user_type: 'client' // or omit this field
    }
  }
})
// → Creates record in `profiles` table
```

### Adminside Signup (Admin User)
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      user_type: 'admin' // ← MUST include this!
    }
  }
})
// → Creates record in `admin_users` table
```

The trigger in the database checks `user_type` and creates the right record automatically!

---

## 📋 Common Tasks

### Generate TypeScript Types from Database
```bash
npm install -g supabase
supabase login
supabase gen types typescript --project-id your-project-id > database.types.ts
```

### View RLS Policies
```bash
# Go to Supabase → Authentication → Policies
# Test policies with different users
```

### Reset Database (if needed)
```bash
# Re-run complete-schema.sql in SQL Editor
# All DROP IF EXISTS statements handle cleanup
```

---

## 🐛 Troubleshooting

### "User not found" error
- Check if user exists in `auth.users` table
- Verify `user_type` was passed during signup

### "Forbidden" or can't see data
- Check RLS policies are enabled
- Verify user is authenticated
- For admins: check `admin_users` table has `is_active = true`

### Orders not showing in admin
- Verify admin account exists in `admin_users`
- Check the order exists in `orders` table
- Test RLS policy in SQL editor

### Companies House API errors
- Verify API key is correct
- Check rate limits (600 requests per 5 minutes)
- API is free but requires registration

---

## 📚 Files Reference

- `complete-schema.sql` - Full database schema
- `DATABASE-SETUP.md` - Detailed setup guide
- `ARCHITECTURE-COMPARISON.md` - Why 1 vs 2 projects
- `RECOMMENDED-ARCHITECTURE.md` - Full architecture details (this is the main file!)

---

## 🎯 Next Steps

1. ✅ **Setup database** (run `complete-schema.sql`)
2. ✅ **Configure both apps** with Supabase credentials
3. ✅ **Add `user_type: 'admin'`** to adminside signup
4. ✅ **Test locally** with both apps running
5. ✅ **Deploy to Vercel** when ready

---

## 💡 Key Concepts

**1 Database, 2 Apps**
```
Frontend + Adminside → Same Supabase Project
                    → Different users see different data (RLS)
```

**Security is Automatic**
```
Client logs in → RLS shows only their orders
Admin logs in  → RLS shows ALL orders
```

**Real-time Works**
```
Client creates order → Admin sees it instantly
Admin sends message → Client sees it instantly
```

---

## ✅ You're All Set!

Your architecture is solid. Just need to:
1. Run the SQL script
2. Configure environment variables
3. Start building features!

Questions? Check `RECOMMENDED-ARCHITECTURE.md` for full details! 🚀
