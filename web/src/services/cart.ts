import { get, post, put, del } from '@/utils/request';

export interface CartItem {
  cart_id: number;
  product_id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface CartResponse {
  items: CartItem[];
}

export interface AddToCartRequest {
  product_id: number;
  quantity?: number;
}

export interface UpdateCartRequest {
  product_id: number;
  quantity: number;
}

export interface RemoveFromCartRequest {
  product_id: number;
}

export interface ApiResponse {
  message: string;
}

export const cartService = {
  // 获取购物车列表
  async getCart(): Promise<CartResponse> {
    return await get<CartResponse>('/cart');
  },

  // 添加商品到购物车
  async addToCart(data: AddToCartRequest): Promise<ApiResponse> {
    return await post<ApiResponse>('/cart/add', data);
  },

  // 更新购物车商品数量
  async updateCart(data: UpdateCartRequest): Promise<ApiResponse> {
    return await put<ApiResponse>('/cart/update', data);
  },

  // 删除购物车商品
  async removeFromCart(data: RemoveFromCartRequest): Promise<ApiResponse> {
    return await del<ApiResponse>('/cart/remove', data);
  },

  // 清空购物车
  async clearCart(): Promise<ApiResponse> {
    return await del<ApiResponse>('/cart/clear');
  },
};