import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { users, companies } from '../schema/donation-app';
import { eq } from 'drizzle-orm';

const router = Router();

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// User types matching frontend
type UserType = 'Individual' | 'Business' | 'Charity';

// Business categories from frontend
const businessCategories = [
  'Cooked Meals',
  'Drinks', 
  'Dairy Products',
  'Bakery',
  'Fruits & Veggies'
];

// Charity categories from frontend
const charityCategories = [
  'Children Center',
  'Elders Center', 
  'Special Needs Center',
  'Food Bank'
];

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password,
      location,
      businessLicense,
      category,
      userType = 'Individual'
    } = req.body;

    // Validation
    const errors: Record<string, string> = {};

    // Validate name
    if (!name || name.trim().length === 0) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

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
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
    }

    // Validate user type
    if (!['Individual', 'Business', 'Charity'].includes(userType)) {
      errors.userType = 'Invalid user type';
    }

    // Business-specific validations
    if (userType === 'Business') {
      if (!location) {
        errors.location = 'Business location is required';
      }
      if (!businessLicense) {
        errors.businessLicense = 'Business license number is required';
      }
      if (!category || !businessCategories.includes(category)) {
        errors.category = 'Valid business category is required';
      }
    }

    // Charity-specific validations
    if (userType === 'Charity') {
      if (!location) {
        errors.location = 'Organization location is required';
      }
      if (!category || !charityCategories.includes(category)) {
        errors.category = 'Valid organization category is required';
      }
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email.trim())).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db.insert(users).values({
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      userType: userType === 'Individual' ? 'normal_user' : 
                userType === 'Business' ? 'donor_company' : 'recipient_company',
      phoneNumber: '',
      address: location || '',
      city: '',
      state: '',
      country: 'Ethiopia',
      isVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    const userId = newUser[0].id;

    // Create company record for Business and Charity
    if (userType === 'Business' || userType === 'Charity') {
      await db.insert(companies).values({
        userId: userId,
        name: name.trim(),
        type: userType === 'Business' ? 'restaurant' : 'organization',
        category: category,
        description: '',
        website: '',
        phoneNumber: '',
        address: location,
        city: '',
        state: '',
        country: 'Ethiopia',
        businessLicense: businessLicense || '',
        taxId: '',
        isVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userId, 
        email: email.trim().toLowerCase(),
        userType: userType 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Food Bridge! 🎉',
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        userType: userType,
        category: category || null
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
    
    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userData = user[0];

    // Check if user is active
    if (!userData.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get company data if exists
    let companyData = null;
    if (userData.userType !== 'normal_user') {
      const company = await db.select().from(companies).where(eq(companies.userId, userData.id)).limit(1);
      if (company.length > 0) {
        companyData = company[0];
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id, 
        email: userData.email,
        userType: userData.userType 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful! Welcome back! 🎉',
      user: {
        id: userData.id,
        name: userData.fullName,
        email: userData.email,
        userType: userData.userType === 'normal_user' ? 'Individual' :
                  userData.userType === 'donor_company' ? 'Business' : 'Charity',
        category: companyData?.category || null
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get current user endpoint
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = user[0];

    // Get company data if exists
    let companyData = null;
    if (userData.userType !== 'normal_user') {
      const company = await db.select().from(companies).where(eq(companies.userId, userData.id)).limit(1);
      if (company.length > 0) {
        companyData = company[0];
      }
    }

    res.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.fullName,
        email: userData.email,
        userType: userData.userType === 'normal_user' ? 'Individual' :
                  userData.userType === 'donor_company' ? 'Business' : 'Charity',
        category: companyData?.category || null,
        location: companyData?.address || userData.address
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  // Since we're using JWT, we just return success
  // The frontend should remove the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get categories endpoint
router.get('/categories', (req, res) => {
  const { type } = req.query;
  
  if (type === 'business') {
    res.json({
      success: true,
      categories: businessCategories
    });
  } else if (type === 'charity') {
    res.json({
      success: true,
      categories: charityCategories
    });
  } else {
    res.json({
      success: true,
      business: businessCategories,
      charity: charityCategories
    });
  }
});

export default router; 