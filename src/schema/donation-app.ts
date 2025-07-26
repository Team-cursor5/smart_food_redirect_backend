// @ts-nocheck

import { pgTable, serial, text, varchar, timestamp, boolean, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User types enum
export const userTypeEnum = pgEnum('user_type', [
  'normal_user',
  'donor_company', 
  'recipient_company',
  'organizer'
]);

// Company types enum
export const companyTypeEnum = pgEnum('company_type', [
  'restaurant',
  'grocery_store'
]);

// Donation types enum
export const donationTypeEnum = pgEnum('donation_type', [
  'money',
  'food',
  'drinks',
  'groceries'
]);

// Donation status enum
export const donationStatusEnum = pgEnum('donation_status', [
  'pending',
  'approved',
  'in_transit',
  'delivered',
  'completed',
  'cancelled'
]);

// Users table (extends better-auth users)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  userType: userTypeEnum('user_type').notNull().default('normal_user'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('Ethiopia'),
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Companies table (for donor and recipient companies)
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  companyType: companyTypeEnum('company_type'),
  businessLicense: varchar('business_license', { length: 100 }),
  taxId: varchar('tax_id', { length: 100 }),
  description: text('description'),
  website: varchar('website', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('Ethiopia'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  verificationDocuments: jsonb('verification_documents'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Donation categories table
export const donationCategories = pgTable('donation_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Donations table
export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  donorId: integer('donor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: integer('recipient_id').references(() => users.id, { onDelete: 'set null' }),
  categoryId: integer('category_id').references(() => donationCategories.id),
  donationType: donationTypeEnum('donation_type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  quantity: integer('quantity'),
  unit: varchar('unit', { length: 50 }),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('ETB'),
  estimatedValue: decimal('estimated_value', { precision: 10, scale: 2 }),
  pickupAddress: text('pickup_address'),
  deliveryAddress: text('delivery_address'),
  pickupDate: timestamp('pickup_date'),
  deliveryDate: timestamp('delivery_date'),
  expiryDate: timestamp('expiry_date'),
  status: donationStatusEnum('donation_status').default('pending'),
  isUrgent: boolean('is_urgent').default(false),
  tags: jsonb('tags'),
  images: jsonb('images'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Donation requests table (recipients can request specific donations)
export const donationRequests = pgTable('donation_requests', {
  id: serial('id').primaryKey(),
  requesterId: integer('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => donationCategories.id),
  donationType: donationTypeEnum('donation_type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  quantity: integer('quantity'),
  unit: varchar('unit', { length: 50 }),
  estimatedValue: decimal('estimated_value', { precision: 10, scale: 2 }),
  deliveryAddress: text('delivery_address').notNull(),
  neededBy: timestamp('needed_by'),
  isUrgent: boolean('is_urgent').default(false),
  status: donationStatusEnum('donation_status').default('pending'),
  tags: jsonb('tags'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Donation matches table (connects donations with requests)
export const donationMatches = pgTable('donation_matches', {
  id: serial('id').primaryKey(),
  donationId: integer('donation_id').notNull().references(() => donations.id, { onDelete: 'cascade' }),
  requestId: integer('request_id').references(() => donationRequests.id, { onDelete: 'set null' }),
  matchedBy: integer('matched_by').references(() => users.id),
  matchScore: decimal('match_score', { precision: 3, scale: 2 }),
  status: donationStatusEnum('donation_status').default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Donation transactions table (tracks money donations)
export const donationTransactions = pgTable('donation_transactions', {
  id: serial('id').primaryKey(),
  donationId: integer('donation_id').notNull().references(() => donations.id, { onDelete: 'cascade' }),
  transactionId: varchar('transaction_id', { length: 100 }).unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('ETB'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
  gatewayResponse: jsonb('gateway_response'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Donation reviews table
export const donationReviews = pgTable('donation_reviews', {
  id: serial('id').primaryKey(),
  donationId: integer('donation_id').notNull().references(() => donations.id, { onDelete: 'cascade' }),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5 stars
  comment: text('comment'),
  isAnonymous: boolean('is_anonymous').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Campaigns table (for organizers)
export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  organizerId: integer('organizer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  goal: decimal('goal', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('ETB'),
  raised: decimal('raised', { precision: 10, scale: 2 }).default('0'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 50 }).default('active'),
  image: text('image'),
  tags: jsonb('tags'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Campaign donations table
export const campaignDonations = pgTable('campaign_donations', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  donorId: integer('donor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('ETB'),
  message: text('message'),
  isAnonymous: boolean('is_anonymous').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Sessions table for better-auth
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Verification tokens table for better-auth
export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  donations: many(donations, { relationName: 'donor' }),
  receivedDonations: many(donations, { relationName: 'recipient' }),
  donationRequests: many(donationRequests),
  campaigns: many(campaigns),
  campaignDonations: many(campaignDonations),
  reviews: many(donationReviews),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
}));

export const donationsRelations = relations(donations, ({ one, many }) => ({
  donor: one(users, {
    fields: [donations.donorId],
    references: [users.id],
    relationName: 'donor',
  }),
  recipient: one(users, {
    fields: [donations.recipientId],
    references: [users.id],
    relationName: 'recipient',
  }),
  category: one(donationCategories, {
    fields: [donations.categoryId],
    references: [donationCategories.id],
  }),
  matches: many(donationMatches),
  transactions: many(donationTransactions),
  reviews: many(donationReviews),
}));

export const donationRequestsRelations = relations(donationRequests, ({ one, many }) => ({
  requester: one(users, {
    fields: [donationRequests.requesterId],
    references: [users.id],
  }),
  category: one(donationCategories, {
    fields: [donationRequests.categoryId],
    references: [donationCategories.id],
  }),
  matches: many(donationMatches),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  organizer: one(users, {
    fields: [campaigns.organizerId],
    references: [users.id],
  }),
  donations: many(campaignDonations),
})); 