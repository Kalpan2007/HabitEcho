import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testBrevoAuth() {
  console.log('🔍 Brevo SMTP Authentication Test\n');
  
  const config = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  };

  console.log('📋 Current Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Pass: ${config.pass ? '✓ ' + config.pass.substring(0, 20) + '...' : '✗ Missing'}`);
  console.log(`   From: ${config.from}\n`);

  // Test 1: Basic connection
  console.log('Test 1: Attempting connection to Brevo...');
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false, // Use TLS
      auth: {
        user: config.user,
        pass: config.pass,
      },
      debug: true, // Enable debug output
      logger: true, // Enable logging
    });

    console.log('🔌 Verifying connection...');
    await transporter.verify();
    
    console.log('✅ SUCCESS! Authentication works!\n');
    
    // If auth works, try sending a test email
    console.log('📧 Attempting to send test email...');
    const result = await transporter.sendMail({
      from: `"HabitEcho" <${config.from}>`,
      to: config.user,
      subject: 'Test Email - HabitEcho',
      text: 'If you receive this, your SMTP is working perfectly!',
      html: '<h1>✅ Success!</h1><p>Your HabitEcho SMTP configuration is working!</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log('\n🎉 All tests passed! Your Brevo SMTP is ready.\n');
    
  } catch (error: any) {
    console.error('\n❌ AUTHENTICATION FAILED!\n');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.response) {
      console.error('Server Response:', error.response);
    }
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:\n');
    
    if (error.code === 'EAUTH') {
      console.log('❌ Authentication Error - Your credentials are being rejected by Brevo.');
      console.log('\n📝 This usually means:');
      console.log('   1. ❌ The SMTP API key is EXPIRED or REVOKED');
      console.log('   2. ❌ You regenerated the key in Brevo but didn\'t update .env');
      console.log('   3. ❌ The email account is not the one used to login to Brevo');
      console.log('   4. ❌ Your Brevo account might be suspended or have issues');
      console.log('\n✅ SOLUTION:');
      console.log('   1. Go to https://app.brevo.com/');
      console.log('   2. Navigate to: SMTP & API → SMTP');
      console.log('   3. Click "Generate a new SMTP key"');
      console.log('   4. Copy the NEW key');
      console.log('   5. Update server/.env file:');
      console.log('      SMTP_PASS=<paste-new-key-here>');
      console.log('   6. Make sure SMTP_USER is your Brevo LOGIN email');
      console.log('   7. Run this test again: npx tsx verify-brevo.ts');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('❌ Connection Error - Cannot reach Brevo servers');
      console.log('   • Check your internet connection');
      console.log('   • Make sure SMTP_HOST=smtp-relay.brevo.com');
      console.log('   • Make sure SMTP_PORT=587');
    }
    
    console.log('\n📧 Verify in Brevo Dashboard:');
    console.log('   • Account Status: Active ✓');
    console.log('   • SMTP Status: Enabled ✓');
    console.log('   • Sender "' + config.from + '": Verified ✓');
    console.log('   • API Keys: Not expired ✓');
    console.log('   • Daily Limit: Not exceeded (300/day free tier) ✓\n');
    
    process.exit(1);
  }
}

testBrevoAuth();
