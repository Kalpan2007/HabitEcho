import { config } from './src/config';
import { sendEmail } from './src/utils/email';

async function main() {
    console.log('--- Config Check ---');
    console.log('Email Enabled:', config.email.enabled);
    console.log('Host:', config.email.host);
    console.log('Port:', config.email.port);
    console.log('User:', config.email.user ? 'set' : 'empty');
    console.log('Pass:', config.email.pass ? 'set' : 'empty');
    console.log('From:', config.email.from);
    console.log('--------------------');

    if (!config.email.enabled) {
        console.warn('Email is disabled in config. Please check your .env file.');
        console.warn('Ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are set.');
        return;
    }

    console.log('Attempting to send email...');
    try {
        const success = await sendEmail('test@example.com', 'Test Subject', '<p>Test Body</p>');
        console.log('Send Email Result:', success);
    } catch (err) {
        console.error('Unexpected error in main wrapper:', err);
    }
}

main().catch(console.error);
