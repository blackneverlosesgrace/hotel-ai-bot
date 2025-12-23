# WhatsApp Hotel Booking Bot - Testing Guide

## Testing Setup

### Prerequisites
- Node.js running with bot server (`npm start` or `npm run dev`)
- Access to WhatsApp Cloud API credentials
- ngrok or tunnel for webhook (if testing locally)
- A test phone number added to WhatsApp Business Account

---

## Unit Testing Scenarios

### Scenario 1: Basic Greeting Flow

**User Action**: Send any initial message
**Expected Flow**:
1. Bot greets user in Hindi/Hinglish
2. Bot asks for check-in date
3. Bot state: `CHECKIN`

**Test Command**:
```bash
curl -X POST http://localhost:3000/send-test-flow \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919876543210"}'
```

**Verification**:
```bash
curl http://localhost:3000/users/919876543210 | jq '.state'
# Output: "CHECKIN"
```

---

### Scenario 2: Date Validation

**User Action**: Send invalid date formats

**Test Cases**:

#### Invalid Date Format
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "25/12/2025"
  }'
```
**Expected**: Bot asks for date in DD-MM-YYYY format, state remains `CHECKIN`

#### Valid Date Format
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "25-12-2025"
  }'
```
**Expected**: Date accepted, state moves to `CHECKOUT`, bot asks check-out date

#### Invalid Date (Future Year)
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "25-12-2030"
  }'
```
**Expected**: May accept (depends on validation logic), typically accepted

---

### Scenario 3: Guest Count Validation

**Setup**: Complete up to `GUEST_COUNT` state

**Test Cases**:

#### Valid Input (Numeric)
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "2"
  }'
```
**Expected**: State moves to `STAY_TYPE`

#### Valid Input (Hindi)
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "दो"
  }'
```
**Expected**: State moves to `STAY_TYPE`

#### Valid Input (English)
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "two"
  }'
```
**Expected**: State moves to `STAY_TYPE`

#### Invalid Input
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "5"
  }'
```
**Expected**: Bot asks again, state remains `GUEST_COUNT`

---

### Scenario 4: Room Type Selection

**Setup**: Complete up to `STAY_TYPE` state

**Test Cases**:

#### Option 1 (Full Day)
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "1"
  }'
```
**Expected**: State moves to `LOCATION`, room type set to "24_hours"

#### Option 2 (Hourly)
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "2"
  }'
```
**Expected**: State moves to `LOCATION`, room type set to "6_hours"

---

### Scenario 5: Location Input

**Setup**: Complete up to `LOCATION` state

**Test Cases**:

#### Valid Location
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "Bandra"
  }'
```
**Expected**: 
- State moves to `PRICE_SHARED`
- Price displayed based on guest count + room type
- Payment options shown

#### Another Location
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "Airport"
  }'
```
**Expected**: Same as above, state to `PRICE_SHARED`

---

### Scenario 6: Payment Method Selection

**Setup**: Complete up to `PRICE_SHARED` state

#### Online Payment
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "1"
  }'
```
**Expected**: 
- State moves to `WAITING_SCREENSHOT`
- Bot sends QR code
- Bot asks for payment screenshot

#### Hotel Payment
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "2"
  }'
```
**Expected**: 
- State moves directly to `HUMAN_HANDOFF`
- Hotel team notification triggered
- Confirmation message sent
- State moves to `CONFIRMED`

---

### Scenario 7: Payment Screenshot Handling

**Setup**: User in `WAITING_SCREENSHOT` state

#### Receiving Text Instead of Image
```bash
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "Payment done"
  }'
```
**Expected**: Bot asks user to send screenshot image, state remains `WAITING_SCREENSHOT`

#### Sending Image (Simulated)
Note: Actual image upload through WhatsApp API is complex. In production testing:
1. User sends actual image through WhatsApp
2. Webhook receives image message
3. Bot marks state to `HUMAN_HANDOFF`
4. Hotel notification triggered
5. Confirmation sent to user

**Webhook Simulation**:
The `messageHandler.handleImageMessage()` should handle this when message type is 'image'

---

### Scenario 8: Image in Wrong State

**Setup**: Send image when not in `WAITING_SCREENSHOT`

**Possible States**:
- `CHECKIN`
- `CHECKOUT`
- `GUEST_COUNT`
- `STAY_TYPE`
- `LOCATION`

**Expected**: Bot ignores image, repeats current question

---

### Scenario 9: Conversation History

**Verify**: User conversation is tracked

```bash
curl http://localhost:3000/users/919876543210 | jq '.lastFiveMessages'
```

**Expected Output**:
```json
[
  {
    "role": "user",
    "content": "25-12-2025",
    "messageType": "text",
    "timestamp": 1703318400000
  },
  {
    "role": "bot",
    "content": "Bot response...",
    "messageType": "text",
    "timestamp": 1703318405000
  }
]
```

---

## Integration Testing Scenarios

### Complete Flow: Online Payment

```bash
# 1. Start fresh user
curl -X POST http://localhost:3000/send-test-flow \
  -d '{"phoneNumber": "919876543210"}' -H "Content-Type: application/json"

# 2. Check-in date
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "25-12-2025"}' \
  -H "Content-Type: application/json"

# 3. Check-out date
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "26-12-2025"}' \
  -H "Content-Type: application/json"

# 4. Guest count
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "2"}' \
  -H "Content-Type: application/json"

# 5. Room type
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "1"}' \
  -H "Content-Type: application/json"

# 6. Location
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "Bandra"}' \
  -H "Content-Type: application/json"

# 7. Payment method - Online
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "1"}' \
  -H "Content-Type: application/json"

# 8. Verify state is WAITING_SCREENSHOT
curl http://localhost:3000/users/919876543210 | jq '.state'
# Expected: "WAITING_SCREENSHOT"
```

**Expected Final State**: `WAITING_SCREENSHOT`
**Expected Price**: ₹999 (Deluxe room, 24-hour, for 2 guests)

---

### Complete Flow: Hotel Payment

Same as above, but at step 7:

```bash
# 7. Payment method - Hotel
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "2"}' \
  -H "Content-Type: application/json"

# 8. Verify state is CONFIRMED
curl http://localhost:3000/users/919876543210 | jq '.state'
# Expected: "CONFIRMED"
```

**Expected Final State**: `CONFIRMED`
**Expected Behavior**: 
- Human handoff notification logged
- Confirmation message sent to user

---

## Performance Testing

### Multiple Concurrent Users

```bash
#!/bin/bash
# Test script for multiple concurrent users

for i in {1..10}; do
  phoneNumber="919876543${i}00"
  echo "Starting flow for user $phoneNumber"
  curl -X POST http://localhost:3000/send-test-flow \
    -d "{\"phoneNumber\": \"$phoneNumber\"}" \
    -H "Content-Type: application/json" &
done

wait
echo "All tests started"

# Check status
curl http://localhost:3000/status | jq '.users.total'
```

---

### Response Time Testing

```bash
# Measure webhook response time
time curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": []
  }'
```

**Expected**: < 100ms

---

## Error Testing

### Invalid Configuration

```bash
# Start server without .env
unset WHATSAPP_PHONE_NUMBER_ID
npm start
```

**Expected**: "Configuration Error" and exit

### Invalid API Token

```bash
# Send message with wrong token in .env
# Manually modify WHATSAPP_API_TOKEN to invalid value
# Send test message
```

**Expected**: 401 error logged, user sees error message in Hindi

### Webhook Verification Failure

```bash
# Wrong verify token
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=abc123"
```

**Expected**: 403 Forbidden

---

## Reminder Testing

### Inactive User Reminder

**Setup**: 
1. User in conversation but inactive for > 1 hour (simulated)
2. Reminder service running

**Verification**:
1. Manually set `lastActivityAt` to past (modify in-memory storage)
2. Wait for reminder check interval or trigger manually
3. Verify reminder message sent

---

## State Machine Testing

### Valid State Transitions

| From | To | Trigger | Status |
|------|----|---------|----|
| START | CHECKIN | Any message | ✓ |
| CHECKIN | CHECKOUT | Valid date | ✓ |
| CHECKOUT | GUEST_COUNT | Valid date | ✓ |
| GUEST_COUNT | STAY_TYPE | 1-4 | ✓ |
| STAY_TYPE | LOCATION | 1 or 2 | ✓ |
| LOCATION | PRICE_SHARED | Any text | ✓ |
| PRICE_SHARED | PAYMENT_CHOICE | User choice | ✓ |
| PAYMENT_CHOICE | WAITING_SCREENSHOT | Option 1 | ✓ |
| PAYMENT_CHOICE | HUMAN_HANDOFF | Option 2 | ✓ |
| WAITING_SCREENSHOT | HUMAN_HANDOFF | Image | ✓ |
| HUMAN_HANDOFF | CONFIRMED | Auto | ✓ |

---

## Database Persistence Testing (Future)

When database is integrated:

```bash
# Restart server while user is in conversation
# Verify user state is restored
curl http://localhost:3000/users/919876543210

# Expected: Same state and booking data as before restart
```

---

## Language Testing

### Hindi/Hinglish Inputs

```bash
# Guest count in Hindi
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543210", "message": "दो"}' \
  -H "Content-Type: application/json"

# Check-in date variations
curl -X POST http://localhost:3000/test-message \
  -d '{"phoneNumber": "919876543211", "message": "२५-१२-२०२५"}' \
  -H "Content-Type: application/json"
```

---

## Monitoring & Analytics

### Check System Health

```bash
# Overall status
curl http://localhost:3000/status | jq '.'

# User distribution by state
curl http://localhost:3000/status | jq '.users.stateDistribution'

# Completed bookings
curl http://localhost:3000/users | jq '.users[] | select(.state=="CONFIRMED") | length'

# Waiting for payment
curl http://localhost:3000/users | \
  jq '.users[] | select(.state=="WAITING_SCREENSHOT") | {phoneNumber, sessionDuration}'

# Abandoned carts
curl http://localhost:3000/users | \
  jq '.users[] | select(.lastActivity > 3600000) | {phoneNumber, state, lastActivity}'
```

---

## Cleanup After Testing

```bash
# Reset all users
for i in {1..10}; do
  curl -X POST http://localhost:3000/reset-user \
    -d "{\"phoneNumber\": \"919876543${i}00\"}" \
    -H "Content-Type: application/json"
done

# Or restart server (clears in-memory storage)
# npm start
```

---

## Expected Message Outputs

### Greeting
```
🙏 नमस्ते! 

होटल बुकिंग के लिए आपका स्वागत है।
आपकी बुकिंग को पूरा करने में हमें खुशी होगी।

कृपया अपनी चेक-इन डेट बताएं (DD-MM-YYYY format में):
```

### Price Display
```
✅ बहुत अच्छा!

आपके लिए उपलब्ध:

🏨 Deluxe Room
💰 Price: ₹999
📅 24 घंटे

कृपया पेमेंट का तरीका चुनें:

1️⃣ Online Payment (QR Code)
2️⃣ Hotel पर Payment करें
```

### Payment Confirmation
```
✅ धन्यवाद!

आपकी Payment Receipt प्राप्त हुई।
हमारा टीम आपसे कुछ ही मिनटों में संपर्क करेगा।

📞 होटल टीम से कॉल के लिए तैयार रहें।
```

---

## Troubleshooting Common Issues

### Bot not responding
- Check server is running: `npm run dev`
- Check .env file is configured
- Check phone number format (91 prefix for India)

### Webhook not receiving
- Verify ngrok URL in Meta Dashboard
- Check webhook verify token matches
- Ensure server is publicly accessible

### Wrong prices showing
- Verify guest count and room type selected
- Check PRICING in states.js
- Check selectRoom() logic in utils.js

### Messages not sending
- Verify WHATSAPP_API_TOKEN is valid
- Check phone number ID is correct
- Ensure test number is added to business account

---

## CI/CD Testing (Future)

```yaml
# .github/workflows/test.yml
name: Test Bot

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run lint
```

---

For detailed API documentation, see [API.md](API.md)
