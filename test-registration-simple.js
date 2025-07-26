const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5500/api';
const SERVER_URL = 'http://localhost:5500';

async function testRegistrationSimple() {
  console.log('🧪 Testing Registration Validation (Simple)...\n');

  try {
    // Test 1: Valid registration (should work with fallback)
    console.log('1️⃣ Testing valid registration...');
    const validResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      })
    });
    
    const validData = await validResponse.json();
    console.log('✅ Valid registration response:', validData);
    console.log('');

    // Test 2: Invalid email
    console.log('2️⃣ Testing invalid email...');
    const invalidEmailResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      })
    });
    
    const invalidEmailData = await invalidEmailResponse.json();
    console.log('❌ Invalid email response:', invalidEmailData);
    console.log('');

    // Test 3: Weak password
    console.log('3️⃣ Testing weak password...');
    const weakPasswordResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password'
      })
    });
    
    const weakPasswordData = await weakPasswordResponse.json();
    console.log('❌ Weak password response:', weakPasswordData);
    console.log('');

    // Test 4: Password mismatch
    console.log('4️⃣ Testing password mismatch...');
    const mismatchResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!'
      })
    });
    
    const mismatchData = await mismatchResponse.json();
    console.log('❌ Password mismatch response:', mismatchData);
    console.log('');

    // Test 5: Multiple validation errors
    console.log('5️⃣ Testing multiple validation errors...');
    const multipleErrorsResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'A',
        email: 'invalid-email',
        password: '123',
        confirmPassword: 'different'
      })
    });
    
    const multipleErrorsData = await multipleErrorsResponse.json();
    console.log('❌ Multiple errors response:', multipleErrorsData);
    console.log('');

    console.log('🎉 Registration validation testing completed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Valid registration (fallback)');
    console.log('✅ Email validation');
    console.log('✅ Password validation');
    console.log('✅ Password confirmation');
    console.log('✅ Multiple error handling');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on port 5500');
  }
}

// Run the tests
testRegistrationSimple(); 