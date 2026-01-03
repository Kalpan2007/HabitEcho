import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// ============================================
// EMAIL TRANSPORTER SETUP
// ============================================

let transporter: Transporter | null = null;

/**
 * Get or create the email transporter
 */
function getTransporter(): Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.port === 465, // true for 465, false for other ports
            auth: {
                user: config.email.user,
                pass: config.email.pass,
            },
        });
    }
    return transporter;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Generate OTP email HTML template
 */
function generateOtpEmailHtml(otp: string, userName: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - HabitEcho</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">🌟 HabitEcho</h1>
          <p style="color: #6b7280; margin-top: 8px;">Your Personal Habit Companion</p>
        </div>
        
        <!-- Greeting -->
        <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
        
        <p style="font-size: 16px; color: #374151;">
          Welcome to HabitEcho! To complete your registration, please use the verification code below:
        </p>
        
        <!-- OTP Code -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
          <p style="color: #e0e7ff; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">
            Your Verification Code
          </p>
          <p style="font-size: 42px; font-weight: bold; color: #ffffff; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otp}
          </p>
        </div>
        
        <!-- Expiry Notice -->
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          ⏱️ This code will expire in <strong>10 minutes</strong>
        </p>
        
        <!-- Security Notice -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 30px; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            🔒 <strong>Security Tip:</strong> Never share this code with anyone. HabitEcho will never ask for your verification code.
          </p>
        </div>
        
        <!-- Footer -->
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          If you didn't request this code, please ignore this email.
        </p>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} HabitEcho. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate OTP email plain text (fallback)
 */
function generateOtpEmailText(otp: string, userName: string): string {
    return `
Hi ${userName},

Welcome to HabitEcho! To complete your registration, use this verification code:

${otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

- The HabitEcho Team
  `;
}

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

/**
 * Send OTP verification email
 */
export async function sendOtpEmail(
    to: string,
    otp: string,
    userName: string
): Promise<boolean> {
    // In development without email config, just log and return
    if (!config.email.enabled) {
        logger.info({ to, otp, userName }, '📧 Email OTP (dev mode - not sent)');
        return true;
    }

    try {
        const transport = getTransporter();

        const mailOptions = {
            from: config.email.from,
            to,
            subject: '🔐 Verify Your Email - HabitEcho',
            text: generateOtpEmailText(otp, userName),
            html: generateOtpEmailHtml(otp, userName),
        };

        const info = await transport.sendMail(mailOptions);
        logger.info({ messageId: info.messageId, to }, 'Email OTP sent successfully');
        return true;
    } catch (error) {
        logger.error({ error, to }, 'Failed to send OTP email');
        // Don't throw - we still want signup to succeed even if email fails
        // The user can request a resend later
        return false;
    }
}

/**
 * Verify email transporter is configured correctly
 */
export async function verifyEmailConfig(): Promise<boolean> {
    if (!config.email.enabled) {
        logger.warn('Email service is disabled (missing SMTP configuration)');
        return false;
    }

    try {
        const transport = getTransporter();
        await transport.verify();
        logger.info('Email service is configured and ready');
        return true;
    } catch (error) {
        logger.error({ error }, 'Email configuration verification failed');
        return false;
    }
}
