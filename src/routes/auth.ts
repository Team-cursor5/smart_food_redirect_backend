// @ts-nocheck
import { Router } from 'express';
import { auth } from '../lib/auth';

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

// Enhanced registration route with full validation
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    
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
      password: password
    };
    
    console.log('🔍 Attempting better-auth signup with:', {
      email: sanitizedData.email,
      name: sanitizedData.fullName,
      passwordLength: sanitizedData.password.length
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
      
      // If better-auth failed, create a user manually or return error
      return res.status(500).json({
        success: false,
        message: 'Registration service temporarily unavailable',
        timestamp: new Date().toISOString()
      });
    }
    
    // Enhance the response for better UX
    if (response.status === 200 || response.status === 201) {
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome aboard! 🎉',
        user: {
          id: responseBody.user?.id,
          fullName: sanitizedData.fullName,
          email: sanitizedData.email,
          emailVerified: responseBody.user?.emailVerified || false,
          createdAt: new Date().toISOString()
        },
        session: responseBody.session,
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

// Enhanced login route using correct better-auth endpoint
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
    
    console.log('🔍 Attempting better-auth signin with:', {
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
        message: 'Login successful! Welcome back! 🎉',
        user: {
          id: responseBody.user?.id,
          name: responseBody.user?.name,
          email: responseBody.user?.email,
          emailVerified: responseBody.user?.emailVerified,
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

// Logout route using correct better-auth endpoint
router.post('/logout', async (req, res) => {
  try {
    console.log('🔍 Attempting better-auth signout...');
    
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
        message: 'Logout successful! See you soon! 👋',
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