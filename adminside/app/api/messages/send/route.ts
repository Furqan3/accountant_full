import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderId, messageText, attachments } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!messageText && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: 'Message text or attachments required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify order exists
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get admin user ID from environment
    const adminUserId = process.env.ADMIN_USER_ID;

    if (!adminUserId) {
      // Try to get the first admin user from admin_users table
      const { data: adminUsers, error: adminError } = await supabaseAdmin
        .from('admin_users')
        .select('user_id')
        .limit(1)
        .single();

      if (adminError || !adminUsers) {
        return NextResponse.json({
          error: 'No admin user configured',
          hint: 'Please set ADMIN_USER_ID in your .env file or ensure admin_users table has entries'
        }, { status: 500 });
      }
    }

    const finalAdminUserId = adminUserId || order.user_id; // Fallback to order user if no admin

    // Create admin message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        order_id: orderId,
        sender_id: finalAdminUserId,
        is_admin: true,
        message_text: messageText || null,
        attachments: attachments || [],
        read_by_user: false,
        read_by_admin: true,
      })
      .select('*')
      .single();

    if (messageError) {
      console.error('Error creating admin message:', messageError);
      return NextResponse.json({
        error: 'Failed to send message',
        details: messageError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      error: 'Failed to send message',
      details: error.message
    }, { status: 500 });
  }
}
