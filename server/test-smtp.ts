import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function testSMTP() {
  console.log('🔍 Testing SMTP Connection...\n');
  
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  };

  console.log('📧 Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Pass: ${config.pass ? '✓ Set (' + config.pass.substring(0, 20) + '...)' : '✗ Missing'}`);
  console.log(`   From: ${config.from}\n`);

  if (!config.host || !config.user || !config.pass || !config.from) {
    console.error('❌ Missing required SMTP configuration!');
    process.exit(1);
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `HabitEcho Test <${config.from}>`,
      to: config.user, // Send to yourself
      subject: '🧪 HabitEcho SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">✅ SMTP Test Successful!</h2>
          <p>Your HabitEcho email configuration is working correctly.</p>
          <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="font-size: 12px; color: #6B7280;">
            Sent at: ${new Date().toLocaleString()}<br>
            From: ${config.from}<br>
            Via: ${config.host}
          </p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Accepted: ${info.accepted.join(', ')}`);
    console.log(`   Rejected: ${info.rejected.length > 0 ? info.rejected.join(', ') : 'None'}`);
    
    console.log('\n🎉 All tests passed! Your SMTP is ready to use.');
    
  } catch (error: any) {
    console.error('\n❌ SMTP Test Failed!');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    if (error.response) {
      console.error('Server Response:', error.response);
    }
    
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify your Brevo SMTP credentials in .env file');
    console.error('   2. Check if your Brevo account is active and verified');
    console.error('   3. Ensure your sender email is verified in Brevo dashboard');
    console.error('   4. Check if you have reached daily sending limits (300/day for free)');
    
    process.exit(1);
  }
}

testSMTP();
