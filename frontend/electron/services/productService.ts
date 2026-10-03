import { db } from '../db';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function getProductsService() {
  const allProducts = await db.select().from(products).where(eq(products.isActive, true));
  return allProducts;
}

export async function createProductService(productData: any) {
  const id = crypto.randomUUID();
  const newProduct = await db.insert(products).values({ id, ...productData }).returning();
  return newProduct[0];
}

export async function updateProductService(id: string, productData: any) {
  const updatedProduct = await db.update(products)
    .set(productData)
    .where(eq(products.id, id))
    .returning();
  return updatedProduct[0];
}

export async function deleteProductService(id: string) {
  const deletedProduct = await db.update(products)
    .set({ isActive: false })
    .where(eq(products.id, id))
    .returning();
  return deletedProduct[0];
}
