
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { seedDatabase } from "../server/seed";

neonConfig.webSocketConstructor = ws;

async function setupDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    console.log("🗄️ Setting up database...");
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });

    console.log("📦 Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("🌱 Seeding database...");
    await seedDatabase();
    
    await pool.end();
    
    console.log("✅ Database setup completed successfully!");
    
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  }
}

setupDatabase()
  .then(() => {
    console.log("Database setup finished!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });
