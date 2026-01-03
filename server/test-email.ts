
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Explicitly load .env from current directory
const envPath = path.join(process.cwd(), '.env');
console.log(`Loading .env from: ${envPath}`);

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');

    // Debug: Read raw content to see if keys exist
    const rawContent = fs.readFileSync(envPath, 'utf8');
    console.log('--- Raw File Check ---');
    console.log('File length:', rawContent.length);
    console.log('Contains SMTP_HOST?', rawContent.includes('SMTP_HOST'));
    console.log('Contains SMTP_USER?', rawContent.includes('SMTP_USER'));

    // Print lines (masking potential values)
    const lines = rawContent.split('\n');
    lines.forEach((line, i) => {
        if (line.trim().startsWith('SMTP_')) {
            const [key, ...val] = line.split('=');
            console.log(`Line ${i + 1}: ${key} = ${val.length > 0 ? '********' : '(empty)'}`);
        }
    });

    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error('❌ Error parsing .env:', result.error);
    } else {
        console.log('✅ .env loaded by dotenv');
    }
} else {
    console.error('❌ .env file NOT found at this path!');
    console.log('Current directory contents:', fs.readdirSync(process.cwd()));
}

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

console.log('--- Email Configuration Check ---');
console.log(`HOST: ${SMTP_HOST}`);
console.log(`PORT: ${SMTP_PORT}`);
console.log(`USER: ${SMTP_USER}`);
console.log(`PASS: ${SMTP_PASS ? '********' : 'NOT SET'}`);
console.log(`FROM: ${SMTP_FROM}`);

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('❌ Missing configuration. Please check .env file.');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    debug: true, // Enable debug output
    logger: true // Log to console
});

async function test() {
    try {
        console.log('Attempting to verify connection...');
        await transporter.verify();
        console.log('✅ Connection verification successful!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: SMTP_FROM || `HabitEcho <${SMTP_USER}>`,
            to: SMTP_USER, // Send to self
            subject: 'HabitEcho SMTP Test',
            text: 'If you receive this, your email configuration is working correctly!',
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (err) {
        console.error('❌ Error testing email:');
        console.error(err);
    }
}

test();
