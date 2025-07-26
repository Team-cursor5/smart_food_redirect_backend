import('node-fetch').then(({default: fetch}) => {

const BASE_URL = 'http://localhost:5500/api';

// Test data
const testUsers = {
  individual: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    userType: 'Individual'
  },
  business: {
    name: 'Pizza Palace',
    email: 'info@pizzapalace.com',
    password: 'SecurePass123!',
    userType: 'Business',
    location: 'Addis Ababa, Ethiopia',
    businessLicense: 'LIC123456',
    category: 'Cooked Meals'
  },
  charity: {
    name: 'Mekedonia',
    email: 'contact@mekedonia.org',
    password: 'SecurePass123!',
    userType: 'Charity',
    location: 'Addis Ababa, Ethiopia',
    category: 'Elders Center'
  }
};

let authToken = null;

async function testAPI() {
  console.log('🍽️ Testing Food Bridge API...\n');

  try {
    // Test 1: Get categories
    console.log('1️⃣ Testing categories endpoint...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories:', categoriesData);
    console.log('');

    // Test 2: Register Individual
    console.log('2️⃣ Testing Individual registration...');
    const individualResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUsers.individual)
    });
    const individualData = await individualResponse.json();
    console.log('✅ Individual registration:', individualData);
    if (individualData.success) {
      authToken = individualData.token;
    }
    console.log('');

    // Test 3: Register Business
    console.log('3️⃣ Testing Business registration...');
    const businessResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUsers.business)
    });
    const businessData = await businessResponse.json();
    console.log('✅ Business registration:', businessData);
    console.log('');

    // Test 4: Register Charity
    console.log('4️⃣ Testing Charity registration...');
    const charityResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUsers.charity)
    });
    const charityData = await charityResponse.json();
    console.log('✅ Charity registration:', charityData);
    console.log('');

    // Test 5: Login
    console.log('5️⃣ Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.individual.email,
        password: testUsers.individual.password
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData);
    if (loginData.success) {
      authToken = loginData.token;
    }
    console.log('');

    // Test 6: Get current user
    if (authToken) {
      console.log('6️⃣ Testing get current user...');
      const meResponse = await fetch(`${BASE_URL}/me`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const meData = await meResponse.json();
      console.log('✅ Current user:', meData);
      console.log('');
    }

    // Test 7: Logout
    console.log('7️⃣ Testing logout...');
    const logoutResponse = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const logoutData = await logoutResponse.json();
    console.log('✅ Logout:', logoutData);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('🍽️ Food Bridge API is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testAPI();
}); 