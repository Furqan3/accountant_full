import { Server, Socket } from 'socket.io'
import { supabase } from '../config/supabase'
import { SocketData, SendMessagePayload } from '../types/socket'
import { sendEmail, getNewMessageEmailContent } from '../utils/email'

// Helper to format service type for display
function formatServiceType(serviceType: string): string {
  const serviceNames: { [key: string]: string } = {
    'confirmation-statement': 'Confirmation Statement',
    'annual-accounts': 'Annual Accounts',
    'vat-return': 'VAT Return',
    'corporation-tax': 'Corporation Tax',
    'payroll': 'Payroll Services',
    'bookkeeping': 'Bookkeeping',
    'company-formation': 'Company Formation',
    'registered-office': 'Registered Office',
    'dormant-accounts': 'Dormant Accounts',
  }
  return serviceNames[serviceType] || serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Service'
}

export function registerMessageHandlers(io: Server, socket: Socket) {
  const socketData = socket.data as SocketData

  // Handle joining an order room
  socket.on('join-order-room', async (orderId: string) => {
    try {
      const { userId, isAdmin } = socketData

      // Admins can join any room
      if (isAdmin) {
        await socket.join(`order:${orderId}`)
        console.log(`✅ Admin ${userId} joined room: order:${orderId}`)
        return
      }

      // Regular users can only join their own orders
      const { data: order, error } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single()

      if (error || !order) {
        console.error(`❌ Order not found: ${orderId}`)
        socket.emit('error', { message: 'Order not found' })
        return
      }

      if (order.user_id === userId) {
        await socket.join(`order:${orderId}`)
        console.log(`✅ User ${userId} joined room: order:${orderId}`)
      } else {
        console.error(`❌ Unauthorized access attempt by ${userId} to order ${orderId}`)
        socket.emit('error', { message: 'Unauthorized access to order' })
      }
    } catch (error: any) {
      console.error('Error joining room:', error.message)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // Handle leaving an order room
  socket.on('leave-order-room', async (orderId: string) => {
    try {
      await socket.leave(`order:${orderId}`)
      console.log(`👋 User ${socketData.userId} left room: order:${orderId}`)
    } catch (error: any) {
      console.error('Error leaving room:', error.message)
    }
  })

  // Handle sending a message
  socket.on('send-message', async (
    payload: SendMessagePayload,
    callback: (response: { success: boolean; error?: string }) => void
  ) => {
    try {
      const { orderId, messageText, attachments, fromAdminApp } = payload
      const { userId, isAdmin } = socketData

      console.log('🔍 [SEND-MSG] Payload received:', {
        orderId,
        fromAdminApp,
        userId,
        isAdmin,
        messageText: messageText?.substring(0, 50)
      })

      if (!orderId) {
        return callback({ success: false, error: 'Order ID is required' })
      }

      if (!messageText && (!attachments || attachments.length === 0)) {
        return callback({ success: false, error: 'Message text or attachments required' })
      }

      // Verify user has access to this order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        return callback({ success: false, error: 'Order not found' })
      }

      // Check authorization
      if (!isAdmin && order.user_id !== userId) {
        return callback({ success: false, error: 'Unauthorized' })
      }

      // Save message to database
      // is_admin indicates if message is from admin side (support), not user role
      const messageData = {
        order_id: orderId,
        sender_id: userId,
        is_admin: fromAdminApp, // True if from adminside, false if from frontend
        message_text: messageText || null,
        attachments: attachments || [],
        read_by_user: !fromAdminApp, // Adminside messages not read by user yet
        read_by_admin: fromAdminApp, // Frontend messages not read by admin yet
      }

      console.log('💾 [SEND-MSG] Inserting message to DB:', {
        order_id: messageData.order_id,
        is_admin: messageData.is_admin,
        fromAdminApp,
        sender_id: messageData.sender_id
      })

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert(messageData)
        .select('*')
        .single()

      if (messageError || !message) {
        console.error('Error saving message:', messageError?.message)
        return callback({ success: false, error: 'Failed to send message' })
      }

      console.log('✅ [SEND-MSG] Message saved to DB:', {
        id: message.id,
        is_admin: message.is_admin,
        fromAdminApp
      })

      // Broadcast to all clients in the order room
      io.to(`order:${orderId}`).emit('new-message', {
        orderId,
        message,
      })

      // Also broadcast to all admins (so they get notified even if not in the room)
      io.to('admins').emit('new-message', {
        orderId,
        message,
      })

      // Acknowledge success
      callback({ success: true })

      console.log(`📨 Message sent in order:${orderId} by ${fromAdminApp ? 'ADMINSIDE' : 'FRONTEND'} (user: ${userId})`)
      console.log(`📡 Broadcast to order room and admins room`)

      // Send email notification to user when admin sends a message
      if (fromAdminApp && messageText) {
        try {
          // Get order details and user info
          const { data: orderDetails } = await supabase
            .from('orders')
            .select('user_id, service_type')
            .eq('id', orderId)
            .single()

          if (orderDetails) {
            // Get user profile for name
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', orderDetails.user_id)
              .single()

            // Get user email from auth.users using admin API
            const { data: authData } = await supabase.auth.admin.getUserById(orderDetails.user_id)
            const userEmail = authData?.user?.email

            if (userEmail) {
              const emailContent = getNewMessageEmailContent({
                userName: profile?.full_name || 'Customer',
                orderNumber: orderId.slice(0, 8).toUpperCase(),
                messagePreview: messageText,
                serviceName: formatServiceType(orderDetails.service_type)
              })

              await sendEmail({
                to: userEmail,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text
              })

              console.log(`✉️ Email notification sent to ${userEmail} for new message`)
            }
          }
        } catch (emailError) {
          console.error('Error sending message notification email:', emailError)
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error.message)
      callback({ success: false, error: 'Failed to send message' })
    }
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socketData.userId}`)
  })
}
