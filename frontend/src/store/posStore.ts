import { create } from 'zustand';

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
}

export interface CartItem extends Product {
  quantity: number;
}

interface PosState {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const mockProducts: Product[] = [
  { id: '1', sku: 'REG-001', name: 'Taza Personalizada', price: 450, stock_quantity: 15 },
  { id: '2', sku: 'REG-002', name: 'Libreta Decorada', price: 600, stock_quantity: 8 },
  { id: '3', sku: 'REG-003', name: 'Lápiz Grabado', price: 150, stock_quantity: 50 },
  { id: '4', sku: 'REG-004', name: 'Caja de Regalo Sorpresa', price: 1200, stock_quantity: 5 },
];

export const usePosStore = create<PosState>((set) => ({
  products: mockProducts,
  cart: [],
  total: 0,

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
