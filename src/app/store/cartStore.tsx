import { CartContract, CartItemContract } from '@/contracts/cart';
import { handleClientError } from '@/lib/clientErrorHandler';
import axios from 'axios';
import { create } from 'zustand';

interface CartRequest {
  productId: string;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItemContract[];
  loadCart: () => Promise<void>;
  addItem: (item: CartRequest) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  cartTotal: () => number;
}


// The Smart Store (uses API routes)
export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  // Load the cart from the server
  loadCart: async () => {
    try {
      const res = await axios.get<CartContract>('/api/cart');
      set({ items: res.data.items });
    } catch (err) {
      handleClientError(err);
    }
  },

  addItem: async (newItem) => {
    try {
      await axios.post('/api/cart', newItem);
      
      // Sync full cart from server to keep local state authoritative
      await get().loadCart();
    } catch (err) {
      handleClientError(err);
    }
  },

  removeItem: async (id) => {
    try {
      await axios.delete(`/api/cart/${encodeURIComponent(id)}`);

      await get().loadCart();
    } catch (err) {
      handleClientError(err);
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      await axios.put(`/api/cart/${encodeURIComponent(id)}`, {
        quantity: Math.max(1, quantity)
      });

      await get().loadCart();
    } catch (err) {
      handleClientError(err);
    }
  },

  cartTotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
}));

// Kick off an initial load in the background (best-effort)
setTimeout(() => {
  try {
    const store = useCartStore.getState();
    void store.loadCart();
  } catch (err) {
    // ignore
    handleClientError(err);
  }
}, 0);