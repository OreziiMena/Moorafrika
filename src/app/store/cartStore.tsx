import { CartContract, CartItemContract } from '@/contracts/cart';
import { handleClientError } from '@/lib/clientErrorHandler';
import axios from 'axios';
import { create } from 'zustand';

interface CartRequest {
  productId: string;
  quantity: number;
  size: string;
}

interface CartStore {
  items: CartItemContract[];
  loadCart: () => Promise<void>;
  addItem: (item: CartRequest) => Promise<void>;
  removeItem: (id: string, size: string) => Promise<void>;
  updateQuantity: (item: CartRequest) => Promise<void>;
  cartTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  // Load the cart from the server (WITH CACHE BUSTING)
  loadCart: async () => {
    try {
      const res = await axios.get<CartContract>('/api/cart', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      set({ items: res.data.items });
    } catch (err) {
      handleClientError(err);
    }
  },

  addItem: async (newItem) => {
    try {
      // Check if the exact product AND size are already in the cart
      const currentCart = get().items;
      const existingItem = currentCart.find(
        (item) => item.productId === newItem.productId && item.size === newItem.size
      );

      if (existingItem) {
        //If it exists, (PUT)
        // We add the newly selected quantity to whatever they already had in the cart
        const newQuantity = existingItem.quantity + newItem.quantity;
        
        await axios.put(`/api/cart/${encodeURIComponent(existingItem.id)}`, {
          quantity: newQuantity,
          size: newItem.size
        });
      } else {
        //If it's a brand new item, (POST)
        await axios.post('/api/cart', newItem);
      }
      await get().loadCart();
      
    } catch (err) {
      handleClientError(err);
    }
  },

  removeItem: async (id, size) => {
    try {
      await axios.delete(`/api/cart/${encodeURIComponent(id)}?size=${encodeURIComponent(size)}`);
      await get().loadCart();
    } catch (err) {
      handleClientError(err);
    }
  },

  updateQuantity: async (item) => {
    try {
      await axios.put(`/api/cart/${encodeURIComponent(item.productId)}`, {
        quantity: Math.max(1, item.quantity),
        size: item.size
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

// Kick off an initial load in the background
setTimeout(() => {
  try {
    const store = useCartStore.getState();
    void store.loadCart();
  } catch (err) {
    handleClientError(err);
  }
}, 0);