import { Socket } from 'socket.io'
import { supabase } from '../config/supabase'
import { SocketData } from '../types/socket'

export async function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication token required'))
    }

    // Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Authentication error:', error?.message)
      return next(new Error('Invalid authentication token'))
    }

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError) {
      console.error('Error checking admin status:', adminError.message)
    }

    // Store user data in socket
    socket.data = {
      userId: user.id,
      email: user.email || '',
      isAdmin: !!adminUser,
    } as SocketData

    console.log(`✅ User authenticated: ${user.email} (Admin: ${!!adminUser})`)
    next()
  } catch (error: any) {
    console.error('Authentication middleware error:', error.message)
    next(new Error('Authentication failed'))
  }
}
