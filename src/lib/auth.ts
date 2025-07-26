import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../config/db";
import { users, sessions, verificationTokens, passwordResetTokens } from "../schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      sessions,
      verificationTokens,
      passwordResetTokens,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    // Remove custom password configuration to use better-auth defaults
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});

// Export the auth handler for Express
export const authHandler = auth.handler;
