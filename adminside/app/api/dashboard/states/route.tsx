import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all orders from Supabase using admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, amount, status, payment_status');

    if (error) {
      console.error('❌ Error fetching orders for stats:', error);
      // Return default stats on error
      return NextResponse.json({
        statsData: [
          {
            id: "1",
            title: "Total Order",
            value: "0",
            icon: "orders",
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
          },
          {
            id: "2",
            title: "Completed",
            value: "0",
            icon: "completed",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600",
          },
          {
            id: "3",
            title: "Total Pending",
            value: "0",
            icon: "pending",
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
          },
          {
            id: "4",
            title: "Total Sales",
            value: "$0",
            icon: "sales",
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
          },
        ]
      });
    }

    console.log(`✅ Fetched ${orders?.length || 0} orders for stats calculation`);

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0;

    // Calculate total sales (sum of all paid/completed orders)
    let totalSales = 0;
    let salesCount = 0;

    orders?.forEach((order: any) => {
      // Count as sale if payment_status is 'paid' OR if status is 'completed'
      if (order.payment_status === 'paid' || order.status === 'completed') {
        totalSales += (order.amount / 100); // Convert from cents
        salesCount++;
      }
    });

    console.log(`💰 Total Sales: $${totalSales.toFixed(2)} from ${salesCount} paid/completed orders`);

    // Format numbers with commas
    const formatNumber = (num: number) => {
      return num.toLocaleString('en-US');
    };

    const formatCurrency = (amount: number) => {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const statsData = [
      {
        id: "1",
        title: "Total Order",
        value: formatNumber(totalOrders),
        icon: "orders",
        bgColor: "bg-yellow-100",
        iconColor: "text-yellow-600",
      },
      {
        id: "2",
        title: "Completed",
        value: formatNumber(completedOrders),
        icon: "completed",
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
      },
      {
        id: "3",
        title: "Total Pending",
        value: formatNumber(pendingOrders),
        icon: "pending",
        bgColor: "bg-orange-100",
        iconColor: "text-orange-600",
      },
      {
        id: "4",
        title: "Total Sales",
        value: formatCurrency(totalSales),
        icon: "sales",
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
      },
    ];

    return NextResponse.json({
      statsData
    });
  } catch (error: any) {
    console.error('Unexpected error calculating stats:', error);
    return NextResponse.json({
      statsData: [
        {
          id: "1",
          title: "Total Order",
          value: "0",
          icon: "orders",
          bgColor: "bg-yellow-100",
          iconColor: "text-yellow-600",
        },
        {
          id: "2",
          title: "Completed",
          value: "0",
          icon: "completed",
          bgColor: "bg-purple-100",
          iconColor: "text-purple-600",
        },
        {
          id: "3",
          title: "Total Pending",
          value: "0",
          icon: "pending",
          bgColor: "bg-orange-100",
          iconColor: "text-orange-600",
        },
        {
          id: "4",
          title: "Total Sales",
          value: "$0",
          icon: "sales",
          bgColor: "bg-green-100",
          iconColor: "text-green-600",
        },
      ],
      error: error.message
    }, { status: 500 });
  }
}
