// app/api/create-payment-intent/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase";
import { sendEmail, getOrderConfirmationEmail } from "@/lib/email";

// Helper to format service type for display
function formatServiceType(serviceType: string): string {
  const serviceNames: { [key: string]: string } = {
    'confirmation-statement': 'File Confirmation Statement',
    'annual-accounts': 'Annual Accounts',
    'vat-return': 'VAT Return',
    'corporation-tax': 'Corporation Tax',
    'payroll': 'Payroll Services',
    'bookkeeping': 'Bookkeeping',
    'company-formation': 'Company Formation',
    'registered-office': 'Registered Office',
    'dormant-accounts': 'File Dormant Accounts',
    'vat-registration': 'Register Company for VAT',
    'paye-registration': 'Register Company for PAYE',
    'change-company-name': 'Change Company Name',
    'change-registered-address': 'Change Registered Address',
    'company-dissolution': 'Company Dissolution',
    'utr-registration': 'UTR Registration',
    'change-directors': 'Change Your Directors',
  }
  return serviceNames[serviceType] || serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Service'
}

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

    // Send order confirmation email
    if (order) {
      try {
        // Get user profile for name
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        // Extract items from metadata
        let items: Array<{name: string, price: number, quantity?: number, companyName?: string, companyNumber?: string}> = [];
        let companyName = '';

        if (metadata?.items) {
          const metaItems = typeof metadata.items === 'string' ? JSON.parse(metadata.items) : metadata.items;
          items = metaItems.map((item: any) => ({
            name: formatServiceType(item.name || item.service_type || 'Service'),
            // item.price from cart is in pounds, convert to pence for email display
            price: Math.round((item.price || 0) * 100),
            quantity: item.quantity || 1,
            companyName: item.companyName,
            companyNumber: item.companyNumber
          }));
          if (metaItems?.[0]?.companyName) {
            companyName = metaItems[0].companyName;
          }
        }

        const emailContent = getOrderConfirmationEmail({
          userName: profile?.full_name || user.email?.split('@')[0] || 'Customer',
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          amount,
          items: items.length > 0 ? items : undefined,
          companyName: companyName || undefined
        });

        await sendEmail({
          to: user.email!,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        console.log('Order confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }
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
