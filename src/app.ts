import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import foodBridgeAuthRoutes from "./routes/food-bridge-auth";
import donationRoutes from "./routes/donation-routes";

export const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true,
}));
app.use(cookieParser());

// Food Bridge Auth routes
app.use('/api', foodBridgeAuthRoutes);

// Donation Dashboard routes
app.use('/api', donationRoutes);

// Food Bridge API documentation
app.get("/", (req, res) => {
  res.json({
    message: "🍽️ Welcome to Food Bridge API!",
    version: "1.0.0",
    description: "A donation platform connecting individuals, businesses, and charities",
    endpoints: {
      auth: {
        register: "POST /api/register",
        login: "POST /api/login",
        logout: "POST /api/logout",
        me: "GET /api/me",
        categories: "GET /api/categories"
      },
      dashboard: {
        stats: "GET /api/dashboard/stats"
      },
      donations: {
        create: "POST /api/donations",
        my: "GET /api/donations/my",
        browse: "GET /api/donations/browse"
      },
      requests: {
        create: "POST /api/requests",
        my: "GET /api/requests/my",
        browse: "GET /api/requests/browse"
      },
      matches: {
        create: "POST /api/matches",
        update: "PUT /api/matches/:matchId/status",
        my: "GET /api/matches/my"
      },
      reviews: {
        create: "POST /api/reviews"
      },
      campaigns: {
        create: "POST /api/campaigns",
        list: "GET /api/campaigns",
        donate: "POST /api/campaigns/donate"
      }
    },
    userTypes: {
      Individual: "Regular users who can receive and share food",
      Business: "Restaurants, groceries, bakeries that donate food",
      Charity: "Organizations that distribute food to those in need"
    },
    features: [
      "✨ User Registration (Individual, Business, Charity)",
      "🔐 Secure JWT Authentication",
      "📧 Email Validation",
      "🏪 Business License Validation",
      "🏢 Organization Category Support",
      "🍕 Food Categories (Cooked Meals, Drinks, Dairy, Bakery, Fruits & Veggies)",
      "❤️ Charity Categories (Children Center, Elders Center, Special Needs, Food Bank)",
      "📍 Location-based Matching",
      "🛡️ CORS Protection",
      "🎯 Comprehensive Input Validation"
    ],
    examples: {
      individual: {
        url: "POST /api/register",
        body: {
          name: "John Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!",
          userType: "Individual"
        }
      },
      business: {
        url: "POST /api/register",
        body: {
          name: "Pizza Palace",
          email: "info@pizzapalace.com",
          password: "SecurePass123!",
          userType: "Business",
          location: "Addis Ababa, Ethiopia",
          businessLicense: "LIC123456",
          category: "Cooked Meals"
        }
      },
      charity: {
        url: "POST /api/register",
        body: {
          name: "Mekedonia",
          email: "contact@mekedonia.org",
          password: "SecurePass123!",
          userType: "Charity",
          location: "Addis Ababa, Ethiopia",
          category: "Elders Center"
        }
      },
      login: {
        url: "POST /api/login", 
        body: {
          email: "john.doe@example.com",
          password: "SecurePass123!"
        }
      },
      categories: {
        business: "GET /api/categories?type=business",
        charity: "GET /api/categories?type=charity"
      }
    },
    validation: {
      fullName: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: "Letters, spaces, hyphens, apostrophes only"
      },
      email: {
        required: true,
        maxLength: 255,
        pattern: "Valid email format"
      },
      password: {
        required: true,
        minLength: 8,
        maxLength: 128,
        requirements: [
          "At least one uppercase letter",
          "At least one lowercase letter", 
          "At least one number",
          "At least one special character"
        ]
      }
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
