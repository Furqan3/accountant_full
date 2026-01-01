# 🚀 Complete Setup Guide

Follow these steps to get your accountant platform running locally.

## ✅ Prerequisites

Before you begin, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] A Supabase account ([Sign up free](https://supabase.com))
- [ ] A Stripe account ([Sign up](https://stripe.com))
- [ ] A Companies House API key ([Register](https://developer.company-information.service.gov.uk/))

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Navigate to the project
cd accountant_project

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install adminside dependencies
cd adminside
npm install
cd ..

# Or use the helper script
npm run install:all
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name:** `accountant-platform` (or your choice)
   - **Database Password:** Choose a strong password
   - **Region:** Choose closest to your users (e.g., London for UK)
4. Click "Create Project"
5. Wait 2-3 minutes for setup

### Step 3: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `complete-schema.sql` in this project
3. Copy **ALL** the contents
4. Paste into the SQL Editor in Supabase
5. Click **RUN** or press Ctrl+Enter
6. ✅ You should see "Success" messages
7. Go to **Table Editor** to verify tables were created

### Step 4: Get Supabase API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 5: Configure Frontend Environment

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Paste your Supabase values here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-key-here

# Get from Companies House Developer Hub
COMPANIES_HOUSE_API_KEY=your-api-key

# Get from Stripe Dashboard (use test keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Leave these as default for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

### Step 6: Configure Adminside Environment

```bash
cd adminside
cp .env.example .env
```

Edit `adminside/.env`:

```env
# Use the SAME Supabase values as frontend!
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-key-here

# Leave these as default
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

⚠️ **Critical:** Both apps MUST use the SAME Supabase URL and key!

### Step 7: Get External API Keys

#### Companies House API (Free)

1. Go to [Companies House Developer Hub](https://developer.company-information.service.gov.uk/)
2. Click "Register" and create an account
3. Verify your email
4. Sign in and go to "Your applications"
5. Click "Create an application"
6. Copy the API key
7. Add to `frontend/.env.local` as `COMPANIES_HOUSE_API_KEY`

#### Stripe API Keys (Test Mode)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
5. Add to `frontend/.env.local`

### Step 8: Start Development Servers

**Option 1: Run both apps at once (recommended)**

```bash
# From project root
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Adminside on http://localhost:3001

**Option 2: Run apps separately**

```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Adminside
npm run dev:admin
```

### Step 9: Verify Setup

#### Test Frontend

1. Open http://localhost:3000 in your browser
2. You should see the home page with a search box
3. Try searching for a company (e.g., number: `00000006`)
4. You should see company details

#### Test Adminside

1. Open http://localhost:3001 in your browser
2. You should see the admin login page
3. No errors in the console

### Step 10: Create Test Accounts

#### Create a Client Account

1. Go to http://localhost:3000
2. Click "Sign Up" or navigate to signup
3. Enter:
   - Name: `Test Client`
   - Email: `client@test.com`
   - Password: `password123`
4. Sign up
5. Check Supabase → **Table Editor** → `profiles` table
6. You should see your profile

#### Create an Admin Account

**Important:** First, update the signup code to mark users as admin.

Edit `adminside/app/(auth)/signup/page.tsx` and ensure signup includes:

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      user_type: 'admin'  // ← Make sure this is set!
    }
  }
})
```

Then:

1. Go to http://localhost:3001
2. Click "Sign Up"
3. Enter:
   - Name: `Admin User`
   - Email: `admin@test.com`
   - Password: `password123`
4. Sign up
5. Check Supabase → **Table Editor** → `admin_users` table
6. You should see your admin account with `is_active = true`

### Step 11: Test Complete Flow

1. **Login as client** (http://localhost:3000)
2. **Search for a company** (e.g., `00000006`)
3. **Add services to cart**
4. **Go to checkout** (you can use Stripe test card: `4242 4242 4242 4242`)
5. **Complete order**
6. **Login as admin** (http://localhost:3001)
7. **View the order in dashboard**
8. **Update order status**
9. **Send a message to client**

## 🔧 Troubleshooting

### "Missing NEXT_PUBLIC_SUPABASE_URL"

- Make sure you copied `.env.example` to `.env.local` (frontend) or `.env` (adminside)
- Check that you filled in the values correctly
- Restart the dev server after changing env files

### "Table does not exist"

- Make sure you ran the `complete-schema.sql` script in Supabase
- Check in Supabase → Table Editor that tables exist
- Try running the script again (it has `IF NOT EXISTS` so it's safe)

### "Forbidden" or "Unauthorized" errors

- Check that RLS policies are enabled in Supabase
- For admin: verify `admin_users` table has your user with `is_active = true`
- Check that you're signed in

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Companies House API not working

- Verify your API key is correct
- Check you haven't exceeded rate limits (600 requests per 5 mins)
- Make sure the company number is valid (8 digits, e.g., `00000006`)

### Stripe test mode issues

- Make sure you're in **Test mode** in Stripe Dashboard
- Use test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC

## 📚 Next Steps

After setup is complete:

1. ✅ Read `README.md` for project overview
2. ✅ Check `docs/RECOMMENDED-ARCHITECTURE.md` for architecture details
3. ✅ Review the code structure in `frontend/` and `adminside/`
4. ✅ Start building your features!

## 🆘 Still Having Issues?

1. Check all environment variables are set correctly
2. Restart dev servers
3. Check browser console for errors
4. Check terminal for error messages
5. Verify database tables exist in Supabase
6. Check Supabase logs in dashboard

## ✅ Setup Complete!

You should now have:

- ✅ Frontend running on http://localhost:3000
- ✅ Adminside running on http://localhost:3001
- ✅ Database configured in Supabase
- ✅ Test accounts created
- ✅ External APIs configured

**Happy coding! 🎉**
