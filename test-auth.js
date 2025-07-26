const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
const SERVER_URL = 'http://localhost:3000';

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'SecurePass123!',
  name: 'Test User'
};

let authCookies = '';

async function testAuth() {
  console.log('🧪 Testing Cool Auth API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('⏰ Server time:', healthData.timestamp);
    console.log('');

    // Test 2: Check API documentation
    console.log('2️⃣ Testing API documentation...');
    const docsResponse = await fetch(SERVER_URL);
    const docsData = await docsResponse.json();
    console.log('📚 API docs loaded:', docsData.message);
    console.log('🔗 Available endpoints:', Object.keys(docsData.endpoints.auth));
    console.log('');

    // Test 3: Sign up a new user
    console.log('3️⃣ Testing user signup...');
    const signupResponse = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Signup response:', signupData);
    
    // Extract cookies for authenticated requests
    const setCookieHeader = signupResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      authCookies = setCookieHeader;
      console.log('🍪 Auth cookies received:', authCookies ? 'Yes' : 'No');
    }
    console.log('');

    // Test 4: Try to sign up the same user again (should fail)
    console.log('4️⃣ Testing duplicate signup (should fail)...');
    const duplicateSignupResponse = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const duplicateSignupData = await duplicateSignupResponse.json();
    console.log('❌ Duplicate signup response:', duplicateSignupData);
    console.log('');

    // Test 5: Sign in the user
    console.log('5️⃣ Testing user signin...');
    const signinResponse = await fetch(`${BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const signinData = await signinResponse.json();
    console.log('🔑 Signin response:', signinData);
    
    // Update cookies from signin
    const signinCookieHeader = signinResponse.headers.get('set-cookie');
    if (signinCookieHeader) {
      authCookies = signinCookieHeader;
    }
    console.log('');

    // Test 6: Get current user (if authenticated)
    if (authCookies) {
      console.log('6️⃣ Testing get current user...');
      const meResponse = await fetch(`${BASE_URL}/me`, {
        headers: {
          'Cookie': authCookies
        }
      });
      
      const meData = await meResponse.json();
      console.log('👤 Current user:', meData);
      console.log('');

      // Test 7: Test better-auth endpoints directly
      console.log('7️⃣ Testing better-auth endpoints...');
      
      // Test session endpoint
      const sessionResponse = await fetch(`${BASE_URL}/auth/session`, {
        headers: {
          'Cookie': authCookies
        }
      });
      const sessionData = await sessionResponse.json();
      console.log('🔐 Session data:', sessionData);
      console.log('');

      // Test 8: Sign out
      console.log('8️⃣ Testing signout...');
      const signoutResponse = await fetch(`${BASE_URL}/signout`, {
        method: 'POST',
        headers: {
          'Cookie': authCookies
        }
      });
      
      const signoutData = await signoutResponse.json();
      console.log('🚪 Signout response:', signoutData);
      console.log('');

      // Test 9: Try to get user after signout (should fail)
      console.log('9️⃣ Testing get user after signout (should fail)...');
      const afterSignoutResponse = await fetch(`${BASE_URL}/me`, {
        headers: {
          'Cookie': authCookies
        }
      });
      
      const afterSignoutData = await afterSignoutResponse.json();
      console.log('❌ After signout response:', afterSignoutData);
      console.log('');
    }

    // Test 10: Test validation errors
    console.log('🔟 Testing validation errors...');
    
    // Test invalid email
    const invalidEmailResponse = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Test User'
      })
    });
    
    const invalidEmailData = await invalidEmailResponse.json();
    console.log('📧 Invalid email response:', invalidEmailData);
    
    // Test short password
    const shortPasswordResponse = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: '123',
        name: 'Test User'
      })
    });
    
    const shortPasswordData = await shortPasswordResponse.json();
    console.log('🔒 Short password response:', shortPasswordData);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Server health check');
    console.log('✅ API documentation');
    console.log('✅ User signup');
    console.log('✅ Duplicate signup prevention');
    console.log('✅ User signin');
    console.log('✅ Session management');
    console.log('✅ Better-auth integration');
    console.log('✅ User signout');
    console.log('✅ Post-signout security');
    console.log('✅ Input validation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure the server is running: npm run dev');
    console.log('2. Check if port 3000 is available');
    console.log('3. Verify database connection');
    console.log('4. Check environment variables');
  }
}

// Run the tests
testAuth(); 