import type { RowDataPacket } from "mysql2/promise";
// API响应中单个商品的价格信息
export interface PriceInfo {
  priceType: number;
  price: string;
}

// API响应中单个商品的库存信息
export interface StockInfo {
  stockQuantity: number;
}

// API响应中单个商品的完整结构
export interface Product {
  spuId: string;
  storeId: string;
  title?: string;
  subTitle?: string;
  image?: string;
  priceInfo?: PriceInfo[];
  stockInfo?: StockInfo;
  isAvailable?: boolean;
  isImport?: boolean;
  categoryIdList?: string[];
}

// HAR文件中单个请求条目
export interface HarEntry {
  request: {
    url: string;
  };
  response: {
    content?: {
      text?: string;
    };
  };
}

// HAR文件的顶层结构
export interface Har {
  log: {
    entries: HarEntry[];
  };
}

// 用户信息
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone_number: string;
  role: "client" | "admin";
  status: number;
  created_at: string;
  updated_at?: string;
  password: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  wechat_openid?: string;
  wechat_unionid?: string;
  last_login_at?: string;
  login_method?: "password" | "phone" | "email" | "wechat";
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  phone_number: string;
  full_name?: string;
  avatar_url?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface VerificationCodeRequest {
  recipient: string;
  type: "phone" | "email";
  purpose: "login" | "register";
}

export interface CodeLoginRequest {
  recipient: string;
  code: string;
  type: "phone" | "email";
}

// 分类数据接口
export interface Category extends RowDataPacket {
  id: string;
  parent_id: string | null;
  name: string;
  level: number;
  image_url: string | null;
  sort_order: number;
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}
