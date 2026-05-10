# Virtual Try-On Application - Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL 14+ (or use a cloud service like Supabase/Neon)
- Git
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Initialize Next.js Project

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest virtual-tryon --typescript --tailwind --app --src-dir

# Navigate to project directory
cd virtual-tryon
```

When prompted, select:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ❌ Turbopack (optional)
- ✅ Import alias (@/*)

### 2. Install Core Dependencies

```bash
# Database & ORM
npm install @prisma/client
npm install -D prisma

# Authentication
npm install next-auth@beta
npm install bcryptjs
npm install -D @types/bcryptjs

# Form handling & validation
npm install react-hook-form zod @hookform/resolvers

# UI Components (shadcn/ui)
npx shadcn-ui@latest init

# Image handling
npm install sharp

# Cloud storage (Cloudinary)
npm install cloudinary

# HTTP client
npm install axios

# State management (optional)
npm install zustand

# Utilities
npm install clsx tailwind-merge
npm install date-fns
```

### 3. Set Up Prisma

```bash
# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env file
```

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  bodyImages    BodyImage[]
  garmentImages GarmentImage[]
  tryOnResults  TryOnResult[]
}

model BodyImage {
  id           String   @id @default(cuid())
  userId       String
  imageUrl     String
  cloudinaryId String
  metadata     Json?
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tryOnResults TryOnResult[]
  
  @@index([userId])
}

model GarmentImage {
  id           String   @id @default(cuid())
  userId       String
  imageUrl     String
  cloudinaryId String
  category     String?
  metadata     Json?
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tryOnResults TryOnResult[]
  
  @@index([userId])
}

model TryOnResult {
  id                 String   @id @default(cuid())
  userId             String
  bodyImageId        String
  garmentImageId     String
  resultUrl          String?
  status             String   @default("pending") // pending, processing, completed, failed
  modelUsed          String?  // huggingface, replicate, mock
  processingMetadata Json?
  isFavorite         Boolean  @default(false)
  createdAt          DateTime @default(now())
  
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  bodyImage      BodyImage     @relation(fields: [bodyImageId], references: [id], onDelete: Cascade)
  garmentImage   GarmentImage  @relation(fields: [garmentImageId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
}
```

### 4. Configure Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/virtual_tryon"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Cloudinary (Sign up at cloudinary.com for free tier)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ML Models (Keep commented until ready to use)
# HUGGINGFACE_API_KEY="your-hf-key"
# REPLICATE_API_TOKEN="your-replicate-token"

# Feature Flags
USE_MOCK_ML=true
ENABLE_HUGGINGFACE=false
ENABLE_REPLICATE=false
```

### 5. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 6. Set Up Project Structure

Create the following directory structure:

```bash
mkdir -p src/lib
mkdir -p src/services
mkdir -p src/components/ui
mkdir -p src/components/upload
mkdir -p src/components/preview
mkdir -p src/components/results
mkdir -p src/app/api/auth
mkdir -p src/app/api/upload
mkdir -p src/app/api/try-on
mkdir -p src/app/api/results
mkdir -p src/app/(auth)/login
mkdir -p src/app/(auth)/register
mkdir -p src/app/(dashboard)/dashboard
mkdir -p src/app/(dashboard)/history
mkdir -p src/app/(dashboard)/favorites
mkdir -p src/app/try-on
```

### 7. Install shadcn/ui Components

```bash
# Install commonly used components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add separator
```

### 8. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app.

## Development Workflow

### Phase 1: Authentication Setup
1. Configure NextAuth.js
2. Create login/register pages
3. Implement protected routes
4. Test authentication flow

### Phase 2: Image Upload
1. Create upload components
2. Integrate Cloudinary
3. Add image validation
4. Implement preview functionality

### Phase 3: Try-On Interface
1. Build try-on page UI
2. Create API routes
3. Implement mock ML service
4. Add processing status updates

### Phase 4: Results & Dashboard
1. Create results display page
2. Build user dashboard
3. Implement history view
4. Add favorites feature

### Phase 5: ML Integration (When Ready)
1. Uncomment Hugging Face integration
2. Uncomment Replicate integration
3. Test fallback mechanism
4. Monitor API usage

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma client

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check
```

## Free Tier Services Setup

### Cloudinary (Image Storage)
1. Sign up at https://cloudinary.com
2. Free tier: 25GB storage, 25GB bandwidth/month
3. Get credentials from dashboard
4. Add to `.env.local`

### Supabase (PostgreSQL Database)
1. Sign up at https://supabase.com
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in `.env.local`

### Vercel (Deployment)
1. Sign up at https://vercel.com
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically on push

### Hugging Face (ML Model - When Ready)
1. Sign up at https://huggingface.co
2. Get API token from settings
3. Free tier has rate limits
4. Uncomment in `.env.local` when ready

### Replicate (ML Model Fallback - When Ready)
1. Sign up at https://replicate.com
2. Get API token
3. Free tier includes monthly credits
4. Uncomment in `.env.local` when ready

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres

# Reset database
npx prisma db push --force-reset
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## Next Steps

1. ✅ Review the technical plan in `TECHNICAL_PLAN.md`
2. ✅ Complete the setup steps above
3. ✅ Start with Phase 1 (Authentication)
4. ✅ Build incrementally, testing each feature
5. ✅ Keep ML integration commented until app is working
6. ✅ Switch to Code mode when ready to implement

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [IDM-VTON Model](https://huggingface.co/spaces/yisol/IDM-VTON)
