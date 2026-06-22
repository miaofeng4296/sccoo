import Taro from '@tarojs/taro';

// Change this to your production URL
const BASE_URL = 'http://localhost:3000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
}

async function request<T = Record<string, unknown>>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    const res = await Taro.request({
      url: `${BASE_URL}${path}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return res.data as T;
  } catch (err) {
    console.error(`API Error: ${path}`, err);
    throw err;
  }
}

// Posts
export const api = {
  // Get posts list
  getPosts: (params?: { page?: number; cityId?: number; type?: string; q?: string }) =>
    request<{ posts: { id: number; title: string; type: string; priceMin?: number; priceMax?: number }[] }>(
      `/xinxi/`
    ),

  // Get post detail
  getPost: (id: number) =>
    Taro.request({ url: `${BASE_URL}/xinxi/${id}` }), // Will parse HTML, better to create JSON API

  // Get cities
  getCities: () =>
    request<{ id: number; name: string }[]>('/api/cities'),

  // Get categories
  getCategories: () =>
    request<{ id: number; name: string; slug: string }[]>('/api/categories'),

  // Create post
  createPost: (data: {
    title: string; content: string; type: string;
    categoryId: number; cityId: number;
    priceMin?: number; priceMax?: number;
    contactName?: string; contactPhone?: string; contactWechat?: string;
  }) =>
    request<{ id: number }>('/api/posts', { method: 'POST', data }),

  // Login
  login: (email: string, password: string) =>
    request<Record<string, unknown>>('/api/auth/callback/credentials', {
      method: 'POST',
      data: { email, password, csrfToken: 'miniapp' },
    }),

  // Register
  register: (data: { email: string; password: string; name: string }) =>
    request<{ id: string }>('/api/register', { method: 'POST', data }),
};

export default api;
