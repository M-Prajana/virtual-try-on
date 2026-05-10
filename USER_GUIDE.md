# Virtual Try-On Application - User Guide

## 🎯 Overview

This guide will help you use the Virtual Try-On application to upload your photos and garments, and generate realistic try-on results using AI.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Creating an Account](#creating-an-account)
3. [Uploading Images](#uploading-images)
4. [Generating Try-Ons](#generating-try-ons)
5. [Managing Results](#managing-results)
6. [Dashboard Features](#dashboard-features)
7. [Tips for Best Results](#tips-for-best-results)
8. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### Prerequisites

Before using the application, ensure:
- The application is running (see SETUP_GUIDE.md)
- Database is connected and migrated
- You have images ready to upload

### Accessing the Application

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see the landing page with application features

## 👤 Creating an Account

### Registration

1. Click **"Get Started"** or **"Sign Up"** on the landing page
2. Fill in the registration form:
   - **Full Name**: Your name
   - **Email**: Valid email address
   - **Password**: At least 6 characters
   - **Confirm Password**: Must match password
3. Click **"Create Account"**
4. You'll be redirected to the login page

### Login

1. Navigate to `/login` or click **"Sign In"**
2. Enter your credentials:
   - **Email**: Your registered email
   - **Password**: Your password
3. Click **"Sign In"**
4. You'll be redirected to the dashboard

## 📸 Uploading Images

### Image Requirements

**Body Images:**
- Format: JPG, PNG, WEBP
- Max size: 10MB
- Recommended: Full body photo, clear background
- Best results: Standing straight, arms slightly away from body

**Garment Images:**
- Format: JPG, PNG, WEBP
- Max size: 10MB
- Recommended: Clear product photo, plain background
- Best results: Flat lay or on mannequin

### Upload Process

1. Navigate to **"Try-On"** page
2. **Step 1: Upload Your Photo**
   - Click the upload area or drag & drop your body image
   - Preview will appear below
3. **Step 2: Upload Garment**
   - Click the upload area or drag & drop garment image
   - Preview will appear below

## 🎨 Generating Try-Ons

### Creating a Try-On

1. After uploading both images, click **"Generate Try-On"**
2. Wait for processing (typically 10-30 seconds)
3. The result will appear on the screen

### What Happens During Processing

1. **Upload Phase**: Images are uploaded to cloud storage
2. **Processing Phase**: ML model generates the try-on result
3. **Result Phase**: Final image is displayed

### ML Model Fallback System

The application uses a smart fallback system:
1. **Mock Mode** (Default for testing): Instant results using sample images
2. **Hugging Face API**: Real AI processing (requires API key)
3. **Replicate API**: Alternative AI service (requires API key)

## 📊 Managing Results

### Viewing Results

After generation, you can:
- **Download**: Save the result to your device
- **Favorite**: Mark as favorite for quick access
- **Try Another**: Reset and create a new try-on

### Downloading Results

1. Click **"Download Result"** button
2. Image will be saved as `try-on-result-{id}.jpg`
3. Check your browser's download folder

### Favorites

**Adding to Favorites:**
1. Click the heart icon on any result
2. Heart turns pink when favorited

**Viewing Favorites:**
1. Go to Dashboard or History page
2. Click **"Favorites"** tab
3. See all your saved favorites

## 🎛️ Dashboard Features

### Statistics Overview

The dashboard shows:
- **Total Try-Ons**: Number of generated results
- **Body Images**: Uploaded body photos
- **Garments**: Uploaded garment images
- **Favorites**: Saved favorite results

### Recent Try-Ons

- View your 6 most recent try-ons
- Quick access to favorite toggle
- Click **"View All"** to see complete history

### Navigation

From dashboard, you can:
- Create new try-on
- View complete history
- Access favorites
- Toggle dark/light mode

## 📜 History Page

### Viewing All Try-Ons

1. Navigate to **"History"** from dashboard
2. See all your try-on results in a grid

### Filtering

- **All Try-Ons**: View complete history
- **Favorites**: View only favorited results

### Actions Per Result

- View result image
- See source body and garment images
- Toggle favorite status
- Download result
- View creation date and status

## 💡 Tips for Best Results

### Body Photos

✅ **Do:**
- Use well-lit photos
- Stand straight with arms slightly away
- Wear fitted clothing
- Use plain background
- Face the camera directly

❌ **Don't:**
- Use blurry or dark photos
- Have cluttered backgrounds
- Wear very loose clothing
- Use group photos
- Have extreme poses

### Garment Images

✅ **Do:**
- Use clear product photos
- Ensure garment is fully visible
- Use plain/white background
- Show front view clearly
- Use high-resolution images

❌ **Don't:**
- Use images with models (unless you want that style)
- Have multiple garments in one image
- Use very small or pixelated images
- Include excessive accessories
- Use images with watermarks

### General Tips

1. **Image Quality**: Higher quality = better results
2. **Lighting**: Good lighting improves accuracy
3. **Angles**: Front-facing works best
4. **Size**: Larger images (within 10MB) work better
5. **Format**: PNG or JPG recommended

## 🎨 Theme Customization

### Dark/Light Mode

Toggle between themes:
1. Click the sun/moon icon in the header
2. Theme preference is saved automatically
3. Works across all pages

### Theme Features

- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on eyes, modern look
- Smooth transitions between themes
- Consistent across all pages

## 🔧 Troubleshooting

### Common Issues

**1. Upload Failed**
- Check file size (max 10MB)
- Verify file format (JPG, PNG, WEBP)
- Ensure stable internet connection
- Try a different image

**2. Generation Takes Too Long**
- Normal processing: 10-30 seconds
- If longer, refresh and try again
- Check your internet connection
- Verify API keys are configured (if using real ML)

**3. Login Issues**
- Verify email and password
- Check if account exists
- Try password reset (if implemented)
- Clear browser cache

**4. Images Not Displaying**
- Check internet connection
- Verify Cloudinary configuration
- Try refreshing the page
- Check browser console for errors

**5. Rate Limit Errors**
- Wait 1 minute before retrying
- Limits: 10 uploads/min, 5 try-ons/min
- Use the application reasonably

### Getting Help

If issues persist:
1. Check TROUBLESHOOTING.md
2. Review browser console for errors
3. Check server logs
4. Verify environment variables
5. Ensure database is connected

## 🔐 Privacy & Security

### Data Storage

- Images stored securely in Cloudinary
- Database hosted on Supabase
- Passwords hashed with bcrypt
- Session-based authentication

### Data Management

- You own your data
- Delete results anytime (feature to be added)
- Images can be removed from cloud storage
- Account deletion available (feature to be added)

## 📱 Mobile Usage

The application is responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

**Mobile Tips:**
- Use portrait mode for better layout
- Tap to upload images
- Swipe to view results
- Use native camera for best photos

## 🎯 Best Practices

### For Optimal Experience

1. **Prepare Images**: Have images ready before starting
2. **Good Lighting**: Take photos in well-lit areas
3. **Clear Background**: Use plain backgrounds
4. **Save Favorites**: Mark good results for reference
5. **Organize**: Use descriptive names when saving
6. **Regular Cleanup**: Remove unwanted results periodically

### Workflow Recommendation

1. Take/prepare body photo
2. Find garment image online or photograph
3. Upload both to application
4. Generate try-on
5. Review result
6. Download or favorite if satisfied
7. Try different garments with same body photo

## 📈 Feature Roadmap

### Coming Soon

- [ ] Image cropping and editing
- [ ] Multiple garment try-on
- [ ] Sharing results
- [ ] Export to social media
- [ ] Advanced filters
- [ ] Batch processing
- [ ] Mobile app

## 🆘 Support

### Resources

- **Setup Guide**: SETUP_GUIDE.md
- **API Documentation**: API_SPECIFICATION.md
- **Troubleshooting**: TROUBLESHOOTING.md
- **Technical Details**: TECHNICAL_PLAN.md

### Contact

For technical issues:
1. Check documentation first
2. Review error messages
3. Check browser console
4. Verify configuration

---

## 🎉 Quick Start Checklist

- [ ] Account created and verified
- [ ] Logged in successfully
- [ ] Body image prepared and uploaded
- [ ] Garment image prepared and uploaded
- [ ] First try-on generated
- [ ] Result downloaded or favorited
- [ ] Dashboard explored
- [ ] History page visited
- [ ] Dark mode tested
- [ ] Mobile view checked (if applicable)

**Congratulations! You're ready to use the Virtual Try-On application!** 🎊

---

*Last Updated: 2026-05-09*