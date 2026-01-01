import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({
        error: 'Missing required fields: orderId and status'
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status. Must be one of: pending, processing, completed, cancelled'
      }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // When order is completed, mark it as paid and set completed_at
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.payment_status = 'paid';
    } else if (status === 'cancelled') {
      updateData.completed_at = null;
      updateData.payment_status = 'failed';
    } else {
      updateData.completed_at = null;
    }

    // Update the order status
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json({
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ Updated order ${orderId} status to: ${status}`);

    return NextResponse.json({
      success: true,
      order: data
    });

  } catch (error: any) {
    console.error('Unexpected error updating order status:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
