# Deployment Guide - Quiz Master General Website

How to get your new WordPress site live on thequizmastergeneral.com

## Option 1: Use Your Current Hosting (Recommended)

If you already have hosting for thequizmastergeneral.com, follow these steps:

### Step 1: Install WordPress

**Via cPanel (Most Common):**
1. Log in to your hosting cPanel
2. Find "WordPress" or "Softaculous Apps Installer"
3. Click "Install Now"
4. Choose:
   - Protocol: https:// (if you have SSL)
   - Domain: thequizmastergeneral.com
   - Directory: leave blank (installs to root)
5. Admin Account:
   - Username: (choose your admin username)
   - Password: (create strong password)
   - Email: your email address
6. Click "Install"
7. Save your login details!

**Manual Installation:**
1. Download WordPress from [wordpress.org](https://wordpress.org)
2. Create MySQL database in cPanel
3. Upload WordPress files via FTP
4. Run installation at yoursite.com/wp-admin/install.php

### Step 2: Upload Theme Files

**Via FTP (FileZilla, etc.):**
1. Connect to your hosting via FTP
2. Navigate to: `/public_html/wp-content/themes/`
3. Upload the entire `quizmaster-general` folder
4. Wait for all files to upload

**Via cPanel File Manager:**
1. Log in to cPanel
2. Open "File Manager"
3. Navigate to: `public_html/wp-content/themes/`
4. Click "Upload"
5. Upload `quizmaster-general.zip` (you'll need to zip the folder first)
6. Extract the zip file

### Step 3: Activate and Configure

1. Go to: `thequizmastergeneral.com/wp-admin`
2. Log in with your admin credentials
3. Go to: Appearance → Themes
4. Activate "Quiz Master General"
5. Follow the QUICK-START.md guide to set up pages and menus

---

## Option 2: Fresh Hosting Setup

If you don't have hosting yet:

### Recommended Hosts for WordPress

**Budget-Friendly:**
- **Bluehost** (~£3-5/month) - Official WordPress recommended
- **SiteGround** (~£4-7/month) - Great support
- **HostGator** (~£3-6/month) - Easy setup

**Premium:**
- **WP Engine** (~£25/month) - Managed WordPress
- **Kinsta** (~£25/month) - Premium managed

### Setup Process

1. **Purchase hosting** from one of the providers above
2. **Register domain** (if not already owned): thequizmastergeneral.com
3. **Point domain** to hosting nameservers (host will provide these)
4. **Wait for DNS propagation** (can take 24-48 hours)
5. **Install WordPress** (most hosts have 1-click install)
6. **Upload theme** as described in Option 1
7. **Configure** following QUICK-START.md

---

## Option 3: Quick Deploy with WordPress.com

**Pros:** Super easy, no technical knowledge needed
**Cons:** Less control, costs more for full features

1. Go to [wordpress.com](https://wordpress.com)
2. Sign up for Business Plan (needed for custom themes)
3. Connect your domain: thequizmastergeneral.com
4. Upload theme via: Appearance → Themes → Upload Theme
5. Activate and configure

---

## SSL Certificate (HTTPS)

**Important:** Always use HTTPS for security and SEO!

### Free SSL with Let's Encrypt

Most hosts offer free SSL:
1. Log in to cPanel
2. Find "SSL/TLS" or "Let's Encrypt"
3. Click "Install SSL"
4. Select your domain
5. Install

### After Installing SSL

Update WordPress to use HTTPS:
1. Go to: Settings → General
2. Update both URLs to: `https://thequizmastergeneral.com`
3. Save Changes

---

## Pre-Launch Checklist

Before making your site public:

### Content
- [ ] All pages created (Home, About, Services, Contact)
- [ ] Real testimonials added
- [ ] Contact information updated
- [ ] About page personalized
- [ ] Services accurately described

### Technical
- [ ] WordPress updated to latest version
- [ ] Theme installed and activated
- [ ] Permalinks set to "Post name"
- [ ] SSL certificate installed
- [ ] Homepage set to static page
- [ ] Navigation menu created

### SEO & Analytics
- [ ] Yoast SEO plugin installed
- [ ] Google Analytics added
- [ ] Site submitted to Google Search Console
- [ ] XML sitemap generated
- [ ] Meta descriptions added

### Security
- [ ] Strong admin password
- [ ] Wordfence or similar security plugin installed
- [ ] Backup solution in place (UpdraftPlus)
- [ ] Removed default "admin" username
- [ ] Limited login attempts enabled

### Testing
- [ ] Tested on desktop Chrome
- [ ] Tested on desktop Firefox
- [ ] Tested on mobile phone
- [ ] Tested on tablet
- [ ] All links work
- [ ] Contact form works (if added)
- [ ] Images load properly
- [ ] No broken links

---

## Post-Launch Tasks

### Immediate (Day 1)
1. Submit sitemap to Google Search Console
2. Set up Google My Business listing
3. Create social media profiles
4. Share on your social channels
5. Email announcement to existing clients

### First Week
1. Monitor Google Analytics
2. Check for any errors or issues
3. Create first blog post
4. Set up email newsletter (if desired)
5. Start building backlinks

### Ongoing
1. Post regular updates/blog posts
2. Respond to contact form submissions
3. Update testimonials
4. Monitor site speed
5. Keep WordPress/plugins updated
6. Regular backups

---

## Email Setup

Set up professional email: info@thequizmastergeneral.com

### Via cPanel
1. Log in to cPanel
2. Find "Email Accounts"
3. Create new email account
4. Access via webmail or configure in Outlook/Gmail

### Via Google Workspace (Professional)
1. Sign up at [workspace.google.com](https://workspace.google.com)
2. Verify domain ownership
3. Update MX records
4. Create email accounts
5. Access via Gmail interface

---

## Troubleshooting Common Issues

### Site Not Loading After DNS Change
- **Solution:** Wait 24-48 hours for DNS propagation
- **Check:** Use [whatsmydns.net](https://www.whatsmydns.net)

### "Error Establishing Database Connection"
- **Solution:** Check wp-config.php database credentials
- **Contact:** Your hosting support

### White Screen / 500 Error
- **Solution:** Deactivate plugins via FTP (rename plugins folder)
- **Switch:** To default WordPress theme temporarily

### Images Not Uploading
- **Solution:** Check file permissions (should be 755 for folders, 644 for files)
- **Increase:** PHP upload limits in hosting

### Can't Log In to wp-admin
- **Solution:** Reset password via "Lost Password" link
- **Or:** Use phpMyAdmin to reset password directly

---

## Need Professional Help?

If you need help with deployment:

1. **Fiverr** - Hire WordPress expert (£20-50)
2. **Upwork** - Professional deployment service
3. **Your Hosting Support** - Many hosts offer free setup help
4. **Local Web Developer** - Support local businesses!

---

## Maintenance Plan

### Daily
- Monitor contact form submissions

### Weekly
- Check for WordPress updates
- Review Google Analytics
- Respond to comments/messages

### Monthly
- Update plugins and theme
- Create backup
- Review security logs
- Add new content

### Quarterly
- Review SEO performance
- Update testimonials
- Refresh content
- Check all forms work
- Test site speed

---

## Success Metrics to Track

Use Google Analytics to monitor:
- Visitor numbers
- Most popular pages
- Where visitors come from
- Mobile vs desktop traffic
- Bounce rate
- Time on site

Set goals:
- Contact form submissions
- Phone calls (use tracking number)
- Booking requests
- Social media follows

---

## Next Steps After Launch

1. **Content Marketing**
   - Write regular blog posts
   - Share quiz questions on social media
   - Create video content

2. **Local SEO**
   - Google My Business optimization
   - Local directory listings
   - Get reviews from venues

3. **Networking**
   - Join local business groups
   - Attend venue networking events
   - Partner with local businesses

4. **Advertising**
   - Facebook/Instagram ads (local targeting)
   - Google Ads (local search)
   - Local newspaper/magazine ads

---

## Support Resources

- **WordPress Documentation:** [wordpress.org/support](https://wordpress.org/support)
- **WordPress Forums:** Community help
- **YouTube:** Thousands of WordPress tutorials
- **Your Hosting Support:** Technical assistance

Good luck with your launch! 🚀🎯
