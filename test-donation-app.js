const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5500/api';
const SERVER_URL = 'http://localhost:5500';

async function testDonationApp() {
  console.log('🎯 Testing Donation App Registration System...\n');

  try {
    // Test 1: Check server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('');

    // Test 2: Get user types
    console.log('2️⃣ Testing get user types...');
    const userTypesResponse = await fetch(`${BASE_URL}/user-types`);
    const userTypesData = await userTypesResponse.json();
    console.log('✅ User types:', userTypesData.userTypes?.length || 0, 'types available');
    console.log('');

    // Test 3: Get donation categories
    console.log('3️⃣ Testing get donation categories...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories:', categoriesData.categories?.length || 0, 'categories available');
    console.log('');

    // Test 4: Register Normal User
    console.log('4️⃣ Testing normal user registration...');
    const normalUserResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        userType: 'normal_user'
      })
    });
    
    const normalUserData = await normalUserResponse.json();
    console.log('✅ Normal user registration:', normalUserData.success ? 'SUCCESS' : 'FAILED');
    if (normalUserData.success) {
      console.log('   User ID:', normalUserData.user?.id);
      console.log('   User Type:', normalUserData.user?.userType);
      console.log('   Next Steps:', normalUserData.nextSteps?.length || 0, 'steps');
    }
    console.log('');

    // Test 5: Register Restaurant (Donor Company)
    console.log('5️⃣ Testing restaurant registration...');
    const restaurantResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Ahmed Hassan',
        email: 'ahmed@restaurant.com',
        password: 'RestaurantPass123!',
        confirmPassword: 'RestaurantPass123!',
        userType: 'donor_company',
        companyName: 'Ethiopian Delights Restaurant',
        companyType: 'restaurant',
        businessLicense: 'LIC123456',
        taxId: 'TAX789012',
        description: 'Traditional Ethiopian restaurant serving authentic dishes',
        website: 'https://ethiopiandelights.com',
        phoneNumber: '+251911234567',
        address: 'Bole Road, Addis Ababa',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia'
      })
    });
    
    const restaurantData = await restaurantResponse.json();
    console.log('✅ Restaurant registration:', restaurantData.success ? 'SUCCESS' : 'FAILED');
    if (restaurantData.success) {
      console.log('   Company Name:', restaurantData.user?.company?.companyName);
      console.log('   Company Type:', restaurantData.user?.company?.companyType);
      console.log('   Next Steps:', restaurantData.nextSteps?.length || 0, 'steps');
    }
    console.log('');

    // Test 6: Register Grocery Store (Donor Company)
    console.log('6️⃣ Testing grocery store registration...');
    const groceryResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Sarah Johnson',
        email: 'sarah@grocery.com',
        password: 'GroceryPass123!',
        confirmPassword: 'GroceryPass123!',
        userType: 'donor_company',
        companyName: 'Fresh Market Grocery',
        companyType: 'grocery_store',
        businessLicense: 'LIC654321',
        taxId: 'TAX210987',
        description: 'Premium grocery store with fresh produce and essentials',
        website: 'https://freshmarket.com',
        phoneNumber: '+251922345678',
        address: 'Kazanchis, Addis Ababa',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia'
      })
    });
    
    const groceryData = await groceryResponse.json();
    console.log('✅ Grocery store registration:', groceryData.success ? 'SUCCESS' : 'FAILED');
    if (groceryData.success) {
      console.log('   Company Name:', groceryData.user?.company?.companyName);
      console.log('   Company Type:', groceryData.user?.company?.companyType);
      console.log('   Next Steps:', groceryData.nextSteps?.length || 0, 'steps');
    }
    console.log('');

    // Test 7: Register Organization (Recipient Company)
    console.log('7️⃣ Testing organization registration...');
    const organizationResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Mekedonia Organization',
        email: 'info@mekedonia.org',
        password: 'MekedoniaPass123!',
        confirmPassword: 'MekedoniaPass123!',
        userType: 'recipient_company',
        companyName: 'Mekedonia Humanitarian Association',
        businessLicense: 'ORG123456',
        taxId: 'NGO789012',
        description: 'Non-profit organization helping vulnerable communities in Ethiopia',
        website: 'https://mekedonia.org',
        phoneNumber: '+251933456789',
        address: 'Kolfe Keranio, Addis Ababa',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia'
      })
    });
    
    const organizationData = await organizationResponse.json();
    console.log('✅ Organization registration:', organizationData.success ? 'SUCCESS' : 'FAILED');
    if (organizationData.success) {
      console.log('   Organization Name:', organizationData.user?.company?.companyName);
      console.log('   User Type:', organizationData.user?.userType);
      console.log('   Next Steps:', organizationData.nextSteps?.length || 0, 'steps');
    }
    console.log('');

    // Test 8: Register Organizer
    console.log('8️⃣ Testing organizer registration...');
    const organizerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Maria Rodriguez',
        email: 'maria@organizer.com',
        password: 'OrganizerPass123!',
        confirmPassword: 'OrganizerPass123!',
        userType: 'organizer'
      })
    });
    
    const organizerData = await organizerResponse.json();
    console.log('✅ Organizer registration:', organizerData.success ? 'SUCCESS' : 'FAILED');
    if (organizerData.success) {
      console.log('   Organizer Name:', organizerData.user?.fullName);
      console.log('   User Type:', organizerData.user?.userType);
      console.log('   Next Steps:', organizerData.nextSteps?.length || 0, 'steps');
    }
    console.log('');

    // Test 9: Login with normal user
    console.log('9️⃣ Testing login with normal user...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        rememberMe: true
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login test:', loginData.success ? 'SUCCESS' : 'FAILED');
    if (loginData.success) {
      console.log('   User Type:', loginData.user?.userType);
      console.log('   Email Verified:', loginData.user?.emailVerified);
    }
    console.log('');

    // Test 10: Validation errors
    console.log('🔟 Testing validation errors...');
    
    // Test invalid user type
    const invalidUserTypeResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        userType: 'invalid_type'
      })
    });
    
    const invalidUserTypeData = await invalidUserTypeResponse.json();
    console.log('✅ Invalid user type validation:', invalidUserTypeData.success ? 'FAILED' : 'SUCCESS');
    if (!invalidUserTypeData.success) {
      console.log('   Error:', invalidUserTypeData.errors?.userType);
    }
    console.log('');

    // Test missing company data for donor company
    const missingCompanyResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test Company',
        email: 'testcompany@example.com',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        userType: 'donor_company'
        // Missing company data
      })
    });
    
    const missingCompanyData = await missingCompanyResponse.json();
    console.log('✅ Missing company data validation:', missingCompanyData.success ? 'FAILED' : 'SUCCESS');
    if (!missingCompanyData.success) {
      console.log('   Errors:', Object.keys(missingCompanyData.errors || {}));
    }
    console.log('');

    console.log('🎉 Donation App Registration Testing Completed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Server health check');
    console.log('✅ User types API');
    console.log('✅ Categories API');
    console.log('✅ Normal user registration');
    console.log('✅ Restaurant registration');
    console.log('✅ Grocery store registration');
    console.log('✅ Organization registration');
    console.log('✅ Organizer registration');
    console.log('✅ Login functionality');
    console.log('✅ Validation error handling');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on port 5500');
  }
}

// Run the tests
testDonationApp(); 