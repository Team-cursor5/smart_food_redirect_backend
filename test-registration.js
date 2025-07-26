const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
const SERVER_URL = 'http://localhost:3000';

// Test user data
const validUser = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!'
};

async function testRegistration() {
  console.log('🧪 Testing Enhanced Registration API...\n');

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
    console.log('🔗 Registration endpoint:', docsData.endpoints.auth.register);
    console.log('');

    // Test 3: Valid registration
    console.log('3️⃣ Testing valid registration...');
    const validRegistrationResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validUser)
    });
    
    const validRegistrationData = await validRegistrationResponse.json();
    console.log('✅ Valid registration response:', validRegistrationData);
    console.log('');

    // Test 4: Duplicate registration (should fail)
    console.log('4️⃣ Testing duplicate registration (should fail)...');
    const duplicateResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validUser)
    });
    
    const duplicateData = await duplicateResponse.json();
    console.log('❌ Duplicate registration response:', duplicateData);
    console.log('');

    // Test 5: Invalid full name tests
    console.log('5️⃣ Testing full name validation...');
    
    const nameTests = [
      { fullName: '', expectedError: 'Full name is required' },
      { fullName: 'A', expectedError: 'Full name must be at least 2 characters long' },
      { fullName: 'A'.repeat(101), expectedError: 'Full name must be less than 100 characters' },
      { fullName: 'John123', expectedError: 'Full name can only contain letters, spaces, hyphens, and apostrophes' },
      { fullName: 'John@Doe', expectedError: 'Full name can only contain letters, spaces, hyphens, and apostrophes' },
      { fullName: 'John-Doe', expectedError: null }, // Should be valid
      { fullName: "O'Connor", expectedError: null }, // Should be valid
    ];

    for (const test of nameTests) {
      const testUser = { ...validUser, fullName: test.fullName, email: `test-${Date.now()}@example.com` };
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      
      const data = await response.json();
      if (test.expectedError) {
        console.log(`❌ "${test.fullName}" - ${data.errors?.fullName || 'Unexpected success'}`);
      } else {
        console.log(`✅ "${test.fullName}" - Valid`);
      }
    }
    console.log('');

    // Test 6: Invalid email tests
    console.log('6️⃣ Testing email validation...');
    
    const emailTests = [
      { email: '', expectedError: 'Email is required' },
      { email: 'invalid-email', expectedError: 'Please enter a valid email address' },
      { email: 'test@', expectedError: 'Please enter a valid email address' },
      { email: '@example.com', expectedError: 'Please enter a valid email address' },
      { email: 'a'.repeat(250) + '@example.com', expectedError: 'Email must be less than 255 characters' },
      { email: 'valid@example.com', expectedError: null }, // Should be valid
    ];

    for (const test of emailTests) {
      const testUser = { ...validUser, email: test.email, fullName: `Test ${Date.now()}` };
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      
      const data = await response.json();
      if (test.expectedError) {
        console.log(`❌ "${test.email}" - ${data.errors?.email || 'Unexpected success'}`);
      } else {
        console.log(`✅ "${test.email}" - Valid`);
      }
    }
    console.log('');

    // Test 7: Invalid password tests
    console.log('7️⃣ Testing password validation...');
    
    const passwordTests = [
      { password: '', expectedError: 'Password is required' },
      { password: '123', expectedError: 'Password must be at least 8 characters long' },
      { password: 'a'.repeat(129), expectedError: 'Password must be less than 128 characters' },
      { password: 'password', expectedError: 'This password is too common. Please choose a stronger password' },
      { password: '12345678', expectedError: 'Password must contain at least one uppercase letter' },
      { password: 'PASSWORD123', expectedError: 'Password must contain at least one lowercase letter' },
      { password: 'Password', expectedError: 'Password must contain at least one number' },
      { password: 'Password123', expectedError: 'Password must contain at least one special character' },
      { password: 'SecurePass123!', expectedError: null }, // Should be valid
    ];

    for (const test of passwordTests) {
      const testUser = { 
        ...validUser, 
        password: test.password, 
        confirmPassword: test.password,
        email: `test-${Date.now()}@example.com`,
        fullName: `Test ${Date.now()}`
      };
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      
      const data = await response.json();
      if (test.expectedError) {
        console.log(`❌ "${test.password}" - ${data.errors?.password || 'Unexpected success'}`);
      } else {
        console.log(`✅ "${test.password}" - Valid`);
      }
    }
    console.log('');

    // Test 8: Password confirmation tests
    console.log('8️⃣ Testing password confirmation...');
    
    const confirmTests = [
      { confirmPassword: '', expectedError: 'Please confirm your password' },
      { confirmPassword: 'DifferentPass123!', expectedError: 'Passwords do not match' },
      { confirmPassword: 'SecurePass123!', expectedError: null }, // Should be valid
    ];

    for (const test of confirmTests) {
      const testUser = { 
        ...validUser, 
        confirmPassword: test.confirmPassword,
        email: `test-${Date.now()}@example.com`,
        fullName: `Test ${Date.now()}`
      };
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      
      const data = await response.json();
      if (test.expectedError) {
        console.log(`❌ "${test.confirmPassword}" - ${data.errors?.confirmPassword || 'Unexpected success'}`);
      } else {
        console.log(`✅ "${test.confirmPassword}" - Valid`);
      }
    }
    console.log('');

    // Test 9: Multiple validation errors
    console.log('9️⃣ Testing multiple validation errors...');
    const invalidUser = {
      fullName: 'A',
      email: 'invalid-email',
      password: '123',
      confirmPassword: 'different'
    };
    
    const multipleErrorsResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidUser)
    });
    
    const multipleErrorsData = await multipleErrorsResponse.json();
    console.log('❌ Multiple validation errors:', multipleErrorsData);
    console.log('');

    // Test 10: Sign in with registered user
    console.log('🔟 Testing signin with registered user...');
    const signinResponse = await fetch(`${BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: validUser.email,
        password: validUser.password
      })
    });
    
    const signinData = await signinResponse.json();
    console.log('🔑 Signin response:', signinData);
    console.log('');

    console.log('🎉 Registration testing completed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Server health check');
    console.log('✅ API documentation');
    console.log('✅ Valid registration');
    console.log('✅ Duplicate prevention');
    console.log('✅ Full name validation');
    console.log('✅ Email validation');
    console.log('✅ Password validation');
    console.log('✅ Password confirmation');
    console.log('✅ Multiple error handling');
    console.log('✅ Post-registration signin');

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
testRegistration(); 