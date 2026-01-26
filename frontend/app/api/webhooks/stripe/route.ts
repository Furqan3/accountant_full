import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase'
import { sendEmail, getPaymentConfirmationEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Helper to format service type for display
function formatServiceType(serviceType: string): string {
  const serviceNames: { [key: string]: string } = {
    'confirmation-statement': 'Confirmation Statement',
    'annual-accounts': 'Annual Accounts',
    'vat-return': 'VAT Return',
    'corporation-tax': 'Corporation Tax',
    'payroll': 'Payroll Services',
    'bookkeeping': 'Bookkeeping',
    'company-formation': 'Company Formation',
    'registered-office': 'Registered Office',
    'dormant-accounts': 'Dormant Accounts',
  }
  return serviceNames[serviceType] || serviceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update payment status to paid (order status remains pending until fulfilled)
        const { data: order, error } = await (supabase as any)
          .from('orders')
          .update({
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .select('id, user_id, service_type, company_name')
          .single()

        if (error) {
          console.error('Error updating order payment status:', error)
        } else {
          console.log('Order payment marked as paid:', paymentIntent.id)

          // Send payment confirmation email
          if (order) {
            try {
              // Get user email from auth.users table
              const { data: userData } = await (supabase as any)
                .from('profiles')
                .select('full_name')
                .eq('id', order.user_id)
                .single()

              const { data: { user } } = await (supabase as any).auth.admin.getUserById(order.user_id)

              if (user?.email) {
                const emailContent = getPaymentConfirmationEmail({
                  userName: userData?.full_name || 'Customer',
                  orderNumber: order.id.slice(0, 8).toUpperCase(),
                  amount: paymentIntent.amount,
                  serviceName: formatServiceType(order.service_type),
                  companyName: order.company_name
                })

                await sendEmail({
                  to: user.email,
                  subject: emailContent.subject,
                  html: emailContent.html,
                  text: emailContent.text
                })

                console.log('Payment confirmation email sent to:', user.email)
              }
            } catch (emailError) {
              console.error('Error sending payment confirmation email:', emailError)
            }
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update payment status to failed (order status remains pending)
        const { error } = await (supabase as any)
          .from('orders')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
          console.error('Error updating order payment status:', error)
        } else {
          console.log('Order payment marked as failed:', paymentIntent.id)
        }
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Delete the order if payment was canceled
        const { error } = await (supabase as any)
          .from('orders')
          .delete()
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
          console.error('Error deleting canceled order:', error)
        } else {
          console.log('Canceled order deleted:', paymentIntent.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
