# Spoolin Industries Gallery System

## Overview
The gallery system has been updated to use **server-based storage** instead of localStorage. This means images are now visible to **all users and browsers** once properly uploaded to the server.

## How It Works

### For Users (Viewing)
- Gallery automatically loads images from `gallery-manifest.json`
- Images are displayed from the `assets/images/gallery/` folder
- Works across all browsers and devices
- No login required to view images

### For Admin (Uploading)
1. **Login** with admin credentials
2. **Select images** using the upload interface
3. **Choose category** (Turbo Systems, Exhaust Work, etc.)
4. **Click "Upload Images"**
5. **Follow the server upload instructions**

## Server Upload Process

When you upload images as admin:

1. **Images are automatically downloaded** to your computer with unique filenames
2. **Gallery manifest is generated** with image metadata
3. **Instructions appear** showing you what to upload to the server

### Required Server Actions:
1. **Upload image files** to: `assets/images/gallery/`
2. **Upload gallery manifest** as: `gallery-manifest.json` (in root)

## File Structure
```
/
├── gallery-manifest.json          # Gallery metadata (root)
├── assets/images/gallery/         # Image files
│   ├── turbo-build-1704987654-0.jpg
│   ├── exhaust-custom-1704987654-1.jpg
│   └── ...
└── gallery.html                   # Gallery page
```

## Gallery Manifest Format
```json
{
  "version": "1.0",
  "lastUpdated": "2025-01-07T20:30:00.000Z",
  "totalImages": 2,
  "images": [
    {
      "id": "1704987654-0",
      "filename": "turbo-build-1704987654-0.jpg",
      "url": "./assets/images/gallery/turbo-build-1704987654-0.jpg",
      "name": "Turbo Build.jpg",
      "category": "turbo",
      "uploadDate": "2025-01-07T20:30:00.000Z",
      "size": 1024000,
      "adminEmail": "spoolinindustries@outlook.com",
      "originalType": "image/jpeg"
    }
  ]
}
```

## Benefits

✅ **Universal Access**: Images visible to all users  
✅ **No Browser Dependency**: Works across all browsers  
✅ **Persistent Storage**: Images stay on server permanently  
✅ **Professional**: Proper file-based gallery system  
✅ **SEO Friendly**: Images indexed by search engines  
✅ **Fast Loading**: Optimized image delivery  

## Admin Login
- **Email**: spoolinindustries@outlook.com
- **Password**: 1234

## Categories
- Turbo Systems
- Exhaust Work  
- Custom Fabrication
- Suspension
- 4×4 Builds

## Support
For technical support with the gallery system, contact the developer. 