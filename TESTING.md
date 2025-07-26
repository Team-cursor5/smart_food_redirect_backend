# 🧪 Testing Guide for Cool Auth API

This guide will help you test the authentication system to ensure everything works correctly.

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run dev
```

### 2. Run Database Migrations
```bash
npx drizzle-kit push
```

### 3. Test the API

Choose one of these testing methods:

## 📋 Testing Methods

### Method 1: Automated Testing (Recommended)

#### Option A: Node.js Test Script
```bash
# Install node-fetch if not already installed
npm install node-fetch@2

# Run the test
node test-auth.js
```

#### Option B: Bash Test Script
```bash
# Make sure you have jq installed for JSON formatting
sudo apt install jq  # Ubuntu/Debian
# or
brew install jq      # macOS

# Run the test
./test-auth.sh
```

### Method 2: Manual Testing with curl

#### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

#### Test 2: API Documentation
```bash
curl http://localhost:3000/
```

#### Test 3: User Signup
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

#### Test 4: User Signin
```bash
curl -X POST http://localhost:3000/api/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

#### Test 5: Get Current User (with cookies)
```bash
# First signin to get cookies
curl -c cookies.txt -X POST http://localhost:3000/api/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Then get user info
curl -b cookies.txt http://localhost:3000/api/me
```

#### Test 6: Signout
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/signout
```

### Method 3: Browser Testing

1. Open your browser and go to `http://localhost:3000`
2. You'll see the API documentation
3. Use browser dev tools or Postman to test the endpoints

## 🧪 What the Tests Check

### ✅ Core Functionality
- [ ] Server health and uptime
- [ ] API documentation loading
- [ ] User registration (signup)
- [ ] User authentication (signin)
- [ ] Session management
- [ ] User logout (signout)
- [ ] Current user retrieval

### ✅ Security Features
- [ ] Duplicate email prevention
- [ ] Input validation (email format, password length)
- [ ] Cookie-based session management
- [ ] Post-logout security (can't access protected routes)

### ✅ Better-Auth Integration
- [ ] Direct better-auth endpoints (`/api/auth/*`)
- [ ] Session data retrieval
- [ ] Proper error handling
- [ ] Cookie management

## 🔍 Expected Results

### Successful Signup
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "emailVerified": false
  }
}
```

### Successful Signin
```json
{
  "success": true,
  "message": "Signed in successfully",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Current User (when authenticated)
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Validation Error (invalid email)
```json
{
  "success": false,
  "message": "Invalid email format",
  "errors": {
    "email": "Please enter a valid email address"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

#### 2. Database connection error
```bash
# Check your .env file has DB_URI
cat .env | grep DB_URI

# Run migrations
npx drizzle-kit push
```

#### 3. Better-auth errors
```bash
# Check better-auth version
npm list better-auth

# Reinstall if needed
npm install better-auth@latest
```

#### 4. Test script errors
```bash
# For node-fetch errors
npm install node-fetch@2

# For jq errors (bash script)
sudo apt install jq
```

### Debug Mode

Enable debug logging by setting environment variables:
```bash
export DEBUG=better-auth:*
npm run dev
```

## 📊 Test Results Interpretation

### ✅ All Tests Pass
Your authentication system is working perfectly!

### ⚠️ Some Tests Fail
- Check the error messages for specific issues
- Verify database connection
- Check environment variables
- Review server logs

### ❌ Most Tests Fail
- Server might not be running
- Database might not be connected
- Environment variables might be missing
- Better-auth configuration might be incorrect

## 🎯 Next Steps

After successful testing:

1. **Add more features**:
   - Email verification
   - Password reset
   - OAuth providers
   - Two-factor authentication

2. **Enhance security**:
   - Rate limiting
   - CSRF protection
   - Input sanitization

3. **Improve UX**:
   - Better error messages
   - User profile management
   - Account deletion

4. **Production deployment**:
   - Environment configuration
   - SSL/TLS setup
   - Monitoring and logging

## 🆘 Need Help?

If you encounter issues:

1. Check the server logs for error messages
2. Verify all environment variables are set
3. Ensure database is running and accessible
4. Check better-auth documentation for configuration issues
5. Review the troubleshooting section above

Happy testing! 🚀 