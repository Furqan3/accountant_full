# 🚀 Quick Start Deployment Guide

Follow these steps in order to deploy your application to production.

---

## ⏱️ Estimated Time: 30-45 minutes

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (sign up with GitHub)
- [ ] Railway account (or Render) for socket server
- [ ] Stripe account with production keys
- [ ] Supabase project (already set up ✅)

---

## 🎯 Step-by-Step Checklist

### 1️⃣ Prepare Code for Deployment (5 min)

```bash
cd /home/unk/projects/accountant_project

# Ensure everything is committed
git status
git add .
git commit -m "Prepare for production deployment"

# Create GitHub repository and push
# Follow instructions at: https://github.com/new
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

- [ ] Code pushed to GitHub

---

### 2️⃣ Deploy Frontend to Vercel (10 min)

1. Go to https://vercel.com
2. Click "Add New Project" → Import from GitHub
3. **Root Directory**: `frontend` ⚠️
4. Add environment variables from `DEPLOYMENT_ENV_VARS.md`
5. Click "Deploy"
6. **Copy deployment URL**: `_______________________________`

- [ ] Frontend deployed
- [ ] URL saved

---

### 3️⃣ Deploy Admin Panel to Vercel (10 min)

1. Vercel Dashboard → "Add New Project"
2. Import **SAME repository**
3. **Root Directory**: `adminside` ⚠️
4. **Project Name**: `accountant-admin`
5. Add environment variables from `DEPLOYMENT_ENV_VARS.md`
6. Click "Deploy"
7. **Copy deployment URL**: `_______________________________`

- [ ] Admin panel deployed
- [ ] URL saved

---

### 4️⃣ Deploy Socket Server to Railway (10 min)

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repository
4. **Root Directory**: `socket-server`
5. Add environment variables:
   ```
   PORT=4000
   ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-admin.vercel.app
   ```
6. Deploy
7. **Copy deployment URL**: `_______________________________`

- [ ] Socket server deployed
- [ ] URL saved

---

### 5️⃣ Update Environment Variables with Real URLs (5 min)

Go back to each Vercel project and update:

**Frontend Project:**
```
NEXT_PUBLIC_APP_URL=https://[your-frontend-url]
NEXT_PUBLIC_ADMIN_URL=https://[your-admin-url]
NEXT_PUBLIC_SOCKET_SERVER_URL=https://[your-railway-url]
```

**Admin Project:**
```
NEXT_PUBLIC_APP_URL=https://[your-admin-url]
NEXT_PUBLIC_FRONTEND_URL=https://[your-frontend-url]
NEXT_PUBLIC_SOCKET_SERVER_URL=https://[your-railway-url]
```

**Railway Socket Server:**
```
ALLOWED_ORIGINS=https://[frontend-url],https://[admin-url]
```

- [ ] All URLs updated
- [ ] Projects redeployed automatically

---

### 6️⃣ Configure Supabase Auth (3 min)

1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `https://[your-frontend-url]`
3. **Redirect URLs** (add both):
   ```
   https://[your-frontend-url]/api/auth/callback
   https://[your-admin-url]/api/auth/callback
   ```

- [ ] Supabase URLs configured

---

### 7️⃣ Set Up Stripe Production Webhook (5 min)

1. https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://[your-frontend-url]/api/stripe/webhook`
4. **Events**: Select `checkout.session.completed`, `payment_intent.succeeded`
5. Copy webhook secret: `whsec_...`
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel frontend project

- [ ] Webhook configured
- [ ] Secret updated in Vercel

---

### 8️⃣ Final Testing (10 min)

Test these critical flows:

- [ ] Open frontend URL in browser
- [ ] Sign up new account
- [ ] Sign in with Google OAuth
- [ ] Search for a company
- [ ] Add service to cart
- [ ] Complete checkout (use Stripe test card: `4242 4242 4242 4242`)
- [ ] Verify order appears
- [ ] Open admin panel
- [ ] Select companies and generate QR codes
- [ ] Scan QR code with phone
- [ ] Test real-time chat

---

## 🎉 You're Live!

Your application is now deployed and running in production!

### Your Live URLs:

- **Frontend**: https://[your-frontend-url]
- **Admin Panel**: https://[your-admin-url]
- **Socket Server**: https://[your-socket-server-url]

---

## 🔧 Optional: Custom Domains

**To use custom domains:**

1. Vercel Project → Settings → Domains
2. Add domain:
   - Frontend: `app.yourdomain.com`
   - Admin: `admin.yourdomain.com`
3. Update DNS:
   - CNAME `app` → `cname.vercel-dns.com`
   - CNAME `admin` → `cname.vercel-dns.com`
4. Wait for SSL (5-10 minutes)
5. Update Supabase redirect URLs
6. Update Stripe webhook URL

---

## 🆘 Troubleshooting

### Frontend won't load:
- Check Vercel deployment logs
- Verify environment variables are set
- Check browser console for errors

### Login not working:
- Verify Supabase redirect URLs
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Test Google OAuth redirect

### Payments failing:
- Verify Stripe webhook is receiving events
- Check `STRIPE_SECRET_KEY` is production key
- Test with Stripe test card first

### Real-time chat not working:
- Check socket server is running on Railway
- Verify `NEXT_PUBLIC_SOCKET_SERVER_URL` is correct
- Check CORS configuration in socket server

### Build errors:
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Vercel

---

## 📊 Monitoring

**Vercel Analytics:**
- Vercel Dashboard → Analytics (automatically enabled)

**View Logs:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs [your-project-url]
```

**Supabase Logs:**
- Supabase Dashboard → Logs

**Stripe Dashboard:**
- https://dashboard.stripe.com/events

---

## 💰 Cost Estimate

With current free tiers:

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| Vercel (Frontend) | 100GB bandwidth | Low-Medium | $0 |
| Vercel (Admin) | 100GB bandwidth | Low | $0 |
| Railway | $5 credit/month | Socket server | $0-5 |
| Supabase | 500MB DB | Low | $0 |
| Stripe | Per transaction | 2.9% + $0.30 | Per sale |

**Total: $0-5/month** (plus Stripe transaction fees)

---

## 🚀 Next Steps

- [ ] Set up custom domains
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Create backup strategy
- [ ] Document admin procedures
- [ ] Train admin users

---

## 📞 Support

If you encounter issues:

1. Check deployment logs in Vercel/Railway
2. Review error messages in browser console
3. Verify environment variables are correct
4. Test in Stripe test mode first
5. Check this guide's troubleshooting section

---

**Good luck with your deployment! 🎉**
