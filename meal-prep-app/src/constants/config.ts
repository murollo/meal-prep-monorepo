import { Platform } from 'react-native';

/**
 * Retorna dinamicamente a URL da API.
 * Se estiver em produção (Vercel ou dispositivos móveis), conecta à API online no Render.
 * Se estiver em desenvolvimento local no PC (localhost), usa a API local.
 */
export const getApiBaseUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return 'https://meal-prep-api.onrender.com';
  }
  return 'https://meal-prep-api.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
