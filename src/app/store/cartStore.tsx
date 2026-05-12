import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;   
  imageUrl: string; 
  quantity: number; 
  variant?: string;
}


interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void; 
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartTotal: () => number;
}

// The Smart Store
export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (newItem) => {
    set((state) => {
      // Check if the item is already in the bag
      const existingItem = state.items.find((item) => item.id === newItem.id);
      
      if (existingItem) {
        // If it's already there, just bump the quantity by 1
        return {
          items: state.items.map((item) =>
            item.id === newItem.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          ),
        };
      }
      
      // If it's brand new, add it to the array with a starting quantity of 1
      return { items: [...state.items, { ...newItem, quantity: 1 }] };
    });
  },

  removeItem: (id) => {
    set((state) => ({ 
      items: state.items.filter((item) => item.id !== id) 
    }));
  },

  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item //User can't set quantity below 1
      ),
    }));
  },

  cartTotal: () => {
    // Look at all items and calculate the grand total
    return get().items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  },
}));