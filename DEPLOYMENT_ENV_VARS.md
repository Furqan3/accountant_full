# Deployment Environment Variables

## Frontend (Vercel)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://busqfmdrslmursuxwmjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1c3FmbWRyc2xtdXJzdXh3bWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNjQxMjMsImV4cCI6MjA4Mjc0MDEyM30.SCSe-ezcCC96u_9qMMdhnwh-Vz1y8Wtn3ttoICxNOmc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1c3FmbWRyc2xtdXJzdXh3bWpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE2NDEyMywiZXhwIjoyMDgyNzQwMTIzfQ.6NaxOxGfD__T1yG6vlqVy59-lJ5O0flHOWpKNkBe11Q

# Companies House API
COMPANIES_HOUSE_API_KEY=b1bf47b7-b30b-4a14-bedd-a19b18eca660

# Stripe - ⚠️ UPDATE WITH PRODUCTION KEYS
STRIPE_SECRET_KEY=sk_live_YOUR_PRODUCTION_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# App URLs - ⚠️ UPDATE AFTER DEPLOYMENT
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_ADMIN_URL=https://your-admin.vercel.app

# Socket Server - ⚠️ UPDATE AFTER RAILWAY DEPLOYMENT
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-socket-server.railway.app
```

---

## Adminside (Vercel)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://busqfmdrslmursuxwmjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1c3FmbWRyc2xtdXJzdXh3bWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNjQxMjMsImV4cCI6MjA4Mjc0MDEyM30.SCSe-ezcCC96u_9qMMdhnwh-Vz1y8Wtn3ttoICxNOmc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1c3FmbWRyc2xtdXJzdXh3bWpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE2NDEyMywiZXhwIjoyMDgyNzQwMTIzfQ.6NaxOxGfD__T1yG6vlqVy59-lJ5O0flHOWpKNkBe11Q

# Companies House API
COMPANIES_HOUSE_API_KEY=b1bf47b7-b30b-4a14-bedd-a19b18eca660

# App URLs - ⚠️ UPDATE AFTER DEPLOYMENT
NEXT_PUBLIC_APP_URL=https://your-admin.vercel.app
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend.vercel.app

# Socket Server - ⚠️ UPDATE AFTER RAILWAY DEPLOYMENT
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-socket-server.railway.app
```

---

## Socket Server (Railway/Render)

```bash
PORT=4000

# CORS - ⚠️ UPDATE AFTER VERCEL DEPLOYMENT
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-admin.vercel.app

# Add any other socket server specific variables
```

---

## Important Notes:

1. **Never commit** production secrets to Git
2. **Use Stripe test keys** until fully tested
3. **Verify webhook** is working before going live
4. **Test payments** in Stripe test mode first
5. **Set up monitoring** (Vercel Analytics, Sentry)

---

## Post-Deployment Checklist:

- [ ] All environment variables configured
- [ ] Supabase redirect URLs updated
- [ ] Stripe webhook configured with production URL
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates working (automatic with Vercel)
- [ ] CORS configured for socket server
- [ ] Test signup/login flow
- [ ] Test payment flow end-to-end
- [ ] Test real-time chat
- [ ] Test QR code generation and payment
- [ ] Monitor error logs in Vercel dashboard

---

## Useful Commands:

### Update environment variable in Vercel:
```bash
vercel env add VARIABLE_NAME
```

### Trigger redeployment:
```bash
vercel --prod
```

### View logs:
```bash
vercel logs YOUR_PROJECT_URL
```

---

## Support Resources:

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

## Cost Breakdown (Free Tiers):

- **Vercel**: Free for 2 projects (100GB bandwidth/month)
- **Railway**: $5 free credit/month (enough for socket server)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Stripe**: Pay only per transaction (2.9% + $0.30)

**Total Monthly Cost**: ~$0-5 (within free tiers)
