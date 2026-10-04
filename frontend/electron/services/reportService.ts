import { db } from '../db';
import { invoices, invoiceItems, products, inventoryTransactions } from '../db/schema';
import { eq, and, sql, lte, desc, gte, inArray } from 'drizzle-orm';

export async function getDashboardMetricsService() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todaySalesQuery = await db.select({
    total: sql<number>`SUM(${invoices.totalAmount})`,
    count: sql<number>`COUNT(${invoices.id})`,
  })
  .from(invoices)
  .where(and(
    eq(invoices.status, 'PAID'),
    gte(invoices.date, today)
  ));

  const monthSalesQuery = await db.select({
    total: sql<number>`SUM(${invoices.totalAmount})`,
  })
  .from(invoices)
  .where(and(
    eq(invoices.status, 'PAID'),
    gte(invoices.date, startOfMonth)
  ));

  return {
    todaySales: todaySalesQuery[0]?.total || 0,
    todayTransactions: todaySalesQuery[0]?.count || 0,
    monthSales: monthSalesQuery[0]?.total || 0,
  };
}

export async function getProfitAndLossService(dateRange?: { startDate: string, endDate: string }) {
  let conditions = eq(invoices.status, 'PAID');
  
  if (dateRange && dateRange.startDate && dateRange.endDate) {
    const start = new Date(dateRange.startDate + 'T00:00:00');
    const end = new Date(dateRange.endDate + 'T23:59:59.999');
    
    conditions = and(
      conditions,
      gte(invoices.date, start),
      lte(invoices.date, end)
    ) as any;
  }

  const result = await db.select({
    totalSales: sql<number>`SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice})`,
    totalCogs: sql<number>`SUM(${invoiceItems.quantity} * ${invoiceItems.cost})`,
  })
  .from(invoiceItems)
  .innerJoin(invoices, eq(invoices.id, invoiceItems.invoiceId))
  .where(conditions);

  const totalSales = result[0]?.totalSales || 0;
  const totalCogs = result[0]?.totalCogs || 0;

  return {
    totalSales,
    totalCogs,
    grossProfit: totalSales - totalCogs
  };
}

export async function getLowStockAlertsService() {
  return await db.select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        inArray(products.type, ['STANDARD', 'MATERIAL']),
        eq(products.manageStock, true),
        lte(products.stockQuantity, products.minStockAlert)
      )
    );
}

export async function getInventoryValuationService() {
  const result = await db.select({
    totalValue: sql<number>`SUM(${products.stockQuantity} * ${products.cost})`,
  })
  .from(products)
  .where(
    and(
      eq(products.isActive, true),
      inArray(products.type, ['STANDARD', 'MATERIAL']),
      eq(products.manageStock, true)
    )
  );
  
  return result[0]?.totalValue || 0;
}

export async function getInventoryAuditService(filters?: { productId?: string }) {
  let conditions = undefined;
  
  if (filters && filters.productId) {
    conditions = eq(inventoryTransactions.productId, filters.productId);
  }

  return await db.select({
    transaction: inventoryTransactions,
    product: {
      name: products.name,
      sku: products.sku,
      type: products.type
    }
  })
  .from(inventoryTransactions)
  .innerJoin(products, eq(products.id, inventoryTransactions.productId))
  .where(conditions)
  .orderBy(desc(inventoryTransactions.date));
}
