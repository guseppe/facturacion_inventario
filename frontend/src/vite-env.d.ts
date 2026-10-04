/// <reference types="vite/client" />

interface Window {
  api: {
    getProducts: () => Promise<any>;
    createProduct: (productData: any) => Promise<any>;
    updateProduct: (id: string, productData: any) => Promise<any>;
    deleteProduct: (id: string) => Promise<any>;
    
    getStoreSettings: () => Promise<any>;
    updateStoreSettings: (settingsData: any) => Promise<any>;
    
    createInvoice: (invoiceData: any) => Promise<any>;
    getInvoices: () => Promise<any>;
    getInventoryTransactions: () => Promise<any>;
    
    createQuote: (quoteData: any) => Promise<any>;
    getQuotes: () => Promise<any>;
    updateQuoteStatus: (id: string, status: string) => Promise<any>;
    
    getPrinters: () => Promise<any>;
    printReceipt: (htmlContent: string, printerName?: string) => Promise<any>;
    backupDatabase: () => Promise<any>;
    selectLogo: () => Promise<any>;
  };
  ipcRenderer: any;
}
