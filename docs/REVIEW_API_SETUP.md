# Review Platform API Setup Guide

This guide will help you connect your review platforms to automatically sync reviews into Avizo.

## 📋 Overview

Avizo supports integration with major review platforms:
- ✅ Google Reviews (via Google My Business API)
- ✅ Facebook Reviews (via Facebook Graph API)
- ✅ Trustpilot (via Trustpilot API)
- 🔄 Yelp (coming soon - read-only API)
- 🔄 TripAdvisor (coming soon)

## 🔑 Setting Up Google Reviews

### Prerequisites
1. A Google My Business account
2. Your business must be verified on Google

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it "Avizo Reviews Integration"
4. Click "Create"

### Step 2: Enable Google My Business API
1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google My Business API"
3. Click on it and press "Enable"
4. Also enable "Places API" for location data

### Step 3: Create API Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you'll need this in Avizo)
4. Click "Restrict Key" for security:
   - Select "API restrictions"
   - Choose "Google My Business API" and "Places API"
   - Save

### Step 4: Get Your Place ID
1. Go to [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Search for your business
3. Copy the "Place ID" (starts with "ChIJ...")

### Step 5: Add to Avizo
1. In Avizo, go to Reviews > Manage Platforms
2. Click "Google Reviews"
3. Enter:
   - **API Key**: Paste your Google Cloud API key
   - **Place ID**: Paste your Place ID
   - **Platform URL**: Your Google Maps listing URL (optional)
4. Click "Add Platform"
5. Click "Sync Reviews" to test

### Rate Limits
- Free tier: 500 requests/day
- Paid tier: Higher limits available

---

## 📘 Setting Up Facebook Reviews

### Prerequisites
1. A Facebook Business Page
2. Admin access to the page

### Step 1: Create a Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" > "Create App"
3. Choose "Business" type
4. Name it "Avizo Reviews"
5. Click "Create App"

### Step 2: Add Facebook Login Product
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" as platform
4. Enter your Avizo URL

### Step 3: Get Page Access Token
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click "Get Token" > "Get Page Access Token"
4. Select your business page
5. Grant permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`
6. Copy the access token

### Step 4: Make Token Long-Lived
1. Go to Access Token Debugger
2. Paste your token
3. Click "Extend Access Token"
4. Copy the new long-lived token (valid for 60 days)

### Step 5: Add to Avizo
1. In Avizo, go to Reviews > Manage Platforms
2. Click "Facebook"
3. Enter:
   - **API Key**: Paste your long-lived access token
   - **Place ID**: Your Facebook Page ID
   - **Platform URL**: Your Facebook page URL
4. Click "Add Platform"
5. Click "Sync Reviews" to test

### Rate Limits
- 200 calls per hour per user
- 4800 calls per day

---

## 🛡️ Setting Up Trustpilot

### Prerequisites
1. A Trustpilot business account
2. Business profile must be claimed

### Step 1: Get API Access
1. Log in to [Trustpilot Business](https://businessapp.b2b.trustpilot.com/)
2. Go to Settings > Integrations
3. Click "API Access"
4. Request API key (may require contacting support)

### Step 2: Generate API Key
1. Once approved, go to API section
2. Click "Generate New Key"
3. Copy the API key and secret
4. Save them securely

### Step 3: Get Your Business Unit ID
1. In Trustpilot Business, go to your profile
2. The Business Unit ID is in the URL: `businessapp.b2b.trustpilot.com/[YOUR-BUSINESS-UNIT-ID]`
3. Or find it in Settings > Business Details

### Step 4: Add to Avizo
1. In Avizo, go to Reviews > Manage Platforms
2. Click "Trustpilot"
3. Enter:
   - **API Key**: Paste your Trustpilot API key
   - **Place ID**: Your Business Unit ID
   - **Platform URL**: Your public Trustpilot profile URL
4. Click "Add Platform"
5. Click "Sync Reviews" to test

### Rate Limits
- Basic: 1000 requests/day
- Premium: Higher limits based on plan

---

## 🌟 Setting Up Yelp (Read-Only)

### Note
Yelp's Fusion API only allows reading basic business info and reviews. You cannot reply via API.

### Step 1: Create Yelp Fusion API Key
1. Go to [Yelp Developers](https://www.yelp.com/developers)
2. Click "Create App"
3. Fill in app details
4. Accept terms
5. Click "Create App"
6. Copy your API Key

### Step 2: Get Your Business ID
1. Find your business on Yelp
2. The Business ID is in the URL: `yelp.com/biz/[BUSINESS-ID]`
3. Or use the Business Search API endpoint

### Step 3: Add to Avizo
1. In Avizo, go to Reviews > Manage Platforms
2. Click "Yelp"
3. Enter:
   - **API Key**: Paste your Yelp Fusion API key
   - **Place ID**: Your Business ID
   - **Platform URL**: Your Yelp business page URL
4. Click "Add Platform"
5. Click "Sync Reviews" to test

### Rate Limits
- 5000 requests/day

---

## 🔄 Auto-Sync Configuration

### Enable Automatic Syncing
Once your platforms are configured:

1. Go to Reviews > Manage Platforms
2. Click on a platform
3. Enable "Auto-sync"
4. Choose sync frequency:
   - Every hour (recommended for high volume)
   - Every 6 hours
   - Once daily
   - Manual only

### How It Works
- Avizo checks for new reviews at scheduled intervals
- Only new reviews since last sync are imported
- Reviews are matched to clients by email/phone if available
- Negative reviews are automatically flagged
- You receive notifications for new reviews

---

## 🔒 Security Best Practices

### Storing API Keys
- API keys are encrypted in the database
- Never share your API keys
- Rotate keys every 90 days
- Use platform-specific key restrictions

### Access Permissions
- Only grant minimum required permissions
- Use read-only tokens when possible
- Monitor API usage for unusual activity

### Webhook Setup (Advanced)
For real-time updates instead of polling:
1. Set up webhook endpoint: `https://your-avizo-instance.com/api/webhooks/reviews`
2. Configure in each platform's settings
3. Receive instant notifications of new reviews

---

## 📊 Monitoring & Troubleshooting

### Check Sync Status
1. Go to Reviews > Manage Platforms
2. View "Last Synced" timestamp
3. Check for any error messages

### Common Issues

**"Invalid API Key"**
- Verify key is copied correctly (no extra spaces)
- Check key hasn't expired
- Ensure API is enabled in platform settings

**"Rate Limit Exceeded"**
- Reduce sync frequency
- Upgrade to higher tier plan
- Wait for limit reset (usually 24 hours)

**"No Reviews Found"**
- Verify Place ID is correct
- Check business has public reviews
- Ensure API has permission to read reviews

**"Authentication Failed"**
- Regenerate access token
- Check token hasn't expired
- Verify all required scopes granted

### Getting Help
- Check platform API documentation
- Contact platform support for API issues
- Open ticket in Avizo for integration problems

---

## 💡 Tips for Success

1. **Start with Google Reviews** - Easiest to set up and most commonly used
2. **Test with sample data first** - Use "Generate Samples" to understand the UI
3. **Set up notifications** - Get alerts for new negative reviews
4. **Reply promptly** - Respond to reviews within 24 hours
5. **Monitor trends** - Use analytics to track rating changes
6. **Automate workflows** - Set up auto-replies for positive reviews (coming soon)

---

## 🆘 Support Resources

- **Google My Business API**: https://developers.google.com/my-business
- **Facebook Graph API**: https://developers.facebook.com/docs/graph-api
- **Trustpilot API**: https://support.trustpilot.com/hc/en-us/articles/115008538687
- **Yelp Fusion API**: https://www.yelp.com/developers/documentation/v3

---

## 🚀 Coming Soon

- **TripAdvisor Integration** - Q1 2025
- **Amazon Reviews** - Q2 2025
- **Custom Review Platform** - Add any platform with a public feed
- **AI Reply Suggestions** - Get AI-powered reply drafts
- **Sentiment Analysis** - Automatic categorization of review content
- **Multi-language Support** - Translate reviews and replies
