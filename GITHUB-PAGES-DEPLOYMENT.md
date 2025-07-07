# Spoolin Industries - GitHub Pages Deployment Guide

## 🚀 Complete GitHub Pages Setup

This guide will walk you through deploying your Spoolin Industries website with a fully functional gallery system on GitHub Pages.

### 🎯 What You'll Get

- ✅ **Free hosting** on GitHub Pages
- ✅ **Professional gallery** with admin upload system
- ✅ **Custom domain support** (optional)
- ✅ **Automatic SSL certificate**
- ✅ **Version control** with Git
- ✅ **Easy updates** through GitHub interface

## 📁 Repository Structure

After setup, your repository should look like this:

```
spoolin-industries/
├── index.html                     # Main homepage
├── shop.html                      # Shop page
├── gallery.html                   # Gallery page (with admin login)
├── gallery-manifest.json          # Gallery image database
├── assets/
│   ├── images/
│   │   ├── gallery/               # Gallery images folder
│   │   │   ├── image1-123456-0.jpg
│   │   │   ├── image2-123456-1.jpg
│   │   │   └── ...
│   │   └── ... (other images)
│   └── ... (other assets)
├── robots.txt
└── README.md
```

## 🔧 Step-by-Step Setup

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click **"New repository"**
3. Repository name: `spoolin-industries` (or your preferred name)
4. Make it **Public** (required for free GitHub Pages)
5. Click **"Create repository"**

### Step 2: Upload Your Website Files

#### Option A: Using GitHub Web Interface (Easiest)

1. In your new repository, click **"uploading an existing file"**
2. Drag and drop ALL your website files:
   - `index.html`
   - `shop.html` 
   - `gallery.html`
   - `gallery-manifest.json`
   - `assets/` folder (entire folder)
   - `robots.txt`
3. Write commit message: "Initial website upload"
4. Click **"Commit changes"**

#### Option B: Using Git Command Line

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/spoolin-industries.git
cd spoolin-industries

# Copy all your website files to this folder
# Then add and commit
git add .
git commit -m "Initial website upload"
git push origin main
```

### Step 3: Enable GitHub Pages

1. In your repository, go to **Settings**
2. Scroll down to **Pages** section
3. Under **Source**, select **"Deploy from a branch"**
4. Select **"main"** branch
5. Select **"/ (root)"** folder
6. Click **"Save"**

### Step 4: Create GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Spoolin Industries Gallery`
4. Select expiration: **No expiration** (or 1 year)
5. Select scopes: **Check `repo` (Full control of private repositories)**
6. Click **"Generate token"**
7. **COPY THE TOKEN** - you won't see it again!

### Step 5: Configure Gallery Settings

1. Open `gallery.html` in your repository
2. Click the **pencil icon** to edit
3. Find line ~35 and update the GitHub configuration:

```javascript
const GITHUB_CONFIG = {
    repoOwner: 'YOUR-GITHUB-USERNAME',     // Replace with your username
    repoName: 'spoolin-industries',        // Replace with your repo name
    branch: 'main',                        // Usually 'main' or 'master'
    token: 'ghp_xxxxxxxxxxxxxxxxxxxx'      // Paste your token here
};
```

4. Commit the changes

⚠️ **Security Note:** Keep your token private! Don't share your repository if it contains the token.

### Step 6: Access Your Live Website

Your website will be available at:
```
https://YOUR-USERNAME.github.io/spoolin-industries/
```

**Gallery page:** `https://YOUR-USERNAME.github.io/spoolin-industries/gallery.html`

## 📸 Using the Gallery System

### Admin Login
- **Email:** `spoolinindustries@outlook.com`
- **Password:** `1234`

### Adding New Images - **FULLY AUTOMATED!**

1. Go to your gallery page
2. Click **"Admin"** and login
3. Upload images using the admin panel
4. **That's it!** The system automatically:
   - ✅ Uploads images directly to GitHub
   - ✅ Updates the gallery manifest
   - ✅ Commits changes to your repository
   - ✅ Makes images visible to all users in 1-2 minutes

### No Manual Steps Required!

Unlike traditional static hosting, this system is **fully automated**:
- ❌ No manual file uploads
- ❌ No downloading files
- ❌ No manual commits
- ✅ Upload → Live automatically!

## 🔄 Updating Your Website

### Method 1: GitHub Web Interface

1. Navigate to the file you want to edit
2. Click the **pencil icon**
3. Make your changes
4. Commit with a descriptive message

### Method 2: Git Command Line

```bash
# Make changes to your files locally
git add .
git commit -m "Update gallery images"
git push origin main
```

### Method 3: GitHub Desktop (User-Friendly)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Clone your repository
3. Make changes in your local folder
4. Use GitHub Desktop to commit and push

## 🌐 Custom Domain (Optional)

To use your own domain (like `spoolinindustries.com`):

1. In repository **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add a DNS record with your domain provider:
   - Type: `CNAME`
   - Name: `www` (or `@` for root domain)
   - Value: `YOUR-USERNAME.github.io`

## 🔒 Security & Best Practices

### Admin Password Security

For production use, consider:
- Changing the default password in `gallery.html`
- Using environment variables (advanced)
- Implementing proper authentication (advanced)

### Image Optimization

- Keep image files under 2MB each
- Use `.jpg` for photos, `.png` for graphics
- Consider compressing images before upload

### Repository Management

- Use descriptive commit messages
- Keep your repository organized
- Regularly backup your gallery images

## 📊 Analytics & Monitoring

### GitHub Pages Analytics

- Built-in traffic analytics in repository **Insights**
- View visitor statistics and popular pages

### External Analytics

Add Google Analytics by inserting tracking code in your HTML files.

## 🚨 Troubleshooting

### Common Issues

**Gallery images not showing:**
- Check that `gallery-manifest.json` is in the repository root
- Verify image files are in `assets/images/gallery/`
- Ensure file names match exactly in the manifest

**Website not updating:**
- Check the **Actions** tab for build status
- GitHub Pages can take 1-2 minutes to update
- Clear your browser cache

**Admin login not working:**
- Verify credentials in `gallery.html`
- Check browser console for JavaScript errors

### Getting Help

1. Check the **Actions** tab for build errors
2. Review the **Issues** tab for common problems
3. GitHub Pages documentation: [pages.github.com](https://pages.github.com/)

## 🎉 You're All Set!

Your Spoolin Industries website is now live on GitHub Pages with:

- ✅ Professional gallery system
- ✅ Admin upload functionality  
- ✅ Free hosting and SSL
- ✅ Easy content management
- ✅ Professional appearance

**Your live website:** `https://YOUR-USERNAME.github.io/spoolin-industries/`

---

*Need help? Check the troubleshooting section above or create an issue in your repository.* 