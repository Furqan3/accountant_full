import { renderToBuffer } from '@react-pdf/renderer'
import { InvoiceDocument, InvoiceData, InvoiceLineItem } from './invoice-pdf'
import React from 'react'

export type { InvoiceData, InvoiceLineItem }

/**
 * Generate an invoice number from the order ID.
 * Format: FH-XXXXXX-NNNNN (using parts of the order UUID)
 */
export function generateInvoiceNumber(orderId: string): string {
  const clean = orderId.replace(/-/g, '').toUpperCase()
  const part1 = clean.slice(0, 6)
  const part2 = clean.slice(6, 11)
  return `FH-${part1}-${part2}`
}

/**
 * Calculate VAT breakdown from an amount that includes VAT at 20%.
 * All amounts in pence.
 */
export function calculateVat(amountInclVat: number): {
  exclTax: number
  vatAmount: number
} {
  const exclTax = Math.round(amountInclVat / 1.2)
  const vatAmount = amountInclVat - exclTax
  return { exclTax, vatAmount }
}

/**
 * Render the invoice PDF to a Buffer.
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const buffer = await renderToBuffer(
    React.createElement(InvoiceDocument, { data }) as any
  )
  return Buffer.from(buffer)
}

/**
 * Returns HTML email for sending alongside the invoice PDF attachment.
 */
export function getInvoiceEmailHtml(data: {
  customerName: string
  invoiceNumber: string
  amount: number // in pence
  dateOfIssue: string
}): { subject: string; html: string; text: string } {
  const formattedAmount = `&pound;${(data.amount / 100).toFixed(2)}`
  const formattedAmountText = `\u00A3${(data.amount / 100).toFixed(2)}`

  return {
    subject: `Invoice ${data.invoiceNumber} from FilingHub`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${data.invoiceNumber}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 680px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 0 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: top;">
                    <h1 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 700; color: #1a1a1a;">Invoice</h1>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <img src="cid:filinghub-logo" alt="FilingHub" width="80" height="46" style="display: block; border: 0; outline: none;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice Meta -->
          <tr>
            <td style="padding: 20px 48px 0 48px;">
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
            </td>
          </tr>

          <!-- From / Bill To -->
          <tr>
            <td style="padding: 0 48px;">
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
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${data.customerName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Amount Due -->
          <tr>
            <td style="padding: 0 48px;">
              <h2 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 700; color: #1a1a1a;">${formattedAmount} due ${data.dateOfIssue}</h2>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; margin-bottom: 36px; font-size: 14px; color: #7c3aed; text-decoration: underline;">Pay online</a>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 48px 48px 48px;">
              <p style="color: #1a1a1a; margin: 0 0 12px; font-size: 14px;">Dear ${data.customerName},</p>
              <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.6;">
                Please find attached your invoice <strong>${data.invoiceNumber}</strong> for ${formattedAmount}, issued on ${data.dateOfIssue}. This invoice has been paid. Thank you for your business.
              </p>
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
      </td></tr></table>
      </body>
      </html>
    `,
    text: `INVOICE - FilingHub
====================

Invoice number: ${data.invoiceNumber}
Date of issue: ${data.dateOfIssue}
Date due: ${data.dateOfIssue}

FilingHub
167-169 Great Portland Street
London, W1W 5PF
United Kingdom
020 4621 7701
VAT Number: 449753744

Bill to:
${data.customerName}

${formattedAmountText} due ${data.dateOfIssue}

Dear ${data.customerName},

Please find attached your invoice ${data.invoiceNumber} for ${formattedAmountText}, issued on ${data.dateOfIssue}. This invoice has been paid. Thank you for your business.

View your orders: ${process.env.NEXT_PUBLIC_APP_URL}/orders

---
FilingHub is a trading name of Taxsol Ltd.
167-169 Great Portland Street, London, W1W 5PF
Contact: 020 4621 7701 | VAT Number: 449753744

Page 1 of 1`
  }
}
