// Load environment variables FIRST before any imports that use them
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { authenticateSocket } from './middleware/auth'
import { registerMessageHandlers } from './handlers/messageHandlers'
import { ServerToClientEvents, ClientToServerEvents, SocketData, Message } from './types/socket'
import { supabase } from './config/supabase'

const app = express()
const httpServer = createServer(app)

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001']

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Initialize Socket.io
const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

// Apply authentication middleware
io.use(authenticateSocket)

// Handle socket connections
io.on('connection', (socket) => {
  const { userId, email, isAdmin } = socket.data
  console.log(`🔌 New connection: ${email} (ID: ${userId}, Admin: ${isAdmin})`)

  // Add admin users to a dedicated admin room
  if (isAdmin) {
    socket.join('admins')
    console.log(`👨‍💻 Admin ${email} joined the 'admins' room.`)
  }

  // Add all users to their own user room for global notifications
  socket.join(`user:${userId}`)
  console.log(`👤 User ${email} joined their personal room: user:${userId}`)

  // Register message handlers for this socket
  registerMessageHandlers(io, socket)
})

// Listen to Supabase Realtime for all message inserts and broadcast them
console.log('📡 Setting up Supabase Realtime listeners...')

// Channel for message updates
const messageChannel = supabase
  .channel('db-messages')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages',
    },
    async (payload) => {
      const { eventType } = payload
      const newMessage = payload.new as Message
      const orderId = newMessage.order_id

      // Get order owner to broadcast to their personal room
      let orderOwnerId: string | null = null
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('user_id')
          .eq('id', orderId)
          .single()
        orderOwnerId = order?.user_id || null
      } catch (error) {
        console.error('Error fetching order owner:', error)
      }

      if (eventType === 'INSERT') {
        console.log(`📨 New message in DB for order:${orderId}, broadcasting...`)
        // Broadcast to the specific order room
        io.to(`order:${orderId}`).emit('new-message', { orderId, message: newMessage })
        // Also broadcast to all admins so they get notified even if not in the room
        io.to('admins').emit('new-message', { orderId, message: newMessage })
        // Also broadcast to the order owner's personal room for global notifications
        if (orderOwnerId) {
          io.to(`user:${orderOwnerId}`).emit('new-message', { orderId, message: newMessage })
          console.log(`📡 Also broadcast to user:${orderOwnerId}`)
        }
      } else if (eventType === 'UPDATE') {
        console.log(`🔄 Message updated in DB for order:${orderId}, broadcasting...`)
        // Broadcast to the specific order room
        io.to(`order:${orderId}`).emit('message-updated', { orderId, message: newMessage })
        // Also broadcast to all admins
        io.to('admins').emit('message-updated', { orderId, message: newMessage })
        // Also broadcast to the order owner's personal room
        if (orderOwnerId) {
          io.to(`user:${orderOwnerId}`).emit('message-updated', { orderId, message: newMessage })
        }
      }
    }
  )
  .subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Listening for message changes')
    } else if (err) {
      console.error('❌ Error subscribing to message changes:', err)
    }
  })

// Channel for order updates (for admin dashboard)
const orderChannel = supabase
  .channel('db-orders')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
    },
    (payload) => {
      console.log(`📦 Order change detected (event: ${payload.eventType}), broadcasting to admins...`)
      io.to('admins').emit('dashboard-refresh')
    }
  )
  .subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Listening for order changes for admin dashboard')
    } else if (err) {
      console.error('❌ Error subscribing to order changes:', err)
    }
  })

// Start server
const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log(`🚀 Socket.io server running on port ${PORT}`)
  console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('='.repeat(60))
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
