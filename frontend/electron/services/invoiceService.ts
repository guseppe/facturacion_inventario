import { db } from '../db';
import { products, invoices, invoiceItems, inventoryTransactions, users, productRecipes } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export async function createInvoiceService(data: { items: any[], paymentMethod: string, totalAmount: number, clientName?: string, clientAddress?: string }) {
  const { items, paymentMethod, totalAmount, clientName, clientAddress } = data;

  let defaultUser = await db.select().from(users).limit(1);
  if (defaultUser.length === 0) {
    const userId = crypto.randomUUID();
    const newUser = await db.insert(users).values({
      id: userId,
      username: 'admin',
      passwordHash: '1995',
      role: 'ADMIN',
      isActive: true
    }).returning();
    defaultUser = newUser;
  }
  const userId = defaultUser[0].id;

  const result = db.transaction((tx) => {
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

    for (const item of items) {
      const productRecord = tx.select().from(products).where(eq(products.id, item.productId)).get();
      if (!productRecord) throw new Error(`Product ${item.productId} not found`);

      // Insert InvoiceItem
      const invoiceItemId = crypto.randomUUID();
      tx.insert(invoiceItems).values({
        id: invoiceItemId,
        invoiceId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        cost: productRecord.cost,
        subtotal: item.quantity * item.unitPrice
      }).run();

      // Process inventory deduction based on product type
      if (productRecord.type === 'SERVICE') {
        // Services do not manage stock, do nothing
        continue;
      }

      if (productRecord.type === 'STANDARD' || productRecord.type === 'MATERIAL') {
        if (productRecord.type === 'MATERIAL' && productRecord.manageStock && productRecord.stockQuantity !== null && productRecord.stockQuantity < item.quantity) {
          throw new Error(`Stock insuficiente para ${productRecord.name}`);
        }
        
        if (productRecord.manageStock) {
          tx.insert(inventoryTransactions).values({
            id: crypto.randomUUID(),
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            referenceId: invoiceId,
            date: new Date(),
            userId,
            notes: `Venta directa`
          }).run();

          tx.update(products)
            .set({ stockQuantity: (productRecord.stockQuantity || 0) - item.quantity })
            .where(eq(products.id, item.productId))
            .run();
        }
      }

      if (productRecord.type === 'COMPOSITE') {
        // Fetch Recipe
        const recipeItemsList = tx.select().from(productRecipes).where(eq(productRecipes.compositeProductId, item.productId)).all();
        
        for (const recipeItem of recipeItemsList) {
          const component = tx.select().from(products).where(eq(products.id, recipeItem.componentProductId)).get();
          if (!component) continue;
          
          if (component.type === 'STANDARD' || component.type === 'MATERIAL') {
            const consumption = item.quantity * recipeItem.quantity;
            
            if (component.type === 'MATERIAL' && component.manageStock && component.stockQuantity !== null && component.stockQuantity < consumption) {
                throw new Error(`Stock insuficiente para el componente ${component.name} (requerido para ${productRecord.name})`);
            }
            
            if (component.manageStock) {
              tx.insert(inventoryTransactions).values({
                id: crypto.randomUUID(),
                productId: component.id,
                type: 'SALE',
                quantity: -consumption,
                referenceId: invoiceId,
                date: new Date(),
                userId,
                notes: `Consumo por ensamble. Derivado de la Factura ${invoiceNumber} (Venta de: ${productRecord.name})`
              }).run();

              tx.update(products)
                .set({ stockQuantity: (component.stockQuantity || 0) - consumption })
                .where(eq(products.id, component.id))
                .run();
            }
          }
        }
      }
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
