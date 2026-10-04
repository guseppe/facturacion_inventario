import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const storeSettings = sqliteTable('store_settings', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color'),
  currency: text('currency').default('DOP'),
  receiptFooterText: text('receipt_footer_text'),
  address: text('address'),
  bankName: text('bank_name'),
  bankAccount: text('bank_account'),
  ownerName: text('owner_name'),
  ownerId: text('owner_id'),
  printerName: text('printer_name'),
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
  type: text('type', { enum: ['STANDARD', 'MATERIAL', 'SERVICE', 'COMPOSITE'] }).notNull().default('STANDARD'),
  manageStock: integer('manage_stock', { mode: 'boolean' }).default(true),
  price: real('price').notNull(),
  cost: real('cost').notNull(),
  stockQuantity: real('stock_quantity').default(0),
  minStockAlert: real('min_stock_alert').default(5),
  location: text('location'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const productRecipes = sqliteTable('product_recipes', {
  id: text('id').primaryKey(),
  compositeProductId: text('composite_product_id').references(() => products.id).notNull(),
  componentProductId: text('component_product_id').references(() => products.id).notNull(),
  quantity: real('quantity').notNull(),
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
  clientName: text('client_name').default('Cliente Mostrador'),
  clientAddress: text('client_address'),
});

export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => invoices.id).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  cost: real('cost').notNull().default(0),
  subtotal: real('subtotal').notNull(),
});

export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id).notNull(),
  type: text('type').notNull(), // SALE, RETURN, MANUAL_IN, MANUAL_OUT
  quantity: real('quantity').notNull(),
  referenceId: text('reference_id'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  notes: text('notes'),
});

export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey(),
  quoteNumber: text('quote_number').notNull().unique(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  totalAmount: real('total_amount').notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  status: text('status').notNull(), // PENDING, APPROVED, REJECTED
  clientName: text('client_name').default('Cliente Mostrador'),
  clientAddress: text('client_address'),
});

export const quoteItems = sqliteTable('quote_items', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id').references(() => quotes.id).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  subtotal: real('subtotal').notNull(),
});
