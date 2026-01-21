# 🔧 How to Fix Brevo SMTP Authentication

## ❌ Current Error: Authentication failed (535 5.7.8)

This means your SMTP credentials are incorrect or expired.

---

## ✅ Steps to Fix:

### 1. Get New SMTP Credentials from Brevo

1. **Login to Brevo Dashboard**: https://app.brevo.com/
2. Go to **SMTP & API** → **SMTP**
3. Click **"Generate a new SMTP key"** or use existing one
4. Copy the following:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: Your Brevo login email (e.g., `kalpankaneriyax@gmail.com`)
   - **SMTP Key**: The generated key (starts with `xsmtpsib-...`)

### 2. Update Your `.env` File

Replace in `server/.env`:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<YOUR_BREVO_LOGIN_EMAIL>
SMTP_PASS=<YOUR_NEW_SMTP_KEY>
SMTP_FROM=<YOUR_VERIFIED_SENDER_EMAIL>
```

**Example:**
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=kalpankaneriyax@gmail.com
SMTP_PASS=xsmtpsib-abc123def456...
SMTP_FROM=kalpankaneriyax@gmail.com
```

### 3. Verify Sender Email in Brevo

1. Go to **Senders** in Brevo dashboard
2. Make sure `kalpankaneriyax@gmail.com` is **verified**
3. If not verified, click **"Verify"** and follow instructions

### 4. Test Again

```bash
cd server
npx tsx test-smtp.ts
```

---

## 🔍 Common Issues:

### Issue: "Invalid login" error
**Solution**: 
- Make sure SMTP_USER is your Brevo **login email**
- NOT the format like `9fd341001@smtp-brevo.com` (that's wrong)

### Issue: "Sender not verified"
**Solution**: 
- Go to Brevo → Senders → Verify your email address
- Click the verification link sent to your inbox

### Issue: "Daily limit exceeded"
**Solution**: 
- Brevo free tier: 300 emails/day
- Check your usage in dashboard
- Wait 24 hours or upgrade plan

---

## 📝 What to Check in Brevo Dashboard:

1. **Account Status**: Active and verified
2. **SMTP Status**: Enabled
3. **Sender Email**: Verified (green checkmark)
4. **API Key**: Not expired or revoked
5. **Usage Limits**: Not exceeded

---

## 🧪 After Fixing, Test:

```bash
# Test SMTP connection
cd server
npx tsx test-smtp.ts

# If successful, start the server
npm run dev
```

Then test signup from frontend - you should receive the verification email!
