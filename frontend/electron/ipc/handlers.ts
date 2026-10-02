import { ipcMain } from 'electron';
import { db } from '../db';
import { products, storeSettings } from '../db/schema';
import { eq } from 'drizzle-orm';

export function registerIpcHandlers() {
  ipcMain.handle('get-products', async () => {
    try {
      const allProducts = await db.select().from(products);
      return { success: true, data: allProducts };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-product', async (_, productData) => {
    try {
      const newProduct = await db.insert(products).values(productData).returning();
      return { success: true, data: newProduct[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-store-settings', async () => {
    try {
      const settings = await db.select().from(storeSettings).limit(1);
      return { success: true, data: settings[0] || null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
