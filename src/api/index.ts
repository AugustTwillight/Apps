import { useAppStore } from '../store/useAppStore';

function getBaseUrl(): string {
  return useAppStore.getState().serverUrl;
}
function getToken(): string | null {
  return useAppStore.getState().token;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${endpoint}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

// ========== 认证 API ==========
export const authApi = {
  health: () => request<any>('/api/health'),
  sendCode: (phone: string) => request<any>('/api/auth/send-code', { method: 'POST', body: JSON.stringify({ phone }) }),
  phoneLogin: (phone: string, code: string) => request<any>('/api/auth/phone-login', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  wechatLogin: (code: string) => request<any>('/api/auth/wechat-login', { method: 'POST', body: JSON.stringify({ code }) }),
  qqLogin: (code: string) => request<any>('/api/auth/qq-login', { method: 'POST', body: JSON.stringify({ code }) }),
  getProfile: () => request<any>('/api/user/profile'),
  updateProfile: (data: any) => request<any>('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getRank: () => request<any>('/api/rank'),
};

export const goalApi = {
  getTodayGoals: () => request<any>('/goals/today'),
  create: (goal: any) => request<any>('/goals', { method: 'POST', body: JSON.stringify(goal) }),
};
export const rankApi = {
  getDaily: () => request<any>('/rank/daily'),
};
