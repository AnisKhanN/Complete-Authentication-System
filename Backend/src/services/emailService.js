import nodemailer from "nodemailer";
import config from "../config/config.js";

// Initialize Gmail SMTP Transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.EMAIL_USER?.trim(),
      pass: config.EMAIL_PASS?.trim(),
    },
    // Force IPv4 to avoid IPv6 ENETUNREACH timeouts on Windows networks
    family: 4,
  });
};

/**
 * Sends a real 6-digit OTP verification email
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit one-time passcode
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendOtpEmail = async (toEmail, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"AuthShield Security" <${config.EMAIL_USER.trim()}>`,
      to: toEmail,
      subject: `Your AuthShield Security Code: ${otp}`,
      text: `Hello,\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this code, please ignore this email or contact security.\n\nBest regards,\nAuthShield Security Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AuthShield Security Code</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 36px 32px; text-align: center; color: #334155; }
            .content p { font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
            .otp-box { display: inline-block; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px 32px; margin: 8px 0 24px; }
            .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b; margin: 0; }
            .warning { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin: 24px 0 0; text-align: left; }
            .footer { padding: 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AuthShield Verification</h1>
              <p>Secure Enterprise Account Protection</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested a one-time verification code to reset your account password. Enter this code into the portal to proceed:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p style="font-size: 13px; color: #64748b;">This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
              <div class="warning">
                <strong>Notice:</strong> If you did not initiate this password reset request, you can safely disregard this email. Your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} AuthShield Security Portal. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[EMAIL SERVICE] OTP successfully delivered to ${toEmail}. Message ID: ${info.messageId}`,
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      `[EMAIL SERVICE] SMTP Error sending to ${toEmail}:`,
      error.message,
    );
    if (
      error.message.includes("Invalid login") ||
      error.message.includes("Username and Password not accepted")
    ) {
      console.warn(
        `[EMAIL SERVICE TIP] Google requires an App Password (16 characters) for Gmail accounts with 2-Step Verification enabled. Visit https://myaccount.google.com/apppasswords to create one.`,
      );
    }
    return { success: false, error: error.message };
  }
};
