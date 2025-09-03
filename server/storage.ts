import {
  users,
  categories,
  menuItems,
  transactions,
  transactionItems,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type MenuItemWithCategory,
  type Transaction,
  type InsertTransaction,
  type TransactionItem,
  type InsertTransactionItem,
  type TransactionWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (for manual auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(userData: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Menu operations
  getMenuItems(): Promise<MenuItemWithCategory[]>;
  getMenuItemsByCategory(categoryId: string): Promise<MenuItemWithCategory[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  addTransactionItems(transactionId: string, items: InsertTransactionItem[]): Promise<TransactionItem[]>;
  getTransactions(limit?: number): Promise<TransactionWithDetails[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<TransactionWithDetails[]>;
  getDailySales(date: Date): Promise<{
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    topItem: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (for manual auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, 1))
      .orderBy(categories.name);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    console.log('Creating category in storage:', categoryData);
    
    // Ensure proper data formatting
    const formattedData = {
      name: categoryData.name,
      description: categoryData.description || null,
      icon: categoryData.icon || 'Utensils',
      isActive: categoryData.isActive || 1,
    };
    
    console.log('Formatted category data:', formattedData);
    
    const [category] = await db
      .insert(categories)
      .values(formattedData)
      .returning();
      
    console.log('Category created successfully:', category);
    return category;
  }

  async updateCategory(id: string, categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db
      .delete(categories)
      .where(eq(categories.id, id));
  }

  // Menu operations
  async getMenuItems(): Promise<MenuItemWithCategory[]> {
    return await db
      .select({
        id: menuItems.id,
        categoryId: menuItems.categoryId,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        imageUrl: menuItems.imageUrl,
        isAvailable: menuItems.isAvailable,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          isActive: categories.isActive,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        }
      })
      .from(menuItems)
      .innerJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(and(eq(menuItems.isAvailable, 1), eq(categories.isActive, 1)))
      .orderBy(categories.name, menuItems.name);
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItemWithCategory[]> {
    return await db
      .select({
        id: menuItems.id,
        categoryId: menuItems.categoryId,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        imageUrl: menuItems.imageUrl,
        isAvailable: menuItems.isAvailable,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          isActive: categories.isActive,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        }
      })
      .from(menuItems)
      .innerJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(
        and(
          eq(menuItems.categoryId, categoryId),
          eq(menuItems.isAvailable, 1),
          eq(categories.isActive, 1)
        )
      )
      .orderBy(menuItems.name);
  }

  async createMenuItem(menuItemData: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db
      .insert(menuItems)
      .values(menuItemData)
      .returning();
    return menuItem;
  }

  async updateMenuItem(id: string, menuItemData: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db
      .update(menuItems)
      .set({ ...menuItemData, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return menuItem;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db
      .delete(menuItems)
      .where(eq(menuItems.id, id));
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    // Generate transaction number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [{ value: nextNumber }] = await db
      .select({ value: count() })
      .from(transactions)
      .where(sql`DATE(created_at) = CURRENT_DATE`);

    const transactionNumber = `TRX-${today}-${String(Number(nextNumber) + 1).padStart(3, '0')}`;

    const [transaction] = await db
      .insert(transactions)
      .values({
        ...transactionData,
        transactionNumber,
      })
      .returning();
    return transaction;
  }

  async addTransactionItems(transactionId: string, items: InsertTransactionItem[]): Promise<TransactionItem[]> {
    const itemsWithTransactionId = items.map(item => ({
      ...item,
      transactionId,
    }));

    return await db
      .insert(transactionItems)
      .values(itemsWithTransactionId)
      .returning();
  }

  async getTransactions(limit: number = 50): Promise<TransactionWithDetails[]> {
    const result = await db
      .select({
        id: transactions.id,
        transactionNumber: transactions.transactionNumber,
        cashierId: transactions.cashierId,
        orderType: transactions.orderType,
        tableNumber: transactions.tableNumber,
        subtotal: transactions.subtotal,
        tax: transactions.tax,
        total: transactions.total,
        paidAmount: transactions.paidAmount,
        changeAmount: transactions.changeAmount,
        paymentStatus: transactions.paymentStatus,
        createdAt: transactions.createdAt,
        cashier: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
           password: users.password,
          lastName: users.lastName,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.cashierId, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    // Get transaction items for each transaction
    const transactionsWithItems = await Promise.all(
      result.map(async (transaction) => {
        const items = await db
          .select({
            id: transactionItems.id,
            transactionId: transactionItems.transactionId,
            menuItemId: transactionItems.menuItemId,
            quantity: transactionItems.quantity,
            unitPrice: transactionItems.unitPrice,
            totalPrice: transactionItems.totalPrice,
            menuItem: {
              id: menuItems.id,
              categoryId: menuItems.categoryId,
              name: menuItems.name,
              description: menuItems.description,
              price: menuItems.price,
              imageUrl: menuItems.imageUrl,
              isAvailable: menuItems.isAvailable,
              createdAt: menuItems.createdAt,
              updatedAt: menuItems.updatedAt,
            }
          })
          .from(transactionItems)
          .innerJoin(menuItems, eq(transactionItems.menuItemId, menuItems.id))
          .where(eq(transactionItems.transactionId, transaction.id));

        return {
          ...transaction,
          items,
        };
      })
    );

    return transactionsWithItems;
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<TransactionWithDetails[]> {
    const result = await db
      .select({
        id: transactions.id,
        transactionNumber: transactions.transactionNumber,
        cashierId: transactions.cashierId,
        orderType: transactions.orderType,
        tableNumber: transactions.tableNumber,
        subtotal: transactions.subtotal,
        tax: transactions.tax,
        total: transactions.total,
        paidAmount: transactions.paidAmount,
        changeAmount: transactions.changeAmount,
        paymentStatus: transactions.paymentStatus,
        createdAt: transactions.createdAt,
        cashier: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
          password: users.password,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.cashierId, users.id))
      .where(
        and(
          sql`DATE(${transactions.createdAt}) >= ${startDate.toISOString().split('T')[0]}`,
          sql`DATE(${transactions.createdAt}) <= ${endDate.toISOString().split('T')[0]}`
        )
      )
      .orderBy(desc(transactions.createdAt));

    // Get transaction items for each transaction
    const transactionsWithItems = await Promise.all(
      result.map(async (transaction) => {
        const items = await db
          .select({
            id: transactionItems.id,
            transactionId: transactionItems.transactionId,
            menuItemId: transactionItems.menuItemId,
            quantity: transactionItems.quantity,
            unitPrice: transactionItems.unitPrice,
            totalPrice: transactionItems.totalPrice,
            menuItem: {
              id: menuItems.id,
              categoryId: menuItems.categoryId,
              name: menuItems.name,
              description: menuItems.description,
              price: menuItems.price,
              imageUrl: menuItems.imageUrl,
              isAvailable: menuItems.isAvailable,
              createdAt: menuItems.createdAt,
              updatedAt: menuItems.updatedAt,
            }
          })
          .from(transactionItems)
          .innerJoin(menuItems, eq(transactionItems.menuItemId, menuItems.id))
          .where(eq(transactionItems.transactionId, transaction.id));

        return {
          ...transaction,
          items,
        };
      })
    );

    return transactionsWithItems;
  }

  async getDailySales(date: Date): Promise<{
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    topItem: string;
  }> {
    const dateStr = date.toISOString().split('T')[0];

    // Get total sales and transaction count
    const [salesData] = await db
      .select({
        totalSales: sql<string>`COALESCE(SUM(${transactions.total}), 0)`,
        totalTransactions: count(transactions.id)
      })
      .from(transactions)
      .where(sql`DATE(${transactions.createdAt}) = ${dateStr}`);

    // Get top selling item
    const topItemResult = await db
      .select({
        itemName: menuItems.name,
        totalQuantity: sql<string>`SUM(${transactionItems.quantity})`
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .innerJoin(menuItems, eq(transactionItems.menuItemId, menuItems.id))
      .where(sql`DATE(${transactions.createdAt}) = ${dateStr}`)
      .groupBy(menuItems.id, menuItems.name)
      .orderBy(desc(sql`SUM(${transactionItems.quantity})`))
      .limit(1);

    const totalSales = parseFloat(salesData.totalSales || '0');
    const totalTransactions = salesData.totalTransactions || 0;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const topItem = topItemResult[0]?.itemName || 'Tidak ada';

    return {
      totalSales,
      totalTransactions,
      averageTransaction,
      topItem,
    };
  }
}

export const storage = new DatabaseStorage();