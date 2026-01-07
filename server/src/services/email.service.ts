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
 * Generate verification email HTML template (OTP)
 */
function generateVerificationEmailHtml(otp: string, userName: string): string {
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
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">🌟 HabitEcho</h1>
          <p style="color: #6b7280; margin-top: 8px;">Your Personal Habit Companion</p>
        </div>
        
        <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
        
        <p style="font-size: 16px; color: #374151;">
          Welcome to HabitEcho! To complete your registration and start building better habits, please enter the following verification code in the app.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <div style="background-color: #f3f4f6; letter-spacing: 12px; font-weight: bold; font-size: 36px; padding: 24px; border-radius: 12px; color: #4f46e5; display: inline-block; border: 2px dashed #4f46e5;">
            ${otp}
          </div>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          ⏱️ This code will expire in 15 minutes.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          If you didn't create an account, you can safely ignore this email.
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
 * Generate habit reminder email HTML template
 */
function generateReminderEmailHtml(userName: string, habitName: string, habitId: string): string {
  const habitLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/habits/${habitId}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Habit Reminder - HabitEcho</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdf2f8;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #db2777; margin: 0; font-size: 28px;">⏰ Time to Shine!</h1>
          <p style="color: #6b7280; margin-top: 4px;">Don't break the streak!</p>
        </div>
        
        <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
        
        <p style="font-size: 16px; color: #374151;">
          Just a friendly nudge to complete your habit: <strong>"${habitName}"</strong>.
        </p>
        
        <div style="background: #fff1f2; border-left: 4px solid #f43f5e; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <p style="margin: 0; font-style: italic; color: #9f1239; font-size: 16px;">
            "Consistency is what transforms average into excellence."
          </p>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${habitLink}" style="background: #f43f5e; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Mark as Completed
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          You're receiving this because you set a reminder for this habit.
        </p>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} HabitEcho. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
  userName: string
): Promise<boolean> {
  if (!config.email.enabled) {
    logger.info({ to, token, userName }, '📧 Email Verification (dev mode - not sent)');
    return true;
  }

  try {
    const transport = getTransporter();
    const mailOptions = {
      from: config.email.from,
      to,
      subject: '🔐 Verify Your Email - HabitEcho',
      html: generateVerificationEmailHtml(token, userName),
    };

    const info = await transport.sendMail(mailOptions);
    logger.info({ messageId: info.messageId, to }, 'Verification email sent');
    return true;
  } catch (error) {
    logger.error({ error, to }, 'Failed to send verification email');
    return false;
  }
}

/**
 * Send habit reminder email
 */
export async function sendReminderEmail(
  to: string,
  userName: string,
  habitName: string,
  habitId: string
): Promise<boolean> {
  if (!config.email.enabled) {
    logger.info({ to, userName, habitName }, '📧 Habit Reminder (dev mode - not sent)');
    return true;
  }

  try {
    const transport = getTransporter();
    const mailOptions = {
      from: config.email.from,
      to,
      subject: `⏰ Reminder: ${habitName}`,
      html: generateReminderEmailHtml(userName, habitName, habitId),
    };

    const info = await transport.sendMail(mailOptions);
    logger.info({ messageId: info.messageId, to, habitName }, 'Reminder email sent');
    return true;
  } catch (error) {
    logger.error({ error, to, habitName }, 'Failed to send reminder email');
    return false;
  }
}

/**
 * Send OTP verification email (DEPRECATED: Use sendVerificationEmail)
 */
export async function sendOtpEmail(
  to: string,
  otp: string,
  userName: string
): Promise<boolean> {
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
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    };

    await transport.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error({ error, to }, 'Failed to send OTP email');
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
