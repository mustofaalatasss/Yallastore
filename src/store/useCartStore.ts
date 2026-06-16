import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: string;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isSidebarOpen: boolean;
  isCheckoutOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isSidebarOpen: false,
      isCheckoutOpen: false,
      addItem: (item) => set((state) => {
        const id = `${item.name}-${item.size || 'default'}-${item.color || 'default'}`;
        const existingItem = state.items.find((i) => i.id === id);
        if (existingItem) {
          return {
            items: state.items.map((i) => 
              i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            isSidebarOpen: true,
          };
        }
        return { 
          items: [...state.items, { ...item, id }],
          isSidebarOpen: true,
        };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) => 
          i.id === id ? { ...i, quantity } : i
        ),
      })),
      clearCart: () => set({ items: [] }),
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
      openCheckout: () => set({ isCheckoutOpen: true, isSidebarOpen: false }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
    }),
    {
      name: 'yalla-cart-storage',
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state like isSidebarOpen
    }
  )
);
