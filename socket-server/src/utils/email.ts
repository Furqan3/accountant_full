import nodemailer from 'nodemailer'

// Create transporter with SMTP settings
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Skip if SMTP is not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured, skipping email send')
      return false
    }

    const transporter = createTransporter()

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"FilingHub" <noreply@filinghub.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log(`✉️ Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export function getNewMessageEmailContent(data: {
  userName: string
  orderNumber: string
  messagePreview: string
  serviceName: string
}) {
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

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
                    <a href="${appUrl}/orders"
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

Click here to view and reply: ${appUrl}/orders

Thank you for choosing FilingHub!

© ${new Date().getFullYear()} FilingHub. All rights reserved.
    `
  }
}
