import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await Promise.resolve(params)
    const orderId = resolvedParams.orderId

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const order = searchParams.get('order') || 'desc' // desc = latest first, asc = oldest first

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Verify user owns this order
    const { data: orderData, error: orderError } = await (supabase as any)
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single()

    if (orderError || !orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (orderData.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get total count of messages for this order
    const { count: totalCount, error: countError } = await (supabase as any)
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId)

    if (countError) {
      console.error('Error counting messages:', countError)
    }

    // Get messages for this order with pagination
    const { data: messages, error: messagesError } = await (supabase as any)
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      console.error('Error details:', JSON.stringify(messagesError, null, 2))

      // Check if table doesn't exist
      if (messagesError.code === '42P01' || messagesError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Messages table not set up. Please run the SQL schema script.' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to fetch messages', details: messagesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: totalCount ? offset + limit < totalCount : false,
      },
    })
  } catch (error: any) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
