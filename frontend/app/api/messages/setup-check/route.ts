import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServiceRoleClient()
    const checks = {
      messagesTable: false,
      ordersTable: false,
      storagePolicy: false,
      realtimeEnabled: false,
    }

    // Check if messages table exists
    const { error: messagesError } = await (supabase as any)
      .from('messages')
      .select('id')
      .limit(1)

    checks.messagesTable = !messagesError

    // Check if orders table has payment_status column
    const { error: ordersError } = await (supabase as any)
      .from('orders')
      .select('id, payment_status')
      .limit(1)

    checks.ordersTable = !ordersError

    // Check storage bucket
    const { data: buckets } = await supabase.storage.listBuckets()
    checks.storagePolicy = buckets?.some((b: any) => b.name === 'messages') || false

    return NextResponse.json({
      success: true,
      checks,
      ready: checks.messagesTable && checks.ordersTable && checks.storagePolicy,
      errors: {
        messages: messagesError,
        orders: ordersError,
      }
    })
  } catch (error: any) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      { error: 'Setup check failed', details: error.message },
      { status: 500 }
    )
  }
}
