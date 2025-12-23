# WhatsApp Hotel Booking Bot - API Documentation

## Overview

This document describes all available API endpoints for the WhatsApp hotel booking chatbot.

## Webhook Endpoints

### Webhook Verification (GET)

Verifies the webhook subscription with Meta.

**Endpoint**: `GET /webhook`

**Query Parameters**:
- `hub.mode`: `subscribe`
- `hub.verify_token`: Your webhook verification token
- `hub.challenge`: Challenge string from Meta

**Response**: 
- **200 OK**: Returns challenge string (for successful verification)
- **403 Forbidden**: Invalid token

**Example**:
```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=my_token&hub.challenge=abc123"
```

---

### Receive Messages (POST)

Main webhook endpoint to receive incoming messages from WhatsApp.

**Endpoint**: `POST /webhook`

**Request Body** (from Meta):
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "123456789012345"
            },
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "919876543210"
              }
            ],
            "messages": [
              {
                "from": "919876543210",
                "id": "wamid.xxx",
                "timestamp": "1671234567",
                "type": "text",
                "text": {
                  "body": "Hello"
                }
              }
            ]
          },
          "field": "messages"
        }
      ],
      "timestamp": "1671234567"
    }
  ]
}
```

**Response**: 
- **200 OK**: `EVENT_RECEIVED` (always respond within 10 seconds)

**Message Types Supported**:
- `text`: Text message
- `image`: Image message (used for payment screenshots)
- `audio`: Audio message (logged but not actively used)
- `document`: Document message (logged but not actively used)

---

## Admin & Monitoring Endpoints

### Get Bot Status

Get current bot status and statistics.

**Endpoint**: `GET /status`

**Response** (200 OK):
```json
{
  "status": "operational",
  "timestamp": "2025-12-23T10:30:00.000Z",
  "users": {
    "total": 12,
    "stateDistribution": {
      "START": 2,
      "CHECKIN": 3,
      "CHECKOUT": 1,
      "GUEST_COUNT": 2,
      "STAY_TYPE": 1,
      "LOCATION": 1,
      "PRICE_SHARED": 1,
      "PAYMENT_CHOICE": 1
    }
  },
  "service": {
    "whatsapp": "connected",
    "reminders": "active"
  }
}
```

**Example**:
```bash
curl http://localhost:3000/status
```

---

### List All Users

Get all users and their current states.

**Endpoint**: `GET /users`

**Query Parameters** (optional):
- `state`: Filter by specific state (e.g., `PAYMENT_CHOICE`)
- `limit`: Limit number of results (default: 100)

**Response** (200 OK):
```json
{
  "total": 3,
  "users": [
    {
      "phoneNumber": "919876543210",
      "state": "PAYMENT_CHOICE",
      "bookingData": {
        "checkinDate": "25-12-2025",
        "checkoutDate": "26-12-2025",
        "guestCount": 2,
        "roomType": "24_hours",
        "location": "Bandra",
        "paymentMethod": null,
        "roomSelected": "deluxe",
        "price": 999
      },
      "sessionDuration": 245000,
      "lastActivity": 5000
    },
    {
      "phoneNumber": "918765432101",
      "state": "CONFIRMED",
      "bookingData": {
        "checkinDate": "24-12-2025",
        "checkoutDate": "25-12-2025",
        "guestCount": 3,
        "roomType": "6_hours",
        "location": "Airport",
        "paymentMethod": "online",
        "roomSelected": "suite",
        "price": 250
      },
      "sessionDuration": 600000,
      "lastActivity": 50000
    }
  ]
}
```

**Example**:
```bash
curl http://localhost:3000/users

# Filter by state
curl http://localhost:3000/users?state=PAYMENT_CHOICE

# Limit results
curl http://localhost:3000/users?limit=5
```

---

### Get Specific User Details

Get detailed information about a specific user.

**Endpoint**: `GET /users/:phoneNumber`

**Path Parameters**:
- `phoneNumber`: WhatsApp phone number (e.g., `919876543210`)

**Response** (200 OK):
```json
{
  "phoneNumber": "919876543210",
  "state": "WAITING_SCREENSHOT",
  "bookingData": {
    "checkinDate": "25-12-2025",
    "checkoutDate": "26-12-2025",
    "guestCount": 2,
    "roomType": "24_hours",
    "location": "Bandra",
    "paymentMethod": "online",
    "roomSelected": "deluxe",
    "price": 999
  },
  "reminders": {
    "inactiveReminders": 0,
    "paymentReminders": 0
  },
  "timestamps": {
    "startedAt": 1703318400000,
    "lastActivityAt": 1703318600000,
    "paymentInitiatedAt": 1703318500000
  },
  "conversationLength": 15,
  "lastFiveMessages": [
    {
      "role": "user",
      "content": "Bandra",
      "messageType": "text",
      "timestamp": 1703318500000
    },
    {
      "role": "bot",
      "content": "Price shown message...",
      "messageType": "text",
      "timestamp": 1703318505000
    }
  ]
}
```

**Example**:
```bash
curl http://localhost:3000/users/919876543210
```

**Response Codes**:
- **200 OK**: User found
- **404 Not Found**: User not found (will create new user)

---

### Send Test Message

Send a test message to a phone number (for testing and debugging).

**Endpoint**: `POST /test-message`

**Request Body**:
```json
{
  "phoneNumber": "919876543210",
  "message": "Hello, this is a test message"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "messageId": "wamid.xxx",
  "timestamp": "2025-12-23T10:30:00.000Z"
}
```

**Response** (500 Error):
```json
{
  "success": false,
  "error": "401 Unauthorized"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "नमस्ते! होटल बुकिंग के लिए प्रस्तुत?"
  }'
```

---

### Start Test Flow

Start the complete booking flow with a fresh user.

**Endpoint**: `POST /send-test-flow`

**Request Body**:
```json
{
  "phoneNumber": "919876543210"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Test flow started",
  "messageId": "wamid.xxx"
}
```

**What happens**:
1. User state is reset
2. Greeting message is sent
3. Bot awaits check-in date input

**Example**:
```bash
curl -X POST http://localhost:3000/send-test-flow \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919876543210"}'
```

---

### Reset User State

Reset a user's conversation state (useful for testing).

**Endpoint**: `POST /reset-user`

**Request Body**:
```json
{
  "phoneNumber": "919876543210"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User 919876543210 has been reset"
}
```

**What happens**:
1. All user data is cleared from memory
2. Next message will be treated as a new user
3. User receives greeting again

**Example**:
```bash
curl -X POST http://localhost:3000/reset-user \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919876543210"}'
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error description",
  "message": "Detailed message (development only)"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | Success | Message sent, data retrieved |
| **400** | Bad Request | Missing required parameters |
| **403** | Forbidden | Invalid webhook token |
| **404** | Not Found | Endpoint doesn't exist |
| **500** | Server Error | API call failed, database error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Implement per-IP rate limiting
- Implement per-user rate limiting
- Add request throttling for WhatsApp API

---

## Message Payload Examples

### Text Message
```json
{
  "from": "919876543210",
  "id": "wamid.xxx",
  "timestamp": "1671234567",
  "type": "text",
  "text": {
    "body": "25-12-2025"
  }
}
```

### Image Message (Payment Screenshot)
```json
{
  "from": "919876543210",
  "id": "wamid.xxx",
  "timestamp": "1671234567",
  "type": "image",
  "image": {
    "mime_type": "image/jpeg",
    "sha256": "xxx",
    "id": "xxx"
  }
}
```

---

## Conversation States Reference

| State | Description | Awaits |
|-------|-------------|--------|
| **START** | Initial greeting | User message |
| **CHECKIN** | Collecting check-in date | Date (DD-MM-YYYY) |
| **CHECKOUT** | Collecting check-out date | Date (DD-MM-YYYY) |
| **GUEST_COUNT** | Collecting guest count | Number (1-4) |
| **STAY_TYPE** | Selecting room type | Option (1 or 2) |
| **LOCATION** | Collecting location | Text |
| **PRICE_SHARED** | Room details shown | User choice |
| **PAYMENT_CHOICE** | Selecting payment method | Option (1 or 2) |
| **WAITING_SCREENSHOT** | Awaiting payment proof | Image file |
| **HUMAN_HANDOFF** | Triggered hotel team | Hotel action |
| **CONFIRMED** | Booking completed | None |

---

## Database Schema (For Future Implementation)

### User Collection
```javascript
{
  _id: ObjectId,
  phoneNumber: String,
  state: String,
  bookingData: {
    checkinDate: Date,
    checkoutDate: Date,
    guestCount: Number,
    roomType: String,
    location: String,
    paymentMethod: String,
    roomSelected: String,
    price: Number
  },
  reminders: {
    inactiveReminders: Number,
    paymentReminders: Number
  },
  timestamps: {
    startedAt: Date,
    lastActivityAt: Date,
    paymentInitiatedAt: Date
  },
  conversation: [{
    role: String,
    content: String,
    messageType: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Integration Examples

### Send Quick Text Message
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "धन्यवाद आपकी वापसी के लिए"
  }'
```

### Get User Booking Details
```bash
curl http://localhost:3000/users/919876543210 | jq '.bookingData'
```

### Monitor Active Sessions
```bash
watch -n 5 'curl -s http://localhost:3000/status | jq ".users"'
```

### Extract Users Waiting for Payment
```bash
curl -s http://localhost:3000/users | \
  jq '.users[] | select(.state=="WAITING_SCREENSHOT")'
```

---

## Testing Workflow

### 1. Start Fresh User
```bash
curl -X POST http://localhost:3000/send-test-flow \
  -d '{"phoneNumber": "919876543210"}' \
  -H "Content-Type: application/json"
```

### 2. Simulate User Responses
```bash
# Check-in date
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "25-12-2025"}' \
  -H "Content-Type: application/json"

# Check-out date
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "26-12-2025"}' \
  -H "Content-Type: application/json"

# Guest count
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "2"}' \
  -H "Content-Type: application/json"

# Room type
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "1"}' \
  -H "Content-Type: application/json"

# Location
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "Bandra"}' \
  -H "Content-Type: application/json"

# Payment method
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "2"}' \
  -H "Content-Type: application/json"
```

### 3. Monitor User Progress
```bash
curl http://localhost:3000/users/919876543210
```

---

## Webhook URL Configuration

When deploying, configure webhook in Meta Dashboard:

1. **Callback URL**: `https://yourdomain.com/webhook`
2. **Verify Token**: Set matching token in environment variables
3. **Subscribed Fields**: `messages`, `message_status`

The webhook must be publicly accessible and return a 200 OK response within 10 seconds of receiving a message.

---

## For More Information

- See [README.md](README.md) for project overview
- See [QUICKSTART.md](QUICKSTART.md) for setup instructions
- Check [.env.example](.env.example) for configuration template
