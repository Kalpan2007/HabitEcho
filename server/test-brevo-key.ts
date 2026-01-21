/**
 * Test Brevo API Key
 * Run: npx tsx test-brevo-key.ts YOUR_API_KEY_HERE
 */

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ Please provide your API key as an argument');
  console.log('\nUsage: npx tsx test-brevo-key.ts YOUR_API_KEY_HERE\n');
  process.exit(1);
}

async function testBrevoKey() {
  console.log('\n🧪 Testing Brevo API Key...\n');
  
  // Check key format
  console.log('1️⃣ Checking key format...');
  console.log(`   Key starts with: ${apiKey.substring(0, 10)}...`);
  
  if (apiKey.startsWith('xsmtpsib-')) {
    console.log('   ❌ WRONG! This is an SMTP password, not an API key');
    console.log('   ℹ️  API keys start with "xkeysib-" not "xsmtpsib-"');
    console.log('\n   Go to: https://app.brevo.com/settings/keys/api');
    console.log('   Create a NEW API key (not SMTP password)\n');
    process.exit(1);
  }
  
  if (!apiKey.startsWith('xkeysib-')) {
    console.log('   ⚠️  Warning: API keys usually start with "xkeysib-"');
  } else {
    console.log('   ✅ Key format looks correct');
  }

  // Test API connection
  console.log('\n2️⃣ Testing API connection...');
  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json();
      console.log('   ❌ API Key Invalid!');
      console.log(`   Error: ${error.message || error.code}`);
      console.log('\n   Please generate a NEW API key:');
      console.log('   1. Go to: https://app.brevo.com/settings/keys/api');
      console.log('   2. Click "Create a new API key"');
      console.log('   3. Copy the FULL key (starts with xkeysib-)');
      process.exit(1);
    }

    const account = await response.json();
    console.log('   ✅ API Key Valid!');
    console.log(`\n   Account: ${account.email}`);
    console.log(`   Plan: ${account.plan?.[0]?.type || 'Free'}`);
    console.log(`   Credits: ${account.plan?.[0]?.credits || 'Unlimited (Free)'}`);

    // Test send email permissions
    console.log('\n3️⃣ Testing email permissions...');
    const testResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'Test', email: 'test@example.com' },
        to: [{ email: 'test@example.com' }],
        subject: 'Test',
        htmlContent: '<p>Test</p>',
      }),
    });

    // We expect this to fail with specific errors (not auth error)
    const testResult = await testResponse.json();
    
    if (testResponse.status === 401) {
      console.log('   ❌ No email sending permissions');
      console.log('   Generate a new API key with email permissions');
    } else if (testResponse.status === 400 && testResult.code === 'invalid_parameter') {
      console.log('   ✅ Has email sending permissions');
    } else {
      console.log(`   ✅ Permissions check passed (${testResponse.status})`);
    }

    console.log('\n✨ API Key is ready to use!\n');
    console.log('📝 Add to your .env file:');
    console.log(`   BREVO_API_KEY=${apiKey}\n`);

  } catch (error: any) {
    console.log('   ❌ Connection failed');
    console.log(`   Error: ${error.message}`);
    process.exit(1);
  }
}

testBrevoKey();
