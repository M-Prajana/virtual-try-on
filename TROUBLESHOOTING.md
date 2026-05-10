# Troubleshooting Guide

## Common Issues and Solutions

### 1. Prisma Client Not Found Error

**Error:**
```
Module '"@prisma/client"' has no exported member 'PrismaClient'
```

**Solution:**
```bash
# Generate Prisma client
npx prisma generate
```

This creates the Prisma client based on your schema. Run this command whenever you modify `prisma/schema.prisma`.

---

### 2. Database Connection Failed

**Error:**
```
Can't reach database server at localhost:5432
```

**Solutions:**

**For Local PostgreSQL:**
```bash
# Check if PostgreSQL is running (macOS)
brew services list

# Start PostgreSQL
brew services start postgresql@14

# Verify connection
psql -U postgres
```

**For Cloud Database (Supabase/Neon):**
1. Check your `DATABASE_URL` in `.env.local`
2. Ensure the connection string is correct
3. Verify your database is active in the dashboard

---

### 3. NextAuth Configuration Error

**Error:**
```
[next-auth][error][NO_SECRET]
```

**Solution:**
```bash
# Generate a secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="paste-the-generated-secret-here"
```

---

### 4. Cloudinary Upload Fails

**Error:**
```
Failed to upload image
```

**Solutions:**

1. **Check credentials in `.env.local`:**
   ```env
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

2. **Verify file requirements:**
   - Format: JPEG, PNG, or WebP
   - Size: Under 10MB
   - Valid image file

3. **Test Cloudinary connection:**
   - Log into cloudinary.com
   - Check your usage limits
   - Verify API keys are active

---

### 5. Module Not Found Errors

**Error:**
```
Cannot find module '@/lib/db'
```

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

---

### 6. TypeScript Errors

**Error:**
```
Type errors in various files
```

**Solution:**

These are often due to Prisma client not being generated:
```bash
npx prisma generate
```

If errors persist:
```bash
# Check TypeScript
npx tsc --noEmit

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

### 7. Build Errors

**Error:**
```
Build failed with errors
```

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

### 8. Environment Variables Not Loading

**Error:**
```
process.env.VARIABLE_NAME is undefined
```

**Solutions:**

1. **Check file name:** Must be `.env.local` (not `.env`)

2. **Restart development server:**
   ```bash
   # Stop with Ctrl+C, then restart
   npm run dev
   ```

3. **Verify variable format:**
   ```env
   # Correct
   DATABASE_URL="postgresql://..."
   
   # Incorrect (no spaces around =)
   DATABASE_URL = "postgresql://..."
   ```

---

### 9. Port Already in Use

**Error:**
```
Port 3000 is already in use
```

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
npm run dev -- -p 3001
```

---

### 10. Image Upload Size Limit

**Error:**
```
File size exceeds limit
```

**Solution:**

The app limits uploads to 10MB. To change this:

1. **Update validation in `src/lib/utils.ts`:**
   ```typescript
   const maxSize = 20 * 1024 * 1024; // 20MB
   ```

2. **Update Next.js config in `next.config.js`:**
   ```javascript
   experimental: {
     serverActions: {
       bodySizeLimit: '20mb',
     },
   },
   ```

---

### 11. ML Service Errors

**Error:**
```
ML processing failed
```

**Solutions:**

1. **Check feature flags in `.env.local`:**
   ```env
   USE_MOCK_ML=true
   ENABLE_HUGGINGFACE=false
   ENABLE_REPLICATE=false
   ```

2. **For development, use mock service:**
   - Set `USE_MOCK_ML=true`
   - This returns instant results without API calls

3. **For production ML services:**
   - Get API keys from Hugging Face or Replicate
   - Update environment variables
   - Enable the services

---

### 12. Database Schema Changes

**When you modify `prisma/schema.prisma`:**

```bash
# Generate new client
npx prisma generate

# Push changes to database
npx prisma db push

# Or create migration (production)
npx prisma migrate dev --name your_change_name
```

---

### 13. Authentication Issues

**Problem:** Can't login after registration

**Solution:**

1. **Check user was created:**
   ```bash
   npx prisma studio
   ```

2. **Verify password hashing:**
   - Check `src/app/api/auth/register/route.ts`
   - Ensure bcrypt is working

3. **Check NextAuth configuration:**
   - Verify `src/lib/auth.ts`
   - Check session strategy

---

### 14. CORS Errors

**Error:**
```
CORS policy blocked the request
```

**Solution:**

This shouldn't happen with Next.js API routes, but if it does:

1. **Check API route paths:**
   - Must be in `src/app/api/` directory
   - Export named functions (GET, POST, etc.)

2. **Verify request format:**
   - Use relative URLs: `/api/upload/body`
   - Not absolute URLs: `http://localhost:3000/api/upload/body`

---

### 15. Deployment Issues

**For Vercel deployment:**

1. **Environment variables:**
   - Add all `.env.local` variables to Vercel dashboard
   - Update `NEXTAUTH_URL` to your production URL

2. **Database:**
   - Use cloud database (Supabase/Neon)
   - Don't use localhost URLs

3. **Build errors:**
   - Check build logs in Vercel
   - Ensure all dependencies are in `package.json`

---

## Quick Diagnostic Commands

```bash
# Check if everything is installed
npm list --depth=0

# Verify Prisma client
npx prisma --version

# Test database connection
npx prisma db pull --preview-feature

# Check TypeScript
npx tsc --noEmit

# Test build
npm run build
```

---

## Getting Help

1. **Check the logs:**
   - Browser console for frontend errors
   - Terminal for backend errors
   - Network tab for API issues

2. **Use Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   View and edit your database directly

3. **Test API endpoints:**
   Use curl or Postman to test individual endpoints

4. **Check documentation:**
   - README.md for setup
   - API_SPECIFICATION.md for API details
   - SETUP_GUIDE.md for step-by-step instructions

---

## Still Having Issues?

If you're still stuck:

1. Check the error message carefully
2. Look for similar issues in the documentation
3. Try the diagnostic commands above
4. Create a minimal reproduction case
5. Check if it's a known issue with the dependencies

Remember: Most issues are related to environment setup, missing dependencies, or configuration problems. The code itself is tested and working!