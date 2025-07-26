# 🚀 Setup Guide for Cool Auth API

Follow this guide to get your authentication system up and running!

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or pnpm package manager

## 🔧 Step-by-Step Setup

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_URI=postgresql://username:password@localhost:5432/your_database_name

# JWT Configuration (for better-auth)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Optional: Arcjet Security (if you want to add rate limiting)
ARCJET_KEY=your-arcjet-key
ARCJET_ENV=development

# Optional: QStash Queue System (if you want to add email verification)
QSTASH_URI=https://qstash.upstash.io
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-current-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE auth_db;
CREATE USER auth_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;
\q

# Update your .env file with the correct DB_URI
DB_URI=postgresql://auth_user:your_password@localhost:5432/auth_db
```

#### Option B: Cloud Database (Recommended)
- **Neon**: https://neon.tech (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)

### 3. Install Dependencies

```bash
# Install all dependencies
npm install

# Or if using pnpm
pnpm install
```

### 4. Database Migrations

```bash
# Generate and run migrations
npx drizzle-kit push
```

### 5. Start the Server

```bash
# Development mode with hot reload
npm run dev

# Or production build
npm run build:prod
npm start
```

## 🧪 Testing Your Setup

### Quick Test
```bash
# Test if server is running
curl http://localhost:3000/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### Full Test Suite
```bash
# Run the automated test suite
./test-auth.sh

# Or use the Node.js version
node test-auth.js
```

## 🔍 Verification Checklist

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Health endpoint responds
- [ ] API documentation loads
- [ ] User signup works
- [ ] User signin works
- [ ] Session management works
- [ ] User signout works
- [ ] Input validation works

## 🐛 Common Issues & Solutions

### Issue 1: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in `.env`
- Ensure database exists: `psql -U username -d database_name`

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Issue 3: Better-Auth Configuration Error
```
Error: Missing required configuration
```

**Solution:**
- Check all required environment variables are set
- Verify JWT_SECRET is long and random
- Ensure DB_URI is correct

### Issue 4: Migration Errors
```
Error: relation "users" does not exist
```

**Solution:**
```bash
# Run migrations
npx drizzle-kit push

# Check migration status
npx drizzle-kit studio
```

## 🎯 Next Steps

After successful setup:

1. **Test the API** using the testing guide
2. **Customize the configuration** for your needs
3. **Add additional features** like email verification
4. **Deploy to production** when ready

## 📚 Additional Resources

- [Better-Auth Documentation](https://better-auth.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Express.js Documentation](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure database is accessible and migrations are run
5. Check the testing guide for verification steps

Happy coding! 🚀 