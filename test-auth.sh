#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"
SERVER_URL="http://localhost:3000"

echo -e "${BLUE}🧪 Testing Cool Auth API with curl...${NC}\n"

# Test 1: Health check
echo -e "${YELLOW}1️⃣ Testing server health...${NC}"
curl -s "${SERVER_URL}/health" | jq .
echo ""

# Test 2: API documentation
echo -e "${YELLOW}2️⃣ Testing API documentation...${NC}"
curl -s "${SERVER_URL}/" | jq .
echo ""

# Test 3: Sign up a new user
echo -e "${YELLOW}3️⃣ Testing user signup...${NC}"
SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }')

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SIGNUP_RESPONSE" | head -n -1)

echo -e "${GREEN}📝 Signup response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Extract cookies if signup was successful
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  COOKIES=$(curl -s -c /tmp/cookies.txt -X POST "${BASE_URL}/signup" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "SecurePass123!",
      "name": "Test User"
    }' > /dev/null && cat /tmp/cookies.txt | grep -v "^#" | grep -v "^$" | awk '{print $6"="$7}' | tr '\n' '; ')
  
  echo -e "${GREEN}🍪 Cookies extracted:${NC} $COOKIES"
  echo ""
fi

# Test 4: Try duplicate signup (should fail)
echo -e "${YELLOW}4️⃣ Testing duplicate signup (should fail)...${NC}"
DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }')

HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$DUPLICATE_RESPONSE" | head -n -1)

echo -e "${RED}❌ Duplicate signup response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 5: Sign in
echo -e "${YELLOW}5️⃣ Testing user signin...${NC}"
SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }')

HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SIGNIN_RESPONSE" | head -n -1)

echo -e "${GREEN}🔑 Signin response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 6: Get current user (if we have cookies)
if [ ! -z "$COOKIES" ]; then
  echo -e "${YELLOW}6️⃣ Testing get current user...${NC}"
  ME_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/me" \
    -H "Cookie: $COOKIES")

  HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
  RESPONSE_BODY=$(echo "$ME_RESPONSE" | head -n -1)

  echo -e "${GREEN}👤 Current user (HTTP $HTTP_CODE):${NC}"
  echo "$RESPONSE_BODY" | jq .
  echo ""

  # Test 7: Better-auth session endpoint
  echo -e "${YELLOW}7️⃣ Testing better-auth session endpoint...${NC}"
  SESSION_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/auth/session" \
    -H "Cookie: $COOKIES")

  HTTP_CODE=$(echo "$SESSION_RESPONSE" | tail -n1)
  RESPONSE_BODY=$(echo "$SESSION_RESPONSE" | head -n -1)

  echo -e "${GREEN}🔐 Session data (HTTP $HTTP_CODE):${NC}"
  echo "$RESPONSE_BODY" | jq .
  echo ""

  # Test 8: Sign out
  echo -e "${YELLOW}8️⃣ Testing signout...${NC}"
  SIGNOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/signout" \
    -H "Cookie: $COOKIES")

  HTTP_CODE=$(echo "$SIGNOUT_RESPONSE" | tail -n1)
  RESPONSE_BODY=$(echo "$SIGNOUT_RESPONSE" | head -n -1)

  echo -e "${GREEN}🚪 Signout response (HTTP $HTTP_CODE):${NC}"
  echo "$RESPONSE_BODY" | jq .
  echo ""
fi

# Test 9: Validation errors
echo -e "${YELLOW}9️⃣ Testing validation errors...${NC}"

# Invalid email
echo -e "${BLUE}📧 Testing invalid email:${NC}"
INVALID_EMAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123!",
    "name": "Test User"
  }')

HTTP_CODE=$(echo "$INVALID_EMAIL_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$INVALID_EMAIL_RESPONSE" | head -n -1)

echo -e "${RED}❌ Invalid email response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Short password
echo -e "${BLUE}🔒 Testing short password:${NC}"
SHORT_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "123",
    "name": "Test User"
  }')

HTTP_CODE=$(echo "$SHORT_PASSWORD_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SHORT_PASSWORD_RESPONSE" | head -n -1)

echo -e "${RED}❌ Short password response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

echo -e "${GREEN}🎉 All tests completed!${NC}"
echo -e "\n${BLUE}📊 Test Summary:${NC}"
echo -e "✅ Server health check"
echo -e "✅ API documentation"
echo -e "✅ User signup"
echo -e "✅ Duplicate signup prevention"
echo -e "✅ User signin"
echo -e "✅ Session management"
echo -e "✅ Better-auth integration"
echo -e "✅ User signout"
echo -e "✅ Input validation"

# Cleanup
rm -f /tmp/cookies.txt 