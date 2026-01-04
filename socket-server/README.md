# Socket.io Server - Real-time Chat

This is a standalone Socket.io server that provides real-time messaging functionality for the Accountant application. It handles bidirectional communication between the frontend (client) and adminside.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Testing the Server](#testing-the-server)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## Prerequisites

Before running the Socket.io server, ensure you have:

- **Node.js** v18 or higher installed
- **npm** v8 or higher
- Access to your Supabase credentials (URL and Service Role Key)
- Frontend and Adminside applications configured to connect to this server

---

## Installation

### 1. Navigate to the socket-server directory

```bash
cd D:\accountant_full\socket-server
```

### 2. Install dependencies

```bash
npm install
```

This will install all required packages:
- `socket.io` - Real-time communication library
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `@supabase/supabase-js` - Supabase client for authentication

---

## Configuration

### 1. Environment Variables

The `.env` file is already configured with your Supabase credentials. Verify the configuration:

**File: `.env`**

```env
PORT=4000
SUPABASE_URL=https://busqfmdrslmursuxwmjj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
NODE_ENV=development
```

**Configuration Options:**

- `PORT` - The port the server runs on (default: 4000)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (frontend and adminside URLs)
- `NODE_ENV` - Environment (development, production)

### 2. Update Allowed Origins for Production

If deploying to production, update the `ALLOWED_ORIGINS` to include your production URLs:

```env
ALLOWED_ORIGINS=https://your-frontend.com,https://your-admin.com
```

---

## Running the Server

### Development Mode (Recommended)

Development mode uses `tsx watch` which automatically restarts the server when you make changes:

```bash
npm run dev
```

**Expected Output:**

```
============================================================
🚀 Socket.io server running on port 4000
📡 Allowed origins: http://localhost:3000, http://localhost:3001
🌍 Environment: development
============================================================
```

### Production Mode

1. **Build the TypeScript code:**

```bash
npm run build
```

2. **Start the server:**

```bash
npm start
```

---

## Testing the Server

### 1. Health Check

Once the server is running, verify it's working by checking the health endpoint:

**Using a browser:**
```
http://localhost:4000/health
```

**Using curl:**
```bash
curl http://localhost:4000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-04T12:34:56.789Z"
}
```

### 2. Monitor Console Logs

When the server is running, you'll see logs for:

- **Connections:**
  ```
  🔌 New connection: user@example.com (ID: abc123, Admin: false)
  ```

- **Room Joins:**
  ```
  ✅ User abc123 joined room: order:order-id-123
  ```

- **Messages:**
  ```
  📨 Message sent in order:order-id-123 by user abc123
  ```

- **Disconnections:**
  ```
  👋 User disconnected: abc123
  ```

### 3. Test Real-time Messaging

1. **Start the Socket.io server** (this terminal)
   ```bash
   npm run dev
   ```

2. **Start the frontend** (new terminal)
   ```bash
   cd D:\accountant_full\frontend
   npm run dev
   ```

3. **Start the adminside** (new terminal)
   ```bash
   cd D:\accountant_full\adminside
   npm run dev
   ```

4. **Test the flow:**
   - Login to frontend at http://localhost:3000
   - Login to adminside at http://localhost:3001
   - Open the messages page on frontend
   - Open the chat page on adminside
   - Select the same order on both sides
   - Send messages from either side
   - **✅ Messages should appear instantly on both sides!**

---

## Troubleshooting

### Server Won't Start

**Error: "Missing Supabase environment variables"**

**Solution:** Check that your `.env` file exists and contains valid `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

```bash
# Verify .env file exists
ls -la .env

# Check environment variables are loading
node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL)"
```

---

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::4000"**

**Solution:** Another process is using port 4000. Either:

1. **Kill the process using port 4000:**
   ```bash
   # Windows
   netstat -ano | findstr :4000
   taskkill /PID <PID> /F

   # Linux/Mac
   lsof -ti:4000 | xargs kill -9
   ```

2. **Change the port** in `.env`:
   ```env
   PORT=4001
   ```

   Then update the frontend and adminside `.env.local` files:
   ```env
   NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4001
   ```

---

### Connection Errors

**Error: "Authentication token required"**

**Cause:** Client is trying to connect without a valid Supabase access token.

**Solution:** Ensure the user is logged in before the Socket.io client initializes. The SocketProvider automatically handles this.

---

**Error: "Invalid authentication token"**

**Cause:** The token has expired or is invalid.

**Solution:**
1. Check that Supabase Auth is working correctly
2. Verify the token is being passed correctly in the socket handshake
3. Log out and log back in to get a fresh token

---

### Messages Not Appearing

**Symptoms:** Messages sent but not received on the other side.

**Debug Steps:**

1. **Check server logs** for:
   - User joined room successfully
   - Message broadcast events

2. **Check browser console** (F12) for:
   - Socket connection status
   - "new-message" events being received

3. **Verify both users are in the same room:**
   - Server logs should show both users joining `order:same-order-id`

4. **Check authorization:**
   - Regular users can only join their own order rooms
   - Admins can join any order room

---

### CORS Errors

**Error: "CORS policy: No 'Access-Control-Allow-Origin' header"**

**Solution:** Update `ALLOWED_ORIGINS` in `.env` to include the origin making the request:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-domain.com
```

Restart the server after changing environment variables.

---

## Production Deployment

### Recommended Platforms

- **Heroku**
- **Railway**
- **Render**
- **AWS EC2**
- **DigitalOcean**
- **VPS with PM2**

### Deployment Checklist

- [ ] Set `NODE_ENV=production` in environment variables
- [ ] Update `ALLOWED_ORIGINS` to include production URLs
- [ ] Use a process manager (PM2, systemd, or platform-specific)
- [ ] Set up SSL/TLS (use `https://` URLs)
- [ ] Configure firewall to allow traffic on the socket port
- [ ] Set up monitoring and logging
- [ ] Enable auto-restart on crashes

### Example: Deploy with PM2

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Start with PM2:**
   ```bash
   pm2 start dist/index.js --name socket-server
   ```

4. **Configure auto-restart:**
   ```bash
   pm2 startup
   pm2 save
   ```

5. **Monitor:**
   ```bash
   pm2 logs socket-server
   pm2 monit
   ```

### Example: Deploy to Railway

1. Push your code to GitHub

2. Create a new project on Railway.app

3. Connect your GitHub repository

4. Set environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALLOWED_ORIGINS` (your production URLs)
   - `NODE_ENV=production`

5. Railway will automatically detect and deploy your Node.js app

6. Update frontend and adminside `.env.local` with the Railway URL:
   ```env
   NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-app.railway.app
   ```

---

## Architecture Overview

### Server Structure

```
socket-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── config/
│   │   └── supabase.ts       # Supabase client configuration
│   ├── middleware/
│   │   └── auth.ts           # Socket authentication middleware
│   ├── handlers/
│   │   └── messageHandlers.ts # Message event handlers
│   └── types/
│       └── socket.ts         # TypeScript type definitions
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

### How It Works

1. **Client connects** with Supabase access token
2. **Server validates token** using Supabase Auth
3. **User joins order room** based on authorization
4. **Messages are sent** via REST API (saves to database)
5. **Server broadcasts** message to all users in the room
6. **Clients receive** message via Socket.io event
7. **UI updates** instantly with the new message

### Events

**Client → Server:**
- `join-order-room` - Join a specific order's chat room
- `leave-order-room` - Leave an order's chat room
- `send-message` - Send a new message (alternative to REST API)

**Server → Client:**
- `new-message` - New message received in current room
- `message-updated` - Existing message was updated
- `error` - Error notification

---

## Additional Notes

### Security

- Authentication is required for all connections
- Users can only access their own orders (admins can access all)
- All messages are validated before broadcasting
- CORS is configured to only allow known origins

### Performance

- Rooms are used to isolate conversations
- Only users in the same room receive messages
- Automatic reconnection with room rejoin
- Supports WebSocket and polling transports

### Scaling

For horizontal scaling (multiple server instances):

1. Install Redis adapter:
   ```bash
   npm install @socket.io/redis-adapter redis
   ```

2. Update `src/index.ts` to use Redis adapter:
   ```typescript
   import { createAdapter } from '@socket.io/redis-adapter'
   import { createClient } from 'redis'

   const pubClient = createClient({ url: 'redis://localhost:6379' })
   const subClient = pubClient.duplicate()

   io.adapter(createAdapter(pubClient, subClient))
   ```

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review server logs for errors
3. Check that all environment variables are correct
4. Ensure Supabase is accessible and configured properly

---

**Happy Chatting! 💬**
