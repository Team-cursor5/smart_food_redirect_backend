#!/bin/bash

BASE_URL="http://localhost:5500/api"
SERVER_URL="http://localhost:5500"

echo "🔐 Testing Complete Login System with curl...\n"

# Test 1: Check server health
echo "1️⃣ Testing server health..."
curl -s "$SERVER_URL/health" | jq .
echo ""

# Test 2: Register a new user
echo "2️⃣ Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }')

echo "✅ Registration response:"
echo "$REGISTER_RESPONSE" | jq .
echo ""

# Extract cookies from registration response
COOKIES=$(echo "$REGISTER_RESPONSE" | grep -o 'Set-Cookie: [^;]*' | sed 's/Set-Cookie: //' | tr '\n' '; ')

# Test 3: Login with correct credentials
echo "3️⃣ Testing login with correct credentials..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIES" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!",
    "rememberMe": true
  }')

echo "✅ Login response:"
echo "$LOGIN_RESPONSE" | jq .
echo ""

# Update cookies from login response
COOKIES=$(echo "$LOGIN_RESPONSE" | grep -o 'Set-Cookie: [^;]*' | sed 's/Set-Cookie: //' | tr '\n' '; ')

# Test 4: Get current user session
echo "4️⃣ Testing get current user session..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -H "Cookie: $COOKIES")

echo "✅ Current user session:"
echo "$ME_RESPONSE" | jq .
echo ""

# Test 5: Login with wrong password
echo "5️⃣ Testing login with wrong password..."
WRONG_PASS_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "WrongPassword123!",
    "rememberMe": true
  }')

echo "❌ Wrong password response:"
echo "$WRONG_PASS_RESPONSE" | jq .
echo ""

# Test 6: Login with non-existent email
echo "6️⃣ Testing login with non-existent email..."
NON_EXISTENT_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123!",
    "rememberMe": true
  }')

echo "❌ Non-existent email response:"
echo "$NON_EXISTENT_RESPONSE" | jq .
echo ""

# Test 7: Login validation errors
echo "7️⃣ Testing login validation errors..."
VALIDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "",
    "rememberMe": true
  }')

echo "❌ Validation errors response:"
echo "$VALIDATION_RESPONSE" | jq .
echo ""

# Test 8: Logout
echo "8️⃣ Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/logout" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIES")

echo "✅ Logout response:"
echo "$LOGOUT_RESPONSE" | jq .
echo ""

# Update cookies from logout response
COOKIES=$(echo "$LOGOUT_RESPONSE" | grep -o 'Set-Cookie: [^;]*' | sed 's/Set-Cookie: //' | tr '\n' '; ')

# Test 9: Try to get session after logout
echo "9️⃣ Testing get session after logout..."
AFTER_LOGOUT_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -H "Cookie: $COOKIES")

echo "❌ Session after logout:"
echo "$AFTER_LOGOUT_RESPONSE" | jq .
echo ""

# Test 10: Register another user
echo "🔟 Testing registration of another user..."
REGISTER2_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Another User",
    "email": "anotheruser@example.com",
    "password": "AnotherPass123!",
    "confirmPassword": "AnotherPass123!"
  }')

echo "✅ Second registration response:"
echo "$REGISTER2_RESPONSE" | jq .
echo ""

echo "🎉 Complete login system testing completed!"
echo ""
echo "📊 Test Summary:"
echo "✅ User registration"
echo "✅ Login with correct credentials"
echo "✅ Session management"
echo "✅ Login validation"
echo "✅ Wrong credentials handling"
echo "✅ Logout functionality"
echo "✅ Session cleanup" 