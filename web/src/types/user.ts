export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birthdate?: string;
  memberSince: string;
  level: number;
  points: number;
  stats: {
    orderCount: number;
    favoriteCount: number;
    reviewCount: number;
    spentAmount: number;
  };
  preferences: {
    newsletter: boolean;
    smsNotification: boolean;
    pushNotification: boolean;
  };
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
  tag?: string; // 如：'家'、'公司'
}

export interface UserBankCard {
  id: string;
  bank: string;
  lastFourDigits: string;
  cardType: 'debit' | 'credit';
  isDefault: boolean;
}

export interface UserUpdateInput {
  name?: string;
  phone?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birthdate?: string;
  preferences?: {
    newsletter?: boolean;
    smsNotification?: boolean;
    pushNotification?: boolean;
  };
}

export type UserTab = 'profile' | 'orders' | 'favorites' | 'addresses' | 'settings';

export const UserLevelMap: Record<number, string> = {
  0: '普通会员',
  1: '白银会员',
  2: '黄金会员',
  3: '铂金会员',
  4: '钻石会员',
};

export const UserLevelThresholds: Record<number, number> = {
  0: 0,
  1: 1000,
  2: 5000,
  3: 20000,
  4: 50000,
};

export const UserLevelColors: Record<number, string> = {
  0: 'default',
  1: 'primary',
  2: 'warning',
  3: 'secondary',
  4: 'success',
};
