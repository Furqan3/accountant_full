import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch orders from Supabase - optimized query
    // Using admin client to bypass RLS and access all orders
    const supabaseAdmin = getSupabaseAdmin();

    // Single optimized query
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, amount, currency, status, payment_status, service_type, metadata, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(50); // Limit to most recent 50 orders for performance

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({
        ordersData: [],
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${orders?.length || 0} orders from database`);

    // Skip profile fetching for now - we get company names from order metadata
    // This makes the API much faster
    const userMap = new Map();

    // Transform Supabase orders to match dashboard format
    const ordersData = orders?.map((order: any, index: number) => {
      const userInfo = userMap.get(order.user_id);

      // Parse metadata to get items and company info
      let items: any[] = [];
      let companyName = 'N/A';

      try {
        const metadata = order.metadata;
        if (metadata?.items) {
          const parsedItems = typeof metadata.items === 'string'
            ? JSON.parse(metadata.items)
            : metadata.items;

          if (Array.isArray(parsedItems)) {
            // Get company name from first item (same as frontend does)
            if (parsedItems.length > 0 && parsedItems[0].companyName) {
              companyName = parsedItems[0].companyName;
            }

            // Map items to dashboard format
            items = parsedItems.map((item: any, idx: number) => ({
              id: `i${order.id}-${idx}`,
              title: item.name || item.title || 'Service',
              qty: item.quantity || 1,
              price: item.price || 0,
            }));
          }
        }
      } catch (e) {
        console.error('Error parsing order metadata:', e);
      }

      // Fallback to profile data if no company name in metadata
      if (companyName === 'N/A' && userInfo) {
        companyName = userInfo.company_name || userInfo.full_name || 'Unknown User';
      }

      // If no items in metadata, create default item from service_type
      if (items.length === 0 && order.service_type) {
        items = [{
          id: `i${order.id}-default`,
          title: order.service_type,
          qty: 1,
          price: order.amount / 100, // Convert from cents
        }];
      }

      // Capitalize status properly
      const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
      };

      return {
        id: order.id,
        orderNo: `ORD-${String(index + 1).padStart(6, '0')}`,
        date: new Date(order.created_at).toLocaleDateString('en-US'),
        createdAt: order.created_at, // Keep raw timestamp for sorting
        company: companyName,
        status: formatStatus(order.status),
        paymentStatus: formatStatus(order.payment_status),
        items,
        total: order.amount / 100, // Convert from cents to dollars
      };
    }) || [];

    return NextResponse.json({
      ordersData
    });
  } catch (error: any) {
    console.error('Unexpected error fetching orders:', error);
    return NextResponse.json({
      ordersData: [],
      error: error.message
    }, { status: 500 });
  }
}