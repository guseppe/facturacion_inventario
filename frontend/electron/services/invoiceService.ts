import { db } from '../db';
import { products, invoices, invoiceItems, inventoryTransactions, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export async function createInvoiceService(data: { items: any[], paymentMethod: string, totalAmount: number, clientName?: string, clientAddress?: string }) {
  const { items, paymentMethod, totalAmount, clientName, clientAddress } = data;

  // Create a default user if none exists (for simplicity in Phase 3)
  let defaultUser = await db.select().from(users).limit(1);
  if (defaultUser.length === 0) {
    const userId = crypto.randomUUID();
    const newUser = await db.insert(users).values({
      id: userId,
      username: 'admin',
      passwordHash: '1234',
      role: 'ADMIN',
      isActive: true
    }).returning();
    defaultUser = newUser;
  }

  const userId = defaultUser[0].id;

  // ATOMIC TRANSACTION (Synchronous for better-sqlite3)
  const result = db.transaction((tx) => {
    // 1. Create Invoice
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = `INV-${Date.now()}`;

    const newInvoice = tx.insert(invoices).values({
      id: invoiceId,
      invoiceNumber,
      date: new Date(),
      totalAmount,
      paymentMethod,
      userId,
      status: 'PAID',
      clientName: clientName || 'Cliente Mostrador',
      clientAddress: clientAddress || null
    }).returning().get();

    // 2. Loop through items
    for (const item of items) {
      // Verify stock first
      const productRecord = tx.select().from(products).where(eq(products.id, item.productId)).get();
      
      if (!productRecord) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      if (productRecord.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${productRecord.name}`);
      }

      // Insert InvoiceItem
      const invoiceItemId = crypto.randomUUID();
      tx.insert(invoiceItems).values({
        id: invoiceItemId,
        invoiceId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice
      }).run();

      // Insert InventoryTransaction
      const transactionId = crypto.randomUUID();
      tx.insert(inventoryTransactions).values({
        id: transactionId,
        productId: item.productId,
        type: 'SALE',
        quantity: -item.quantity, // Negative for sale
        referenceId: invoiceId,
        date: new Date(),
        userId
      }).run();

      // Update Product Stock
      tx.update(products)
        .set({ stockQuantity: productRecord.stockQuantity - item.quantity })
        .where(eq(products.id, item.productId))
        .run();
    }

    return newInvoice;
  });

  return result;
}

export async function getInvoicesService() {
  const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.date));
  
  const invoicesWithItems = [];
  for (const invoice of allInvoices) {
    const items = await db.select({
      id: invoiceItems.id,
      productId: invoiceItems.productId,
      quantity: invoiceItems.quantity,
      unitPrice: invoiceItems.unitPrice,
      subtotal: invoiceItems.subtotal,
      name: products.name,
    })
    .from(invoiceItems)
    .leftJoin(products, eq(invoiceItems.productId, products.id))
    .where(eq(invoiceItems.invoiceId, invoice.id));
    
    invoicesWithItems.push({ ...invoice, items });
  }
  
  return invoicesWithItems;
}

export async function getInventoryTransactionsService() {
  const allTransactions = await db.select().from(inventoryTransactions).orderBy(desc(inventoryTransactions.date));
  return allTransactions;
}
