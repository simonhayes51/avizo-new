# The Quiz Master General - WordPress Website

A vibrant, engaging WordPress website for The Quiz Master General, North East England's leading quiz and entertainment provider.

## What's Included

This package contains a complete, custom WordPress theme called **Quiz Master General** designed specifically for quiz entertainment businesses.

### Features

✅ **Fully Responsive Design** - Looks great on all devices
✅ **Fun, Engaging Visual Design** - Orange/yellow color scheme perfect for entertainment
✅ **Easy to Update** - All content editable through WordPress admin
✅ **Mobile Menu** - User-friendly navigation on mobile devices
✅ **Smooth Scrolling** - Professional page transitions
✅ **SEO Ready** - Proper heading structure and meta tags
✅ **Social Media Ready** - Open Graph tags for sharing
✅ **Contact Information** - Easy-to-update contact details
✅ **Service Pages** - Showcase quiz nights, race nights, and more
✅ **Testimonials Section** - Build trust with client reviews
✅ **Interactive Features** - Smooth animations and effects

## Installation Instructions

### Step 1: Install WordPress

1. **Get WordPress hosting** (recommended providers):
   - Bluehost
   - SiteGround
   - WP Engine
   - HostGator

2. **Install WordPress** on your hosting:
   - Most hosts offer 1-click WordPress installation
   - Or download from [wordpress.org](https://wordpress.org) and install manually

3. **Complete the WordPress setup**:
   - Set your site title: "The Quiz Master General"
   - Set tagline: "North East England's Premier Quiz Provider"

### Step 2: Install the Theme

1. **Copy the theme folder**:
   - Upload the entire `quizmaster-general` folder to your WordPress installation at:
   ```
   /wp-content/themes/quizmaster-general/
   ```

2. **Activate the theme**:
   - Log in to WordPress Admin (usually: yoursite.com/wp-admin)
   - Go to Appearance → Themes
   - Find "Quiz Master General" theme
   - Click "Activate"

### Step 3: Set Up Your Content

#### Create Your Main Pages

Create these pages via Pages → Add New:

1. **Home Page** (will use front-page.php template automatically)
   - Title: "Home" (you can leave content empty)
   - Publish

2. **About Page**
   - Title: "About"
   - Copy content from `sample-content/about.txt`
   - Customize with your personal information
   - Publish

3. **Services Page**
   - Title: "Services"
   - Copy content from `sample-content/services.txt`
   - Customize to match your offerings
   - Publish

4. **Contact Page**
   - Title: "Contact"
   - Copy content from `sample-content/contact.txt`
   - Update with your contact information
   - Publish

#### Set Your Homepage

1. Go to Settings → Reading
2. Select "A static page" for homepage displays
3. Choose "Home" as your Homepage
4. Save Changes

#### Create Your Menu

1. Go to Appearance → Menus
2. Create a new menu called "Primary Menu"
3. Add your pages:
   - Home
   - About
   - Services
   - Contact
4. Set "Display location" to "Primary Menu"
5. Save Menu

### Step 4: Customize Your Site

#### Update Site Settings

1. **Settings → General**:
   - Site Title: "The Quiz Master General"
   - Tagline: "North East England's Premier Quiz Provider"
   - Timezone: Europe/London

2. **Settings → Permalinks**:
   - Select "Post name" for clean URLs
   - Save Changes

#### Add a Logo (Optional)

1. Go to Appearance → Customize → Site Identity
2. Upload your logo image (recommended size: 200x100px)
3. Publish

#### Customize Colors (Optional)

The theme uses these colors by default:
- Primary Orange: #FF6B35
- Secondary Yellow: #F7931E
- Accent Teal: #4ECDC4

To change colors:
1. Go to Appearance → Customize → Additional CSS
2. Add your custom CSS color overrides
3. Publish

### Step 5: Add Your Content

#### Update the Homepage

Edit the front-page.php file to customize:
- Hero section text
- Service descriptions
- Testimonials (replace with real client feedback)
- Contact information

#### Add Blog Posts (Optional)

You can add news, quiz recaps, or venue spotlights:
1. Posts → Add New
2. Write your post
3. Publish

## Editing Your Site

### How to Edit Pages

1. Log in to WordPress Admin
2. Go to Pages → All Pages
3. Click the page you want to edit
4. Make your changes in the WordPress editor
5. Click "Update"

That's it! No coding required.

### How to Edit Contact Information

**In the Footer:**
Edit `footer.php` or use WordPress Customizer widgets:
- Appearance → Widgets
- Add widgets to Footer Widget 1, 2, and 3

**On the Contact Page:**
- Simply edit the Contact page content in WordPress

### How to Update Services

1. Go to Pages → All Pages
2. Click "Services"
3. Edit the content
4. Update

### How to Add Testimonials

Edit the `front-page.php` file and add new testimonial cards in the testimonials section.

## Customization Guide

### Adding More Pages

1. Pages → Add New
2. Create your page
3. Add to the menu via Appearance → Menus

### Changing Fonts

The theme uses web-safe fonts by default. To add custom fonts:
1. Choose fonts from [Google Fonts](https://fonts.google.com)
2. Add to Appearance → Customize → Additional CSS

### Adding Contact Form

Install a plugin like **Contact Form 7**:
1. Plugins → Add New
2. Search "Contact Form 7"
3. Install and Activate
4. Create your form
5. Add shortcode to Contact page

## Recommended Plugins

To enhance your site, install these free plugins:

### Essential
- **Yoast SEO** - Search engine optimization
- **Contact Form 7** - Contact forms
- **Wordfence Security** - Security protection
- **UpdraftPlus** - Backups

### Optional
- **Google Analytics** - Track visitors
- **Smush** - Image optimization
- **WP Super Cache** - Speed optimization
- **Redirection** - Manage redirects

## Site Maintenance

### Regular Tasks

**Weekly:**
- Check for WordPress updates
- Check for plugin updates
- Check for theme updates

**Monthly:**
- Backup your site
- Review security logs
- Update content

**Keep Your Site Secure:**
- Use strong passwords
- Keep WordPress updated
- Keep plugins updated
- Use security plugin (Wordfence)
- Regular backups

## Troubleshooting

### Menu Not Showing
- Make sure you've created and assigned the menu to "Primary Menu" location
- Check Appearance → Menus

### Homepage Not Displaying Correctly
- Verify Settings → Reading is set to "Static Page"
- Make sure "Home" is selected as Homepage

### Styling Issues
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Clear WordPress cache if using cache plugin
- Check theme is activated

### Mobile Menu Not Working
- Make sure JavaScript is enabled
- Clear browser cache
- Check browser console for errors

## Support & Updates

### Getting Help

1. **WordPress Documentation**: [wordpress.org/support](https://wordpress.org/support)
2. **WordPress Forums**: Community support
3. **Your Hosting Provider**: Technical support

### Making Updates

When editing the theme files:
1. Always backup first
2. Test changes on a staging site if possible
3. Keep a copy of original files

## File Structure

```
quizmaster-general/
├── style.css              # Main stylesheet
├── functions.php          # Theme functions
├── header.php            # Site header
├── footer.php            # Site footer
├── front-page.php        # Homepage template
├── index.php             # Main template
├── page.php              # Page template
├── single.php            # Blog post template
├── screenshot.png        # Theme screenshot (create this)
└── js/
    └── main.js           # JavaScript features
```

## Customization Tips

### Quick Wins
1. Add high-quality photos of your quiz nights
2. Include real testimonials from venues
3. Add a gallery of events
4. Create blog posts about quiz topics
5. Link social media profiles

### Content Ideas
- Quiz night recaps
- Venue spotlights
- Sample quiz questions
- Quiz tips and trivia
- Event announcements
- Customer testimonials

## Going Live

### Pre-Launch Checklist

- [ ] All pages created and published
- [ ] Navigation menu set up
- [ ] Contact information updated
- [ ] About page personalized
- [ ] Testimonials added (real ones)
- [ ] Images optimized
- [ ] SEO plugin installed
- [ ] Google Analytics added
- [ ] Social media links added
- [ ] Contact form working
- [ ] Mobile responsiveness tested
- [ ] All links working
- [ ] Favicon added
- [ ] Privacy policy page
- [ ] Cookie notice (if using cookies)

### After Launch

- Submit to Google Search Console
- Create Google My Business listing
- Share on social media
- Email existing clients
- Add to email signature
- Print business cards with URL

## License

This theme is free to use and modify for your business.

## Credits

Built with love for The Quiz Master General!
- WordPress: [wordpress.org](https://wordpress.org)
- Font Awesome Icons: [fontawesome.com](https://fontawesome.com)
