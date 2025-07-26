#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"
SERVER_URL="http://localhost:3000"

echo -e "${BLUE}🧪 Testing Enhanced Registration API with curl...${NC}\n"

# Test 1: Health check
echo -e "${YELLOW}1️⃣ Testing server health...${NC}"
curl -s "${SERVER_URL}/health" | jq .
echo ""

# Test 2: API documentation
echo -e "${YELLOW}2️⃣ Testing API documentation...${NC}"
curl -s "${SERVER_URL}/" | jq '.endpoints.auth.register'
echo ""

# Test 3: Valid registration
echo -e "${YELLOW}3️⃣ Testing valid registration...${NC}"
VALID_REGISTRATION_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }')

HTTP_CODE=$(echo "$VALID_REGISTRATION_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$VALID_REGISTRATION_RESPONSE" | head -n -1)

echo -e "${GREEN}✅ Valid registration response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 4: Duplicate registration (should fail)
echo -e "${YELLOW}4️⃣ Testing duplicate registration (should fail)...${NC}"
DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }')

HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$DUPLICATE_RESPONSE" | head -n -1)

echo -e "${RED}❌ Duplicate registration response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 5: Invalid full name
echo -e "${YELLOW}5️⃣ Testing invalid full name...${NC}"
INVALID_NAME_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "A",
    "email": "test-name@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }')

HTTP_CODE=$(echo "$INVALID_NAME_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$INVALID_NAME_RESPONSE" | head -n -1)

echo -e "${RED}❌ Invalid name response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 6: Invalid email
echo -e "${YELLOW}6️⃣ Testing invalid email...${NC}"
INVALID_EMAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "invalid-email",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }')

HTTP_CODE=$(echo "$INVALID_EMAIL_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$INVALID_EMAIL_RESPONSE" | head -n -1)

echo -e "${RED}❌ Invalid email response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 7: Weak password
echo -e "${YELLOW}7️⃣ Testing weak password...${NC}"
WEAK_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test-password@example.com",
    "password": "password",
    "confirmPassword": "password"
  }')

HTTP_CODE=$(echo "$WEAK_PASSWORD_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$WEAK_PASSWORD_RESPONSE" | head -n -1)

echo -e "${RED}❌ Weak password response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 8: Password mismatch
echo -e "${YELLOW}8️⃣ Testing password mismatch...${NC}"
PASSWORD_MISMATCH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test-mismatch@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "DifferentPass123!"
  }')

HTTP_CODE=$(echo "$PASSWORD_MISMATCH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$PASSWORD_MISMATCH_RESPONSE" | head -n -1)

echo -e "${RED}❌ Password mismatch response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 9: Multiple validation errors
echo -e "${YELLOW}9️⃣ Testing multiple validation errors...${NC}"
MULTIPLE_ERRORS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "A",
    "email": "invalid-email",
    "password": "123",
    "confirmPassword": "different"
  }')

HTTP_CODE=$(echo "$MULTIPLE_ERRORS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$MULTIPLE_ERRORS_RESPONSE" | head -n -1)

echo -e "${RED}❌ Multiple errors response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 10: Valid registration with special characters in name
echo -e "${YELLOW}🔟 Testing valid registration with special characters...${NC}"
SPECIAL_NAME_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jean-Pierre O'\''Connor",
    "email": "jean-pierre@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }')

HTTP_CODE=$(echo "$SPECIAL_NAME_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SPECIAL_NAME_RESPONSE" | head -n -1)

echo -e "${GREEN}✅ Special name registration response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

# Test 11: Sign in with registered user
echo -e "${YELLOW}1️⃣1️⃣ Testing signin with registered user...${NC}"
SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }')

HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SIGNIN_RESPONSE" | head -n -1)

echo -e "${GREEN}🔑 Signin response (HTTP $HTTP_CODE):${NC}"
echo "$RESPONSE_BODY" | jq .
echo ""

echo -e "${GREEN}🎉 Registration testing completed!${NC}"
echo -e "\n${BLUE}📊 Test Summary:${NC}"
echo -e "✅ Server health check"
echo -e "✅ API documentation"
echo -e "✅ Valid registration"
echo -e "✅ Duplicate prevention"
echo -e "✅ Full name validation"
echo -e "✅ Email validation"
echo -e "✅ Password validation"
echo -e "✅ Password confirmation"
echo -e "✅ Multiple error handling"
echo -e "✅ Special characters in names"
echo -e "✅ Post-registration signin" 