import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService, CartItem } from '@/services/cart';
import { useAuth } from './useAuth';
import { addToast } from '@heroui/react';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  
  // API相关操作
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // 本地计算方法
  calculateTotals: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      loading: false,

      // 计算总计
      calculateTotals: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ totalItems, totalAmount });
      },

      // 从API获取购物车数据
      fetchCart: async () => {
        const { isAuthenticated } = useAuth.getState();
        if (!isAuthenticated) {
          set({ items: [], totalItems: 0, totalAmount: 0 });
          return;
        }

        try {
          set({ loading: true });
          const response = await cartService.getCart();
          set({ items: response.items });
          get().calculateTotals();
        } catch (error: any) {
          console.error('获取购物车失败:', error);
          addToast({
            title: '获取购物车失败',
            description: error.response?.data?.error || '网络错误',
            color: 'danger',
            timeout: 3000,
          });
        } finally {
          set({ loading: false });
        }
      },

      // 添加商品到购物车
      addItem: async (productId: number, quantity = 1) => {
        const { isAuthenticated } = useAuth.getState();
        if (!isAuthenticated) {
          addToast({
            title: '请先登录',
            description: '登录后才能添加商品到购物车',
            color: 'warning',
            timeout: 3000,
          });
          return;
        }

        try {
          set({ loading: true });
          await cartService.addToCart({ product_id: productId, quantity });
          
          addToast({
            title: '添加成功',
            description: '商品已添加到购物车',
            color: 'success',
            timeout: 2000,
          });
          
          // 重新获取购物车数据
          await get().fetchCart();
        } catch (error: any) {
          console.error('添加到购物车失败:', error);
          addToast({
            title: '添加失败',
            description: error.response?.data?.error || '网络错误',
            color: 'danger',
            timeout: 3000,
          });
        } finally {
          set({ loading: false });
        }
      },

      // 更新商品数量
      updateQuantity: async (productId: number, quantity: number) => {
        const { isAuthenticated } = useAuth.getState();
        if (!isAuthenticated) return;

        try {
          set({ loading: true });
          await cartService.updateCart({ product_id: productId, quantity });
          
          // 重新获取购物车数据
          await get().fetchCart();
        } catch (error: any) {
          console.error('更新购物车失败:', error);
          addToast({
            title: '更新失败',
            description: error.response?.data?.error || '网络错误',
            color: 'danger',
            timeout: 3000,
          });
        } finally {
          set({ loading: false });
        }
      },

      // 删除商品
      removeItem: async (productId: number) => {
        const { isAuthenticated } = useAuth.getState();
        if (!isAuthenticated) return;

        try {
          set({ loading: true });
          await cartService.removeFromCart({ product_id: productId });
          
          addToast({
            title: '删除成功',
            description: '商品已从购物车中移除',
            color: 'success',
            timeout: 2000,
          });
          
          // 重新获取购物车数据
          await get().fetchCart();
        } catch (error: any) {
          console.error('删除商品失败:', error);
          addToast({
            title: '删除失败',
            description: error.response?.data?.error || '网络错误',
            color: 'danger',
            timeout: 3000,
          });
        } finally {
          set({ loading: false });
        }
      },

      // 清空购物车
      clearCart: async () => {
        const { isAuthenticated } = useAuth.getState();
        if (!isAuthenticated) return;

        try {
          set({ loading: true });
          await cartService.clearCart();
          
          set({ items: [], totalItems: 0, totalAmount: 0 });
          
          addToast({
            title: '清空成功',
            description: '购物车已清空',
            color: 'success',
            timeout: 2000,
          });
        } catch (error: any) {
          console.error('清空购物车失败:', error);
          addToast({
            title: '清空失败',
            description: error.response?.data?.error || '网络错误',
            color: 'danger',
            timeout: 3000,
          });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      // 只持久化购物车数据，不持久化loading状态
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalAmount: state.totalAmount,
      }),
    }
  )
);
