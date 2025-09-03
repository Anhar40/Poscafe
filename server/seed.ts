import { db } from "./db";
import { users, categories, menuItems } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Create demo users
    const demoUsers = [
      {
        id: "admin-1",
        username: "admin",
        password: "admin123", // In production, this should be hashed
        email: "admin@cafepos.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin" as const,
        isActive: 1,
      },
      {
        id: "kasir-1", 
        username: "kasir",
        password: "kasir123", // In production, this should be hashed
        email: "kasir@cafepos.com",
        firstName: "Kasir",
        lastName: "User",
        role: "kasir" as const,
        isActive: 1,
      }
    ];

    // Insert demo users (using upsert to avoid duplicates)
    for (const user of demoUsers) {
      try {
        const existingUser = await db.select().from(users).where(eq(users.username, user.username)).limit(1);
        if (existingUser.length === 0) {
          await db.insert(users).values(user);
          console.log(`✓ Created user: ${user.username}`);
        } else {
          console.log(`- User already exists: ${user.username}`);
        }
      } catch (error) {
        console.log(`- Error creating user ${user.username}:`, error);
      }
    }

    // Create demo categories
    const demoCategories = [
      {
        id: "cat-1",
        name: "Kopi",
        description: "Berbagai macam kopi",
        icon: "Coffee",
        isActive: 1,
      },
      {
        id: "cat-2", 
        name: "Teh",
        description: "Minuman teh",
        icon: "TeaCup",
        isActive: 1,
      },
      {
        id: "cat-3",
        name: "Makanan",
        description: "Makanan ringan dan berat",
        icon: "UtensilsCrossed",
        isActive: 1,
      }
    ];

    for (const category of demoCategories) {
      try {
        const existing = await db.select().from(categories).where(eq(categories.name, category.name)).limit(1);
        if (existing.length === 0) {
          await db.insert(categories).values(category);
          console.log(`✓ Created category: ${category.name}`);
        } else {
          console.log(`- Category already exists: ${category.name}`);
        }
      } catch (error) {
        console.log(`- Error creating category ${category.name}:`, error);
      }
    }

    // Create demo menu items
    const demoMenuItems = [
      {
        id: "menu-1",
        categoryId: "cat-1",
        name: "Espresso",
        description: "Kopi espresso klasik",
        price: "25000",
        isAvailable: 1,
      },
      {
        id: "menu-2",
        categoryId: "cat-1", 
        name: "Cappuccino",
        description: "Kopi dengan susu foam",
        price: "30000",
        isAvailable: 1,
      },
      {
        id: "menu-3",
        categoryId: "cat-2",
        name: "Teh Tarik",
        description: "Teh dengan susu",
        price: "20000",
        isAvailable: 1,
      },
      {
        id: "menu-4",
        categoryId: "cat-3",
        name: "Roti Bakar",
        description: "Roti bakar dengan selai",
        price: "15000",
        isAvailable: 1,
      }
    ];

    for (const item of demoMenuItems) {
      try {
        const existing = await db.select().from(menuItems).where(eq(menuItems.name, item.name)).limit(1);
        if (existing.length === 0) {
          await db.insert(menuItems).values(item);
          console.log(`✓ Created menu item: ${item.name}`);
        } else {
          console.log(`- Menu item already exists: ${item.name}`);
        }
      } catch (error) {
        console.log(`- Error creating menu item ${item.name}:`, error);
      }
    }

    console.log("🎉 Database seeding completed!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if called directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };