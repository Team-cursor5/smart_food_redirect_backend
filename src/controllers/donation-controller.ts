// @ts-nocheck
import { Request, Response } from 'express';
import { db } from '../config/db';
import { 
  donations, 
  donationRequests, 
  donationMatches, 
  donationTransactions, 
  donationReviews, 
  campaigns, 
  campaignDonations,
  companies,
  users
} from '../schema/donation-app';
import { eq, and, or, desc, asc, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get user from token
const getUserFromToken = (req: Request) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
};

export class DonationController {
  
  // 📊 Dashboard Statistics
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const userId = user.userId;

      // Get user's company info
      const userCompany = await db.select()
        .from(companies)
        .where(eq(companies.userId, userId))
        .limit(1);

      const isBusiness = userCompany.length > 0 && userCompany[0].type === 'restaurant';
      const isCharity = userCompany.length > 0 && userCompany[0].type === 'organization';

      let stats: any = {};

      if (isBusiness) {
        // Business Dashboard Stats
        const [totalDonations, activeDonations, completedDonations, totalRecipients] = await Promise.all([
          db.select({ count: sql<number>`count(*)` }).from(donations).where(eq(donations.donorId, userId)),
          db.select({ count: sql<number>`count(*)` }).from(donations).where(and(eq(donations.donorId, userId), eq(donations.status, 'active'))),
          db.select({ count: sql<number>`count(*)` }).from(donations).where(and(eq(donations.donorId, userId), eq(donations.status, 'completed'))),
          db.select({ count: sql<number>`count(distinct ${donations.recipientId})` }).from(donations).where(eq(donations.donorId, userId))
        ]);

        stats = {
          totalDonations: totalDonations[0]?.count || 0,
          activeDonations: activeDonations[0]?.count || 0,
          completedDonations: completedDonations[0]?.count || 0,
          totalRecipients: totalRecipients[0]?.count || 0,
          userType: 'Business'
        };

      } else if (isCharity) {
        // Charity Dashboard Stats
        const [totalRequests, activeRequests, completedRequests, totalDonors] = await Promise.all([
          db.select({ count: sql<number>`count(*)` }).from(donationRequests).where(eq(donationRequests.recipientId, userId)),
          db.select({ count: sql<number>`count(*)` }).from(donationRequests).where(and(eq(donationRequests.recipientId, userId), eq(donationRequests.status, 'active'))),
          db.select({ count: sql<number>`count(*)` }).from(donationRequests).where(and(eq(donationRequests.recipientId, userId), eq(donationRequests.status, 'completed'))),
          db.select({ count: sql<number>`count(distinct ${donationRequests.donorId})` }).from(donationRequests).where(eq(donationRequests.recipientId, userId))
        ]);

        stats = {
          totalRequests: totalRequests[0]?.count || 0,
          activeRequests: activeRequests[0]?.count || 0,
          completedRequests: completedRequests[0]?.count || 0,
          totalDonors: totalDonors[0]?.count || 0,
          userType: 'Charity'
        };

      } else {
        // Individual Dashboard Stats
        const [totalDonations, totalRequests, totalMatches] = await Promise.all([
          db.select({ count: sql<number>`count(*)` }).from(donations).where(eq(donations.donorId, userId)),
          db.select({ count: sql<number>`count(*)` }).from(donationRequests).where(eq(donationRequests.requesterId, userId)),
          db.select({ count: sql<number>`count(*)` }).from(donationMatches).where(eq(donationMatches.userId, userId))
        ]);

        stats = {
          totalDonations: totalDonations[0]?.count || 0,
          totalRequests: totalRequests[0]?.count || 0,
          totalMatches: totalMatches[0]?.count || 0,
          userType: 'Individual'
        };
      }

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics'
      });
    }
  }

  // 🍕 Create Donation (Business)
  static async createDonation(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const {
        title,
        description,
        category,
        quantity,
        unit,
        expiryDate,
        pickupLocation,
        pickupTime,
        specialInstructions
      } = req.body;

      // Validation
      if (!title || !category || !quantity || !unit || !pickupLocation) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Check if user is a business
      const userCompany = await db.select()
        .from(companies)
        .where(and(eq(companies.userId, user.userId), eq(companies.type, 'restaurant')))
        .limit(1);

      if (userCompany.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Only businesses can create donations'
        });
      }

      const newDonation = await db.insert(donations).values({
        donorId: user.userId,
        title: title.trim(),
        description: description?.trim() || '',
        category: category,
        quantity: parseFloat(quantity),
        unit: unit,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        pickupLocation: pickupLocation.trim(),
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        specialInstructions: specialInstructions?.trim() || '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        message: 'Donation created successfully! 🎉',
        donation: newDonation[0]
      });

    } catch (error) {
      console.error('Create donation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating donation'
      });
    }
  }

  // 📋 Create Donation Request (Charity/Individual)
  static async createDonationRequest(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const {
        title,
        description,
        category,
        quantity,
        unit,
        urgency,
        deliveryLocation,
        deliveryTime,
        specialRequirements
      } = req.body;

      // Validation
      if (!title || !category || !quantity || !unit || !deliveryLocation) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const newRequest = await db.insert(donationRequests).values({
        requesterId: user.userId,
        title: title.trim(),
        description: description?.trim() || '',
        category: category,
        quantity: parseFloat(quantity),
        unit: unit,
        urgency: urgency || 'normal',
        deliveryLocation: deliveryLocation.trim(),
        deliveryTime: deliveryTime ? new Date(deliveryTime) : null,
        specialRequirements: specialRequirements?.trim() || '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        message: 'Donation request created successfully! 🎉',
        request: newRequest[0]
      });

    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating donation request'
      });
    }
  }

  // 📋 Get My Donations (Business)
  static async getMyDonations(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { status, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereClause = eq(donations.donorId, user.userId);
      if (status && status !== 'all') {
        whereClause = and(whereClause, eq(donations.status, status as string));
      }

      const userDonations = await db.select()
        .from(donations)
        .where(whereClause)
        .orderBy(desc(donations.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const totalCount = await db.select({ count: sql<number>`count(*)` })
        .from(donations)
        .where(whereClause);

      res.json({
        success: true,
        donations: userDonations,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          pages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Get donations error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching donations'
      });
    }
  }

  // 📋 Get My Requests (Charity/Individual)
  static async getMyRequests(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { status, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereClause = eq(donationRequests.requesterId, user.userId);
      if (status && status !== 'all') {
        whereClause = and(whereClause, eq(donationRequests.status, status as string));
      }

      const userRequests = await db.select()
        .from(donationRequests)
        .where(whereClause)
        .orderBy(desc(donationRequests.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const totalCount = await db.select({ count: sql<number>`count(*)` })
        .from(donationRequests)
        .where(whereClause);

      res.json({
        success: true,
        requests: userRequests,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          pages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Get requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching requests'
      });
    }
  }

  // 🔍 Browse Available Donations (Charity/Individual)
  static async browseDonations(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { category, location, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereClause = eq(donations.status, 'active');
      
      if (category) {
        whereClause = and(whereClause, eq(donations.category, category as string));
      }
      
      if (location) {
        whereClause = and(whereClause, sql`${donations.pickupLocation} ILIKE ${`%${location}%`}`);
      }

      const availableDonations = await db.select({
        id: donations.id,
        title: donations.title,
        description: donations.description,
        category: donations.category,
        quantity: donations.quantity,
        unit: donations.unit,
        expiryDate: donations.expiryDate,
        pickupLocation: donations.pickupLocation,
        pickupTime: donations.pickupTime,
        specialInstructions: donations.specialInstructions,
        createdAt: donations.createdAt,
        donor: {
          id: users.id,
          name: users.fullName,
          company: companies.name
        }
      })
        .from(donations)
        .leftJoin(users, eq(donations.donorId, users.id))
        .leftJoin(companies, eq(users.id, companies.userId))
        .where(whereClause)
        .orderBy(desc(donations.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const totalCount = await db.select({ count: sql<number>`count(*)` })
        .from(donations)
        .where(whereClause);

      res.json({
        success: true,
        donations: availableDonations,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          pages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Browse donations error:', error);
      res.status(500).json({
        success: false,
        message: 'Error browsing donations'
      });
    }
  }

  // 🔍 Browse Donation Requests (Business)
  static async browseRequests(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { category, location, urgency, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereClause = eq(donationRequests.status, 'active');
      
      if (category) {
        whereClause = and(whereClause, eq(donationRequests.category, category as string));
      }
      
      if (location) {
        whereClause = and(whereClause, sql`${donationRequests.deliveryLocation} ILIKE ${`%${location}%`}`);
      }

      if (urgency) {
        whereClause = and(whereClause, eq(donationRequests.urgency, urgency as string));
      }

      const availableRequests = await db.select({
        id: donationRequests.id,
        title: donationRequests.title,
        description: donationRequests.description,
        category: donationRequests.category,
        quantity: donationRequests.quantity,
        unit: donationRequests.unit,
        urgency: donationRequests.urgency,
        deliveryLocation: donationRequests.deliveryLocation,
        deliveryTime: donationRequests.deliveryTime,
        specialRequirements: donationRequests.specialRequirements,
        createdAt: donationRequests.createdAt,
        requester: {
          id: users.id,
          name: users.fullName,
          company: companies.name
        }
      })
        .from(donationRequests)
        .leftJoin(users, eq(donationRequests.requesterId, users.id))
        .leftJoin(companies, eq(users.id, companies.userId))
        .where(whereClause)
        .orderBy(desc(donationRequests.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const totalCount = await db.select({ count: sql<number>`count(*)` })
        .from(donationRequests)
        .where(whereClause);

      res.json({
        success: true,
        requests: availableRequests,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          pages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Browse requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Error browsing requests'
      });
    }
  }

  // 🤝 Create Donation Match
  static async createMatch(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { donationId, requestId, message } = req.body;

      if (!donationId && !requestId) {
        return res.status(400).json({
          success: false,
          message: 'Either donationId or requestId is required'
        });
      }

      // Check if match already exists
      const existingMatch = await db.select()
        .from(donationMatches)
        .where(and(
          eq(donationMatches.userId, user.userId),
          donationId ? eq(donationMatches.donationId, donationId) : eq(donationMatches.requestId, requestId)
        ))
        .limit(1);

      if (existingMatch.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Match already exists'
        });
      }

      const newMatch = await db.insert(donationMatches).values({
        userId: user.userId,
        donationId: donationId || null,
        requestId: requestId || null,
        message: message?.trim() || '',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        message: 'Match created successfully! 🤝',
        match: newMatch[0]
      });

    } catch (error) {
      console.error('Create match error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating match'
      });
    }
  }

  // ✅ Accept/Reject Match
  static async updateMatchStatus(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { matchId } = req.params;
      const { status, message } = req.body;

      if (!['accepted', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const updatedMatch = await db.update(donationMatches)
        .set({
          status,
          message: message?.trim() || '',
          updatedAt: new Date()
        })
        .where(eq(donationMatches.id, parseInt(matchId)))
        .returning();

      if (updatedMatch.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Match not found'
        });
      }

      res.json({
        success: true,
        message: `Match ${status} successfully!`,
        match: updatedMatch[0]
      });

    } catch (error) {
      console.error('Update match error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating match'
      });
    }
  }

  // 📊 Get My Matches
  static async getMyMatches(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { status, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereClause = eq(donationMatches.userId, user.userId);
      if (status && status !== 'all') {
        whereClause = and(whereClause, eq(donationMatches.status, status as string));
      }

      const userMatches = await db.select({
        id: donationMatches.id,
        status: donationMatches.status,
        message: donationMatches.message,
        createdAt: donationMatches.createdAt,
        updatedAt: donationMatches.updatedAt,
        donation: donations,
        request: donationRequests
      })
        .from(donationMatches)
        .leftJoin(donations, eq(donationMatches.donationId, donations.id))
        .leftJoin(donationRequests, eq(donationMatches.requestId, donationRequests.id))
        .where(whereClause)
        .orderBy(desc(donationMatches.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const totalCount = await db.select({ count: sql<number>`count(*)` })
        .from(donationMatches)
        .where(whereClause);

      res.json({
        success: true,
        matches: userMatches,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          pages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Get matches error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching matches'
      });
    }
  }

  // ⭐ Create Review
  static async createReview(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { matchId, rating, comment } = req.body;

      if (!matchId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rating (1-5)'
        });
      }

      // Check if user was part of the match
      const match = await db.select()
        .from(donationMatches)
        .where(eq(donationMatches.id, parseInt(matchId)))
        .limit(1);

      if (match.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Match not found'
        });
      }

      // Check if review already exists
      const existingReview = await db.select()
        .from(donationReviews)
        .where(and(
          eq(donationReviews.matchId, parseInt(matchId)),
          eq(donationReviews.reviewerId, user.userId)
        ))
        .limit(1);

      if (existingReview.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Review already exists'
        });
      }

      const newReview = await db.insert(donationReviews).values({
        matchId: parseInt(matchId),
        reviewerId: user.userId,
        rating: parseInt(rating),
        comment: comment?.trim() || '',
        createdAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully! ⭐',
        review: newReview[0]
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating review'
      });
    }
  }

  // 🎯 Create Campaign
  static async createCampaign(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const {
        title,
        description,
        goal,
        category,
        startDate,
        endDate,
        targetLocation,
        imageUrl
      } = req.body;

      if (!title || !description || !goal || !category || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const newCampaign = await db.insert(campaigns).values({
        organizerId: user.userId,
        title: title.trim(),
        description: description.trim(),
        goal: parseFloat(goal),
        category: category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetLocation: targetLocation?.trim() || '',
        imageUrl: imageUrl || '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        message: 'Campaign created successfully! 🎯',
        campaign: newCampaign[0]
      });

    } catch (error) {
      console.error('Create campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating campaign'
      });
    }
  }

  // 📋 Get Campaigns
  static async getCampaigns(req: Request, res: Response) {
    try {
      const { status, category, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereClause = sql`1=1`;
      
      if (status && status !== 'all') {
        whereClause = and(whereClause, eq(campaigns.status, status as string));
      }
      
      if (category) {
        whereClause = and(whereClause, eq(campaigns.category, category as string));
      }

      const allCampaigns = await db.select({
        id: campaigns.id,
        title: campaigns.title,
        description: campaigns.description,
        goal: campaigns.goal,
        category: campaigns.category,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        targetLocation: campaigns.targetLocation,
        imageUrl: campaigns.imageUrl,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        organizer: {
          id: users.id,
          name: users.fullName,
          company: companies.name
        }
      })
        .from(campaigns)
        .leftJoin(users, eq(campaigns.organizerId, users.id))
        .leftJoin(companies, eq(users.id, companies.userId))
        .where(whereClause)
        .orderBy(desc(campaigns.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const totalCount = await db.select({ count: sql<number>`count(*)` })
        .from(campaigns)
        .where(whereClause);

      res.json({
        success: true,
        campaigns: allCampaigns,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          pages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Get campaigns error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching campaigns'
      });
    }
  }

  // 💰 Donate to Campaign
  static async donateToCampaign(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { campaignId, amount, message } = req.body;

      if (!campaignId || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      const newDonation = await db.insert(campaignDonations).values({
        campaignId: parseInt(campaignId),
        donorId: user.userId,
        amount: parseFloat(amount),
        message: message?.trim() || '',
        status: 'completed',
        createdAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        message: 'Thank you for your donation! 💝',
        donation: newDonation[0]
      });

    } catch (error) {
      console.error('Campaign donation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing donation'
      });
    }
  }
} 