# Realtime Webhook Setup Guide

This guide explains how to set up Supabase webhooks to receive realtime database change events.

## Overview

Webhooks allow you to receive HTTP callbacks when database changes occur. This is useful for:
- Sending push notifications
- Triggering email alerts
- Logging events to external services
- Running custom business logic
- Analytics and monitoring

## Webhook Endpoints

We have two webhook endpoints:

### Admin Side
```
POST https://your-admin-domain.com/api/webhooks/realtime
```

### Frontend Side
```
POST https://your-frontend-domain.com/api/webhooks/realtime
```

## Setup Steps

### 1. Configure Supabase Webhooks

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Webhooks**
3. Click **Create a new hook**

### 2. Create Webhook for Messages Table

**For Admin Side:**
- **Name:** `admin-messages-webhook`
- **Table:** `messages`
- **Events:** Select all (INSERT, UPDATE, DELETE)
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://your-admin-domain.com/api/webhooks/realtime`
- **Headers:**
  ```
  Content-Type: application/json
  ```

**For Frontend Side:**
- **Name:** `frontend-messages-webhook`
- **Table:** `messages`
- **Events:** Select all (INSERT, UPDATE, DELETE)
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://your-frontend-domain.com/api/webhooks/realtime`
- **Headers:**
  ```
  Content-Type: application/json
  ```

### 3. (Optional) Add Webhook Secret

For production, you should add a webhook secret to verify requests:

1. Generate a secret key:
   ```bash
   openssl rand -hex 32
   ```

2. Add to your `.env.local`:
   ```
   SUPABASE_WEBHOOK_SECRET=your_generated_secret
   ```

3. In Supabase webhook settings, add header:
   ```
   x-supabase-signature: your_generated_secret
   ```

4. Uncomment the signature verification in the webhook route files

### 4. Configure Webhook Payload

The webhook payload will look like this:

```json
{
  "type": "INSERT",
  "table": "messages",
  "schema": "public",
  "record": {
    "id": "uuid",
    "order_id": "uuid",
    "sender_id": "uuid",
    "is_admin": false,
    "message_text": "Hello!",
    "attachments": [],
    "read_by_user": false,
    "read_by_admin": false,
    "created_at": "2026-01-02T12:00:00Z",
    "updated_at": "2026-01-02T12:00:00Z"
  },
  "old_record": null
}
```

For UPDATE events, `old_record` will contain the previous values.

## Customizing Webhook Logic

Edit the webhook route files to add your custom logic:

**Admin:** `/adminside/app/api/webhooks/realtime/route.ts`
**Frontend:** `/frontend/app/api/webhooks/realtime/route.ts`

### Example: Send Email Notification

```typescript
async function handleInsert(payload: any) {
  const { table, record } = payload

  if (table === 'messages' && record.is_admin === false) {
    // New message from customer
    await sendEmailToAdmin({
      subject: 'New Customer Message',
      body: `Order: ${record.order_id}\nMessage: ${record.message_text}`,
    })
  }
}
```

### Example: Send Push Notification

```typescript
async function handleInsert(payload: any) {
  const { table, record } = payload

  if (table === 'messages' && record.is_admin === true) {
    // New message from admin
    await sendPushNotification({
      userId: record.sender_id,
      title: 'New message from support',
      body: record.message_text,
    })
  }
}
```

## Testing Webhooks

### 1. Local Testing with ngrok

For local development:

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. Expose local server: `ngrok http 3000`
4. Use the ngrok URL in Supabase webhook settings

### 2. Test with cURL

```bash
curl -X POST https://your-domain.com/api/webhooks/realtime \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "messages",
    "schema": "public",
    "record": {
      "id": "test-id",
      "message_text": "Test message"
    }
  }'
```

### 3. Check Logs

Monitor your application logs to see webhook events:

```bash
# Development
npm run dev

# Production (Vercel)
vercel logs
```

## Webhook vs Realtime Subscriptions

**Realtime Subscriptions (Current Setup):**
- Client-side listening for changes
- Instant UI updates
- Good for: Live chat, real-time dashboards
- Already implemented in the app

**Webhooks (New Setup):**
- Server-side HTTP callbacks
- Good for: Notifications, integrations, logging
- Runs independently of client connections

Both work together! Subscriptions update the UI, webhooks trigger background actions.

## Troubleshooting

### Webhook not firing
- Check Supabase webhook logs in Dashboard
- Verify URL is publicly accessible
- Check your application logs for errors

### Authentication errors
- Verify webhook secret matches
- Check headers are correctly configured

### Payload issues
- Log the full payload to debug
- Check the record structure matches your expectations

## Security Best Practices

1. **Always verify webhook signatures** in production
2. **Use HTTPS** for webhook URLs
3. **Rate limit** webhook endpoints
4. **Validate payload** structure before processing
5. **Handle errors** gracefully to avoid webhook retries

## Next Steps

1. Set up webhooks in Supabase Dashboard
2. Test with sample messages
3. Add your custom logic (notifications, etc.)
4. Deploy to production
5. Monitor webhook logs

For more information, see:
- [Supabase Webhooks Documentation](https://supabase.com/docs/guides/database/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
