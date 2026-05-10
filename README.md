# Virtual Try-On Application

An AI-powered virtual try-on application that allows users to upload their body picture and garment images to generate realistic try-on results using machine learning models.

## 🌟 Features

- **User Authentication**: Secure registration and login system
- **Image Upload**: Upload body and garment images with validation
- **AI-Powered Try-On**: Generate realistic virtual try-on results
- **Multiple ML Models**: Fallback system (Hugging Face → Replicate → Mock)
- **User Dashboard**: View statistics and manage try-on history
- **Favorites**: Save and organize favorite try-on results
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend/Backend**: Next.js 14+ with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Storage**: Cloudinary (free tier)
- **ML Models**: IDM-VTON via Hugging Face/Replicate APIs
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL 14+ (or use a cloud service like Supabase/Neon)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd final_year
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database - Update with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/virtual_tryon"

# NextAuth - Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary - Sign up at cloudinary.com
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ML Models (Keep commented until ready)
# HUGGINGFACE_API_KEY="your-hf-key"
# REPLICATE_API_TOKEN="your-replicate-token"

# Feature Flags
USE_MOCK_ML=true
ENABLE_HUGGINGFACE=false
ENABLE_REPLICATE=false
```

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
final_year/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── upload/        # Image upload endpoints
│   │   │   ├── try-on/        # Try-on processing endpoints
│   │   │   ├── favorites/     # Favorites management
│   │   │   └── dashboard/     # Dashboard statistics
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── try-on/            # Try-on interface
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   │   ├── db.ts             # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── storage.ts        # Cloudinary config
│   │   └── utils.ts          # Helper functions
│   ├── services/             # Business logic
│   │   └── ml-service.ts     # ML model integration
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS config
└── tsconfig.json            # TypeScript config
```

## 🔧 Configuration

### Database Setup

#### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb virtual_tryon
```

#### Option 2: Cloud Database (Recommended)

**Supabase** (Free tier):
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings → Database
4. Update `DATABASE_URL` in `.env.local`

**Neon** (Free tier):
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in `.env.local`

### Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Free tier includes: 25GB storage, 25GB bandwidth/month
3. Get credentials from Dashboard → Settings → Access Keys
4. Update `.env.local` with your credentials

### ML Model Integration

The application uses a fallback mechanism for ML models:

1. **Mock Service** (Default for development)
   - No API key required
   - Returns placeholder results
   - Perfect for testing UI/UX

2. **Hugging Face API** (Primary)
   - Sign up at [huggingface.co](https://huggingface.co)
   - Get API token from Settings → Access Tokens
   - Uncomment `HUGGINGFACE_API_KEY` in `.env.local`
   - Set `ENABLE_HUGGINGFACE=true`

3. **Replicate API** (Fallback)
   - Sign up at [replicate.com](https://replicate.com)
   - Get API token from Account Settings
   - Uncomment `REPLICATE_API_TOKEN` in `.env.local`
   - Set `ENABLE_REPLICATE=true`

## 📝 Usage

### For Users

1. **Register/Login**: Create an account or sign in
2. **Upload Body Image**: Go to Try-On page and upload your photo
3. **Upload Garment Image**: Upload the clothing item you want to try
4. **Generate Try-On**: Click "Try On" and wait for processing
5. **View Results**: See the generated image and download if desired
6. **Manage History**: View all your try-ons in the Dashboard

### For Developers

#### Running Tests

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

#### Database Migrations

```bash
# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

#### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Sign up at [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- ML API keys (when ready to use)

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for session management
- CSRF protection enabled
- Input validation on all endpoints
- File upload validation (type, size)
- SQL injection prevention via Prisma

## 🎯 Roadmap

- [ ] Multiple garment try-on in single image
- [ ] 360-degree view support
- [ ] Size recommendation system
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] AR try-on using device camera
- [ ] Garment marketplace integration

## 🐛 Troubleshooting

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

# Clear cache and reinstall
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

## 📚 API Documentation

See [API_SPECIFICATION.md](./API_SPECIFICATION.md) for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [IDM-VTON](https://huggingface.co/spaces/yisol/IDM-VTON) for the ML model
- [Next.js](https://nextjs.org/) for the framework
- [Prisma](https://www.prisma.io/) for database ORM
- [Cloudinary](https://cloudinary.com/) for image storage

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ for your final year project