
import nodemailer from 'nodemailer';

async function main() {
    console.log('⏳ Creating Ethereal test account...');

    try {
        const testAccount = await nodemailer.createTestAccount();

        console.log('\n✅ Ethereal Account Created!');
        console.log('----------------------------------------');
        console.log(`User: ${testAccount.user}`);
        console.log(`Pass: ${testAccount.pass}`);
        console.log('----------------------------------------');

        console.log('\n📝 Update your .env file with these values:');
        console.log('SMTP_HOST=smtp.ethereal.email');
        console.log('SMTP_PORT=587');
        console.log(`SMTP_USER=${testAccount.user}`);
        console.log(`SMTP_PASS=${testAccount.pass}`);
        console.log('SMTP_FROM="HabitEcho Dev <dev@habitecho.com>"');

        console.log('\n💡 When you send an email with these settings, Nodemailer will print a "Preview URL" to the console.');
        console.log('You can click that link to view the email in your browser.');

    } catch (err) {
        console.error('❌ Failed to create account:', err);
    }
}

main();
