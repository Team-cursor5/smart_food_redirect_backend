const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5500/api';
const SERVER_URL = 'http://localhost:5500';

async function testBetterAuthEndpoints() {
  console.log('🔍 Testing Better-Auth Endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('');

    // Test 2: Check API documentation
    console.log('2️⃣ Testing API documentation...');
    const docsResponse = await fetch(SERVER_URL);
    const docsData = await docsResponse.json();
    console.log('📚 API docs loaded:', docsData.message);
    console.log('');

    // Test 3: Test different better-auth endpoints
    console.log('3️⃣ Testing better-auth endpoints...');
    
    const endpoints = [
      '/auth/signup',
      '/auth/signin',
      '/auth/signout',
      '/auth/session',
      '/auth/user',
      '/auth/email-password/signup',
      '/auth/email-and-password/signup',
      '/auth/email-password/signin',
      '/auth/email-and-password/signin'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Testing: ${endpoint}`);
        
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status !== 404) {
          const responseText = await response.text();
          console.log(`   Response: ${responseText.substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Test 4: Test POST to signup endpoint
    console.log('\n4️⃣ Testing POST to signup endpoint...');
    
    const signupEndpoints = [
      '/auth/signup',
      '/auth/email-password/signup',
      '/auth/email-and-password/signup'
    ];

    for (const endpoint of signupEndpoints) {
      try {
        console.log(`\n🔍 Testing POST: ${endpoint}`);
        
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'TestPass123!',
            name: 'Test User'
          })
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status !== 404) {
          const responseText = await response.text();
          console.log(`   Response: ${responseText.substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Test 5: Test direct better-auth handler
    console.log('\n5️⃣ Testing direct better-auth handler...');
    
    try {
      const response = await fetch(`${BASE_URL}/auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      const responseText = await response.text();
      console.log(`   Response: ${responseText.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n🎉 Better-Auth endpoint testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on port 5500');
  }
}

// Run the tests
testBetterAuthEndpoints(); 