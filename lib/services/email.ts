"use server";

import nodemailer from "nodemailer";
import { generateQRCodeBuffer } from "@/lib/utils/qrcode";

// Initialize nodemailer transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.error("Missing SMTP configuration environment variables");
    throw new Error("Email configuration missing. Check SMTP_HOST, SMTP_USER, and SMTP_PASSWORD");
  }

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: user,
      pass: pass,
    },
  });
};

interface SendRegistrationEmailProps {
  attendeeEmail: string;
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  registrationToken: string;
}

/**
 * Send registration confirmation email with QR code
 */
export async function sendRegistrationEmail({
  attendeeEmail,
  attendeeName,
  eventTitle,
  eventDate,
  eventVenue,
  registrationToken,
}: SendRegistrationEmailProps): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate QR code as buffer
    const qrCodeBuffer = await generateQRCodeBuffer(registrationToken);

    // Create transporter
    const transporter = getTransporter();

    // Format event date
    let formattedDate = eventDate;
    try {
      const date = new Date(eventDate);
      formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
    }

    // Prepare HTML email
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .event-details {
              background-color: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .event-details p {
              margin: 10px 0;
              font-size: 14px;
            }
            .event-details .label {
              font-weight: 600;
              color: #667eea;
            }
            .qr-section {
              text-align: center;
              padding: 30px 0;
              border-top: 1px solid #e0e0e0;
              border-bottom: 1px solid #e0e0e0;
              margin: 30px 0;
            }
            .qr-section h3 {
              margin-top: 0;
              color: #667eea;
            }
            .qr-image {
              max-width: 300px;
              margin: 20px auto;
            }
            .instructions {
              background-color: #e8f4f8;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .instructions h4 {
              margin-top: 0;
              color: #0277bd;
            }
            .instructions ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .instructions li {
              margin: 8px 0;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              background-color: #667eea;
              color: white;
              padding: 12px 30px;
              border-radius: 6px;
              text-decoration: none;
              margin: 20px 0;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Registration Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${attendeeName}</strong>,</p>
              <p>Thank you for registering for the event! We're excited to see you there. Below is your QR code for check-in.</p>

              <div class="event-details">
                <p><span class="label">Event:</span> ${eventTitle}</p>
                <p><span class="label">Date & Time:</span> ${formattedDate}</p>
                <p><span class="label">Venue:</span> ${eventVenue}</p>
              </div>

              <div class="qr-section">
                <h3>Your Check-In QR Code</h3>
                <p style="color: #666; font-size: 14px;">Scan this QR code at the event or show it to the organizer for check-in.</p>
                <img src="cid:qrcode" alt="Check-in QR Code" class="qr-image" />
              </div>

              <div class="instructions">
                <h4>📱 What to do next:</h4>
                <ol>
                  <li>Save this email on your phone for easy access during the event</li>
                  <li>Alternatively, download the QR code from your profile dashboard</li>
                  <li>Show your QR code at the event for quick check-in</li>
                  <li>If you're organizing the event, use the QR code to scan attendees</li>
                </ol>
              </div>

              <div style="text-align: center;">
                <p>
                  <strong>Any questions?</strong><br />
                  Contact the event organizer if you need any assistance.
                </p>
              </div>

              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2026 Event Hive. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const info = await transporter.sendMail({
      from: fromEmail,
      to: attendeeEmail,
      subject: `Registration Confirmed: ${eventTitle}`,
      html: htmlContent,
      attachments: [
        {
          filename: "registration-qrcode.png",
          content: qrCodeBuffer,
          cid: "qrcode", // Content ID for inline embedding
        },
      ],
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending registration email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send a simple test email (for debugging)
 */
export async function sendTestEmail(testEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const info = await transporter.sendMail({
      from: fromEmail,
      to: testEmail,
      subject: "Test Email from Event Hive",
      html: "<h1>Test Email</h1><p>If you received this, email is working correctly!</p>",
    });

    console.log("Test email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending test email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
