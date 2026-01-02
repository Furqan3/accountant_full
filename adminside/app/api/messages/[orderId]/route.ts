import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get messages for this order
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({
        error: 'Failed to fetch messages',
        details: messagesError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      messages: messages || [],
      total: messages?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      error: 'Failed to fetch messages',
      details: error.message
    }, { status: 500 });
  }
}
