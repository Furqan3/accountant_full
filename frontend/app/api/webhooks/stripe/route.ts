import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase'
import { sendEmail, getPaymentConfirmationEmail } from '@/lib/email'
import { generateInvoiceNumber, generateInvoicePdf, calculateVat, getInvoiceEmailHtml } from '@/lib/invoice'
import type { InvoiceLineItem } from '@/lib/invoice'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

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

                // Generate invoice PDF
                const invoiceNumber = generateInvoiceNumber(order.id)
                const now = new Date()
                const dateOfIssue = now.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })

                const invoiceLineItems: InvoiceLineItem[] = items.length > 0
                  ? items.map(item => {
                      // item.price from cart metadata is in pounds, convert to pence for invoice calculations
                      const priceInPence = Math.round(item.price * 100)
                      const totalPence = priceInPence * (item.quantity || 1)
                      const { exclTax, vatAmount } = calculateVat(totalPence)
                      const unitExclTax = calculateVat(priceInPence).exclTax
                      return {
                        description: item.name + (item.companyName ? ` - ${item.companyName}` : ''),
                        quantity: item.quantity || 1,
                        unitPriceExclTax: unitExclTax,
                        taxAmount: vatAmount,
                        amountExclTax: exclTax,
                      }
                    })
                  : (() => {
                      const { exclTax, vatAmount } = calculateVat(paymentIntent.amount)
                      return [{
                        description: serviceName + (companyName ? ` - ${companyName}` : ''),
                        quantity: 1,
                        unitPriceExclTax: exclTax,
                        taxAmount: vatAmount,
                        amountExclTax: exclTax,
                      }]
                    })()

                const subtotalExclTax = invoiceLineItems.reduce((sum, item) => sum + item.amountExclTax, 0)
                const totalVat = invoiceLineItems.reduce((sum, item) => sum + item.taxAmount, 0)

                let invoicePdfBuffer: Buffer | null = null
                try {
                  invoicePdfBuffer = await generateInvoicePdf({
                    invoiceNumber,
                    dateOfIssue,
                    dateDue: dateOfIssue,
                    customerName: userData?.full_name || 'Customer',
                    customerEmail: user.email,
                    lineItems: invoiceLineItems,
                    subtotalExclTax,
                    vatAmount: totalVat,
                    totalInclTax: paymentIntent.amount,
                  })
                } catch (pdfError) {
                  console.error('Error generating invoice PDF:', pdfError)
                }

                const pdfAttachment = invoicePdfBuffer
                  ? [{ filename: `${invoiceNumber}.pdf`, content: invoicePdfBuffer }]
                  : undefined

                // Send payment confirmation email (invoice format) with PDF attached
                const emailContent = getPaymentConfirmationEmail({
                  userName: userData?.full_name || 'Customer',
                  userEmail: user.email,
                  invoiceNumber,
                  dateOfIssue,
                  items: invoiceLineItems.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPriceExclTax: item.unitPriceExclTax,
                    taxPercent: 20,
                    amountExclTax: item.amountExclTax,
                  })),
                  subtotalExclTax,
                  vatAmount: totalVat,
                  totalInclTax: paymentIntent.amount,
                })

                await sendEmail({
                  to: user.email,
                  subject: emailContent.subject,
                  html: emailContent.html,
                  text: emailContent.text,
                  attachments: pdfAttachment,
                })

                // Send separate invoice email with PDF attached
                if (invoicePdfBuffer) {
                  const invoiceEmail = getInvoiceEmailHtml({
                    customerName: userData?.full_name || 'Customer',
                    invoiceNumber,
                    amount: paymentIntent.amount,
                    dateOfIssue,
                  })

                  await sendEmail({
                    to: user.email,
                    subject: invoiceEmail.subject,
                    html: invoiceEmail.html,
                    text: invoiceEmail.text,
                    attachments: pdfAttachment,
                  })
                }

                console.log('Payment receipt and invoice emails sent to:', user.email)
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
