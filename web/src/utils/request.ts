import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { useAuth } from '@/hooks/useAuth';

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const { token } = useAuth.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;

    // 这里可以根据实际后端接口返回格式进行调整
    if (data.code === 0) {
      return data.data;
    }

    // 处理业务错误
    const error = new Error(data.message || '请求失败') as AxiosError;
    error.response = response;
    return Promise.reject(error);
  },
  (error: AxiosError) => {
    const { response } = error;

    // 处理 401 未授权错误
    if (response?.status === 401) {
      useAuth.getState().logout();
      window.location.href = '/login';
      return Promise.reject(new Error('请先登录'));
    }

    // 处理 403 禁止访问错误
    if (response?.status === 403) {
      return Promise.reject(new Error('没有权限访问'));
    }

    // 处理 404 不存在错误
    if (response?.status === 404) {
      return Promise.reject(new Error('请求的资源不存在'));
    }

    // 处理 500 服务器错误
    if (response?.status === 500) {
      return Promise.reject(new Error('服务器错误，请稍后重试'));
    }

    // 处理网络错误
    if (!window.navigator.onLine) {
      return Promise.reject(new Error('网络连接已断开，请检查网络'));
    }

    return Promise.reject(error);
  }
);

// GET 请求
export const get = async <T>(url: string, params?: object): Promise<T> => {
  try {
    return await request.get(url, { params });
  } catch (error) {
    throw error;
  }
};

// POST 请求
export const post = async <T>(url: string, data?: object): Promise<T> => {
  try {
    return await request.post(url, data);
  } catch (error) {
    throw error;
  }
};

// PUT 请求
export const put = async <T>(url: string, data?: object): Promise<T> => {
  try {
    return await request.put(url, data);
  } catch (error) {
    throw error;
  }
};

// DELETE 请求
export const del = async <T>(url: string, params?: object): Promise<T> => {
  try {
    return await request.delete(url, { params });
  } catch (error) {
    throw error;
  }
};

// 上传文件
export const upload = async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    return await request.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  } catch (error) {
    throw error;
  }
};

// 下载文件
export const download = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await request.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    throw error;
  }
};

export default request;
