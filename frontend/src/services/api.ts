import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('[API] Initializing with base URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const fullURL = `${config.baseURL || ''}${config.url}`;
  console.log(`[API-REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    fullURL: fullURL,
    hasToken: !!token,
    method: config.method,
  });
  console.log('[API-REQUEST] FULL CONFIG:', JSON.stringify({
    url: config.url,
    baseURL: config.baseURL,
    method: config.method,
    data: config.data ? 'has data' : 'no data',
  }));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API-RESPONSE] ${response.status} from ${response.config.url}`, { 
      data: response.data ? (typeof response.data === 'string' ? response.data.slice(0, 50) : 'object') : 'empty',
    });
    return response;
  },
  (error) => {
    console.error(`[API-ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data ? (typeof error.response.data === 'string' ? error.response.data.slice(0, 100) : 'object') : 'empty',
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
    });
    if (error.response?.status === 401) {
      console.error('[API] Unauthorized - clearing token');
      localStorage.removeItem('token');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export interface WeatherData {
  id: number;
  temperature_max: number;
  temperature_min: number;
  humidity: number;
  pressure: number;
  precipitation: number;
  recorded_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface RiverData {
  id: number;
  temperature: number;
  calidad_biologica: string;
  estado_rio: string;
  bosque_rivera: string;
  recorded_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CentinelasData {
  id: number;
  temperatura_agua: number;
  flora_invasora: string;
  residuos: string;
  efluentes: string;
  mortandades: string;
  recorded_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface POMData {
  id: number;
  temperatura_mar: number;
  recorded_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CarouselSettings {
  intervalMs: number;
  showIndicators: boolean;
  images: Array<{ panelId: string; version: number }>;
}

// Public endpoints
export const weatherApi = {
  getCurrentWeather: () => api.get<WeatherData>('/weather/current'),
  getMonthlyHistory: () => api.get<WeatherData[]>('/weather/monthly'),
};

export const riverApi = {
  getCurrent: () => api.get<RiverData>('/river/current'),
  getMonthlyHistory: () => api.get<RiverData[]>('/river/monthly'),
};

export const centinelasApi = {
  getCurrent: () => api.get<CentinelasData>('/centinelas/current'),
  getMonthlyHistory: () => api.get<CentinelasData[]>('/centinelas/monthly'),
};

export const pomApi = {
  getCurrent: () => api.get<POMData>('/pom/current'),
  getMonthlyHistory: () => api.get<POMData[]>('/pom/monthly'),
};

export const carouselApi = {
  getSettings: () => api.get<CarouselSettings>('/carousel/settings'),
};

// Auth endpoints
export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; user: { id: number; username: string } }>('/auth/login', {
      username,
      password,
    }),
};

// Admin endpoints
export const adminApi = {
  getWeatherHistory: () => api.get<WeatherData[]>('/admin/weather/history'),
  createWeather: (data: Omit<WeatherData, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<WeatherData>('/admin/weather', data),
  updateWeather: (id: number, data: Partial<WeatherData>) =>
    api.put<WeatherData>(`/admin/weather/${id}`, data),
  deleteWeather: (id: number) => api.delete(`/admin/weather/${id}`),

  getRiverHistory: () => api.get<RiverData[]>('/admin/river/history'),
  createRiver: (data: Omit<RiverData, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<RiverData>('/admin/river', data),
  updateRiver: (id: number, data: Partial<RiverData>) =>
    api.put<RiverData>(`/admin/river/${id}`, data),
  deleteRiver: (id: number) => api.delete(`/admin/river/${id}`),

  getCentinelasHistory: () => api.get<CentinelasData[]>('/admin/centinelas/history'),
  createCentinelas: (data: Omit<CentinelasData, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<CentinelasData>('/admin/centinelas', data),
  updateCentinelas: (id: number, data: Partial<CentinelasData>) =>
    api.put<CentinelasData>(`/admin/centinelas/${id}`, data),
  deleteCentinelas: (id: number) => api.delete(`/admin/centinelas/${id}`),

  getPOMHistory: () => api.get<POMData[]>('/admin/pom/history'),
  createPOM: (data: Omit<POMData, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<POMData>('/admin/pom', data),
  updatePOM: (id: number, data: Partial<POMData>) =>
    api.put<POMData>(`/admin/pom/${id}`, data),
  deletePOM: (id: number) => api.delete(`/admin/pom/${id}`),

  getCarouselImages: () => api.get<Array<{ panel_id: string; content_type: string; updated_at: string }>>('/admin/carousel/images'),
  getCarouselSettings: () => api.get<CarouselSettings>('/carousel/settings'),
  updateCarouselSettings: (data: Pick<CarouselSettings, 'intervalMs' | 'showIndicators'>) =>
    api.put<CarouselSettings>('/admin/carousel/settings', data),
  uploadCarouselImage: (panelId: string, imageData: string, contentType: string) =>
    api.put(`/admin/carousel/images/${panelId}`, { imageData, contentType }),
};
