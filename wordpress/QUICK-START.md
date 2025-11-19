# Quick Start Guide - Quiz Master General Website

Get your website up and running in 30 minutes!

## What You Need

- WordPress hosting account
- FTP/File access to your hosting
- WordPress installed on your domain

## 5 Simple Steps

### Step 1: Upload the Theme (5 minutes)

1. Connect to your hosting via FTP (FileZilla, cPanel File Manager, etc.)
2. Navigate to: `/wp-content/themes/`
3. Upload the entire `quizmaster-general` folder
4. Wait for upload to complete

### Step 2: Activate the Theme (2 minutes)

1. Log in to WordPress Admin: `www.thequizmastergeneral.com/wp-admin`
2. Go to: **Appearance** → **Themes**
3. Find "Quiz Master General"
4. Click **Activate**

### Step 3: Create Your Pages (10 minutes)

Create 4 pages by going to **Pages** → **Add New**:

#### 1. Home
- Title: `Home`
- Content: Leave empty (template will handle it)
- Click **Publish**

#### 2. About
- Title: `About`
- Copy/paste content from: `sample-content/about.txt`
- Edit to add your personal info
- Click **Publish**

#### 3. Services
- Title: `Services`
- Copy/paste content from: `sample-content/services.txt`
- Click **Publish**

#### 4. Contact
- Title: `Contact`
- Copy/paste content from: `sample-content/contact.txt`
- Update with your email/phone
- Click **Publish**

### Step 4: Set Homepage & Menu (8 minutes)

#### Set Static Homepage
1. Go to: **Settings** → **Reading**
2. Select: ☑ A static page
3. Homepage: Select "Home"
4. Click **Save Changes**

#### Create Navigation Menu
1. Go to: **Appearance** → **Menus**
2. Menu Name: `Primary Menu`
3. Click **Create Menu**
4. Add pages in this order:
   - ☑ Home
   - ☑ About
   - ☑ Services
   - ☑ Contact
5. Click **Add to Menu**
6. Check box: ☑ Primary Menu (under "Display location")
7. Click **Save Menu**

### Step 5: Update Site Info (5 minutes)

1. Go to: **Settings** → **General**
2. Site Title: `The Quiz Master General`
3. Tagline: `North East England's Premier Quiz Provider`
4. Click **Save Changes**

5. Go to: **Settings** → **Permalinks**
6. Select: ☑ Post name
7. Click **Save Changes**

## That's It! 🎉

Visit your website: `www.thequizmastergeneral.com`

## What to Do Next

### Immediate Tasks
- [ ] Replace testimonials with real ones
- [ ] Add your actual contact details
- [ ] Personalize the About page
- [ ] Add photos (if you have them)

### Within First Week
- [ ] Install Yoast SEO plugin
- [ ] Install Contact Form 7 plugin
- [ ] Set up Google Analytics
- [ ] Create social media profiles
- [ ] Test on mobile devices

### Content to Add Later
- Blog posts about quiz nights
- Venue gallery
- FAQ page
- Pricing information
- Booking form

## Common Questions

**Q: Where do I edit the homepage hero section?**
A: Edit file: `wp-content/themes/quizmaster-general/front-page.php`

**Q: How do I change colors?**
A: Go to: Appearance → Customize → Additional CSS

**Q: How do I add a logo?**
A: Go to: Appearance → Customize → Site Identity → Select Logo

**Q: Where do I add social media links?**
A: Edit the footer.php file or use a social media widget

**Q: How do I add a contact form?**
A: Install "Contact Form 7" plugin, create form, add shortcode to Contact page

## Need Help?

- Check the full README.md for detailed instructions
- Visit [wordpress.org/support](https://wordpress.org/support)
- Contact your hosting provider's support

## Pro Tips

💡 **Use Real Photos** - Add actual photos of your quiz nights for authenticity

💡 **Get Reviews** - Ask satisfied venue owners for testimonials

💡 **Keep It Updated** - Post news/updates regularly to show you're active

💡 **Mobile First** - Most visitors will be on phones, always check mobile view

💡 **SEO Matters** - Install Yoast SEO and fill out all the fields

Good luck with your new website! 🎯🎉
