/**
 * Brevo Transactional Email Service
 * Uses Brevo's API instead of SMTP for production reliability
 * API Documentation: https://developers.brevo.com/reference/sendtransacemail
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// ============================================
// TYPES
// ============================================

interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendEmailOptions {
  to: string | EmailRecipient | EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: EmailRecipient;
  tags?: string[];
}

interface BrevoApiResponse {
  messageId?: string;
  messageIds?: string[];
  code?: string;
  message?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================
// BREVO API CLIENT
// ============================================

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send email using Brevo Transactional Email API
 */
async function sendEmailViaBrevoApi(options: SendEmailOptions): Promise<EmailResult> {
  const apiKey = config.email.apiKey;
  
  if (!apiKey) {
    logger.error('BREVO_API_KEY is not configured');
    return { success: false, error: 'BREVO_API_KEY is not configured' };
  }

  if (!config.email.from) {
    logger.error('BREVO_SENDER_EMAIL is not configured');
    return { success: false, error: 'BREVO_SENDER_EMAIL is not configured' };
  }

  // Normalize recipients to array format
  const toRecipients: EmailRecipient[] = Array.isArray(options.to)
    ? options.to
    : typeof options.to === 'string'
      ? [{ email: options.to }]
      : [options.to];

  const payload = {
    sender: {
      name: config.email.senderName,
      email: config.email.from,
    },
    to: toRecipients,
    replyTo: options.replyTo || {
      name: config.email.senderName,
      email: config.email.replyTo,
    },
    subject: options.subject,
    htmlContent: options.htmlContent,
    textContent: options.textContent,
    tags: options.tags,
  };

  try {
    logger.debug({ to: toRecipients, subject: options.subject }, '📧 Sending email via Brevo API...');

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as BrevoApiResponse;

    if (!response.ok) {
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          code: data.code,
          message: data.message,
          to: toRecipients.map(r => r.email),
        },
        '❌ Brevo API error'
      );
      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const messageId = data.messageId || data.messageIds?.[0];
    
    logger.info(
      {
        messageId,
        to: toRecipients.map(r => r.email),
        subject: options.subject,
      },
      '✅ Email sent successfully via Brevo API'
    );

    return { success: true, messageId };
    
  } catch (error: any) {
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        to: toRecipients.map(r => r.email),
      },
      '❌ Failed to send email via Brevo API'
    );
    return { success: false, error: error.message };
  }
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
 * Send email verification OTP with retry logic
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

  const maxRetries = 3;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendEmailViaBrevoApi({
      to: { email: to, name: userName },
      subject: '🔐 Verify Your Email - HabitEcho',
      htmlContent: generateVerificationEmailHtml(token, userName),
      textContent: `Your HabitEcho verification code is: ${token}. This code expires in 15 minutes.`,
      tags: ['verification', 'otp'],
    });

    if (result.success) {
      logger.info(
        { messageId: result.messageId, to, attempt },
        '✅ Verification email sent successfully'
      );
      return true;
    }

    lastError = result.error;
    logger.warn(
      { error: result.error, to, attempt, maxRetries },
      `⚠️ Failed to send verification email (attempt ${attempt}/${maxRetries})`
    );

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  logger.error({ error: lastError, to, maxRetries }, '❌ Failed to send verification email after all retries');
  return false;
}

/**
 * Send habit reminder email with retry logic
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

  const maxRetries = 2;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendEmailViaBrevoApi({
      to: { email: to, name: userName },
      subject: `⏰ Reminder: ${habitName}`,
      htmlContent: generateReminderEmailHtml(userName, habitName, habitId),
      textContent: `Hi ${userName}, don't forget to complete your habit: "${habitName}"!`,
      tags: ['reminder', 'habit'],
    });

    if (result.success) {
      logger.info({ messageId: result.messageId, to, habitName, attempt }, '✅ Reminder email sent');
      return true;
    }

    lastError = result.error;
    logger.warn(
      { error: result.error, to, habitName, attempt },
      `⚠️ Failed to send reminder (attempt ${attempt}/${maxRetries})`
    );

    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  logger.error({ error: lastError, to, habitName }, '❌ Failed to send reminder email');
  return false;
}

/**
 * Send OTP verification email (alias for sendVerificationEmail)
 */
export async function sendOtpEmail(
  to: string,
  otp: string,
  userName: string
): Promise<boolean> {
  return sendVerificationEmail(to, otp, userName);
}

/**
 * Send a generic email
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<boolean> {
  if (!config.email.enabled) {
    logger.info({ to, subject }, '📧 Email (dev mode - not sent)');
    return true;
  }

  const result = await sendEmailViaBrevoApi({
    to,
    subject,
    htmlContent,
    textContent,
  });

  return result.success;
}

/**
 * Verify email service is configured correctly
 */
export async function verifyEmailConfig(): Promise<boolean> {
  if (!config.email.enabled) {
    logger.warn('Email service is disabled (missing BREVO_API_KEY or BREVO_SENDER_EMAIL)');
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': config.email.apiKey,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      logger.error({ status: response.status, error: data }, '❌ Brevo API key is invalid');
      return false;
    }

    const account = await response.json() as any;
    logger.info(
      { email: account.email, plan: account.plan?.[0]?.type },
      '✅ Brevo API configured and ready'
    );
    return true;
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ Failed to verify Brevo API configuration');
    return false;
  }
}
