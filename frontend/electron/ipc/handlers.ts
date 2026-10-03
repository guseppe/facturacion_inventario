import { ipcMain } from 'electron';
import { 
  getProductsService, 
  createProductService, 
  updateProductService, 
  deleteProductService 
} from '../services/productService';
import { 
  getStoreSettingsService, 
  updateStoreSettingsService 
} from '../services/settingsService';
import { 
  createInvoiceService, 
  getInvoicesService, 
  getInventoryTransactionsService 
} from '../services/invoiceService';

export function registerIpcHandlers() {
  // --- Products ---
  ipcMain.handle('get-products', async () => {
    try {
      const data = await getProductsService();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-product', async (_, productData) => {
    try {
      const data = await createProductService(productData);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-product', async (_, { id, ...productData }) => {
    try {
      const data = await updateProductService(id, productData);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-product', async (_, id) => {
    try {
      const data = await deleteProductService(id);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // --- Settings ---
  ipcMain.handle('get-store-settings', async () => {
    try {
      const data = await getStoreSettingsService();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-store-settings', async (_, settingsData) => {
    try {
      const data = await updateStoreSettingsService(settingsData);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // --- Invoices & Transactions ---
  ipcMain.handle('create-invoice', async (_, data) => {
    try {
      const result = await createInvoiceService(data);
      return { success: true, data: result };
    } catch (error: any) {
      console.error("Transaction Error:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-invoices', async () => {
    try {
      const data = await getInvoicesService();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-inventory-transactions', async () => {
    try {
      const data = await getInventoryTransactionsService();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
