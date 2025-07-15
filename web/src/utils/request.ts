import axios, { AxiosInstance, AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: "http://localhost:13100",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
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
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    console.error('API请求错误:', error);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
    return Promise.reject(error);
  },
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
export const upload = async <T>(
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<T> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    return await request.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });
  } catch (error) {
    throw error;
  }
};

// 下载文件
export const download = async (
  url: string,
  filename: string,
): Promise<void> => {
  try {
    const response = await request.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
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
