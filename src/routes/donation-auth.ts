// @ts-nocheck
import { Router } from 'express';
import { auth } from '../lib/auth';
import { db } from '../config/db';
import { users, companies, donationCategories } from '../schema/donation-app';

const router = Router();

// Better-auth API routes - handles all /auth/* endpoints
router.use('/auth', async (req, res) => {
  try {
    // Convert Express request to web standard Request
    const url = new URL(req.url, `http://${req.headers.host}`);
    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers: req.headers as any,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const response = await auth.handler(webRequest);
    
    // Set cookies if present
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    
    // Set status and send response
    const responseBody = await response.json();
    res.status(response.status).json(responseBody);
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Enhanced registration route with user type selection
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      confirmPassword,
      userType = 'normal_user',
      // Company specific fields
      companyName,
      companyType,
      businessLicense,
      taxId,
      description,
      website,
      phoneNumber,
      address,
      city,
      state,
      country = 'Ethiopia'
    } = req.body;
    
    // Initialize errors object
    const errors: Record<string, string> = {};
    
    // Validate full name
    if (!fullName || fullName.trim().length === 0) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters long';
    } else if (fullName.trim().length > 100) {
      errors.fullName = 'Full name must be less than 100 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
      errors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    // Validate email
    if (!email || email.trim().length === 0) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      } else if (email.trim().length > 255) {
        errors.email = 'Email must be less than 255 characters';
      }
    }
    
    // Validate password
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
    } else {
      // Enhanced password validation
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      
      if (!hasUpperCase) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!hasLowerCase) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!hasNumbers) {
        errors.password = 'Password must contain at least one number';
      } else if (!hasSpecialChar) {
        errors.password = 'Password must contain at least one special character';
      }
    }
    
    // Validate password confirmation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password && confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate user type
    const validUserTypes = ['normal_user', 'donor_company', 'recipient_company', 'organizer'];
    if (!validUserTypes.includes(userType)) {
      errors.userType = 'Invalid user type selected';
    }
    
    // Company-specific validation
    if (userType === 'donor_company' || userType === 'recipient_company') {
      if (!companyName || companyName.trim().length === 0) {
        errors.companyName = 'Company name is required';
      } else if (companyName.trim().length < 2) {
        errors.companyName = 'Company name must be at least 2 characters long';
      } else if (companyName.trim().length > 255) {
        errors.companyName = 'Company name must be less than 255 characters';
      }
      
      if (userType === 'donor_company') {
        if (!companyType || !['restaurant', 'grocery_store'].includes(companyType)) {
          errors.companyType = 'Please select either Restaurant or Grocery Store';
        }
      }
      
      if (!address || address.trim().length === 0) {
        errors.address = 'Address is required';
      }
      
      if (!city || city.trim().length === 0) {
        errors.city = 'City is required';
      }
      
      if (!phoneNumber || phoneNumber.trim().length === 0) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(phoneNumber.trim())) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
    }
    
    // Check for common weak passwords
    const weakPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (password && weakPasswords.includes(password.toLowerCase())) {
      errors.password = 'This password is too common. Please choose a stronger password';
    }
    
    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString()
      });
    }
    
    // Sanitize inputs
    const sanitizedData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      userType: userType,
      companyData: userType === 'donor_company' || userType === 'recipient_company' ? {
        companyName: companyName.trim(),
        companyType: companyType,
        businessLicense: businessLicense?.trim(),
        taxId: taxId?.trim(),
        description: description?.trim(),
        website: website?.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state?.trim(),
        country: country.trim()
      } : null
    };
    
    console.log('🔍 Attempting donation app registration with:', {
      email: sanitizedData.email,
      name: sanitizedData.fullName,
      userType: sanitizedData.userType,
      hasCompanyData: !!sanitizedData.companyData
    });
    
    // Use the correct better-auth signup endpoint
    const url = new URL('/auth/sign-up/email', `http://${req.headers.host}`);
    const webRequest = new Request(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...req.headers as any,
      },
      body: JSON.stringify({
        email: sanitizedData.email,
        password: sanitizedData.password,
        name: sanitizedData.fullName
      })
    });

    console.log('📤 Sending request to better-auth sign-up/email...');
    const response = await auth.handler(webRequest);
    console.log('📥 Received response from better-auth:', {
      status: response.status,
      statusText: response.statusText
    });
    
    // Set cookies if present
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    
    // Handle response
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    let responseBody;
    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      console.error('Response text:', responseText);
      
      // If better-auth failed, create a user manually
      return res.status(500).json({
        success: false,
        message: 'Registration service temporarily unavailable',
        timestamp: new Date().toISOString()
      });
    }
    
    // Enhance the response for better UX
    if (response.status === 200 || response.status === 201) {
      const userData = {
        id: responseBody.user?.id || Date.now(),
        fullName: sanitizedData.fullName,
        email: sanitizedData.email,
        userType: sanitizedData.userType,
        emailVerified: responseBody.user?.emailVerified || false,
        createdAt: new Date().toISOString()
      };
      
      // Add company data if applicable
      if (sanitizedData.companyData) {
        userData.company = sanitizedData.companyData;
      }
      
      return res.status(201).json({
        success: true,
        message: `Registration successful! Welcome to the donation community! 🎉`,
        user: userData,
        session: responseBody.session,
        nextSteps: getNextSteps(sanitizedData.userType),
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle better-auth errors
    res.status(response.status).json({
      success: false,
      message: responseBody.message || 'Registration failed',
      errors: responseBody.errors || {},
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to get next steps based on user type
function getNextSteps(userType: string) {
  switch (userType) {
    case 'normal_user':
      return [
        'Complete your profile',
        'Browse available donations',
        'Start donating to causes you care about',
        'Connect with local organizations'
      ];
    case 'donor_company':
      return [
        'Complete company verification',
        'Upload business license',
        'Set up your donation preferences',
        'Start donating food and drinks'
      ];
    case 'recipient_company':
      return [
        'Complete organization verification',
        'Upload registration documents',
        'Set up your donation requests',
        'Connect with local donors'
      ];
    case 'organizer':
      return [
        'Complete your profile',
        'Create donation campaigns',
        'Organize community events',
        'Connect with donors and recipients'
      ];
    default:
      return ['Complete your profile', 'Explore the platform'];
  }
}

// Get user types for registration form
router.get('/user-types', async (req, res) => {
  try {
    const userTypes = [
      {
        value: 'normal_user',
        label: 'Individual User',
        description: 'I want to donate money and help others',
        icon: '👤',
        features: ['Donate money', 'Browse donations', 'Support causes']
      },
      {
        value: 'donor_company',
        label: 'Restaurant/Grocery Store',
        description: 'I want to donate food and drinks',
        icon: '🏪',
        features: ['Donate food', 'Donate drinks', 'Help local communities'],
        requirements: ['Business license', 'Restaurant or grocery store']
      },
      {
        value: 'recipient_company',
        label: 'Organization (like Mekedonia)',
        description: 'I want to receive donations for my organization',
        icon: '🏢',
        features: ['Receive donations', 'Request specific items', 'Help people in need'],
        requirements: ['Organization registration', 'Verification documents']
      },
      {
        value: 'organizer',
        label: 'Campaign Organizer',
        description: 'I want to organize donation campaigns',
        icon: '🎯',
        features: ['Create campaigns', 'Organize events', 'Coordinate donations']
      }
    ];
    
    res.status(200).json({
      success: true,
      userTypes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get user types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user types',
      timestamp: new Date().toISOString()
    });
  }
});

// Get donation categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 1,
        name: 'Food & Meals',
        description: 'Cooked meals, ingredients, and food items',
        icon: '🍕',
        donationTypes: ['food', 'groceries']
      },
      {
        id: 2,
        name: 'Drinks & Beverages',
        description: 'Water, juices, soft drinks, and other beverages',
        icon: '🥤',
        donationTypes: ['drinks']
      },
      {
        id: 3,
        name: 'Groceries & Essentials',
        description: 'Packaged food, household items, and essentials',
        icon: '🛒',
        donationTypes: ['groceries']
      },
      {
        id: 4,
        name: 'Financial Support',
        description: 'Money donations for various causes',
        icon: '💰',
        donationTypes: ['money']
      },
      {
        id: 5,
        name: 'Emergency Relief',
        description: 'Urgent donations for emergency situations',
        icon: '🚨',
        donationTypes: ['food', 'drinks', 'groceries', 'money']
      }
    ];
    
    res.status(200).json({
      success: true,
      categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe = true } = req.body;
    
    // Initialize errors object
    const errors: Record<string, string> = {};
    
    // Validate email
    if (!email || email.trim().length === 0) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Validate password
    if (!password) {
      errors.password = 'Password is required';
    }
    
    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('🔍 Attempting donation app login with:', {
      email: email.trim().toLowerCase(),
      rememberMe
    });
    
    // Use the correct better-auth signin endpoint
    const url = new URL('/auth/sign-in/email', `http://${req.headers.host}`);
    const webRequest = new Request(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...req.headers as any,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password: password,
        rememberMe: rememberMe
      })
    });

    console.log('📤 Sending request to better-auth sign-in/email...');
    const response = await auth.handler(webRequest);
    console.log('📥 Received response from better-auth:', {
      status: response.status,
      statusText: response.statusText
    });
    
    // Set cookies if present
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    
    // Handle response
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    let responseBody;
    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      console.error('Response text:', responseText);
      
      return res.status(500).json({
        success: false,
        message: 'Login service temporarily unavailable',
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle successful login
    if (response.status === 200) {
      return res.status(200).json({
        success: true,
        message: 'Login successful! Welcome back to the donation community! 🎉',
        user: {
          id: responseBody.user?.id,
          name: responseBody.user?.name,
          email: responseBody.user?.email,
          emailVerified: responseBody.user?.emailVerified,
          userType: responseBody.user?.userType || 'normal_user',
        },
        session: responseBody.session,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle login errors
    res.status(response.status).json({
      success: false,
      message: responseBody.message || 'Login failed',
      errors: responseBody.errors || {},
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      timestamp: new Date().toISOString()
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    console.log('🔍 Attempting donation app logout...');
    
    // Use the correct better-auth signout endpoint
    const url = new URL('/auth/sign-out', `http://${req.headers.host}`);
    const webRequest = new Request(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...req.headers as any,
      }
    });

    console.log('📤 Sending request to better-auth sign-out...');
    const response = await auth.handler(webRequest);
    console.log('📥 Received response from better-auth:', {
      status: response.status,
      statusText: response.statusText
    });
    
    // Set cookies if present
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    
    // Handle response
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    let responseBody;
    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      console.error('Response text:', responseText);
    }
    
    // Handle successful logout
    if (response.status === 200) {
      return res.status(200).json({
        success: true,
        message: 'Logout successful! Thank you for being part of our donation community! 👋',
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle logout errors
    res.status(response.status).json({
      success: false,
      message: responseBody.message || 'Logout failed',
      errors: responseBody.errors || {},
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      timestamp: new Date().toISOString()
    });
  }
});

// Get current user session
router.get('/me', async (req, res) => {
  try {
    console.log('🔍 Attempting to get current user session...');
    
    // Use the correct better-auth session endpoint
    const url = new URL('/auth/session', `http://${req.headers.host}`);
    const webRequest = new Request(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...req.headers as any,
      }
    });

    console.log('📤 Sending request to better-auth session...');
    const response = await auth.handler(webRequest);
    console.log('📥 Received response from better-auth:', {
      status: response.status,
      statusText: response.statusText
    });
    
    // Set cookies if present
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    
    // Handle response
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    let responseBody;
    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      console.error('Response text:', responseText);
    }
    
    // Handle successful session retrieval
    if (response.status === 200 && responseBody.user) {
      return res.status(200).json({
        success: true,
        message: 'User session retrieved successfully',
        user: {
          id: responseBody.user.id,
          name: responseBody.user.name,
          email: responseBody.user.email,
          emailVerified: responseBody.user.emailVerified,
          userType: responseBody.user.userType || 'normal_user',
        },
        session: responseBody.session,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle no session
    if (response.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'No active session found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle other errors
    res.status(response.status).json({
      success: false,
      message: responseBody.message || 'Failed to get user session',
      errors: responseBody.errors || {},
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Get user session error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error while getting user session',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 