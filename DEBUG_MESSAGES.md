# Debug Guide: Messages Not Showing in Frontend

Follow these steps to identify why messages aren't appearing:

## Step 1: Check Browser Console

Open browser DevTools (F12) and check for errors:

### Look for these errors:
- ❌ **Realtime subscription errors** - "Failed to subscribe"
- ❌ **CORS errors** - "blocked by CORS policy"
- ❌ **Authentication errors** - "Unauthorized"
- ❌ **Network errors** - "Failed to fetch"

### Expected console logs:
- ✅ `New message received:` - Should appear when message is sent
- ✅ `Message updated:` - Should appear for UPDATE events
- ✅ Real-time subscription connected logs

## Step 2: Verify Realtime is Enabled in Supabase

1. Go to **Supabase Dashboard** → **Project Settings** → **API**
2. Scroll down to **Realtime**
3. Make sure **Enable Realtime** is ON
4. Check if `messages` table is in the **Realtime enabled tables** list

If `messages` is not listed:
```sql
-- Run this in SQL Editor
ALTER TABLE messages REPLICA IDENTITY FULL;
```

## Step 3: Check Message is Being Inserted

1. Go to **Supabase Dashboard** → **Table Editor** → **messages**
2. Send a test message
3. Refresh the table - does the new message appear?

If YES → Database insert works, problem is with frontend subscription
If NO → Database insert is failing

## Step 4: Test Realtime Subscription Manually

Add this to your browser console while on the chat page:

```javascript
// Test if Supabase client is available
console.log('Supabase:', typeof supabase !== 'undefined' ? 'Available' : 'Not available')

// Check current subscriptions
console.log('Active channels:', window.supabase?._realtime?.channels)
```

## Step 5: Check Which Side Isn't Working

### Test Admin Side:
1. Open **Admin** → Chat
2. Send a message as **Client** (from frontend)
3. Does it appear in Admin chat?

### Test Frontend Side:
1. Open **Frontend** → Messages
2. Send a message as **Admin**
3. Does it appear in Frontend?

### Results:
- ❌ **Neither side shows messages** → Realtime disabled or subscription issue
- ❌ **Admin works, Frontend doesn't** → Frontend subscription issue
- ❌ **Frontend works, Admin doesn't** → Admin subscription issue
- ✅ **Both work** → No issue!

## Step 6: Common Issues & Fixes

### Issue 1: Realtime Not Enabled

**Fix:**
1. Supabase Dashboard → Database → Replication
2. Enable Realtime for `messages` table
3. Or run: `ALTER TABLE messages REPLICA IDENTITY FULL;`

### Issue 2: Subscription Not Connecting

**Check in browser console:**
```javascript
// Should see connection status
supabase.channel('test').subscribe((status) => {
  console.log('Subscription status:', status)
})
```

**Fix:**
- Refresh the page
- Clear browser cache
- Check internet connection

### Issue 3: Messages Insert but Don't Update UI

**Possible causes:**
- React state not updating
- Message format doesn't match interface
- Filter preventing message from showing

**Fix:**
Check browser console for React warnings/errors

### Issue 4: Old Session Token

**Fix:**
```javascript
// In browser console
localStorage.clear()
// Then refresh and sign in again
```

## Step 7: Enable Debug Logging

Add this to your chat page to see detailed logs:

### For Admin (`adminside/app/(main)/chat/page.tsx`):

Add after line 43:
```typescript
.on('system', {}, (payload) => {
  console.log('🔌 Realtime system event:', payload)
})
```

### For Frontend (`frontend/components/messages/message-panel.tsx`):

Add debug logs in the subscription setup to see what's happening.

## Step 8: Manual Test

Try manually triggering a message insert in SQL Editor:

```sql
INSERT INTO messages (
  order_id,
  sender_id,
  is_admin,
  message_text,
  attachments,
  read_by_user,
  read_by_admin
) VALUES (
  'your-order-id',  -- Replace with actual order ID
  'your-user-id',   -- Replace with actual user ID
  true,
  'Test message from SQL',
  '[]'::jsonb,
  false,
  true
);
```

Watch the browser - does the message appear?

## Quick Diagnostics Checklist

Run through this checklist:

- [ ] Webhook is working (you said YES ✅)
- [ ] Realtime is enabled in Supabase
- [ ] `messages` table has Realtime enabled
- [ ] Browser console shows no errors
- [ ] Subscription is connecting (check logs)
- [ ] Messages appear in Supabase table editor
- [ ] User is authenticated (check `user` object)
- [ ] Order ID matches between chat and messages

## Most Likely Issues

Based on "webhook works but frontend doesn't show messages":

### 1. Realtime Not Enabled for Messages Table (90% likely)

**Solution:**
```sql
-- Run in Supabase SQL Editor
ALTER TABLE messages REPLICA IDENTITY FULL;
```

Then in Supabase Dashboard:
- Database → Replication → Enable for `messages`

### 2. Filter Mismatch (5% likely)

Check if `order_id` in the subscription filter matches the actual order ID

### 3. React State Not Updating (5% likely)

Check browser console for React errors

## Need More Help?

Share these details:
1. Browser console errors (screenshot)
2. Supabase Realtime status (enabled/disabled)
3. Does message appear in Supabase table editor?
4. Which side isn't working (admin/frontend/both)?
