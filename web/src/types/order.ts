export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled' | 'refunding' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
}

export interface OrderPayment {
  method: 'alipay' | 'wechat' | 'unionpay';
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;
  transactionId?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  address: OrderAddress;
  payment: OrderPayment;
  timeline: OrderTimeline[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
  firstItemImage: string;
}

export const OrderStatusMap: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '已付款',
  shipping: '配送中',
  delivered: '已送达',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
};

export const OrderStatusColorMap: Record<OrderStatus, string> = {
  pending: 'warning',
  paid: 'primary',
  shipping: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  refunding: 'warning',
  refunded: 'default',
};
