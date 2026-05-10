# Database Setup Guide

## Issue: Database Connection Error

You're getting this error because the `DATABASE_URL` in `.env.local` needs proper credentials.

## Quick Fix Options

### Option 1: Use Supabase (Recommended - Free & Easy)

1. **Sign up at [supabase.com](https://supabase.com)**

2. **Create a new project**
   - Choose a project name
   - Set a database password (save this!)
   - Select a region close to you

3. **Get your connection string**
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Copy the "URI" format
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

4. **Update `.env.local`**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres"
   ```
   Replace `[YOUR-PASSWORD]` with your actual password

5. **Push the schema**
   ```bash
   npx prisma db push
   ```

### Option 2: Use Neon (Also Free)

1. **Sign up at [neon.tech](https://neon.tech)**

2. **Create a new project**

3. **Copy the connection string** from the dashboard

4. **Update `.env.local`**
   ```env
   DATABASE_URL="your-neon-connection-string"
   ```

5. **Push the schema**
   ```bash
   npx prisma db push
   ```

### Option 3: Local PostgreSQL

If you want to use local PostgreSQL:

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. **Create a database**
   ```bash
   createdb virtual_tryon
   ```

3. **Update `.env.local`**
   ```env
   DATABASE_URL="postgresql://localhost:5432/virtual_tryon"
   ```
   
   Or with username:
   ```env
   DATABASE_URL="postgresql://your_username@localhost:5432/virtual_tryon"
   ```

4. **Push the schema**
   ```bash
   npx prisma db push
   ```

## After Setting Up Database

Once your database is connected:

1. **Verify connection**
   ```bash
   npx prisma db push
   ```
   
   You should see:
   ```
   ✔ Your database is now in sync with your Prisma schema.
   ```

2. **Open Prisma Studio** (optional - to view your database)
   ```bash
   npx prisma studio
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Visit** [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Error: "User was denied access"
- Check your database password is correct
- Ensure the connection string format is correct
- For Supabase/Neon, make sure you copied the full connection string

### Error: "Can't reach database server"
- For local PostgreSQL: Check if it's running with `brew services list`
- For cloud databases: Check your internet connection
- Verify the host and port are correct

### Error: "Database does not exist"
- For local PostgreSQL: Create the database with `createdb virtual_tryon`
- For cloud databases: The database should be created automatically

## Recommended: Use Supabase

For your final year project, I recommend Supabase because:
- ✅ Free tier is generous
- ✅ No credit card required
- ✅ Easy setup (5 minutes)
- ✅ Includes database GUI
- ✅ Automatic backups
- ✅ Works from anywhere (no localhost issues)

## Next Steps

After database is connected:

1. ✅ Prisma client is generated
2. ✅ Database schema is pushed
3. ✅ Run `npm run dev`
4. ✅ Visit http://localhost:3000
5. ✅ Start building frontend pages!

---

Need help? Check TROUBLESHOOTING.md for more solutions.