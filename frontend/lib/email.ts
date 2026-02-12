import { Resend } from 'resend'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Read logo once at startup for inline email embedding
let logoBuffer: Buffer | null = null
try {
  logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'))
} catch {
  console.warn('Could not read logo.png for email embedding')
}

interface EmailAttachment {
  filename: string
  content: Buffer
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Skip if Resend API key is not configured
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend API key not configured, skipping email send')
      return false
    }

    // Build attachments: user attachments + inline logo
    const attachments: Array<{
      filename: string
      content: Buffer
      contentId?: string
    }> = []

    // Add inline logo for CID reference in HTML
    if (logoBuffer) {
      attachments.push({
        filename: 'logo.png',
        content: logoBuffer,
        contentId: 'filinghub-logo',
      })
    }

    // Add user-provided attachments (e.g. invoice PDF)
    if (options.attachments) {
      for (const a of options.attachments) {
        attachments.push({
          filename: a.filename,
          content: a.content,
        })
      }
    }

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FilingHub <noreply@filinghub.co.uk>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments,
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

interface InvoiceEmailItem {
  description: string
  quantity: number
  unitPriceExclTax: number   // pence
  taxPercent: number
  amountExclTax: number      // pence
}

export function getPaymentConfirmationEmail(data: {
  userName: string
  userEmail: string
  invoiceNumber: string
  dateOfIssue: string
  items: InvoiceEmailItem[]
  subtotalExclTax: number    // pence
  vatAmount: number          // pence
  totalInclTax: number       // pence
}) {
  const fmt = (pence: number) => `£${(pence / 100).toFixed(2)}`

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; text-align: right; border-bottom: 1px solid #e5e7eb;">${fmt(item.unitPriceExclTax)}</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.taxPercent}%</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; text-align: right; border-bottom: 1px solid #e5e7eb;">${fmt(item.amountExclTax)}</td>
    </tr>
  `).join('')

  const itemsText = data.items.map(item =>
    `  ${item.description} x${item.quantity} — ${fmt(item.unitPriceExclTax)} (excl. tax) — ${fmt(item.amountExclTax)}`
  ).join('\n')

  return {
    subject: `Invoice ${data.invoiceNumber} - FilingHub`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 680px; width: 100%;">
          <tr>
            <td style="padding: 48px 48px 0 48px;">
              <!-- Header: Invoice title + Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: top;">
                    <h1 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 700; color: #1a1a1a;">Invoice</h1>
                  </td>
                  <td style="vertical-align: top; text-align: right;">
                    <img src="cid:filinghub-logo" alt="FilingHub" width="80" height="46" style="display: block; border: 0; outline: none;">
                  </td>
                </tr>
              </table>

              <!-- Invoice meta -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 2px 0; font-size: 14px; color: #6b7280; font-weight: 600; padding-right: 16px;">Invoice number</td>
                  <td style="padding: 2px 0; font-size: 14px; color: #1a1a1a; font-weight: 600;">${data.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; font-size: 14px; color: #6b7280; padding-right: 16px;">Date of issue</td>
                  <td style="padding: 2px 0; font-size: 14px; color: #1a1a1a;">${data.dateOfIssue}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; font-size: 14px; color: #6b7280; padding-right: 16px;">Date due</td>
                  <td style="padding: 2px 0; font-size: 14px; color: #1a1a1a;">${data.dateOfIssue}</td>
                </tr>
              </table>

              <!-- From / Bill to -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                <tr>
                  <td style="vertical-align: top; width: 50%;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">FilingHub</p>
                    <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
                      167-169 Great Portland Street<br>
                      London<br>
                      W1W 5PF<br>
                      United Kingdom<br>
                      020 4621 7701<br>
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #4b5563;">VAT Number: 449753744</p>
                  </td>
                  <td style="vertical-align: top; width: 50%;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #6b7280;">Bill to</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${data.userName}</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #4b5563;">${data.userEmail}</p>
                  </td>
                </tr>
              </table>

              <!-- Amount due headline -->
              <h2 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 700; color: #1a1a1a;">${fmt(data.totalInclTax)} due ${data.dateOfIssue}</h2>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; margin-bottom: 36px; font-size: 14px; color: #7c3aed; text-decoration: underline;">Pay online</a>

              <!-- Items table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 0;">
                <thead>
                  <tr>
                    <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
                    <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit price<br>(excl. tax)</th>
                    <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: center; border-bottom: 2px solid #e5e7eb;">Tax</th>
                    <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount<br>(excl. tax)</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 48px;">
                <tr>
                  <td style="padding: 8px 16px; font-size: 14px; color: #4b5563; text-align: right; border-bottom: 1px solid #f3f4f6;">Subtotal</td>
                  <td style="padding: 8px 16px; font-size: 14px; color: #1a1a1a; text-align: right; width: 120px; border-bottom: 1px solid #f3f4f6;">${fmt(data.subtotalExclTax)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 16px; font-size: 14px; color: #4b5563; text-align: right; border-bottom: 1px solid #f3f4f6;">Total excluding tax</td>
                  <td style="padding: 8px 16px; font-size: 14px; color: #1a1a1a; text-align: right; border-bottom: 1px solid #f3f4f6;">${fmt(data.subtotalExclTax)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 16px; font-size: 14px; color: #4b5563; text-align: right; border-bottom: 1px solid #f3f4f6;">VAT - United Kingdom (20% on ${fmt(data.subtotalExclTax)})</td>
                  <td style="padding: 8px 16px; font-size: 14px; color: #1a1a1a; text-align: right; border-bottom: 1px solid #f3f4f6;">${fmt(data.vatAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 16px; font-size: 14px; color: #4b5563; text-align: right; border-bottom: 1px solid #e5e7eb;">Total</td>
                  <td style="padding: 8px 16px; font-size: 14px; color: #1a1a1a; text-align: right; border-bottom: 1px solid #e5e7eb;">${fmt(data.totalInclTax)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 700; color: #1a1a1a; text-align: right;">Amount due</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 700; color: #1a1a1a; text-align: right;">${fmt(data.totalInclTax)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 48px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px 0;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">FilingHub is a trading name of Taxsol Ltd.</p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">167-169 Great Portland Street, London, W1W 5PF</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af; text-align: center;">Contact: 020 4621 7701 | VAT Number: 449753744</p>
            </td>
          </tr>

          <!-- Page indicator -->
          <tr>
            <td style="padding: 8px 48px 24px 48px;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: right;">Page 1 of 1</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `INVOICE - FilingHub
====================

Invoice number: ${data.invoiceNumber}
Date of issue:  ${data.dateOfIssue}
Date due:       ${data.dateOfIssue}

FilingHub
167-169 Great Portland Street
London, W1W 5PF
United Kingdom
020 4621 7701
VAT Number: 449753744

Bill to:
${data.userName}
${data.userEmail}

${fmt(data.totalInclTax)} due ${data.dateOfIssue}

Pay online: ${process.env.NEXT_PUBLIC_APP_URL}/orders

ITEMS
-----
${itemsText}

Subtotal:                                        ${fmt(data.subtotalExclTax)}
Total excluding tax:                             ${fmt(data.subtotalExclTax)}
VAT - United Kingdom (20% on ${fmt(data.subtotalExclTax)}):  ${fmt(data.vatAmount)}
Total:                                           ${fmt(data.totalInclTax)}
Amount due:                                      ${fmt(data.totalInclTax)}

---
FilingHub is a trading name of Taxsol Ltd.
167-169 Great Portland Street, London, W1W 5PF
Contact: 020 4621 7701 | VAT Number: 449753744
Page 1 of 1
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
      <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; border-bottom: 1px solid #e5e7eb;">
        ${item.name}
        ${item.companyName ? `<br><span style="font-size: 12px; color: #6b7280;">${item.companyName}${item.companyNumber ? ` (${item.companyNumber})` : ''}</span>` : ''}
      </td>
      <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; text-align: right; border-bottom: 1px solid #e5e7eb;">£${(item.price / 100).toFixed(2)}</td>
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
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 680px; width: 100%;">
          <tr>
            <td style="padding: 48px 48px 0 48px;">
              <!-- Header: Title + Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: top;">
                    <h1 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 700; color: #1a1a1a;">Order Confirmation</h1>
                  </td>
                  <td style="vertical-align: top; text-align: right;">
                    <img src="cid:filinghub-logo" alt="FilingHub" width="80" height="46" style="display: block; border: 0; outline: none;">
                  </td>
                </tr>
              </table>

              <!-- Order meta -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 2px 0; font-size: 14px; color: #6b7280; font-weight: 600; padding-right: 16px;">Order number</td>
                  <td style="padding: 2px 0; font-size: 14px; color: #1a1a1a; font-weight: 600;">#${data.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; font-size: 14px; color: #6b7280; padding-right: 16px;">Order date</td>
                  <td style="padding: 2px 0; font-size: 14px; color: #1a1a1a;">${orderDate}</td>
                </tr>
              </table>

              <!-- Greeting -->
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #1a1a1a;">Thank you for your order, <strong>${data.userName}</strong>!</p>
              <p style="margin: 0 0 32px 0; font-size: 14px; color: #4b5563;">We're excited to help you with your filing needs.</p>

              ${data.items && data.items.length > 0 ? `
              <!-- Items table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 0;">
                <thead>
                  <tr>
                    <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 2px solid #e5e7eb;">Service</th>
                    <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              ` : ''}

              <!-- Total -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 36px;">
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 700; color: #1a1a1a; text-align: right;">Order Total</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 700; color: #1a1a1a; text-align: right; width: 120px;">${formattedAmount}</td>
                </tr>
              </table>

              <!-- What happens next -->
              <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">What Happens Next?</h3>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr><td style="padding: 4px 0; font-size: 14px; color: #4b5563;">1. Our team will review your order and start processing</td></tr>
                <tr><td style="padding: 4px 0; font-size: 14px; color: #4b5563;">2. We may contact you if we need additional information</td></tr>
                <tr><td style="padding: 4px 0; font-size: 14px; color: #4b5563;">3. You'll receive updates on your order status via email</td></tr>
                <tr><td style="padding: 4px 0; font-size: 14px; color: #4b5563;">4. Track your order anytime through your dashboard</td></tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 48px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">Track Your Order</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 48px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px 0;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">FilingHub is a trading name of Taxsol Ltd.</p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">167-169 Great Portland Street, London, W1W 5PF</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af; text-align: center;">Contact: 020 4621 7701 | VAT Number: 449753744</p>
            </td>
          </tr>

          <!-- Page indicator -->
          <tr>
            <td style="padding: 8px 48px 24px 48px;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: right;">Page 1 of 1</p>
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
Order Date:   ${orderDate}

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

FilingHub is a trading name of Taxsol Ltd.
167-169 Great Portland Street, London, W1W 5PF
Contact: 020 4621 7701 | VAT Number: 449753744
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
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 680px; width: 100%;">
          <tr>
            <td style="padding: 48px 48px 0 48px;">
              <!-- Header: Title + Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: top;">
                    <h1 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 700; color: #1a1a1a;">New Message</h1>
                  </td>
                  <td style="vertical-align: top; text-align: right;">
                    <img src="cid:filinghub-logo" alt="FilingHub" width="80" height="46" style="display: block; border: 0; outline: none;">
                  </td>
                </tr>
              </table>

              <!-- Message meta -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 2px 0; font-size: 14px; color: #6b7280; padding-right: 16px;">Order</td>
                  <td style="padding: 2px 0; font-size: 14px; color: #1a1a1a; font-weight: 600;">#${data.orderNumber} - ${data.serviceName}</td>
                </tr>
              </table>

              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1a1a;">Hello <strong>${data.userName}</strong>, you've received a message from FilingHub support.</p>

              <!-- Message preview -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #f9fafb; border-left: 3px solid #7c3aed; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; font-size: 14px; color: #374151; font-style: italic; line-height: 1.6;">"${data.messagePreview.length > 200 ? data.messagePreview.substring(0, 200) + '...' : data.messagePreview}"</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 48px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">View Message & Reply</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 48px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px 0;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">This email was sent by FilingHub because you received a new message.</p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">FilingHub is a trading name of Taxsol Ltd.</p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">167-169 Great Portland Street, London, W1W 5PF</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af; text-align: center;">Contact: 020 4621 7701 | VAT Number: 449753744</p>
            </td>
          </tr>

          <!-- Page indicator -->
          <tr>
            <td style="padding: 8px 48px 24px 48px;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: right;">Page 1 of 1</p>
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

FilingHub is a trading name of Taxsol Ltd.
167-169 Great Portland Street, London, W1W 5PF
Contact: 020 4621 7701 | VAT Number: 449753744
    `
  }
}