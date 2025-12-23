# WhatsApp Hotel Booking Bot - Quick Start Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **WhatsApp Business Account** with Cloud API access
3. **Meta Developer Account** at https://developers.meta.com
4. **ngrok** or similar tool for local testing (optional)

## Step 1: Get WhatsApp Cloud API Credentials

1. Go to [Meta Developers](https://developers.meta.com)
2. Create a new app or use existing Business App
3. Add WhatsApp product
4. Go to **WhatsApp** > **API Setup**
5. Note down:
   - **Phone Number ID** (from sender phone number)
   - **Business Account ID**
   - **Permanent Access Token** (generate from User Token Management)

## Step 2: Setup Project

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Fill in .env
```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_API_TOKEN=EAAbCdEfG...
WEBHOOK_VERIFY_TOKEN=my_secure_token_12345
PORT=3000
NODE_ENV=development
```

## Step 3: Setup Webhook

### Option A: Local Testing with ngrok

```bash
# Install ngrok
# https://ngrok.com/download

# Start ngrok
ngrok http 3000

# Copy the forwarding URL (e.g., https://abc123.ngrok.io)
```

### Option B: Production Deployment

Deploy server to any platform (Heroku, AWS, DigitalOcean, etc.)

## Step 4: Configure Webhook in Meta Dashboard

1. Go to **WhatsApp** > **Configuration**
2. Under **Webhook**, click **Edit**
3. Enter:
   - **Callback URL**: `https://your-domain.com/webhook` (use ngrok URL for testing)
   - **Verify Token**: (same as `WEBHOOK_VERIFY_TOKEN` in .env)
4. Click **Verify and Save**
5. Subscribe to:
   - ✓ messages
   - ✓ message_status

## Step 5: Run the Bot

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

You should see:
```
🤖 WhatsApp Hotel Booking Bot Started
==================================================
✓ Server running on port 3000
✓ Webhook: http://localhost:3000/webhook
✓ Status: http://localhost:3000/status
✓ Node Environment: development
✓ WhatsApp Phone ID: 123456789012345
==================================================
```

## Step 6: Add Test User

1. Go to WhatsApp **Configuration**
2. Under **Test numbers**, add your phone number
3. You'll receive a test code via WhatsApp

## Testing the Bot

### Option 1: Send Message to Test Number

Send any message to the phone number configured in WhatsApp. The bot should respond with greeting.

### Option 2: Use Test Endpoint

```bash
# Send test message
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "Hello Bot"
  }'

# Start test flow
curl -X POST http://localhost:3000/send-test-flow \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919876543210"}'

# Check bot status
curl http://localhost:3000/status

# Get user details
curl http://localhost:3000/users/919876543210
```

## Complete Conversation Flow Example

1. **User**: Send any message → Bot greets with check-in prompt
2. **User**: `25-12-2025` → Bot asks for check-out date
3. **User**: `26-12-2025` → Bot asks number of guests
4. **User**: `2` → Bot asks room type
5. **User**: `1` → Bot asks location
6. **User**: `Bandra` → Bot shows room & price, asks payment method
7. **User**: `1` → Bot sends QR code
8. **User**: Sends screenshot → Bot triggers human handoff
9. **Hotel Team**: Gets notification, calls customer

## Conversation States

```
START → CHECKIN → CHECKOUT → GUEST_COUNT → STAY_TYPE → LOCATION 
→ PRICE_SHARED → PAYMENT_CHOICE → [WAITING_SCREENSHOT or HUMAN_HANDOFF] 
→ CONFIRMED
```

## Admin Endpoints

### Get Status
```bash
curl http://localhost:3000/status
```

Response:
```json
{
  "status": "operational",
  "timestamp": "2025-12-23T10:30:00.000Z",
  "users": {
    "total": 5,
    "stateDistribution": {
      "START": 1,
      "CHECKIN": 2,
      "PAYMENT_CHOICE": 2
    }
  }
}
```

### List All Users
```bash
curl http://localhost:3000/users
```

### Get Single User
```bash
curl http://localhost:3000/users/919876543210
```

### Reset User (for testing)
```bash
curl -X POST http://localhost:3000/reset-user \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919876543210"}'
```

## Troubleshooting

### Webhook not receiving messages
1. Check ngrok/URL is correctly configured in Meta Dashboard
2. Verify `WEBHOOK_VERIFY_TOKEN` matches in code and Dashboard
3. Ensure server is running and accessible
4. Check firewall/security settings

### Messages not sending to user
1. Check `WHATSAPP_API_TOKEN` is valid and not expired
2. Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
3. Ensure phone number is in correct format (91XXXXXXXXXX for India)
4. Check if number is test user or active number

### Bot stuck in a state
1. Use `/reset-user` endpoint to reset
2. Check error logs in console
3. Verify input format matches expected pattern

### "Configuration Error" on startup
1. Ensure `.env` file exists and is readable
2. Verify all required variables are set:
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_API_TOKEN`
   - `WEBHOOK_VERIFY_TOKEN`

## Production Checklist

- [ ] Use strong `WEBHOOK_VERIFY_TOKEN`
- [ ] Never commit `.env` file
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for webhook URL
- [ ] Implement rate limiting
- [ ] Add error tracking (Sentry, DataDog)
- [ ] Setup logging system
- [ ] Configure database for user persistence
- [ ] Setup monitoring/alerting
- [ ] Test with real users
- [ ] Document API endpoints for hotel team

## Common Error Messages

| Error | Solution |
|-------|----------|
| `WHATSAPP_PHONE_NUMBER_ID not found` | Check .env file, restart server |
| `401 Unauthorized` | Check access token validity and expiration |
| `403 Forbidden (webhook)` | Verify token in Meta Dashboard |
| `404 Not Found` | Check webhook URL format |
| `Webhook timeout` | Server taking too long, optimize code |

## Support Resources

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Webhooks](https://developers.facebook.com/docs/whatsapp/webhooks)
- [Express.js Docs](https://expressjs.com/)
- [Node.js Docs](https://nodejs.org/docs/)

## Next Steps

1. **Database Integration**: Store users in MongoDB/PostgreSQL
2. **Real Payment Gateway**: Integrate Razorpay/PayU
3. **Real Hotel Data**: Connect to inventory system
4. **Admin Dashboard**: Build UI for hotel team
5. **Analytics**: Track conversion, drop-offs
6. **Multi-language**: Add more language support
7. **NLP Improvement**: Better input parsing
8. **Webhook Signatures**: Verify incoming webhooks
