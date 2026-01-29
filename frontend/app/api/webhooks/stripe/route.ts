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
  return serviceNames[serviceType] || serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Service'
}

// Extract order items from metadata
function extractOrderItems(metadata: any): Array<{name: string, price: number, quantity?: number, companyName?: string, companyNumber?: string}> {
  try {
    if (metadata?.items) {
      const items = typeof metadata.items === 'string' ? JSON.parse(metadata.items) : metadata.items
      return items.map((item: any) => ({
        name: formatServiceType(item.name || item.service_type || 'Service'),
        price: item.price || 0,
        quantity: item.quantity || 1,
        companyName: item.companyName,
        companyNumber: item.companyNumber
      }))
    }
  } catch (e) {
    console.error('Error parsing order items:', e)
  }
  return []
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
          .select('id, user_id, service_type, company_name, metadata, amount')
          .single()

        if (error) {
          console.error('Error updating order payment status:', error)
        } else {
          console.log('Order payment marked as paid:', paymentIntent.id)

          // Send payment confirmation email with receipt
          if (order) {
            try {
              // Get user profile for name
              const { data: userData } = await (supabase as any)
                .from('profiles')
                .select('full_name')
                .eq('id', order.user_id)
                .single()

              // Get user email from auth
              const { data: { user } } = await (supabase as any).auth.admin.getUserById(order.user_id)

              if (user?.email) {
                // Extract items from metadata
                const items = extractOrderItems(order.metadata)
                let companyName = order.company_name
                let serviceName = formatServiceType(order.service_type)

                // If no items but metadata has items, try to extract company name
                if (items.length === 0 && order.metadata?.items) {
                  try {
                    const metaItems = typeof order.metadata.items === 'string'
                      ? JSON.parse(order.metadata.items)
                      : order.metadata.items
                    if (metaItems?.[0]?.companyName) {
                      companyName = metaItems[0].companyName
                    }
                    if (metaItems?.[0]?.name) {
                      serviceName = formatServiceType(metaItems[0].name)
                    }
                  } catch (e) {}
                }

                const emailContent = getPaymentConfirmationEmail({
                  userName: userData?.full_name || 'Customer',
                  orderNumber: order.id.slice(0, 8).toUpperCase(),
                  amount: paymentIntent.amount,
                  serviceName,
                  companyName,
                  items: items.length > 0 ? items : undefined,
                  paymentDate: new Date().toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                })

                await sendEmail({
                  to: user.email,
                  subject: emailContent.subject,
                  html: emailContent.html,
                  text: emailContent.text
                })

                console.log('Payment receipt email sent to:', user.email)
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
