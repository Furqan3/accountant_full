import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

/**
 * TEMPORARY ADMIN ENDPOINT FOR TESTING
 * This endpoint allows sending messages as admin without authentication
 * WARNING: Remove this before production! This is only for testing.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, messageText, attachments, adminEmail } = await req.json()

    // Validate required fields
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    if (!messageText && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: 'Message text or attachments required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Verify order exists and get the user
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get admin user ID from environment or use a system approach
    // OPTION 1: Use environment variable for a dedicated admin user
    const adminUserId = process.env.ADMIN_USER_ID

    // OPTION 2: If no admin user is set, get the first admin user from auth.users
    // This is a fallback for testing only
    let finalAdminUserId = adminUserId

    if (!finalAdminUserId) {
      // Try to get any existing user from auth.users to use as admin
      // In production, you should have a dedicated admin user
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

      if (usersError || !users || users.users.length === 0) {
        return NextResponse.json(
          {
            error: 'No admin user configured. Please set ADMIN_USER_ID environment variable or ensure at least one user exists in auth.users',
            hint: 'Create a user account first, then use that user\'s ID as ADMIN_USER_ID in your .env file'
          },
          { status: 500 }
        )
      }

      // Use the first user as fallback (for testing only)
      finalAdminUserId = users.users[0].id
      console.warn('⚠️ Using first available user as admin. Set ADMIN_USER_ID in .env for production!')
    }

    // Create admin message
    const { data: message, error: messageError } = await (supabase as any)
      .from('messages')
      .insert({
        order_id: orderId,
        sender_id: finalAdminUserId,
        is_admin: true,  // This marks it as an admin message
        message_text: messageText || null,
        attachments: attachments || [],
        read_by_user: false,  // User hasn't read it yet
        read_by_admin: true,  // Admin has read it (since they sent it)
      })
      .select('*')
      .single()

    if (messageError) {
      console.error('Error creating admin message:', messageError)
      return NextResponse.json(
        { error: 'Failed to send admin message', details: messageError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message,
      note: 'Admin message sent successfully',
    })
  } catch (error: any) {
    console.error('Send admin message error:', error)
    return NextResponse.json(
      { error: 'Something went wrong', details: error.message },
      { status: 500 }
    )
  }
}
