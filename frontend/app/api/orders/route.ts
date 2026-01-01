import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    const { data: orders, error } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unread message counts for all orders in a single query (optimized)
    const orderIds = (orders || []).map((order: any) => order.id)

    let unreadCounts: Record<string, number> = {}

    if (orderIds.length > 0) {
      // Fetch all unread messages for these orders in ONE query
      const { data: unreadMessages } = await (supabase as any)
        .from('messages')
        .select('order_id')
        .in('order_id', orderIds)
        .eq('is_admin', true)
        .eq('read_by_user', false)

      // Count unread messages per order in JavaScript
      if (unreadMessages) {
        unreadCounts = unreadMessages.reduce((acc: Record<string, number>, msg: any) => {
          acc[msg.order_id] = (acc[msg.order_id] || 0) + 1
          return acc
        }, {})
      }
    }

    // Attach unread counts to orders
    const ordersWithUnread = (orders || []).map((order: any) => ({
      ...order,
      unread_count: unreadCounts[order.id] || 0,
    }))

    return NextResponse.json({ orders: ordersWithUnread }, { status: 200 })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
