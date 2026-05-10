# Virtual Try-On Application - Testing Guide

## 🧪 Overview

This guide provides step-by-step instructions to test all features of the Virtual Try-On application.

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Authentication Testing](#authentication-testing)
3. [Image Upload Testing](#image-upload-testing)
4. [Try-On Generation Testing](#try-on-generation-testing)
5. [Dashboard Testing](#dashboard-testing)
6. [History & Favorites Testing](#history--favorites-testing)
7. [UI/UX Testing](#uiux-testing)
8. [API Testing](#api-testing)
9. [Error Handling Testing](#error-handling-testing)
10. [Performance Testing](#performance-testing)

## 🔧 Pre-Testing Setup

### 1. Verify Environment

```bash
# Check if server is running
curl http://localhost:3000

# Check database connection
npm run db:studio

# Verify environment variables
cat .env.local
```

### 2. Prepare Test Data

**Test Images Needed:**
- 2-3 body photos (different poses)
- 3-5 garment images (different types)
- 1 invalid file (e.g., .txt file)
- 1 oversized image (>10MB)

### 3. Clear Previous Data (Optional)

```bash
# Reset database
npx prisma migrate reset

# Re-run migrations
npx prisma migrate dev
```

## 🔐 Authentication Testing

### Test Case 1: User Registration

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Fill in registration form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "test123"
   - Confirm Password: "test123"
3. Click "Create Account"

**Expected Results:**
- ✅ Form validates all fields
- ✅ Password confirmation works
- ✅ Redirects to login page
- ✅ Success message appears
- ✅ User created in database

**Test Variations:**
- Try with existing email (should fail)
- Try with mismatched passwords (should fail)
- Try with short password <6 chars (should fail)
- Try with invalid email format (should fail)

### Test Case 2: User Login

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "test123"
3. Click "Sign In"

**Expected Results:**
- ✅ Validates credentials
- ✅ Redirects to dashboard
- ✅ Session created
- ✅ User name appears in dashboard

**Test Variations:**
- Try with wrong password (should fail)
- Try with non-existent email (should fail)
- Try with empty fields (should fail)

### Test Case 3: Protected Routes

**Steps:**
1. Logout (clear cookies)
2. Try accessing:
   - `/dashboard`
   - `/try-on`
   - `/history`

**Expected Results:**
- ✅ Redirects to login page
- ✅ Callback URL preserved
- ✅ After login, redirects to original page

## 📸 Image Upload Testing

### Test Case 4: Valid Image Upload

**Steps:**
1. Login and navigate to `/try-on`
2. Upload valid body image (JPG, <10MB)
3. Upload valid garment image (PNG, <10MB)

**Expected Results:**
- ✅ Drag & drop works
- ✅ Click to upload works
- ✅ Preview appears immediately
- ✅ File validation passes
- ✅ No error messages

### Test Case 5: Invalid Image Upload

**Steps:**
1. Try uploading:
   - Text file (.txt)
   - Oversized image (>10MB)
   - Corrupted image file

**Expected Results:**
- ✅ Shows appropriate error message
- ✅ Upload rejected
- ✅ No preview shown
- ✅ Can retry with valid file

### Test Case 6: Image Preview

**Steps:**
1. Upload body image
2. Check preview display
3. Upload garment image
4. Check preview display

**Expected Results:**
- ✅ Preview shows correct image
- ✅ Image maintains aspect ratio
- ✅ Preview is clear and visible
- ✅ Can replace image

## 🎨 Try-On Generation Testing

### Test Case 7: Successful Try-On Generation

**Steps:**
1. Upload body image
2. Upload garment image
3. Click "Generate Try-On"
4. Wait for processing

**Expected Results:**
- ✅ Loading state appears
- ✅ Button disabled during processing
- ✅ Result appears after processing
- ✅ Result image is displayed
- ✅ Download button available
- ✅ "Try Another" button available

**Verify in Database:**
```sql
-- Check if records created
SELECT * FROM "BodyImage" ORDER BY "createdAt" DESC LIMIT 1;
SELECT * FROM "GarmentImage" ORDER BY "createdAt" DESC LIMIT 1;
SELECT * FROM "TryOnResult" ORDER BY "createdAt" DESC LIMIT 1;
```

### Test Case 8: Try-On with Mock ML

**Steps:**
1. Ensure `ML_MODE=mock` in .env.local
2. Generate try-on
3. Check result

**Expected Results:**
- ✅ Instant result (no API call)
- ✅ Mock image returned
- ✅ Status is "completed"
- ✅ Result saved to database

### Test Case 9: Download Result

**Steps:**
1. After generating try-on
2. Click "Download Result"
3. Check downloads folder

**Expected Results:**
- ✅ File downloads successfully
- ✅ Filename format: `try-on-result-{id}.jpg`
- ✅ Image opens correctly
- ✅ Image quality maintained

### Test Case 10: Try Another

**Steps:**
1. After viewing result
2. Click "Try Another"
3. Check page state

**Expected Results:**
- ✅ Form resets
- ✅ Previews cleared
- ✅ Can upload new images
- ✅ Previous result not lost

## 📊 Dashboard Testing

### Test Case 11: Dashboard Statistics

**Steps:**
1. Navigate to `/dashboard`
2. Check statistics cards

**Expected Results:**
- ✅ Total Try-Ons count correct
- ✅ Body Images count correct
- ✅ Garments count correct
- ✅ Favorites count correct
- ✅ Numbers update after new try-on

### Test Case 12: Recent Try-Ons Display

**Steps:**
1. View dashboard
2. Check recent try-ons section

**Expected Results:**
- ✅ Shows up to 6 recent results
- ✅ Images display correctly
- ✅ Dates are accurate
- ✅ Status badges show correctly
- ✅ Favorite icons work

### Test Case 13: Dashboard Navigation

**Steps:**
1. From dashboard, click:
   - "New Try-On"
   - "View All"
   - Theme toggle

**Expected Results:**
- ✅ "New Try-On" goes to `/try-on`
- ✅ "View All" goes to `/history`
- ✅ Theme toggle works
- ✅ Navigation smooth

## 📜 History & Favorites Testing

### Test Case 14: View All History

**Steps:**
1. Navigate to `/history`
2. View all try-ons

**Expected Results:**
- ✅ All try-ons displayed
- ✅ Grid layout responsive
- ✅ Images load correctly
- ✅ Dates accurate
- ✅ Status badges correct

### Test Case 15: Filter by Favorites

**Steps:**
1. On history page
2. Click "Favorites" tab
3. View filtered results

**Expected Results:**
- ✅ Shows only favorited items
- ✅ Empty state if no favorites
- ✅ Can switch back to "All"
- ✅ Filter persists on refresh

### Test Case 16: Toggle Favorites

**Steps:**
1. Click heart icon on a result
2. Check if favorited
3. Click again to unfavorite

**Expected Results:**
- ✅ Heart fills when favorited
- ✅ Heart empties when unfavorited
- ✅ Updates in database
- ✅ Reflects in dashboard stats
- ✅ Shows in favorites filter

### Test Case 17: View Source Images

**Steps:**
1. On history page
2. Check source images section

**Expected Results:**
- ✅ Body image thumbnail visible
- ✅ Garment image thumbnail visible
- ✅ Thumbnails are clear
- ✅ Labeled correctly

### Test Case 18: Download from History

**Steps:**
1. On history page
2. Click download on any result

**Expected Results:**
- ✅ Downloads correct image
- ✅ Filename includes result ID
- ✅ Image quality preserved

## 🎨 UI/UX Testing

### Test Case 19: Dark/Light Mode

**Steps:**
1. Toggle theme using sun/moon icon
2. Navigate through all pages
3. Check consistency

**Expected Results:**
- ✅ Theme switches smoothly
- ✅ All pages respect theme
- ✅ Text readable in both modes
- ✅ Images display correctly
- ✅ Preference saved

### Test Case 20: Responsive Design

**Steps:**
1. Test on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ Navigation accessible
- ✅ Images scale properly
- ✅ Buttons remain clickable
- ✅ Text remains readable

### Test Case 21: Loading States

**Steps:**
1. Observe loading states during:
   - Login
   - Image upload
   - Try-on generation
   - Page navigation

**Expected Results:**
- ✅ Loading indicators appear
- ✅ Buttons disabled during loading
- ✅ Clear feedback to user
- ✅ No UI jumps

### Test Case 22: Error Messages

**Steps:**
1. Trigger various errors:
   - Invalid login
   - Failed upload
   - Network error

**Expected Results:**
- ✅ Error messages clear
- ✅ Styled appropriately
- ✅ Dismissible
- ✅ Actionable guidance

## 🔌 API Testing

### Test Case 23: API Endpoints

Use curl or Postman to test:

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test","email":"api@test.com","password":"test123"}'
```

**Upload Body Image:**
```bash
curl -X POST http://localhost:3000/api/upload/body \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -F "image=@/path/to/body.jpg"
```

**Upload Garment:**
```bash
curl -X POST http://localhost:3000/api/upload/garment \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -F "image=@/path/to/garment.jpg"
```

**Generate Try-On:**
```bash
curl -X POST http://localhost:3000/api/try-on \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"bodyImageId":"body-id","garmentImageId":"garment-id"}'
```

**Expected Results:**
- ✅ 200 status for success
- ✅ 401 for unauthorized
- ✅ 400 for bad request
- ✅ Proper JSON responses

### Test Case 24: Dashboard Stats API

```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Expected Results:**
- ✅ Returns correct statistics
- ✅ JSON format
- ✅ All fields present

### Test Case 25: Favorites API

**Add Favorite:**
```bash
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"tryOnResultId":"result-id"}'
```

**Get Favorites:**
```bash
curl http://localhost:3000/api/favorites \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Remove Favorite:**
```bash
curl -X DELETE http://localhost:3000/api/favorites/result-id \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

## ⚠️ Error Handling Testing

### Test Case 26: Network Errors

**Steps:**
1. Disconnect internet
2. Try uploading image
3. Try generating try-on

**Expected Results:**
- ✅ Shows network error message
- ✅ Allows retry
- ✅ No data corruption

### Test Case 27: Invalid Data

**Steps:**
1. Try submitting forms with:
   - Empty fields
   - Invalid formats
   - SQL injection attempts
   - XSS attempts

**Expected Results:**
- ✅ Validation catches errors
- ✅ Appropriate error messages
- ✅ No security vulnerabilities
- ✅ Data sanitized

### Test Case 28: Session Expiry

**Steps:**
1. Login
2. Wait for session to expire (or clear cookies)
3. Try accessing protected route

**Expected Results:**
- ✅ Redirects to login
- ✅ Shows session expired message
- ✅ Can login again
- ✅ Redirects back to intended page

## 🚀 Performance Testing

### Test Case 29: Image Upload Speed

**Steps:**
1. Upload various image sizes
2. Measure upload time

**Expected Results:**
- ✅ Small images (<1MB): <2 seconds
- ✅ Medium images (1-5MB): <5 seconds
- ✅ Large images (5-10MB): <10 seconds

### Test Case 30: Page Load Times

**Steps:**
1. Measure load time for each page:
   - Landing page
   - Login/Register
   - Dashboard
   - Try-On
   - History

**Expected Results:**
- ✅ Initial load: <3 seconds
- ✅ Subsequent loads: <1 second
- ✅ No layout shifts
- ✅ Images lazy load

### Test Case 31: Concurrent Users

**Steps:**
1. Open multiple browser tabs
2. Login with different users
3. Perform actions simultaneously

**Expected Results:**
- ✅ No conflicts
- ✅ Data isolated per user
- ✅ No race conditions
- ✅ Database handles concurrent writes

## ✅ Testing Checklist

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes redirect
- [ ] Session management works
- [ ] Logout works

### Image Upload
- [ ] Valid images upload successfully
- [ ] Invalid files rejected
- [ ] File size validation works
- [ ] Preview displays correctly
- [ ] Multiple uploads work

### Try-On Generation
- [ ] Generation completes successfully
- [ ] Loading states display
- [ ] Results display correctly
- [ ] Download works
- [ ] Database records created

### Dashboard
- [ ] Statistics accurate
- [ ] Recent try-ons display
- [ ] Navigation works
- [ ] Updates in real-time

### History & Favorites
- [ ] All try-ons display
- [ ] Favorites filter works
- [ ] Toggle favorites works
- [ ] Download from history works
- [ ] Source images visible

### UI/UX
- [ ] Dark/light mode works
- [ ] Responsive on all devices
- [ ] Loading states clear
- [ ] Error messages helpful
- [ ] Navigation intuitive

### API
- [ ] All endpoints respond
- [ ] Authentication required
- [ ] Proper status codes
- [ ] JSON responses valid

### Error Handling
- [ ] Network errors handled
- [ ] Invalid data rejected
- [ ] Session expiry handled
- [ ] User-friendly messages

### Performance
- [ ] Fast page loads
- [ ] Quick image uploads
- [ ] Smooth animations
- [ ] No memory leaks

## 🐛 Bug Reporting Template

When you find a bug, report it with:

```markdown
**Bug Title:** Brief description

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
If applicable

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Screen size: 1920x1080

**Console Errors:**
Any error messages from browser console

**Additional Context:**
Any other relevant information
```

## 📊 Test Results Template

```markdown
# Test Results - [Date]

## Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Skipped: W

## Failed Tests
1. Test Case #: Description
   - Issue: What went wrong
   - Fix: How to resolve

## Performance Metrics
- Average page load: Xs
- Average upload time: Xs
- Average generation time: Xs

## Recommendations
- List of improvements
- Priority issues
- Nice-to-have features
```

---

## 🎯 Quick Test Scenario

For a quick end-to-end test:

1. ✅ Register new account
2. ✅ Login
3. ✅ Upload body image
4. ✅ Upload garment image
5. ✅ Generate try-on
6. ✅ Download result
7. ✅ Add to favorites
8. ✅ View dashboard
9. ✅ Check history
10. ✅ Toggle dark mode
11. ✅ Logout

**Time Required:** ~5 minutes

---

*Last Updated: 2026-05-09*