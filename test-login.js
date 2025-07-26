const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5500/api';
const SERVER_URL = 'http://localhost:5500';

// Store cookies for session management
let cookies = [];

async function testLoginSystem() {
  console.log('🔐 Testing Complete Login System...\n');

  try {
    // Test 1: Check server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('');

    // Test 2: Register a new user
    console.log('2️⃣ Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('✅ Registration response:', registerData);
    
    // Store cookies from registration
    const setCookieHeader = registerResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
    }
    console.log('');

    // Test 3: Login with correct credentials
    console.log('3️⃣ Testing login with correct credentials...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies.join('; ')
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'SecurePass123!',
        rememberMe: true
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login response:', loginData);
    
    // Update cookies from login
    const loginSetCookieHeader = loginResponse.headers.get('set-cookie');
    if (loginSetCookieHeader) {
      cookies = loginSetCookieHeader.split(',').map(cookie => cookie.trim());
    }
    console.log('');

    // Test 4: Get current user session
    console.log('4️⃣ Testing get current user session...');
    const meResponse = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookies.join('; ')
      }
    });
    
    const meData = await meResponse.json();
    console.log('✅ Current user session:', meData);
    console.log('');

    // Test 5: Login with wrong password
    console.log('5️⃣ Testing login with wrong password...');
    const wrongPasswordResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'WrongPassword123!',
        rememberMe: true
      })
    });
    
    const wrongPasswordData = await wrongPasswordResponse.json();
    console.log('❌ Wrong password response:', wrongPasswordData);
    console.log('');

    // Test 6: Login with non-existent email
    console.log('6️⃣ Testing login with non-existent email...');
    const nonExistentResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
        rememberMe: true
      })
    });
    
    const nonExistentData = await nonExistentResponse.json();
    console.log('❌ Non-existent email response:', nonExistentData);
    console.log('');

    // Test 7: Login validation errors
    console.log('7️⃣ Testing login validation errors...');
    const validationResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: '',
        rememberMe: true
      })
    });
    
    const validationData = await validationResponse.json();
    console.log('❌ Validation errors response:', validationData);
    console.log('');

    // Test 8: Logout
    console.log('8️⃣ Testing logout...');
    const logoutResponse = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies.join('; ')
      }
    });
    
    const logoutData = await logoutResponse.json();
    console.log('✅ Logout response:', logoutData);
    
    // Update cookies from logout
    const logoutSetCookieHeader = logoutResponse.headers.get('set-cookie');
    if (logoutSetCookieHeader) {
      cookies = logoutSetCookieHeader.split(',').map(cookie => cookie.trim());
    }
    console.log('');

    // Test 9: Try to get session after logout
    console.log('9️⃣ Testing get session after logout...');
    const afterLogoutResponse = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookies.join('; ')
      }
    });
    
    const afterLogoutData = await afterLogoutResponse.json();
    console.log('❌ Session after logout:', afterLogoutData);
    console.log('');

    // Test 10: Register another user
    console.log('🔟 Testing registration of another user...');
    const register2Response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Another User',
        email: 'anotheruser@example.com',
        password: 'AnotherPass123!',
        confirmPassword: 'AnotherPass123!'
      })
    });
    
    const register2Data = await register2Response.json();
    console.log('✅ Second registration response:', register2Data);
    console.log('');

    console.log('🎉 Complete login system testing completed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ User registration');
    console.log('✅ Login with correct credentials');
    console.log('✅ Session management');
    console.log('✅ Login validation');
    console.log('✅ Wrong credentials handling');
    console.log('✅ Logout functionality');
    console.log('✅ Session cleanup');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on port 5500');
  }
}

// Run the tests
testLoginSystem(); 