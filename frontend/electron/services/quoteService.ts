import { db } from '../db';
import { products, quotes, quoteItems, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export async function createQuoteService(data: { items: any[], totalAmount: number, clientName?: string, clientAddress?: string }) {
  const { items, totalAmount, clientName, clientAddress } = data;

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

  const result = db.transaction((tx) => {
    const quoteId = crypto.randomUUID();
    const quoteNumber = `COT-${Date.now()}`;

    const newQuote = tx.insert(quotes).values({
      id: quoteId,
      quoteNumber,
      date: new Date(),
      totalAmount,
      userId,
      status: 'PENDING',
      clientName: clientName || 'Cliente Mostrador',
      clientAddress: clientAddress || null
    }).returning().get();

    for (const item of items) {
      const quoteItemId = crypto.randomUUID();
      tx.insert(quoteItems).values({
        id: quoteItemId,
        quoteId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice
      }).run();
    }
    return newQuote;
  });
  return result;
}

export async function getQuotesService() {
  const allQuotes = await db.select().from(quotes).orderBy(desc(quotes.date));
  
  // Fetch items for all quotes (N+1 query is fine for local SQLite)
  const quotesWithItems = [];
  for (const quote of allQuotes) {
    const items = await db.select({
      id: quoteItems.id,
      productId: quoteItems.productId,
      quantity: quoteItems.quantity,
      unitPrice: quoteItems.unitPrice,
      subtotal: quoteItems.subtotal,
      name: products.name,
    })
    .from(quoteItems)
    .leftJoin(products, eq(quoteItems.productId, products.id))
    .where(eq(quoteItems.quoteId, quote.id));
    
    quotesWithItems.push({ ...quote, items });
  }
  
  return quotesWithItems;
}

export async function updateQuoteStatusService(id: string, status: string) {
  const updated = await db.update(quotes).set({ status }).where(eq(quotes.id, id)).returning();
  return updated[0];
}
