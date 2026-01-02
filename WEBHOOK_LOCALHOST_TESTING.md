# Testing Webhooks on Localhost

Since Supabase needs a publicly accessible URL to send webhooks, you need to expose your localhost. Here are the best options:

## Option 1: Use ngrok (Recommended)

### Install ngrok

```bash
# Using npm
npm install -g ngrok

# Or download from https://ngrok.com/download
```

### Start your dev server

```bash
# Terminal 1 - Admin side
cd adminside
npm run dev
# Runs on http://localhost:3001

# Terminal 2 - Frontend (if needed)
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Expose with ngrok

```bash
# Terminal 3 - For admin webhooks
ngrok http 3001

# You'll get a URL like: https://abc123.ngrok.io
```

### Configure Supabase Webhook

1. Go to Supabase Dashboard → Database → Webhooks
2. Create new webhook:
   - **Name:** `localhost-admin-messages`
   - **Table:** `messages`
   - **Events:** INSERT, UPDATE, DELETE
   - **URL:** `https://abc123.ngrok.io/api/webhooks/realtime`
   - **Method:** POST

### Test it!

1. Send a message in your chat
2. Check the terminal running `npm run dev` - you should see:
   ```
   📨 Realtime webhook received: { type: 'INSERT', table: 'messages', ... }
   ✉️ New message created: { id: '...', orderId: '...', ... }
   ```

3. Check ngrok dashboard at http://localhost:4040 to see webhook requests

## Option 2: Use Cloudflare Tunnel (Free, No Account Needed)

### Install cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Windows
# Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Start tunnel

```bash
# Admin side
cloudflared tunnel --url http://localhost:3001

# You'll get a URL like: https://xyz.trycloudflare.com
```

### Configure in Supabase

Use the cloudflare URL: `https://xyz.trycloudflare.com/api/webhooks/realtime`

## Option 3: Skip Webhooks for Now

**Alternative:** Just rely on Realtime Subscriptions (already working!)

The chat already works perfectly with Supabase Realtime subscriptions. You only need webhooks if you want:
- Email/SMS notifications
- Logging to external services
- Automated responses
- Analytics tracking

**For now, you can skip webhooks entirely** and enable them later when you deploy to production.

## Option 4: Mock Webhooks Locally

You can test webhook logic without Supabase by manually calling the endpoint:

```bash
# Test admin webhook
curl -X POST http://localhost:3001/api/webhooks/realtime \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "messages",
    "schema": "public",
    "record": {
      "id": "test-123",
      "order_id": "order-456",
      "sender_id": "user-789",
      "is_admin": false,
      "message_text": "Test webhook message",
      "attachments": [],
      "read_by_user": false,
      "read_by_admin": false,
      "created_at": "2026-01-02T12:00:00Z",
      "updated_at": "2026-01-02T12:00:00Z"
    },
    "old_record": null
  }'
```

Check your terminal - you should see the webhook logs!

## Recommended Approach for Development

**Right now (localhost testing):**
1. ✅ Use Realtime Subscriptions (already working)
2. ❌ Skip webhook setup for localhost
3. 🔧 Test webhook routes with cURL if needed

**Later (production deployment):**
1. Deploy to Vercel/Netlify
2. Get public URLs
3. Configure webhooks in Supabase
4. Add notification logic

## Quick Decision Guide

**Do you need to test webhooks RIGHT NOW?**
- **No** → Skip webhooks, use Realtime subscriptions (already working perfectly!)
- **Yes** → Use ngrok (easiest) or cloudflare tunnel

**When to use webhooks?**
- Sending email/SMS notifications
- Logging to external services (e.g., Slack, Discord)
- Triggering automated workflows
- Analytics and monitoring

**Current status:**
- ✅ Chat works in realtime without webhooks
- ✅ Files upload and display instantly
- ✅ Both admin and client see updates live
- 🔜 Webhooks are optional extras for notifications/integrations

## Ngrok Quick Start (Copy & Paste)

```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Start your dev server (in one terminal)
cd /home/unk/projects/accountant_project/adminside
npm run dev

# 3. Expose it (in another terminal)
ngrok http 3001

# 4. Copy the https URL from ngrok (e.g., https://abc123.ngrok.io)
# 5. In Supabase Dashboard → Database → Webhooks:
#    URL: https://abc123.ngrok.io/api/webhooks/realtime
#    Table: messages
#    Events: INSERT, UPDATE, DELETE
#    Method: POST

# 6. Test by sending a chat message
# 7. Check your terminal for webhook logs!
```

## Bottom Line

**For localhost testing, you have 3 choices:**

1. 🚀 **ngrok** - Easiest, most popular
2. ☁️ **Cloudflare tunnel** - Free, no account
3. 🎯 **Skip for now** - Enable in production (recommended)

Your chat already works perfectly without webhooks! They're only needed for additional features like notifications.
