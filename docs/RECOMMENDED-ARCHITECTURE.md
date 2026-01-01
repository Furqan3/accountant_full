# 🏗️ Recommended Architecture for Accounting Platform

## 📋 Executive Summary

**Architecture Type:** Monorepo with Dual Next.js Apps + Shared Supabase Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR PROJECT                             │
│                     /accountent (monorepo)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │    /frontend     │              │   /adminside     │        │
│  │  (Client App)    │              │  (Admin Panel)   │        │
│  │                  │              │                  │        │
│  │  Next.js 16      │              │  Next.js 16      │        │
│  │  React 19        │              │  React 19        │        │
│  │  Tailwind CSS    │              │  Tailwind CSS    │        │
│  │  Stripe          │              │  Dashboard       │        │
│  │                  │              │  Order Mgmt      │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                 │                  │
│           └─────────────┬───────────────────┘                  │
│                         │                                      │
│                         ▼                                      │
│           ┌─────────────────────────┐                          │
│           │   SUPABASE BACKEND      │                          │
│           │  (Single Project)       │                          │
│           ├─────────────────────────┤                          │
│           │ • PostgreSQL Database   │                          │
│           │ • Authentication        │                          │
│           │ • Row Level Security    │                          │
│           │ • Storage (Files)       │                          │
│           │ • Real-time Subscriptions                          │
│           └─────────────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Architecture Decision: Dual Apps + Single Backend

### ✅ RECOMMENDED Structure

```
accountent/
├── frontend/              # Client-facing app (Public)
│   ├── app/
│   │   ├── (auth)/       # Login, Signup for clients
│   │   ├── (main)/       # Company search, services, checkout
│   │   └── api/          # API routes for frontend
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── adminside/            # Admin panel (Private)
│   ├── app/
│   │   ├── (auth)/       # Admin login
│   │   ├── (main)/       # Dashboard, orders, chat
│   │   └── api/          # API routes for admin
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── complete-schema.sql   # Shared database schema
├── .env.example
└── README.md
```

---

## 🔐 Authentication Architecture

### Recommended: Separate Auth for Each App

```
┌────────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH                           │
│                  (Single Auth System)                      │
└────────────────────────────────────────────────────────────┘
         │                                    │
         │                                    │
    ┌────▼─────┐                        ┌────▼─────┐
    │ FRONTEND │                        │ADMINSIDE │
    │  SIGNUP  │                        │  SIGNUP  │
    └──────────┘                        └──────────┘
         │                                    │
         │                                    │
    user_type:                           user_type:
    'client' or null                     'admin'
         │                                    │
         ▼                                    ▼
    ┌──────────┐                        ┌──────────┐
    │ profiles │                        │admin_users│
    │  table   │                        │   table   │
    └──────────┘                        └──────────┘
```

### Implementation

**Frontend Signup:**
```typescript
// frontend/app/(auth)/signup/page.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      user_type: 'client' // Mark as client
    },
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})
```

**Adminside Signup:**
```typescript
// adminside/app/(auth)/signup/page.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      user_type: 'admin' // Mark as admin
    },
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})
```

**Database Trigger (Already in schema):**
```sql
-- Automatically creates correct record based on user_type
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_admin_user();
```

---

## 🌐 Deployment Architecture

### Option 1: Vercel (Recommended for Next.js)

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend Project                                   │
│  URL: https://accountent.com                        │
│  or: https://app.accountent.com                     │
│                                                     │
│  Adminside Project                                  │
│  URL: https://admin.accountent.com                  │
│                                                     │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │    SUPABASE      │
              │  (Backend DB)    │
              └──────────────────┘
```

**Setup:**
```bash
# Deploy frontend
cd frontend
vercel --prod

# Deploy adminside
cd adminside
vercel --prod
```

**Environment Variables (in Vercel Dashboard):**
- Both projects use the **same** Supabase credentials
- Different domain names

---

### Option 2: Single Vercel Project with Subdomains

```
accountent-monorepo/
├── frontend/
├── adminside/
└── vercel.json    # Route based on subdomain
```

**vercel.json:**
```json
{
  "projects": [
    {
      "name": "frontend",
      "source": "frontend",
      "domain": "app.accountent.com"
    },
    {
      "name": "adminside",
      "source": "adminside",
      "domain": "admin.accountent.com"
    }
  ]
}
```

---

## 🔄 Data Flow Architecture

### Client Order Flow

```
1. Client Searches Company (Frontend)
   ↓
2. Calls Companies House API
   │  GET /api/companies/[id]
   ↓
3. Client Adds Services to Cart
   ↓
4. Checkout with Stripe
   │  POST /api/checkout
   ↓
5. Create Order in Supabase
   │  INSERT INTO orders (user_id, items, amount)
   ↓
6. Admin Sees Order Immediately (Adminside)
   │  SELECT * FROM orders (RLS shows all)
   ↓
7. Admin Processes Order
   │  UPDATE orders SET status = 'processing'
   ↓
8. Chat with Client
   │  INSERT INTO messages (order_id, message_text)
   ↓
9. Mark Complete
   │  UPDATE orders SET status = 'completed'
```

### Real-time Updates

```typescript
// Frontend: Listen for order updates
const subscription = supabase
  .channel('order-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Order updated!', payload)
      // Update UI
    }
  )
  .subscribe()

// Adminside: Listen for new orders
const subscription = supabase
  .channel('new-orders')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'orders'
    },
    (payload) => {
      console.log('New order!', payload)
      // Show notification
    }
  )
  .subscribe()
```

---

## 📁 Shared Code Strategy

### Current: Separate codebases ✅

**Pros:**
- ✅ Complete independence
- ✅ Different UI/UX for each app
- ✅ Easier to understand
- ✅ Deploy separately

**Cons:**
- ❌ Duplicate utilities (Supabase client setup, helpers)
- ❌ Type definitions duplicated

### Option: Add Shared Package (Optional)

```
accountent/
├── frontend/
├── adminside/
└── packages/
    └── shared/
        ├── types/
        │   └── database.types.ts  # Generated from Supabase
        ├── lib/
        │   ├── supabase.ts        # Shared client setup
        │   └── utils.ts           # Common utilities
        └── package.json
```

**If you want this:**
```bash
# Install workspace tools
npm install -g pnpm

# Create pnpm-workspace.yaml
echo "packages:
  - 'frontend'
  - 'adminside'
  - 'packages/*'
" > pnpm-workspace.yaml

# Import in apps
import { Database } from '@accountent/shared/types'
import { createClient } from '@accountent/shared/lib/supabase'
```

**My Recommendation:** Keep separate for now (simpler), add shared package only when you have significant duplication.

---

## 🔌 API Architecture

### Frontend APIs (Public)

```typescript
// frontend/app/api/
├── auth/
│   └── callback/route.ts        # Auth redirect
├── companies/
│   ├── [id]/route.ts            # Get company from Companies House
│   ├── save/route.ts            # Save company to Supabase
│   └── favorites/route.ts       # Get user's saved companies
├── checkout/
│   └── route.ts                 # Stripe checkout session
├── orders/
│   └── route.ts                 # Create order
└── webhooks/
    └── stripe/route.ts          # Stripe webhooks
```

### Adminside APIs (Private)

```typescript
// adminside/app/api/
├── auth/
│   └── signin/route.ts          # Admin login
├── dashboard/
│   ├── stats/route.tsx          # Dashboard statistics
│   └── orders/route.tsx         # Recent orders
├── orders/
│   ├── route.ts                 # List all orders
│   └── [id]/route.ts            # Update order status
└── messages/
    └── route.ts                 # Send admin messages
```

---

## 🛡️ Security Best Practices

### 1. Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
COMPANIES_HOUSE_API_KEY=xxx           # Server-side only
STRIPE_SECRET_KEY=sk_xxx              # Server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx

# adminside/.env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # SAME
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx              # SAME
```

### 2. RLS Policies (Already in Schema)

```sql
-- Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can see all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

### 3. API Route Protection

```typescript
// Protect admin routes
export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminUser || !adminUser.is_active) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Proceed with admin logic
}
```

---

## 📊 State Management

### Frontend (Client App)

```typescript
// Use React Context for cart
// frontend/context/cart-context.tsx
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

// Use Supabase for persistent data
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)
```

### Adminside (Admin Panel)

```typescript
// Simple React state + Supabase queries
const [orders, setOrders] = useState([])

useEffect(() => {
  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })
    setOrders(data)
  }
  fetchOrders()
}, [])

// Real-time subscription
supabase
  .channel('orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders'
  }, fetchOrders)
  .subscribe()
```

---

## 🚀 Performance Optimization

### 1. Database Queries

```typescript
// ✅ Good: Select only what you need
const { data } = await supabase
  .from('orders')
  .select('id, status, created_at, profiles(full_name)')
  .limit(20)

// ❌ Bad: Select everything
const { data } = await supabase
  .from('orders')
  .select('*')
```

### 2. Caching

```typescript
// Use Next.js caching
export const revalidate = 60 // Revalidate every 60 seconds

export async function generateMetadata({ params }) {
  // This will be cached
}
```

### 3. Indexes (Already in Schema)

```sql
-- Fast lookups
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_messages_order_id ON messages(order_id);
```

---

## 📈 Monitoring & Analytics

### Recommended Tools

1. **Supabase Dashboard**
   - Database performance
   - Query analytics
   - RLS policy testing

2. **Vercel Analytics**
   - Page performance
   - User metrics
   - Error tracking

3. **Stripe Dashboard**
   - Payment analytics
   - Failed payments
   - Revenue tracking

---

## 🔄 Development Workflow

```bash
# Local Development

# Terminal 1: Run frontend
cd frontend
npm run dev
# → http://localhost:3000

# Terminal 2: Run adminside
cd adminside
npm run dev
# → http://localhost:3000 (or 3001)

# Both connect to the same Supabase project
```

---

## ✅ Final Architecture Recommendations

1. **✅ Keep 2 separate Next.js apps** (frontend + adminside)
   - Different UIs and user experiences
   - Independent deployment
   - Clear separation of concerns

2. **✅ Use 1 Supabase project** for both apps
   - Shared database and authentication
   - RLS handles all security
   - Real-time sync between apps

3. **✅ Deploy separately** on Vercel
   - `app.accountent.com` → Frontend
   - `admin.accountent.com` → Adminside

4. **✅ Use the provided schema** (`complete-schema.sql`)
   - All tables, indexes, RLS policies included
   - Ready to use

5. **✅ Implement real-time features**
   - Order updates
   - Chat messages
   - Notifications

6. **🔄 Optional: Add shared package later**
   - Only when you have significant code duplication
   - Not needed initially

---

## 🎯 Summary

```
┌─────────────────────────────────────────────────┐
│         RECOMMENDED ARCHITECTURE                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Structure:    Dual Apps + Single Backend      │
│  Framework:    Next.js 16 + React 19           │
│  Database:     Supabase (1 project)            │
│  Auth:         Supabase Auth (RLS)             │
│  Payments:     Stripe                          │
│  Deployment:   Vercel (2 projects)             │
│  Real-time:    Supabase Subscriptions          │
│  State:        React Context + Supabase        │
│                                                 │
│  Why this works:                                │
│  ✅ Scalable                                    │
│  ✅ Secure (RLS)                                │
│  ✅ Cost-effective                              │
│  ✅ Easy to maintain                            │
│  ✅ Industry standard                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

This architecture will serve you well from MVP to production! 🚀
