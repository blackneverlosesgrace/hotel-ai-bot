# WhatsApp Hotel Booking Chatbot

A state-based WhatsApp AI chatbot built with Node.js and Express for converting hotel booking leads from Meta Ads to WhatsApp bookings.

## Features

- **State Machine Architecture**: Guided conversation flow with clearly defined states
- **Multi-step Booking**: Collects check-in, check-out, guest count, room type, location, and payment preference
- **Payment Handling**: Supports both online (QR-based) and hotel payment methods
- **Image Processing**: Handles payment screenshots for online payment verification
- **Hinglish Support**: Responds in simple Hindi/Hinglish for better UX
- **Automatic Reminders**: Sends follow-up messages for inactive users or incomplete payments
- **State Persistence**: Stores user data and conversation state in memory/database

## Project Structure

```
hotel-ai-bot/
├── server.js                 # Express app & webhook handler
├── config.js                 # Configuration & constants
├── states.js                 # State machine definitions
├── userStorage.js            # User data & state management
├── messageHandler.js         # Message processing logic
├── whatsappService.js        # WhatsApp API integration
├── reminderService.js        # Reminder & follow-up logic
├── utils.js                  # Helper functions
├── .env.example              # Environment variables template
├── .env                       # Environment variables (create this)
├── package.json              # Dependencies
└── README.md                 # This file
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Add your WhatsApp Cloud API credentials and phone number ID

## Configuration

Copy `.env.example` to `.env` and fill in:

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_API_TOKEN=your_permanent_access_token
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
PORT=3000
NODE_ENV=development
```

## Conversation Flow

```
START
├── Greet user
└── Ask check-in date (CHECKIN)
    └── Validate & ask check-out date (CHECKOUT)
        └── Ask number of guests (GUEST_COUNT)
            └── Ask room type (STAY_TYPE)
                └── Ask location (LOCATION)
                    └── Show available rooms & price (PRICE_SHARED)
                        └── Ask payment method (PAYMENT_CHOICE)
                            ├── Online Path
                            │   ├── Send QR code (WAITING_SCREENSHOT)
                            │   └── Receive payment screenshot → HUMAN_HANDOFF
                            └── Hotel Payment Path
                                └── Direct to HUMAN_HANDOFF
                                    └── Send confirmation (CONFIRMED)
```

## States

- **START**: Initial greeting
- **CHECKIN**: Collecting check-in date
- **CHECKOUT**: Collecting check-out date
- **GUEST_COUNT**: Collecting number of guests (1-4)
- **STAY_TYPE**: Selecting room type (24h or 6h)
- **LOCATION**: Collecting preferred location
- **PRICE_SHARED**: Showing room details and pricing
- **PAYMENT_CHOICE**: Selecting payment method
- **WAITING_SCREENSHOT**: Awaiting payment screenshot (online payment)
- **HUMAN_HANDOFF**: Triggering human agent contact
- **CONFIRMED**: Booking confirmed

## Message Handling

### Text Messages
- Processed based on current conversation state
- Validated for format and content
- State automatically advances on successful input

### Image Messages
- Only accepted in `WAITING_SCREENSHOT` state (payment proof)
- Automatically moves user to `HUMAN_HANDOFF` state
- Images in other states are politely ignored

## Webhook

### Receive Webhook (POST /webhook)
- Handles incoming messages from WhatsApp
- Identifies user by phone number
- Loads user state
- Processes message based on type and current state
- Updates and persists state

### Webhook Verification (GET /webhook)
- Verifies webhook subscription with Meta
- Required for initial webhook setup

## Reminders

- Inactive for 1 hour in any state before payment: Gentle reminder sent
- Online payment: Reminder after 30 minutes if screenshot not received
- Maximum 2 follow-up messages per session

## Sample API Requests

### Send Text Message
```bash
curl -X POST https://graph.instagram.com/v18.0/{PHONE_NUMBER_ID}/messages \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "91xxxxxxxxxx",
    "type": "text",
    "text": {
      "body": "नमस्ते! कृपया अपनी चेक-इन डेट बताएं।"
    }
  }'
```

## Environment Setup

### WhatsApp Cloud API Setup

1. Go to [Meta Developers](https://developers.meta.com)
2. Create a Business App
3. Get Business Phone Number ID from WhatsApp section
4. Generate a permanent access token
5. Set up webhook URL pointing to your server
6. Add your phone number to test users

### Webhook Configuration

- **Webhook URL**: `https://yourdomain.com/webhook`
- **Verify Token**: Custom string (match `WEBHOOK_VERIFY_TOKEN` in .env)
- **Subscribe to messages and message_status**

## Running the Bot

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on the port specified in `.env` (default: 3000).

## Checking If Bot Is Live

### Quick Status Check
```bash
# Run the automated status checker
npm run check:live

# Or directly
node check-live-status.js
```

This will check:
- ✓ Environment configuration
- ✓ Local server status
- ✓ WhatsApp API connectivity
- ✓ Webhook accessibility
- ✓ Dependencies installation

### Web Dashboard
Once the server is running, visit:
- **Local**: http://localhost:3000/status.html
- **Production**: https://yourdomain.com/status.html

### API Status Endpoint
```bash
curl http://localhost:3000/status
```

Returns JSON with:
- Deployment status (live/offline/partial)
- Environment configuration
- Active users count
- Service health indicators
- Uptime information

For detailed status information, see [LIVE_STATUS.md](LIVE_STATUS.md)

## Testing

1. **Local Testing**: Use ngrok to expose local server to internet
   ```bash
   ngrok http 3000
   ```
2. **Webhook Verification**: Meta will verify your endpoint
3. **Send Test Message**: Use WhatsApp test number to test flow

## Error Handling

- Graceful error handling for API failures
- Fallback responses in Hindi/Hinglish
- Automatic retry logic for failed message sends
- Logging of all errors for debugging

## Pricing Logic

Current mock pricing:
- Room prices between ₹699–₹1299
- Varies by guest count and stay duration
- 24-hour stay: Higher base price
- 6-hour stay: Lower hourly rate

## Security Considerations

- Store sensitive credentials in `.env` (never commit)
- Validate webhook requests
- Sanitize user inputs
- Implement rate limiting for production
- Use HTTPS for webhook endpoint

## Future Enhancements

- Database integration for persistent storage
- Real hotel inventory integration
- Payment gateway integration (Razorpay, PayU)
- Multi-language support
- Analytics and conversation metrics
- Admin dashboard for human agents

## Support

For issues or questions, please refer to:
- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Express.js Documentation](https://expressjs.com/)

## License

MIT
