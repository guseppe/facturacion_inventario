import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const storeSettings = sqliteTable('store_settings', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color'),
  currency: text('currency').default('DOP'),
  receiptFooterText: text('receipt_footer_text'),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // ADMIN, CASHIER
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  cost: real('cost').notNull(),
  stockQuantity: integer('stock_quantity').default(0),
  minStockAlert: integer('min_stock_alert').default(5),
  location: text('location'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  totalAmount: real('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull(), // CASH, CARD, TRANSFER
  userId: text('user_id').references(() => users.id).notNull(),
  status: text('status').notNull(), // PAID, CANCELLED
  idempotencyKey: text('idempotency_key').unique(),
});

export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => invoices.id).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  subtotal: real('subtotal').notNull(),
});

export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id).notNull(),
  type: text('type').notNull(), // SALE, RETURN, MANUAL_IN, MANUAL_OUT
  quantity: integer('quantity').notNull(),
  referenceId: text('reference_id'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  notes: text('notes'),
});
