import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSession, isAuthenticated, loginUser } from "./auth";
import {
  insertCategorySchema,
  insertMenuItemSchema,
  insertTransactionSchema,
  insertTransactionItemSchema,
  loginSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupSession(app);

  // Auth routes
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await loginUser(username, password);
      
      if (!user) {
        return res.status(401).json({ message: "Username atau password salah" });
      }

      // Store user in session
      req.session.user = user;
      res.json({ message: "Login berhasil", user });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Login gagal" });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout gagal" });
      }
      res.json({ message: "Logout berhasil" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories routes
  app.get('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });



app.post('/api/categories', isAuthenticated, async (req: any, res) => {
  try {
    // 🔐 Cek user harus admin
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log('Raw request body:', req.body);
    console.log('Request content-type:', req.headers['content-type']);

    // 📋 Validasi awal
    if (!req.body || !req.body.name) {
      return res.status(400).json({
        message: "Nama kategori harus diisi",
        received: req.body
      });
    }

    console.log('Creating category with data:', req.body);

    // ✅ Validasi schema Zod
    const categoryData = insertCategorySchema.parse(req.body);
    console.log('Parsed category data:', categoryData);

    // 💾 Simpan ke DB
    const category = await storage.createCategory(categoryData);
    console.log('Category created successfully:', category);

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      category
    });

  } catch (err: unknown) {
    // Pastikan error selalu aman dibaca
    console.error("Error creating category:", err);

    if (err instanceof z.ZodError) {
      console.error("Validation errors:", err.errors);
      return res.status(400).json({
        message: "Data tidak valid",
        errors: err.errors,
        details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }

    // Cek error DB
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const dbErr = err as { code?: string; message?: string };
      if (dbErr.code === '23505') {
        return res.status(409).json({
          message: "Kategori dengan nama tersebut sudah ada"
        });
      }
      return res.status(500).json({
        message: "Gagal menambah kategori",
        error: dbErr.message || "Unknown database error",
        code: dbErr.code
      });
    }

    // Fallback untuk error tak terduga
    res.status(500).json({
      message: "Gagal menambah kategori",
      error: err instanceof Error ? err.message : String(err)
    });
  }
});


  app.put('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = req.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = req.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Menu items routes
  app.get('/api/menu-items', isAuthenticated, async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get('/api/menu-items/category/:categoryId', isAuthenticated, async (req, res) => {
    try {
      const { categoryId } = req.params;
      const menuItems = await storage.getMenuItemsByCategory(categoryId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items by category:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post('/api/menu-items', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = req.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put('/api/menu-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = req.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.updateMenuItem(id, menuItemData);
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/menu-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = req.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      await storage.deleteMenuItem(id);
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Transactions routes

app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Schema transaksi tanpa cashierId & transactionId di items
    const transactionSchema = insertTransactionSchema
      .omit({ cashierId: true }) // Hapus cashierId dari validasi request
      .extend({
        items: z.array(
          insertTransactionItemSchema.omit({ transactionId: true })
        ),
      });

    // Parse & validasi data dari request
    const { items, ...transactionData } = transactionSchema.parse(req.body);

    // 1️⃣ Buat transaksi, isi cashierId dari session user
    const transaction = await storage.createTransaction({
      ...transactionData,
      cashierId: user.id, // Diambil dari req.user, bukan dari body
    });

    // 2️⃣ Tambahkan transactionId ke setiap item
    const itemsWithId = items.map((item) => ({
      ...item,
      transactionId: transaction.id,
    }));

    // 3️⃣ Simpan items ke DB
    await storage.addTransactionItems(transaction.id, itemsWithId);

    res.status(201).json(transaction);

  } catch (err: unknown) {
    console.error("Error creating transaction:", err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data",
        errors: err.errors,
      });
    }

    res.status(500).json({
      message: "Failed to create transaction",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const transactions = await storage.getTransactions(limit);
    res.json(transactions);

  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

  // Dashboard routes
  app.get('/api/dashboard/daily-sales', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const date = req.query.date ? new Date(req.query.date) : new Date();
      const salesData = await storage.getDailySales(date);
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
      res.status(500).json({ message: "Failed to fetch daily sales" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
