import { post } from '@/utils/request';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginWithCodeCredentials {
  recipient: string;
  code: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone_number: string;
  full_name?: string;
  avatar_url?: string;
}

export interface SendVerificationCodeData {
  recipient: string;
  purpose: 'login' | 'register';
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    phone_number: string;
    full_name?: string;
    avatar_url?: string;
    role: string;
    phone_verified?: boolean;
    email_verified?: boolean;
  };
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
  };
  token: string;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export const authService = {
  // 用户名密码登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/users/login', credentials);
    return response;
  },

  // 验证码登录（自动识别手机号/邮箱）
  async loginWithCode(credentials: LoginWithCodeCredentials): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/users/login-with-code-auto', credentials);
    return response;
  },

  // 注册
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await post<RegisterResponse>('/users/register', data);
    return response;
  },

  // 发送验证码（自动识别手机号/邮箱）
  async sendVerificationCode(data: SendVerificationCodeData): Promise<MessageResponse> {
    const response = await post<MessageResponse>('/users/send-verification-code-auto', data);
    return response;
  },

  // 获取用户信息
  async getProfile(): Promise<AuthResponse['user']> {
    const response = await post<AuthResponse['user']>('/users/profile');
    return response;
  }
};