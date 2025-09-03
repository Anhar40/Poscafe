"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.insertTransactionItemSchema = exports.insertTransactionSchema = exports.insertMenuItemSchema = exports.insertCategorySchema = exports.insertUserSchema = exports.transactionItemsRelations = exports.transactionsRelations = exports.menuItemsRelations = exports.categoriesRelations = exports.usersRelations = exports.transactionItems = exports.transactions = exports.menuItems = exports.categories = exports.users = exports.paymentStatusEnum = exports.orderTypeEnum = exports.userRoleEnum = exports.sessions = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// Session storage table (required for Replit Auth)
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// User roles enum
exports.userRoleEnum = (0, pg_core_1.pgEnum)("user_role", ["admin", "kasir"]);
// Order types enum
exports.orderTypeEnum = (0, pg_core_1.pgEnum)("order_type", ["dine-in", "takeaway"]);
// Payment status enum
exports.paymentStatusEnum = (0, pg_core_1.pgEnum)("payment_status", ["pending", "completed", "cancelled"]);
// User storage table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    username: (0, pg_core_1.varchar)("username", { length: 50 }).unique().notNull(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(), // Will store hashed password
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    profileImageUrl: (0, pg_core_1.text)("profile_image_url"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    role: (0, exports.userRoleEnum)("role").default("kasir").notNull(),
    isActive: (0, pg_core_1.integer)("is_active").default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Menu categories
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.varchar)("icon", { length: 50 }),
    isActive: (0, pg_core_1.integer)("is_active").default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Menu items
exports.menuItems = (0, pg_core_1.pgTable)("menu_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull().references(() => exports.categories.id),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.decimal)("price", { precision: 10, scale: 2 }).notNull(),
    imageUrl: (0, pg_core_1.varchar)("image_url"),
    isAvailable: (0, pg_core_1.integer)("is_available").default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Transactions
exports.transactions = (0, pg_core_1.pgTable)("transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    transactionNumber: (0, pg_core_1.varchar)("transaction_number", { length: 20 }).notNull().unique(),
    cashierId: (0, pg_core_1.varchar)("cashier_id").notNull().references(() => exports.users.id),
    orderType: (0, exports.orderTypeEnum)("order_type").notNull(),
    tableNumber: (0, pg_core_1.integer)("table_number"),
    subtotal: (0, pg_core_1.decimal)("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: (0, pg_core_1.decimal)("tax", { precision: 10, scale: 2 }).notNull(),
    total: (0, pg_core_1.decimal)("total", { precision: 10, scale: 2 }).notNull(),
    paidAmount: (0, pg_core_1.decimal)("paid_amount", { precision: 10, scale: 2 }).notNull(),
    changeAmount: (0, pg_core_1.decimal)("change_amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: (0, exports.paymentStatusEnum)("payment_status").default("completed").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Transaction items
exports.transactionItems = (0, pg_core_1.pgTable)("transaction_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    transactionId: (0, pg_core_1.varchar)("transaction_id").notNull().references(() => exports.transactions.id),
    menuItemId: (0, pg_core_1.varchar)("menu_item_id").notNull().references(() => exports.menuItems.id),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    unitPrice: (0, pg_core_1.decimal)("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: (0, pg_core_1.decimal)("total_price", { precision: 10, scale: 2 }).notNull(),
});
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    transactions: many(exports.transactions),
}));
exports.categoriesRelations = (0, drizzle_orm_1.relations)(exports.categories, ({ many }) => ({
    menuItems: many(exports.menuItems),
}));
exports.menuItemsRelations = (0, drizzle_orm_1.relations)(exports.menuItems, ({ one, many }) => ({
    category: one(exports.categories, {
        fields: [exports.menuItems.categoryId],
        references: [exports.categories.id],
    }),
    transactionItems: many(exports.transactionItems),
}));
exports.transactionsRelations = (0, drizzle_orm_1.relations)(exports.transactions, ({ one, many }) => ({
    cashier: one(exports.users, {
        fields: [exports.transactions.cashierId],
        references: [exports.users.id],
    }),
    items: many(exports.transactionItems),
}));
exports.transactionItemsRelations = (0, drizzle_orm_1.relations)(exports.transactionItems, ({ one }) => ({
    transaction: one(exports.transactions, {
        fields: [exports.transactionItems.transactionId],
        references: [exports.transactions.id],
    }),
    menuItem: one(exports.menuItems, {
        fields: [exports.transactionItems.menuItemId],
        references: [exports.menuItems.id],
    }),
}));
// Insert schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.categories).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    description: zod_1.z.string().nullable().optional(),
    icon: zod_1.z.string().optional().default('Utensils'),
    isActive: zod_1.z.number().optional().default(1),
});
exports.insertMenuItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.menuItems).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactions).omit({
    id: true,
    transactionNumber: true,
    createdAt: true,
});
exports.insertTransactionItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactionItems).omit({
    id: true,
});
// Login schema
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username harus diisi"),
    password: zod_1.z.string().min(1, "Password harus diisi"),
});
