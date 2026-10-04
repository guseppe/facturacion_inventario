import { ipcRenderer, contextBridge } from 'electron';

// Expose secure APIs to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Products
  getProducts: () => ipcRenderer.invoke('get-products'),
  createProduct: (productData: any) => ipcRenderer.invoke('create-product', productData),
  updateProduct: (id: string, productData: any) => ipcRenderer.invoke('update-product', { id, ...productData }),
  deleteProduct: (id: string) => ipcRenderer.invoke('delete-product', id),
  
  // Settings
  getStoreSettings: () => ipcRenderer.invoke('get-store-settings'),
  updateStoreSettings: (settingsData: any) => ipcRenderer.invoke('update-store-settings', settingsData),

  // Invoices & Transactions
  createInvoice: (invoiceData: any) => ipcRenderer.invoke('create-invoice', invoiceData),
  getInvoices: () => ipcRenderer.invoke('get-invoices'),
  getInventoryTransactions: () => ipcRenderer.invoke('get-inventory-transactions'),

  // Quotes
  createQuote: (quoteData: any) => ipcRenderer.invoke('create-quote', quoteData),
  getQuotes: () => ipcRenderer.invoke('get-quotes'),
  updateQuoteStatus: (id: string, status: string) => ipcRenderer.invoke('update-quote-status', id, status),

  // Peripherals and Backup
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printReceipt: (htmlContent: string, printerName?: string) => ipcRenderer.invoke('print-receipt', htmlContent, printerName),
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  selectLogo: () => ipcRenderer.invoke('select-logo'),
});

// Optionally keep generic ipcRenderer if still needed by some other parts, 
// though it's recommended to remove it eventually.
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});
