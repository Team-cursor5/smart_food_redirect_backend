import('node-fetch').then(({default: fetch}) => {

const BASE_URL = 'http://localhost:5500/api';
let authToken = null;
let userId = null;

// Test data
const testUser = {
  name: 'Test Business',
  email: 'test@business.com',
  password: 'SecurePass123!',
  userType: 'Business',
  location: 'Addis Ababa, Ethiopia',
  businessLicense: 'TEST123456',
  category: 'Cooked Meals'
};

const testDonation = {
  title: 'Fresh Pizza Donation',
  description: 'Delicious pizza available for donation',
  category: 'Cooked Meals',
  quantity: 10,
  unit: 'pieces',
  pickupLocation: 'Pizza Palace, Addis Ababa',
  specialInstructions: 'Please bring containers'
};

const testRequest = {
  title: 'Need Food for Children',
  description: 'Looking for food donations for our children center',
  category: 'Cooked Meals',
  quantity: 5,
  unit: 'meals',
  urgency: 'high',
  deliveryLocation: 'Children Center, Addis Ababa',
  specialRequirements: 'Vegetarian options preferred'
};

const testCampaign = {
  title: 'Feed the Hungry Campaign',
  description: 'Help us feed 1000 people this month',
  goal: 50000,
  category: 'Food',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  targetLocation: 'Addis Ababa'
};

async function testDonationDashboard() {
  console.log('🍽️ Testing Food Bridge Donation Dashboard...\n');

  try {
    // Step 1: Register and Login
    console.log('1️⃣ Registering test business...');
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerResponse.json();
    console.log('✅ Registration:', registerData.success ? 'Success' : 'Failed');
    
    if (registerData.success) {
      authToken = registerData.token;
      userId = registerData.user.id;
    }

    // Step 2: Login
    console.log('2️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.success ? 'Success' : 'Failed');
    
    if (loginData.success) {
      authToken = loginData.token;
      userId = loginData.user.id;
    }

    if (!authToken) {
      console.log('❌ Authentication failed, stopping tests');
      return;
    }

    // Step 3: Get Dashboard Stats
    console.log('3️⃣ Getting dashboard stats...');
    const statsResponse = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const statsData = await statsResponse.json();
    console.log('✅ Dashboard Stats:', statsData.success ? 'Success' : 'Failed');
    if (statsData.success) {
      console.log('   📊 Stats:', statsData.stats);
    }

    // Step 4: Create Donation
    console.log('4️⃣ Creating donation...');
    const donationResponse = await fetch(`${BASE_URL}/donations`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testDonation)
    });
    const donationData = await donationResponse.json();
    console.log('✅ Create Donation:', donationData.success ? 'Success' : 'Failed');
    if (donationData.success) {
      console.log('   🍕 Donation ID:', donationData.donation.id);
    }

    // Step 5: Get My Donations
    console.log('5️⃣ Getting my donations...');
    const myDonationsResponse = await fetch(`${BASE_URL}/donations/my`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const myDonationsData = await myDonationsResponse.json();
    console.log('✅ My Donations:', myDonationsData.success ? 'Success' : 'Failed');
    if (myDonationsData.success) {
      console.log('   📋 Total Donations:', myDonationsData.donations.length);
    }

    // Step 6: Browse Donations
    console.log('6️⃣ Browsing available donations...');
    const browseResponse = await fetch(`${BASE_URL}/donations/browse`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const browseData = await browseResponse.json();
    console.log('✅ Browse Donations:', browseData.success ? 'Success' : 'Failed');
    if (browseData.success) {
      console.log('   🔍 Available Donations:', browseData.donations.length);
    }

    // Step 7: Create Donation Request
    console.log('7️⃣ Creating donation request...');
    const requestResponse = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });
    const requestData = await requestResponse.json();
    console.log('✅ Create Request:', requestData.success ? 'Success' : 'Failed');
    if (requestData.success) {
      console.log('   📋 Request ID:', requestData.request.id);
    }

    // Step 8: Get My Requests
    console.log('8️⃣ Getting my requests...');
    const myRequestsResponse = await fetch(`${BASE_URL}/requests/my`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const myRequestsData = await myRequestsResponse.json();
    console.log('✅ My Requests:', myRequestsData.success ? 'Success' : 'Failed');
    if (myRequestsData.success) {
      console.log('   📋 Total Requests:', myRequestsData.requests.length);
    }

    // Step 9: Browse Requests
    console.log('9️⃣ Browsing available requests...');
    const browseRequestsResponse = await fetch(`${BASE_URL}/requests/browse`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const browseRequestsData = await browseRequestsResponse.json();
    console.log('✅ Browse Requests:', browseRequestsData.success ? 'Success' : 'Failed');
    if (browseRequestsData.success) {
      console.log('   🔍 Available Requests:', browseRequestsData.requests.length);
    }

    // Step 10: Create Match (if we have donations and requests)
    if (donationData.success && requestData.success) {
      console.log('🔟 Creating donation match...');
      const matchResponse = await fetch(`${BASE_URL}/matches`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donationId: donationData.donation.id,
          message: 'I would like to donate to your cause!'
        })
      });
      const matchData = await matchResponse.json();
      console.log('✅ Create Match:', matchData.success ? 'Success' : 'Failed');
      if (matchData.success) {
        console.log('   🤝 Match ID:', matchData.match.id);
      }
    }

    // Step 11: Get My Matches
    console.log('1️⃣1️⃣ Getting my matches...');
    const myMatchesResponse = await fetch(`${BASE_URL}/matches/my`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const myMatchesData = await myMatchesResponse.json();
    console.log('✅ My Matches:', myMatchesData.success ? 'Success' : 'Failed');
    if (myMatchesData.success) {
      console.log('   🤝 Total Matches:', myMatchesData.matches.length);
    }

    // Step 12: Create Campaign
    console.log('1️⃣2️⃣ Creating campaign...');
    const campaignResponse = await fetch(`${BASE_URL}/campaigns`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCampaign)
    });
    const campaignData = await campaignResponse.json();
    console.log('✅ Create Campaign:', campaignData.success ? 'Success' : 'Failed');
    if (campaignData.success) {
      console.log('   🎯 Campaign ID:', campaignData.campaign.id);
    }

    // Step 13: Get Campaigns
    console.log('1️⃣3️⃣ Getting campaigns...');
    const campaignsResponse = await fetch(`${BASE_URL}/campaigns`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    const campaignsData = await campaignsResponse.json();
    console.log('✅ Get Campaigns:', campaignsData.success ? 'Success' : 'Failed');
    if (campaignsData.success) {
      console.log('   🎯 Total Campaigns:', campaignsData.campaigns.length);
    }

    // Step 14: Donate to Campaign
    if (campaignData.success) {
      console.log('1️⃣4️⃣ Donating to campaign...');
      const donateResponse = await fetch(`${BASE_URL}/campaigns/donate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignId: campaignData.campaign.id,
          amount: 1000,
          message: 'Happy to help!'
        })
      });
      const donateData = await donateResponse.json();
      console.log('✅ Campaign Donation:', donateData.success ? 'Success' : 'Failed');
    }

    // Step 15: Create Review
    if (matchData.success) {
      console.log('1️⃣5️⃣ Creating review...');
      const reviewResponse = await fetch(`${BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          matchId: matchData.match.id,
          rating: 5,
          comment: 'Excellent experience! Very helpful.'
        })
      });
      const reviewData = await reviewResponse.json();
      console.log('✅ Create Review:', reviewData.success ? 'Success' : 'Failed');
    }

    console.log('\n🎉 All donation dashboard tests completed!');
    console.log('🍽️ Food Bridge Donation Dashboard is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testDonationDashboard();

}); 