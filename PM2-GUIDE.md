# PM2 Process Manager Guide

This project includes PM2 configuration files to manage all services (Admin Dashboard, Frontend, and Socket Server).

## Prerequisites

Install PM2 globally:
```bash
npm install -g pm2
```

## Quick Start

### Development Mode

Start all services in development mode:
```bash
pm2 start ecosystem.dev.config.js
```

### Production Mode

1. First, build all services:
```bash
cd adminside && npm run build && cd ..
cd frontend && npm run build && cd ..
cd socket-server && npm run build && cd ..
```

2. Start all services in production mode:
```bash
pm2 start ecosystem.config.js
```

## PM2 Commands

### Managing Services

```bash
# Start all services
pm2 start ecosystem.config.js

# Start specific service
pm2 start ecosystem.config.js --only adminside
pm2 start ecosystem.config.js --only frontend
pm2 start ecosystem.config.js --only socket-server

# Stop all services
pm2 stop all

# Stop specific service
pm2 stop adminside
pm2 stop frontend
pm2 stop socket-server

# Restart all services
pm2 restart all

# Restart specific service
pm2 restart adminside

# Delete all services from PM2
pm2 delete all

# Delete specific service
pm2 delete adminside

# Reload all services (zero-downtime reload)
pm2 reload all
```

### Monitoring

```bash
# View all running processes
pm2 list

# Monitor all services (real-time)
pm2 monit

# View logs for all services
pm2 logs

# View logs for specific service
pm2 logs adminside
pm2 logs frontend
pm2 logs socket-server

# Clear all logs
pm2 flush

# Show detailed info about a service
pm2 show adminside
```

### Startup Script (Auto-restart on server reboot)

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save

# Remove startup script
pm2 unstartup
```

## Service Details

| Service       | Port | Description                    |
|---------------|------|--------------------------------|
| adminside     | 3000 | Admin Dashboard (Next.js)      |
| frontend      | 3001 | User Frontend (Next.js)        |
| socket-server | 4000 | Real-time Socket.io Server     |

## Log Files

All logs are stored in the `./logs` directory:

- `adminside-error.log` / `adminside-out.log`
- `frontend-error.log` / `frontend-out.log`
- `socket-server-error.log` / `socket-server-out.log`

Development logs have `-dev` suffix.

## Environment Variables

Make sure you have the following `.env.local` files configured:

- `./adminside/.env.local`
- `./frontend/.env.local`
- `./socket-server/.env`

## Troubleshooting

### Service not starting

1. Check logs:
   ```bash
   pm2 logs <service-name>
   ```

2. Check service status:
   ```bash
   pm2 list
   ```

3. Restart the service:
   ```bash
   pm2 restart <service-name>
   ```

### Port already in use

Stop all PM2 processes and check for processes using the ports:
```bash
pm2 stop all
lsof -i :3000
lsof -i :3001
lsof -i :4000
```

### Reset PM2

If you need to completely reset PM2:
```bash
pm2 kill
pm2 start ecosystem.config.js
```

## Advanced Configuration

### Cluster Mode (for scaling)

To run services in cluster mode (multiple instances), edit `ecosystem.config.js`:

```javascript
{
  name: 'frontend',
  instances: 'max', // or a specific number like 4
  exec_mode: 'cluster',
  // ... other settings
}
```

**Note:** Socket server should stay in `fork` mode due to socket.io sticky sessions.

### Memory Limits

Each service has a memory restart limit:
- Admin/Frontend: 1GB
- Socket Server: 512MB

Adjust these in the ecosystem config if needed.

## Production Deployment

1. Build all services
2. Start with PM2: `pm2 start ecosystem.config.js`
3. Setup startup script: `pm2 startup && pm2 save`
4. Monitor: `pm2 monit`

## Useful Scripts

You can add these to your root `package.json`:

```json
{
  "scripts": {
    "pm2:dev": "pm2 start ecosystem.dev.config.js",
    "pm2:prod": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop all",
    "pm2:restart": "pm2 restart all",
    "pm2:logs": "pm2 logs",
    "pm2:monit": "pm2 monit",
    "pm2:delete": "pm2 delete all"
  }
}
```

Then use:
```bash
npm run pm2:dev
npm run pm2:logs
```
