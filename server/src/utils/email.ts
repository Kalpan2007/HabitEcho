import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

const isGmail = config.email.host === 'smtp.gmail.com';

const transporter = nodemailer.createTransport(
  isGmail
    ? {
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    }
    : {
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    }
);

/**
 * Send an email using the configured SMTP server.
 * Returns true if successful, false otherwise.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!config.email.enabled) {
    logger.warn({ to, subject }, 'Email service disabled or not configured. Skipping email.');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });

    logger.info(`📧 Email sent: ${info.messageId}`);

    // Log Ethereal URL if available (for testing)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`🔗 Preview URL: ${previewUrl}`);
      console.log(`\n📬 [DEV] Email Preview: ${previewUrl}\n`);
    }

    return true;
  } catch (error) {
    logger.error({ error, to }, 'Failed to send email');
    return false;
  }
}

/**
 * Send OTP for email verification
 */
export async function sendOtpEmail(to: string, code: string, name?: string) {
  const subject = `${code} is your HabitEcho verification code`;
  const greeting = name ? `Welcome to HabitEcho, ${name}!` : 'Welcome to HabitEcho!';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
      <h2 style="color: #4F46E5;">${greeting}</h2>
      <p style="font-size: 16px; color: #374151;">Use the verification code below to confirm your email address and start building consistent habits.</p>
      
      <div style="margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background: #F3F4F6; padding: 15px 30px; border-radius: 8px; border: 1px solid #E5E7EB;">
          ${code}
        </span>
      </div>
      
      <p style="font-size: 14px; color: #6B7280;">This code will expire in ${config.otp.expiryMinutes} minutes.</p>
      <p style="font-size: 12px; color: #9CA3AF; margin-top: 40px;">If you didn't request this code, you can ignore this email.</p>
    </div>
  `;

  return sendEmail(to, subject, html);
}
