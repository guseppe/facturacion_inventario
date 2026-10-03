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
  };
  ipcRenderer: any;
}
