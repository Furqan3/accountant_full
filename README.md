# 🏢 Accountant Platform

A comprehensive accounting services platform for UK businesses with client and admin portals.

## 🏗️ Architecture

This is a **monorepo** containing two Next.js applications sharing a single Supabase backend:

```
accountant_project/
├── frontend/              # Client-facing app (port 3000)
├── adminside/            # Admin dashboard (port 3001)
├── packages/             # Shared code
│   └── shared/          # Types, utilities, config
├── docs/                # Documentation
├── complete-schema.sql  # Database schema
└── package.json         # Root package.json
```

### Apps

| App | Port | Production URL | Purpose |
|-----|------|----------------|---------|
| **Frontend** | 3000 | `https://app.yourcompany.com` | Client portal for searching companies and ordering services |
| **Adminside** | 3001 | `https://admin.yourcompany.com` | Admin panel for managing orders and clients |

**Both apps connect to the SAME Supabase project** using Row Level Security for access control.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm
- Supabase account (free tier works)

### 1. Install Dependencies

```bash
# Install root dependencies and all apps
npm run install:all

# Or manually
npm install
cd frontend && npm install
cd ../adminside && npm install
```

### 2. Database Setup

```bash
# 1. Create a Supabase project at https://supabase.com
# 2. Copy complete-schema.sql contents
# 3. Run in Supabase SQL Editor
# 4. Get your API keys from Settings → API
```

### 3. Configure Environment Variables

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your Supabase keys
```

**Adminside:**
```bash
cd adminside
cp .env.example .env
# Edit .env with your Supabase keys (SAME as frontend!)
```

⚠️ **Important:** Both apps must use the **SAME** Supabase URL and anon key!

### 4. Run Development Servers

**Option 1: Run both apps at once**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Frontend
npm run dev:frontend
# → http://localhost:3000

# Terminal 2 - Adminside
npm run dev:admin
# → http://localhost:3001
```

## 📁 Project Structure

### Frontend (Client App)
```
frontend/
├── app/
│   ├── (auth)/              # Client authentication
│   ├── (main)/              # Main client pages
│   │   ├── page.tsx         # Home/Search
│   │   ├── company/[id]/    # Company details & services
│   │   ├── checkout/        # Checkout flow
│   │   └── profile/         # User profile
│   └── api/                 # API routes
│       ├── companies/       # Companies House integration
│       ├── checkout/        # Stripe checkout
│       └── webhooks/        # Payment webhooks
├── components/              # Reusable components
├── lib/                     # Utilities
└── context/                 # React contexts
```

### Adminside (Admin Panel)
```
adminside/
├── app/
│   ├── (auth)/              # Admin authentication
│   ├── (main)/              # Admin pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── search/          # Search clients/companies
│   │   ├── chat/            # Client messaging
│   │   └── settings/        # Admin settings
│   └── api/                 # Admin API routes
├── components/              # Admin components
└── lib/                     # Admin utilities
```

## 🔒 Authentication & Security

### How User Types Work

The system automatically creates the correct user record based on signup:

**Client Signup (Frontend):**
```typescript
await supabase.auth.signUp({
  email, password,
  options: {
    data: { full_name: name, user_type: 'client' }
  }
})
// → Creates record in 'profiles' table
```

**Admin Signup (Adminside):**
```typescript
await supabase.auth.signUp({
  email, password,
  options: {
    data: { full_name: name, user_type: 'admin' }
  }
})
// → Creates record in 'admin_users' table
```

### Row Level Security (RLS)

Access is automatically controlled:
- **Clients** see only their own orders, companies, messages
- **Admins** see ALL data across all users
- **No code changes needed** - the database enforces this!

## 🗄️ Database Tables

| Table | Purpose | Who Can Access |
|-------|---------|----------------|
| `admin_users` | Admin accounts | Admins only |
| `profiles` | Client accounts | Own profile |
| `companies` | Saved companies | Own companies + Admins |
| `services` | Service catalog | Public |
| `subscription_plans` | Monthly packages | Public |
| `subscriptions` | Active subscriptions | Own + Admins |
| `orders` | Service orders | Own + Admins |
| `messages` | Client-Admin chat | Related orders + Admins |
| `user_preferences` | User settings | Own |
| `notifications` | Notifications | Own |

## 🛠️ Available Scripts

```bash
# Development
npm run dev                  # Run both apps concurrently
npm run dev:frontend         # Run frontend only
npm run dev:admin            # Run adminside only

# Build
npm run build                # Build both apps
npm run build:frontend       # Build frontend only
npm run build:admin          # Build adminside only

# Installation
npm run install:all          # Install all dependencies

# Database
npm run types:generate       # Generate TypeScript types from Supabase

# Cleanup
npm run clean                # Remove all node_modules
```

## 🚀 Deployment

### Vercel (Recommended)

**Frontend:**
```bash
cd frontend
vercel --prod
# Set domain: app.yourcompany.com
```

**Adminside:**
```bash
cd adminside
vercel --prod
# Set domain: admin.yourcompany.com
```

Add environment variables in Vercel dashboard for each project.

### Environment Variables for Production

Both apps need:
- `NEXT_PUBLIC_SUPABASE_URL` (same for both)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same for both)

Frontend also needs:
- `COMPANIES_HOUSE_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 📚 Documentation

- [`docs/QUICK-START.md`](docs/QUICK-START.md) - Getting started
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Architecture details
- [`docs/DATABASE-SETUP.md`](docs/DATABASE-SETUP.md) - Database setup
- [`complete-schema.sql`](complete-schema.sql) - Full database schema

## 🧪 Testing the System

### 1. Test Client Flow
1. Go to `http://localhost:3000`
2. Sign up as a client
3. Search for a UK company (e.g., company number: 00000006)
4. Add services to cart
5. Go through checkout

### 2. Test Admin Flow
1. Go to `http://localhost:3001`
2. Sign up as admin (ensure `user_type: 'admin'`)
3. View orders in dashboard
4. Process orders
5. Send messages to clients

## 📊 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth with RLS
- **Payments:** Stripe
- **External API:** Companies House API
- **Deployment:** Vercel
- **Real-time:** Supabase Realtime

## 🔄 Development Workflow

1. Make changes in `frontend/` or `adminside/`
2. Test locally on ports 3000 and 3001
3. Commit and push to git
4. Deploy to Vercel (auto-deploy on push)
5. Both apps use the same Supabase database

## 🐛 Troubleshooting

### "User not found" error
- Check if user exists in `auth.users` table
- Verify `user_type` was passed during signup

### Can't see data / Forbidden error
- Check RLS policies are enabled
- Verify user is authenticated
- For admins: check `admin_users` table has `is_active = true`

### Orders not showing in admin
- Verify admin account exists in `admin_users`
- Check the order exists in `orders` table
- Test RLS policy in SQL editor

### Port already in use
```bash
# Kill process on port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test both apps locally
4. Submit pull request

## 📝 License

Proprietary - All rights reserved

---

**🎉 You're all set! Start with `npm run dev` and visit http://localhost:3000**
