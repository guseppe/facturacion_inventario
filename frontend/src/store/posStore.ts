import { create } from 'zustand';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stockQuantity: number;
  minStockAlert: number;
  location?: string;
  isActive: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

interface PosState {
  products: Product[];
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const usePosStore = create<PosState>((set) => ({
  products: [],
  cart: [],
  total: 0,
  isLoading: false,
  error: null,

  loadProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.getProducts();
      if (response.success) {
        set({ products: response.data, isLoading: false });
      } else {
        set({ error: response.error, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error loading products', isLoading: false });
    }
  },

  addToCart: (product) => set((state) => {
    const existingItem = state.cart.find(item => item.id === product.id);
    if (existingItem) {
      const updatedCart = state.cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      return { 
        cart: updatedCart,
        total: updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    }
    const newCart = [...state.cart, { ...product, quantity: 1 }];
    return { 
      cart: newCart,
      total: newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }),

  removeFromCart: (productId) => set((state) => {
    const newCart = state.cart.filter(item => item.id !== productId);
    return {
      cart: newCart,
      total: newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) return state; // Do not update if zero or less, should use remove instead
    const newCart = state.cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    return {
      cart: newCart,
      total: newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }),

  clearCart: () => set({ cart: [], total: 0 }),
}));
