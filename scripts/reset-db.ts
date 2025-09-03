
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function resetDatabase() {
  try {
    console.log("🗑️ Dropping all tables...");
    
    // Drop tables in correct order (reverse of dependencies)
    await db.execute(sql`DROP TABLE IF EXISTS transaction_items CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS transactions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS menu_items CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS categories CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS sessions CASCADE`);
    
    // Drop enums
    await db.execute(sql`DROP TYPE IF EXISTS user_role CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS order_type CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS payment_status CASCADE`);
    
    console.log("✅ Database reset completed!");
    
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}

resetDatabase()
  .then(() => {
    console.log("Database reset successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database reset failed:", error);
    process.exit(1);
  });
