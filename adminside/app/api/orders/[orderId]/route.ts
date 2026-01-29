import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch user details
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = users?.users?.find((u: any) => u.id === order.user_id);

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('id', order.user_id)
      .single();

    // Extract company info from metadata
    let companyName = 'Unknown Company';
    let companyNumber = null;
    let services: Array<{ name: string; quantity: number }> = [];

    try {
      if (order.metadata?.items) {
        const items = typeof order.metadata.items === 'string'
          ? JSON.parse(order.metadata.items)
          : order.metadata.items;

        if (items && items.length > 0) {
          if (items[0].companyName) {
            companyName = items[0].companyName;
          }
          if (items[0].companyNumber) {
            companyNumber = items[0].companyNumber;
          }
          services = items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity || 1,
          }));
        }
      } else if (order.metadata?.companyName) {
        companyName = order.metadata.companyName;
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }

    const userName = profile?.full_name || authUser?.email || 'Unknown User';

    return NextResponse.json({
      order: {
        id: order.id,
        name: userName,
        companyName,
        lastMessage: '',
        timestamp: new Date(order.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        unread: 0,
        orderDetails: {
          orderId: order.id,
          amount: order.amount,
          status: order.status,
          created_at: order.created_at,
          companyName,
          companyNumber,
          services,
        },
        user: authUser ? {
          name: profile?.full_name || authUser.email,
          email: authUser.email,
        } : null,
      }
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}
