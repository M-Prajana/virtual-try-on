# Virtual Try-On Application - Setup Guide

This guide will help you set up and run the virtual try-on application on your local machine.

## ✅ What's Already Done

The following components have been implemented:

### Backend Infrastructure
- ✅ Next.js 14+ project with TypeScript
- ✅ PostgreSQL database schema with Prisma ORM
- ✅ NextAuth.js authentication system
- ✅ Cloudinary storage integration
- ✅ ML service with fallback mechanism (Mock → Hugging Face → Replicate)

### API Routes
- ✅ `/api/auth/register` - User registration
- ✅ `/api/auth/[...nextauth]` - Authentication handlers
- ✅ `/api/upload/body` - Body image upload
- ✅ `/api/upload/garment` - Garment image upload
- ✅ `/api/try-on` - Try-on processing
- ✅ `/api/try-on/[id]` - Get/delete try-on result
- ✅ `/api/favorites` - Manage favorites
- ✅ `/api/dashboard/stats` - Dashboard statistics

### Pages
- ✅ Landing page with features showcase
- ⏳ Login page (needs to be created)
- ⏳ Register page (needs to be created)
- ⏳ Try-on interface (needs to be created)
- ⏳ Dashboard (needs to be created)
- ⏳ History page (needs to be created)
- ⏳ Favorites page (needs to be created)

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Database

**Option A: Use Supabase (Recommended - Free)**

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (URI format)
5. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
   ```

**Option B: Local PostgreSQL**

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14
createdb virtual_tryon

# Update .env.local
DATABASE_URL="postgresql://localhost:5432/virtual_tryon"
```

### Step 3: Set Up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (Free tier: 25GB)
2. Go to Dashboard
3. Copy your credentials
4. Update `.env.local`:
   ```env
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

### Step 4: Generate NextAuth Secret

```bash
# Generate a random secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="paste-generated-secret-here"
```

### Step 5: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 6: Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎨 Next Steps: Building the Frontend

The backend is complete! Now you need to create the frontend pages. Here's what's needed:

### 1. Authentication Pages

Create these files:

**`src/app/(auth)/login/page.tsx`**
- Login form with email and password
- Link to register page
- Use NextAuth signIn function

**`src/app/(auth)/register/page.tsx`**
- Registration form
- Call `/api/auth/register`
- Redirect to login after success

### 2. Try-On Interface

**`src/app/try-on/page.tsx`**
- Upload body image component
- Upload garment image component
- Preview both images
- "Try On" button
- Display processing status
- Show result when complete

### 3. Dashboard

**`src/app/(dashboard)/dashboard/page.tsx`**
- Display statistics from `/api/dashboard/stats`
- Recent try-ons list
- Quick actions (new try-on, view history)

**`src/app/(dashboard)/history/page.tsx`**
- List all try-on results
- Filter by status
- Pagination
- Delete functionality

**`src/app/(dashboard)/favorites/page.tsx`**
- Display favorite try-ons
- Remove from favorites option

## 📦 Recommended UI Components

You can use these libraries to speed up development:

### Option 1: shadcn/ui (Recommended)

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label dialog
```

### Option 2: Build Custom Components

Use the utility functions already created in `src/lib/utils.ts`

## 🧪 Testing the Backend

You can test the API endpoints using curl or Postman:

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Upload Body Image

```bash
curl -X POST http://localhost:3000/api/upload/body \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

## 🔧 Development Tips

### 1. Use Prisma Studio

View and edit your database:

```bash
npx prisma studio
```

### 2. Check Logs

The application logs important information:
- API requests and responses
- ML service status
- Error messages

### 3. Mock ML Service

The app is configured to use mock ML service by default:
- Returns results instantly
- No API costs
- Perfect for development

When ready to use real ML models:
1. Get API keys from Hugging Face or Replicate
2. Update `.env.local`
3. Set `USE_MOCK_ML=false`

## 📝 Environment Variables Checklist

Make sure these are set in `.env.local`:

- [x] `DATABASE_URL` - PostgreSQL connection string
- [x] `NEXTAUTH_URL` - http://localhost:3000
- [x] `NEXTAUTH_SECRET` - Random secret key
- [x] `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- [x] `CLOUDINARY_API_KEY` - Your Cloudinary API key
- [x] `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- [x] `USE_MOCK_ML=true` - Use mock ML service
- [ ] `HUGGINGFACE_API_KEY` - (Optional, for later)
- [ ] `REPLICATE_API_TOKEN` - (Optional, for later)

## 🐛 Common Issues

### Issue: Prisma Client Not Found

```bash
npx prisma generate
```

### Issue: Database Connection Failed

Check your `DATABASE_URL` is correct and the database is running.

### Issue: NextAuth Error

Make sure `NEXTAUTH_SECRET` is set in `.env.local`

### Issue: Image Upload Fails

1. Check Cloudinary credentials
2. Verify file size is under 10MB
3. Check file format (JPEG, PNG, WebP only)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Project Status

### Completed ✅
- Project setup and configuration
- Database schema and models
- Authentication system
- All API endpoints
- ML service integration
- Storage configuration
- Landing page
- Documentation

### In Progress 🚧
- Frontend pages (login, register, try-on, dashboard)
- UI components
- Image upload components
- Results display

### Planned 📋
- Error handling improvements
- Loading states
- Rate limiting
- Analytics
- Testing

## 💡 Tips for Success

1. **Start with Authentication**: Build login/register pages first
2. **Test Each Feature**: Use Prisma Studio to verify data
3. **Use Mock ML**: Don't worry about real ML models initially
4. **Responsive Design**: Use Tailwind's responsive classes
5. **Error Handling**: Add try-catch blocks and user feedback
6. **Git Commits**: Commit after each feature

## 🤝 Need Help?

- Check the [README.md](./README.md) for detailed information
- Review [API_SPECIFICATION.md](./API_SPECIFICATION.md) for API details
- Look at [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) for architecture

---

Good luck with your final year project! 🚀