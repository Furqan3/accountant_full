import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Skip if Resend API key is not configured
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend API key not configured, skipping email send')
      return false
    }

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FilingHub <noreply@filinghub.co.uk>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return false
    }

    console.log(`Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Email templates
interface OrderItem {
  name: string
  price: number
  quantity?: number
  companyName?: string
  companyNumber?: string
}

export function getPaymentConfirmationEmail(data: {
  userName: string
  orderNumber: string
  amount: number
  serviceName: string
  companyName?: string
  items?: OrderItem[]
  paymentDate?: string
}) {
  const formattedAmount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(data.amount / 100)

  const paymentDate = data.paymentDate || new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Generate items rows HTML
  const itemsHtml = data.items?.map(item => `
    <tr>
      <td style="padding: 12px 0; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong>
        ${item.companyName ? `<br><span style="color: #6b7280; font-size: 12px;">${item.companyName}${item.companyNumber ? ` (${item.companyNumber})` : ''}</span>` : ''}
      </td>
      <td style="padding: 12px 0; color: #374151; font-size: 14px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity || 1}</td>
      <td style="padding: 12px 0; color: #374151; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">£${(item.price / 100).toFixed(2)}</td>
    </tr>
  `).join('') || ''

  // Generate items text
  const itemsText = data.items?.map(item =>
    `  - ${item.name}${item.companyName ? ` (${item.companyName})` : ''}: £${(item.price / 100).toFixed(2)}`
  ).join('\n') || ''

  return {
    subject: `Payment Receipt - Order #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">FilingHub</h1>
                    <p style="color: #ccfbf1; margin: 10px 0 0; font-size: 16px;">Payment Receipt</p>
                  </td>
                </tr>

                <!-- Success Icon -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: #dcfce7; border-radius: 50%; display: inline-block; line-height: 80px;">
                      <span style="font-size: 40px;">✓</span>
                    </div>
                    <h2 style="color: #15803d; margin: 20px 0 10px; font-size: 24px;">Payment Successful!</h2>
                    <p style="color: #6b7280; margin: 0; font-size: 16px;">Thank you for your payment, ${data.userName}!</p>
                  </td>
                </tr>

                <!-- Receipt Details -->
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid #0d9488; padding-bottom: 16px;">
                        <div>
                          <p style="color: #6b7280; margin: 0; font-size: 12px; text-transform: uppercase;">Receipt Number</p>
                          <p style="color: #111827; margin: 4px 0 0; font-size: 18px; font-weight: bold;">#${data.orderNumber}</p>
                        </div>
                        <div style="text-align: right;">
                          <p style="color: #6b7280; margin: 0; font-size: 12px; text-transform: uppercase;">Payment Date</p>
                          <p style="color: #111827; margin: 4px 0 0; font-size: 14px;">${paymentDate}</p>
                        </div>
                      </div>

                      <!-- Items Table -->
                      ${data.items && data.items.length > 0 ? `
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                        <tr>
                          <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Item</th>
                          <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: center; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Qty</th>
                          <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: right; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Price</th>
                        </tr>
                        ${itemsHtml}
                      </table>
                      ` : `
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service:</td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.serviceName}</td>
                        </tr>
                        ${data.companyName ? `
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Company:</td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.companyName}</td>
                        </tr>
                        ` : ''}
                      </table>
                      `}

                      <!-- Total -->
                      <div style="background-color: #0d9488; border-radius: 8px; padding: 16px; margin-top: 16px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #ffffff; font-size: 16px; font-weight: bold;">Total Paid</td>
                            <td style="color: #ffffff; font-size: 24px; font-weight: bold; text-align: right;">${formattedAmount}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- Payment Method -->
                      <p style="color: #6b7280; margin: 16px 0 0; font-size: 12px; text-align: center;">
                        Paid via Credit/Debit Card • Status: <span style="color: #15803d; font-weight: 600;">PAID</span>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- What's Next -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h3 style="color: #374151; margin: 0 0 12px; font-size: 18px;">What's Next?</h3>
                    <p style="color: #6b7280; margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
                      Our team will now process your order. You can track the progress of your order through your dashboard.
                      If we need any additional information, we'll reach out to you via the messaging system.
                    </p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders"
                       style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      View Your Order
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                      This is your official payment receipt. Please keep it for your records.
                    </p>
                    <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">
                      © ${new Date().getFullYear()} FilingHub. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
PAYMENT RECEIPT - FilingHub
============================

Hello ${data.userName},

Your payment has been successfully processed!

RECEIPT DETAILS
---------------
Receipt Number: #${data.orderNumber}
Payment Date: ${paymentDate}
Status: PAID

ORDER ITEMS
-----------
${itemsText || `Service: ${data.serviceName}${data.companyName ? `\nCompany: ${data.companyName}` : ''}`}

TOTAL PAID: ${formattedAmount}
-----------------------------

What's Next?
Our team will now process your order. You can track the progress through your dashboard.

View your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders

Thank you for choosing FilingHub!

© ${new Date().getFullYear()} FilingHub. All rights reserved.
    `
  }
}

// Order Confirmation Email (sent when order is created, before payment)
export function getOrderConfirmationEmail(data: {
  userName: string
  orderNumber: string
  amount: number
  items?: OrderItem[]
  companyName?: string
}) {
  const formattedAmount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(data.amount / 100)

  const orderDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Generate items rows HTML
  const itemsHtml = data.items?.map(item => `
    <tr>
      <td style="padding: 12px 0; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong>
        ${item.companyName ? `<br><span style="color: #6b7280; font-size: 12px;">${item.companyName}${item.companyNumber ? ` (${item.companyNumber})` : ''}</span>` : ''}
      </td>
      <td style="padding: 12px 0; color: #374151; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">£${(item.price / 100).toFixed(2)}</td>
    </tr>
  `).join('') || ''

  // Generate items text
  const itemsText = data.items?.map(item =>
    `  - ${item.name}${item.companyName ? ` (${item.companyName})` : ''}: £${(item.price / 100).toFixed(2)}`
  ).join('\n') || ''

  return {
    subject: `Order Confirmed - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">FilingHub</h1>
                    <p style="color: #ccfbf1; margin: 10px 0 0; font-size: 16px;">Order Confirmation</p>
                  </td>
                </tr>

                <!-- Order Confirmed Icon -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: #dbeafe; border-radius: 50%; display: inline-block; line-height: 80px;">
                      <span style="font-size: 40px;">📋</span>
                    </div>
                    <h2 style="color: #1d4ed8; margin: 20px 0 10px; font-size: 24px;">Order Confirmed!</h2>
                    <p style="color: #6b7280; margin: 0; font-size: 16px;">Thank you for your order, ${data.userName}!</p>
                  </td>
                </tr>

                <!-- Order Details -->
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                      <div style="margin-bottom: 16px; border-bottom: 2px solid #0d9488; padding-bottom: 16px;">
                        <table width="100%">
                          <tr>
                            <td>
                              <p style="color: #6b7280; margin: 0; font-size: 12px; text-transform: uppercase;">Order Number</p>
                              <p style="color: #111827; margin: 4px 0 0; font-size: 18px; font-weight: bold;">#${data.orderNumber}</p>
                            </td>
                            <td style="text-align: right;">
                              <p style="color: #6b7280; margin: 0; font-size: 12px; text-transform: uppercase;">Order Date</p>
                              <p style="color: #111827; margin: 4px 0 0; font-size: 14px;">${orderDate}</p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Items Table -->
                      ${data.items && data.items.length > 0 ? `
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                        <tr>
                          <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Service</th>
                          <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: right; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">Price</th>
                        </tr>
                        ${itemsHtml}
                      </table>
                      ` : ''}

                      <!-- Total -->
                      <div style="background-color: #0d9488; border-radius: 8px; padding: 16px; margin-top: 16px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #ffffff; font-size: 16px; font-weight: bold;">Order Total</td>
                            <td style="color: #ffffff; font-size: 24px; font-weight: bold; text-align: right;">${formattedAmount}</td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Processing Info -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h3 style="color: #374151; margin: 0 0 12px; font-size: 18px;">What Happens Next?</h3>
                    <ol style="color: #6b7280; margin: 0 0 16px; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                      <li>Our team will review your order and start processing</li>
                      <li>We may contact you if we need additional information</li>
                      <li>You'll receive updates on your order status via email</li>
                      <li>Track your order anytime through your dashboard</li>
                    </ol>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders"
                       style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      Track Your Order
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                      Questions about your order? Reply to this email or contact us through your dashboard.
                    </p>
                    <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">
                      © ${new Date().getFullYear()} FilingHub. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
ORDER CONFIRMATION - FilingHub
==============================

Hello ${data.userName},

Thank you for your order! We're excited to help you with your filing needs.

ORDER DETAILS
-------------
Order Number: #${data.orderNumber}
Order Date: ${orderDate}

ORDER ITEMS
-----------
${itemsText}

ORDER TOTAL: ${formattedAmount}
-----------------------------

WHAT HAPPENS NEXT?
1. Our team will review your order and start processing
2. We may contact you if we need additional information
3. You'll receive updates on your order status via email
4. Track your order anytime through your dashboard

Track your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders

Thank you for choosing FilingHub!

© ${new Date().getFullYear()} FilingHub. All rights reserved.
    `
  }
}

export function getNewMessageEmail(data: {
  userName: string
  orderNumber: string
  messagePreview: string
  serviceName: string
}) {
  return {
    subject: `New Message - Order #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Message</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">FilingHub</h1>
                    <p style="color: #ccfbf1; margin: 10px 0 0; font-size: 16px;">New Message Notification</p>
                  </td>
                </tr>

                <!-- Message Icon -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: #dbeafe; border-radius: 50%; display: inline-block; line-height: 80px;">
                      <span style="font-size: 40px;">💬</span>
                    </div>
                    <h2 style="color: #1d4ed8; margin: 20px 0 10px; font-size: 24px;">You Have a New Message!</h2>
                    <p style="color: #6b7280; margin: 0; font-size: 16px;">Hello ${data.userName}, you've received a message from FilingHub support.</p>
                  </td>
                </tr>

                <!-- Message Preview -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border-left: 4px solid #0d9488;">
                      <p style="color: #6b7280; margin: 0 0 8px; font-size: 14px;">
                        <strong>Order:</strong> #${data.orderNumber} - ${data.serviceName}
                      </p>
                      <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6;">
                        "${data.messagePreview.length > 200 ? data.messagePreview.substring(0, 200) + '...' : data.messagePreview}"
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 40px; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders"
                       style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      View Message & Reply
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                      This email was sent by FilingHub because you received a new message.
                    </p>
                    <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">
                      © ${new Date().getFullYear()} FilingHub. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
New Message - FilingHub

Hello ${data.userName},

You have received a new message from FilingHub support regarding your order.

Order: #${data.orderNumber} - ${data.serviceName}

Message Preview:
"${data.messagePreview.length > 200 ? data.messagePreview.substring(0, 200) + '...' : data.messagePreview}"

Click here to view and reply: ${process.env.NEXT_PUBLIC_APP_URL}/orders

Thank you for choosing FilingHub!

© ${new Date().getFullYear()} FilingHub. All rights reserved.
    `
  }
}
