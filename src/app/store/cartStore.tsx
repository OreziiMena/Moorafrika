import { CartContract, CartItemContract } from '@/contracts/cart';
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
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error('Failed to load cart');
      const data: CartContract = await res.json();
      set({ items: data.items });
    } catch (err) {
      console.error('loadCart error', err);
    }
  },

  addItem: async (newItem) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!res.ok) throw new Error('Failed to add item to cart');

      // Sync full cart from server to keep local state authoritative
      await get().loadCart();
    } catch (err) {
      console.error('addItem error', err);
    }
  },

  removeItem: async (id) => {
    try {
      const res = await fetch(`/api/cart/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to remove item from cart');

      await get().loadCart();
    } catch (err) {
      console.error('removeItem error', err);
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      const res = await fetch(`/api/cart/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Math.max(1, quantity) }),
      });

      if (!res.ok) throw new Error('Failed to update cart item quantity');

      await get().loadCart();
    } catch (err) {
      console.error('updateQuantity error', err);
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
  }
}, 0);