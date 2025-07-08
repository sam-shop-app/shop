// src/types.ts

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
