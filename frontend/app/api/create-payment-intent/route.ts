// app/api/create-payment-intent/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { amount, serviceType, companyId, metadata } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // Get authenticated user
    const user = await getUser();
    if (!user) {
      console.error("Payment attempt without authentication");
      return NextResponse.json({ error: "Authentication required. Please sign in to continue." }, { status: 401 });
    }

    console.log("Creating payment intent for user:", user.id);

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user.id,
        service_type: serviceType || 'general',
        ...(metadata || {})
      }
    });

    // Create order record in database using service role client
    const supabase = createServiceRoleClient();
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency: 'usd',
        status: 'pending',
        payment_status: 'pending',
        service_type: serviceType || null,
        company_id: companyId || null,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      // Continue even if database insert fails - payment is more important
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order?.id || null,
    });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
