import { create } from 'zustand';


// Define what a cart item looks like
interface CartItem {
  id: string;
  name: string;
  price: string;
  imageSrc: string;
}

// Define the rules for the store
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
}

// Create the actual store
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));