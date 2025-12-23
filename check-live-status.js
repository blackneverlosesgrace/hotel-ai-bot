#!/usr/bin/env node

/**
 * WhatsApp Bot Live Status Checker
 * 
 * This script checks if the WhatsApp hotel booking bot is live and operational.
 * It performs multiple checks:
 * 1. Environment configuration
 * 2. Local server status
 * 3. WhatsApp API connectivity
 * 4. Webhook accessibility
 * 5. Database/storage status
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Check result interface
 */
class CheckResult {
  constructor(name, status, message, details = {}) {
    this.name = name;
    this.status = status; // 'pass', 'fail', 'warning', 'skip'
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Main status checker class
 */
class StatusChecker {
  constructor() {
    this.results = [];
    this.overallStatus = 'unknown';
  }

  /**
   * Add a check result
   */
  addResult(result) {
    this.results.push(result);
    this.printResult(result);
  }

  /**
   * Print colored result
   */
  printResult(result) {
    let color, symbol;
    
    switch (result.status) {
      case 'pass':
        color = colors.green;
        symbol = '✓';
        break;
      case 'fail':
        color = colors.red;
        symbol = '✗';
        break;
      case 'warning':
        color = colors.yellow;
        symbol = '⚠';
        break;
      case 'skip':
        color = colors.blue;
        symbol = '○';
        break;
      default:
        color = colors.reset;
        symbol = '?';
    }

    console.log(`${color}${symbol} ${result.name}${colors.reset}`);
    console.log(`  ${result.message}`);
    
    if (Object.keys(result.details).length > 0) {
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    }
    console.log('');
  }

  /**
   * Check 1: Environment Configuration
   */
  async checkEnvironment() {
    console.log(`${colors.bold}━━━ Checking Environment Configuration ━━━${colors.reset}\n`);

    const envPath = path.resolve(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
      this.addResult(new CheckResult(
        'Environment File',
        'fail',
        '.env file not found',
        { 
          path: envPath,
          action: 'Create .env file from .env.example'
        }
      ));
      return false;
    }

    this.addResult(new CheckResult(
      'Environment File',
      'pass',
      '.env file exists',
      { path: envPath }
    ));

    // Check required variables
    const requiredVars = [
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_API_TOKEN',
      'WEBHOOK_VERIFY_TOKEN',
      'PORT'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      this.addResult(new CheckResult(
        'Environment Variables',
        'fail',
        `Missing required environment variables`,
        { 
          missing: missingVars.join(', '),
          action: 'Add these variables to your .env file'
        }
      ));
      return false;
    }

    this.addResult(new CheckResult(
      'Environment Variables',
      'pass',
      'All required variables are set',
      { 
        configured: requiredVars.length,
        port: process.env.PORT || '3000'
      }
    ));

    return true;
  }

  /**
   * Check 2: Local Server Status
   */
  async checkLocalServer() {
    console.log(`${colors.bold}━━━ Checking Local Server Status ━━━${colors.reset}\n`);

    const port = process.env.PORT || 3000;
    const baseUrl = `http://localhost:${port}`;

    try {
      const response = await axios.get(`${baseUrl}/status`, { timeout: 5000 });
      
      this.addResult(new CheckResult(
        'Local Server',
        'pass',
        `Server is running on port ${port}`,
        {
          status: response.data.status,
          users: response.data.users?.total || 0,
          timestamp: response.data.timestamp
        }
      ));
      return true;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        this.addResult(new CheckResult(
          'Local Server',
          'fail',
          `Server is NOT running on port ${port}`,
          {
            url: baseUrl,
            action: 'Start the server with: npm start or npm run dev'
          }
        ));
      } else {
        this.addResult(new CheckResult(
          'Local Server',
          'fail',
          `Server check failed: ${error.message}`,
          { error: error.code }
        ));
      }
      return false;
    }
  }

  /**
   * Check 3: WhatsApp API Connectivity
   */
  async checkWhatsAppAPI() {
    console.log(`${colors.bold}━━━ Checking WhatsApp API Connectivity ━━━${colors.reset}\n`);

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_API_TOKEN;

    if (!phoneNumberId || !accessToken) {
      this.addResult(new CheckResult(
        'WhatsApp API',
        'skip',
        'WhatsApp credentials not configured',
        { action: 'Add credentials to .env file' }
      ));
      return false;
    }

    // Check if credentials look valid (basic format check)
    if (phoneNumberId.includes('your_') || accessToken.includes('your_')) {
      this.addResult(new CheckResult(
        'WhatsApp API',
        'fail',
        'WhatsApp credentials are placeholder values',
        { 
          action: 'Replace placeholder values with real credentials from Meta Dashboard'
        }
      ));
      return false;
    }

    try {
      // Try to get phone number info from WhatsApp API
      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        timeout: 10000
      });

      this.addResult(new CheckResult(
        'WhatsApp API',
        'pass',
        'WhatsApp API is accessible',
        {
          phoneNumberId: phoneNumberId.substring(0, 10) + '...',
          verifiedName: response.data.verified_name || 'N/A',
          displayPhone: response.data.display_phone_number || 'N/A'
        }
      ));
      return true;
    } catch (error) {
      if (error.response) {
        this.addResult(new CheckResult(
          'WhatsApp API',
          'fail',
          `WhatsApp API error: ${error.response.data?.error?.message || 'Authentication failed'}`,
          {
            statusCode: error.response.status,
            action: 'Check your WhatsApp credentials in .env file'
          }
        ));
      } else {
        this.addResult(new CheckResult(
          'WhatsApp API',
          'fail',
          `Cannot reach WhatsApp API: ${error.message}`,
          { action: 'Check your internet connection' }
        ));
      }
      return false;
    }
  }

  /**
   * Check 4: Public Webhook URL (for production)
   */
  async checkWebhookUrl() {
    console.log(`${colors.bold}━━━ Checking Webhook URL ━━━${colors.reset}\n`);

    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      this.addResult(new CheckResult(
        'Webhook URL',
        'warning',
        'No public webhook URL configured',
        { 
          current: 'Running in local development mode',
          action: 'For production, set WEBHOOK_URL in .env and configure in Meta Dashboard'
        }
      ));
      return false;
    }

    try {
      const response = await axios.get(`${webhookUrl}/status`, { timeout: 10000 });
      
      this.addResult(new CheckResult(
        'Webhook URL',
        'pass',
        'Public webhook URL is accessible',
        {
          url: webhookUrl,
          status: response.data.status
        }
      ));
      return true;
    } catch (error) {
      this.addResult(new CheckResult(
        'Webhook URL',
        'fail',
        `Webhook URL not accessible: ${error.message}`,
        {
          url: webhookUrl,
          action: 'Ensure server is deployed and accessible from internet'
        }
      ));
      return false;
    }
  }

  /**
   * Check 5: Dependencies
   */
  async checkDependencies() {
    console.log(`${colors.bold}━━━ Checking Dependencies ━━━${colors.reset}\n`);

    const packageJsonPath = path.resolve(__dirname, 'package.json');
    const nodeModulesPath = path.resolve(__dirname, 'node_modules');

    if (!fs.existsSync(packageJsonPath)) {
      this.addResult(new CheckResult(
        'Dependencies',
        'fail',
        'package.json not found',
        { action: 'Ensure you are in the project root directory' }
      ));
      return false;
    }

    if (!fs.existsSync(nodeModulesPath)) {
      this.addResult(new CheckResult(
        'Dependencies',
        'fail',
        'node_modules not found',
        { action: 'Run: npm install' }
      ));
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});

    this.addResult(new CheckResult(
      'Dependencies',
      'pass',
      'All dependencies are installed',
      {
        dependencies: dependencies.join(', '),
        count: dependencies.length
      }
    ));
    return true;
  }

  /**
   * Calculate overall status
   */
  calculateOverallStatus() {
    const failCount = this.results.filter(r => r.status === 'fail').length;
    const passCount = this.results.filter(r => r.status === 'pass').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;

    if (failCount > 0) {
      return 'OFFLINE';
    } else if (warningCount > 0 || passCount < 3) {
      return 'PARTIALLY CONFIGURED';
    } else {
      return 'LIVE';
    }
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    
    const status = this.calculateOverallStatus();
    const passCount = this.results.filter(r => r.status === 'pass').length;
    const failCount = this.results.filter(r => r.status === 'fail').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const skipCount = this.results.filter(r => r.status === 'skip').length;

    let statusColor;
    let statusSymbol;
    
    switch (status) {
      case 'LIVE':
        statusColor = colors.green;
        statusSymbol = '✓';
        break;
      case 'PARTIALLY CONFIGURED':
        statusColor = colors.yellow;
        statusSymbol = '⚠';
        break;
      case 'OFFLINE':
        statusColor = colors.red;
        statusSymbol = '✗';
        break;
      default:
        statusColor = colors.reset;
        statusSymbol = '?';
    }

    console.log(`${colors.bold}Overall Status: ${statusColor}${statusSymbol} ${status}${colors.reset}\n`);
    
    console.log(`Results Summary:`);
    console.log(`  ${colors.green}✓ Passed: ${passCount}${colors.reset}`);
    console.log(`  ${colors.red}✗ Failed: ${failCount}${colors.reset}`);
    console.log(`  ${colors.yellow}⚠ Warnings: ${warningCount}${colors.reset}`);
    console.log(`  ${colors.blue}○ Skipped: ${skipCount}${colors.reset}`);
    console.log('');

    // Print recommendations
    if (status === 'OFFLINE') {
      console.log(`${colors.bold}${colors.red}Bot is NOT live!${colors.reset}`);
      console.log('');
      console.log('Next steps:');
      const failedChecks = this.results.filter(r => r.status === 'fail');
      failedChecks.forEach((check, i) => {
        console.log(`  ${i + 1}. ${check.name}: ${check.details.action || check.message}`);
      });
    } else if (status === 'PARTIALLY CONFIGURED') {
      console.log(`${colors.bold}${colors.yellow}Bot is partially configured${colors.reset}`);
      console.log('Some features may not work correctly.');
    } else {
      console.log(`${colors.bold}${colors.green}🎉 Bot is LIVE and operational!${colors.reset}`);
    }

    console.log('');
    console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  }

  /**
   * Run all checks
   */
  async runAllChecks() {
    console.log(`\n${colors.bold}${colors.blue}🤖 WhatsApp Hotel Booking Bot - Status Check${colors.reset}\n`);
    console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    console.log(`Started at: ${new Date().toLocaleString()}\n`);

    await this.checkDependencies();
    await this.checkEnvironment();
    await this.checkLocalServer();
    await this.checkWhatsAppAPI();
    await this.checkWebhookUrl();

    this.printSummary();

    // Return exit code based on status
    const status = this.calculateOverallStatus();
    return status === 'LIVE' ? 0 : 1;
  }
}

/**
 * Main execution
 */
async function main() {
  const checker = new StatusChecker();
  const exitCode = await checker.runAllChecks();
  process.exit(exitCode);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
  });
}

export default StatusChecker;
