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
import {
  createQuoteService,
  getQuotesService,
  updateQuoteStatusService
} from '../services/quoteService';

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

  // --- Quotes ---
  ipcMain.handle('create-quote', async (_, data) => {
    try {
      const result = await createQuoteService(data);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-quotes', async () => {
    try {
      const data = await getQuotesService();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-quote-status', async (_, id, status) => {
    try {
      const data = await updateQuoteStatusService(id, status);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // --- Auth ---
  ipcMain.handle('auth:login', async (_, credentials) => {
    try {
      const { loginService } = require('../services/authService');
      const user = await loginService(credentials);
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    return { success: true };
  });

  // --- Reports ---
  ipcMain.handle('reports:getDashboardMetrics', async () => {
    try {
      const { getDashboardMetricsService } = require('../services/reportService');
      const data = await getDashboardMetricsService();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('reports:getProfitAndLoss', async (_, dateRange) => {
    try {
      const { getProfitAndLossService } = require('../services/reportService');
      const data = await getProfitAndLossService(dateRange);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('reports:getLowStockAlerts', async () => {
    try {
      const { getLowStockAlertsService } = require('../services/reportService');
      const data = await getLowStockAlertsService();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('reports:getInventoryAudit', async (_, filters) => {
    try {
      const { getInventoryAuditService } = require('../services/reportService');
      const data = await getInventoryAuditService(filters);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // --- Peripherals & Backups ---
  ipcMain.handle('get-printers', async (event) => {
    try {
      const printers = await event.sender.getPrintersAsync();
      return { success: true, data: printers };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('print-receipt', async (event, htmlContent, printerName) => {
    try {
      const { BrowserWindow } = require('electron');
      const win = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      return new Promise((resolve) => {
        win.webContents.on('did-finish-load', () => {
          win.webContents.print({
            silent: true,
            deviceName: printerName,
            color: false,
            margins: { marginType: 'none' },
            landscape: false,
            pagesPerSheet: 1,
            collate: false,
            copies: 1,
          }, (success, failureReason) => {
            win.close();
            if (success) {
              resolve({ success: true, data: 'Printed successfully' });
            } else {
              resolve({ success: false, error: failureReason });
            }
          });
        });
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('backup-database', async () => {
    try {
      const { dialog } = require('electron');
      const fs = require('fs');
      const path = require('path');
      const { dbPath } = require('../db/index');

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Guardar Copia de Seguridad',
        defaultPath: 'respaldo_papeleria_pos.db',
        filters: [
          { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Backup canceled' };
      }

      fs.copyFileSync(dbPath, filePath);
      return { success: true, data: filePath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('select-logo', async () => {
    try {
      const { dialog, app } = require('electron');
      const fs = require('fs');
      const path = require('path');

      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Seleccionar Logo',
        filters: [
          { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp'] }
        ],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) {
        return { success: false, error: 'Cancelado' };
      }

      const sourcePath = filePaths[0];
      const ext = path.extname(sourcePath);
      const fileName = `logo_${Date.now()}${ext}`;
      const userDataPath = app.getPath('userData');
      const destPath = path.join(userDataPath, fileName);

      fs.copyFileSync(sourcePath, destPath);
      
      const fileBuffer = fs.readFileSync(destPath);
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      
      return { success: true, data: dataUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
