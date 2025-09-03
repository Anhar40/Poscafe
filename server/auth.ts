import type { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { loginSchema, type User } from "@shared/schema";

// Extend session type
declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

// Session middleware
export function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  app.use(session({
    secret: process.env.SESSION_SECRET || 'cafepos-secret-key-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));
}

// Auth middleware
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.user) {
    req.user = req.session.user; // Make user available in req.user
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Login function
export async function loginUser(username: string, password: string): Promise<User | null> {
  try {
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return null;
    }

    // Simple password check (in production, use bcrypt for hashed passwords)
    if (user.password === password && user.isActive) {
      // Remove password from user object for security
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }

    return null;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}