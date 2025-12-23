# WhatsApp Hotel Booking Bot - Deployment Guide

## Deployment Options

This bot can be deployed to various platforms. Here are the most suitable options:

---

## Option 1: Heroku (Easiest for Beginners)

### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed
- Git installed

### Steps

1. **Create Heroku App**
```bash
heroku login
heroku create whatsapp-hotel-bot
```

2. **Add Environment Variables**
```bash
heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_id
heroku config:set WHATSAPP_API_TOKEN=your_token
heroku config:set WEBHOOK_VERIFY_TOKEN=your_token
heroku config:set NODE_ENV=production
```

3. **Create Procfile** (already provided if using standard setup)
```
web: npm start
```

4. **Deploy**
```bash
git push heroku main
```

5. **Configure Webhook in Meta Dashboard**
- Webhook URL: `https://whatsapp-hotel-bot.herokuapp.com/webhook`
- Verify Token: (same as `WEBHOOK_VERIFY_TOKEN`)

6. **View Logs**
```bash
heroku logs --tail
```

### Pros
- Easy to setup
- Free tier available
- Good for MVP/testing
- Automatic SSL

### Cons
- App sleeps after 30 mins inactivity (free tier)
- Limited resources (free tier)
- Costs money at scale

---

## Option 2: DigitalOcean (Recommended for Production)

### Prerequisites
- DigitalOcean account
- SSH key generated

### Steps

1. **Create Droplet**
   - OS: Ubuntu 22.04
   - Plan: $6/month (Basic)
   - Region: Choose closest to your market

2. **Connect via SSH**
```bash
ssh root@your_droplet_ip
```

3. **Setup Server**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install nginx for reverse proxy
apt install -y nginx

# Install certbot for SSL
apt install -y certbot python3-certbot-nginx
```

4. **Clone Repository**
```bash
cd /var/www
git clone <your-repo-url> whatsapp-hotel-bot
cd whatsapp-hotel-bot
npm install
```

5. **Configure Environment**
```bash
nano .env
# Fill in your WhatsApp credentials
```

6. **Start with PM2**
```bash
pm2 start server.js --name "whatsapp-bot"
pm2 startup
pm2 save
```

7. **Configure Nginx**
```bash
nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Setup SSL**
```bash
certbot --nginx -d yourdomain.com
```

9. **Restart Nginx**
```bash
systemctl restart nginx
```

### Monitoring
```bash
# View logs
pm2 logs

# Monitor process
pm2 monit

# Restart bot
pm2 restart whatsapp-bot
```

### Pros
- Full control
- Good value
- Scalable
- Good performance

### Cons
- More manual setup
- Need to manage server
- Need to manage SSL/updates

---

## Option 3: AWS (For Large Scale)

### Using EC2 + RDS + CloudWatch

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04
   - Instance type: t3.micro (free tier) or t3.small
   - Security group: Allow 80, 443, 22

2. **Follow DigitalOcean setup steps** (similar process)

3. **Setup RDS** (if using database)
   - Engine: MongoDB or PostgreSQL
   - Configure security groups

4. **Setup CloudWatch**
   - Monitor CPU, memory, network
   - Set alarms for issues

5. **Use Elastic IP**
   - Static public IP for your instance

### Pros
- Highly scalable
- Enterprise-grade
- Good monitoring
- Many integrations

### Cons
- Complex setup
- Can be expensive
- Steep learning curve

---

## Option 4: Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  whatsapp-bot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
      - WHATSAPP_API_TOKEN=${WHATSAPP_API_TOKEN}
      - WEBHOOK_VERIFY_TOKEN=${WEBHOOK_VERIFY_TOKEN}
      - NODE_ENV=production
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

### Deploy with Docker
```bash
# Build image
docker build -t whatsapp-hotel-bot .

# Run container
docker run -d -p 3000:3000 \
  -e WHATSAPP_PHONE_NUMBER_ID=your_id \
  -e WHATSAPP_API_TOKEN=your_token \
  -e WEBHOOK_VERIFY_TOKEN=your_token \
  --name whatsapp-bot \
  whatsapp-hotel-bot
```

---

## Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `WEBHOOK_VERIFY_TOKEN`
- [ ] Never commit `.env` file
- [ ] Use HTTPS for webhook URL
- [ ] Test complete flow before deployment
- [ ] Setup error monitoring (Sentry, DataDog)
- [ ] Setup logging and rotation
- [ ] Configure backup strategy
- [ ] Setup monitoring and alerting
- [ ] Have rollback plan ready
- [ ] Document deployment process
- [ ] Setup automated deployments (CI/CD)

---

## Performance Optimization

### 1. Environment Variables
```env
NODE_ENV=production
```

### 2. Process Manager
Use PM2 for automatic restarts:
```bash
pm2 start server.js --name "whatsapp-bot" -i 2 --max-memory-restart 500M
```

### 3. Logging
Implement proper logging:
```javascript
// Add Winston logger
npm install winston
```

### 4. Reverse Proxy
Use Nginx to handle load and SSL

### 5. Database
Migrate from in-memory to persistent storage:
```bash
npm install mongodb
# or
npm install pg
```

### 6. Caching
Add Redis for session caching:
```bash
npm install redis
```

---

## Monitoring & Alerting

### Key Metrics to Monitor
- Server uptime
- Response time
- Error rate
- Active users
- Message delivery rate
- API quota usage

### Tools
- **PM2 Plus**: Process monitoring
- **New Relic**: APM monitoring
- **DataDog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay

### Setup PM2 Plus Monitoring
```bash
pm2 plus
```

---

## Database Migration (From In-Memory)

### Step 1: Install MongoDB Driver
```bash
npm install mongodb
```

### Step 2: Create Database Connection
```javascript
// db.js
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
export const db = client.db('whatsapp-bot');
```

### Step 3: Update User Storage
Modify `userStorage.js` to use MongoDB:
```javascript
// Replace Map-based storage with MongoDB operations
export async function getUser(phoneNumber) {
  const users = db.collection('users');
  return await users.findOne({ phoneNumber });
}
```

---

## Zero-Downtime Deployment

### Using PM2
```bash
pm2 restart whatsapp-bot --wait-ready --listen-timeout 10000
```

### Using Docker Swarm
```bash
docker service update --image whatsapp-hotel-bot:v2 my-service
```

---

## Rollback Plan

### If something goes wrong:

1. **Immediate Rollback**
```bash
git revert HEAD
git push heroku main
# or
pm2 restart whatsapp-bot
```

2. **Database Rollback**
```bash
# Backup before updates
mongodump --db whatsapp-bot --out backup/

# Restore if needed
mongorestore --db whatsapp-bot backup/whatsapp-bot/
```

3. **Configuration Rollback**
- Keep `.env` backup
- Version control configuration
- Use environment-specific configs

---

## Scaling Strategy

### Phase 1: MVP (Current Setup)
- Single server
- In-memory storage
- Basic logging

### Phase 2: Growth
- Database (MongoDB/PostgreSQL)
- Redis caching
- Better monitoring
- Load testing

### Phase 3: Production Scale
- Multiple app servers
- Load balancer
- Database replication
- CDN for static assets
- Message queue (Redis/RabbitMQ)

### Phase 4: Enterprise
- Auto-scaling groups
- Kubernetes orchestration
- Distributed tracing
- Multi-region deployment

---

## Security Hardening

### 1. Environment Variables
```bash
# Never hardcode secrets
# Use strong, random tokens
openssl rand -base64 32
```

### 2. HTTPS/SSL
- Always use HTTPS for webhook
- Use strong ciphers
- Keep certificates updated

### 3. Input Validation
- Sanitize all inputs
- Validate phone numbers
- Check date formats

### 4. Rate Limiting
```javascript
// Add rate limiting middleware
npm install express-rate-limit
```

### 5. Request Signing
Verify webhook signatures:
```javascript
function verifyWebhookSignature(req, appSecret) {
  const signature = req.get('x-hub-signature-256');
  const body = req.rawBody;
  // Verify signature...
}
```

### 6. API Key Management
- Rotate tokens regularly
- Use environment-specific tokens
- Audit token usage

---

## Disaster Recovery

### Backup Strategy
```bash
# Backup database daily
0 2 * * * mongodump --db whatsapp-bot --out /backups/$(date +\%Y\%m\%d)/

# Backup configuration
0 3 * * * tar -czf /backups/config-$(date +\%Y\%m\%d).tar.gz /app/.env
```

### Recovery Plan
1. Identify issue
2. Restore from backup
3. Verify data integrity
4. Test thoroughly
5. Deploy fix
6. Monitor closely

---

## Post-Deployment

### 1. Smoke Tests
```bash
curl https://yourdomain.com/status
# Should return operational status
```

### 2. Monitor Logs
```bash
pm2 logs
# or
tail -f /var/log/nginx/error.log
```

### 3. User Communication
- Notify hotel team
- Test with real users
- Monitor error rate

### 4. Gradual Rollout
- Start with 10% traffic
- Monitor metrics
- Gradually increase to 100%

---

## Continuous Deployment (CI/CD)

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
      - name: Deploy
        run: |
          git push heroku main
```

---

## Cost Optimization

### Estimates (Monthly)

| Platform | Tier | Cost | Suitable For |
|----------|------|------|--------------|
| Heroku | Free | $0 | Development |
| Heroku | Eco | $7 | MVP/Staging |
| DigitalOcean | Basic | $6 | Production (small) |
| DigitalOcean | Plus | $18 | Production (medium) |
| AWS | t3.micro | Free | Free tier |
| AWS | t3.small | $23 | Production |

### Ways to Save
- Use free tier for development
- Right-size instances
- Use spot instances
- Combine services efficiently
- Monitor usage regularly

---

## Support Resources

- [Node.js Deployment Guide](https://nodejs.org/en/docs/guides/nodejs-web-application-security/)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [AWS Getting Started](https://aws.amazon.com/getting-started/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

For local development, see [QUICKSTART.md](QUICKSTART.md)
For testing guide, see [TESTING.md](TESTING.md)
