import { Platform } from 'react-native';

/**
 * Retorna dinamicamente o IP da API.
 * No navegador (celular ou PC), detecta o IP atual (ex: 192.168.x.x:3000)
 * para permitir conexão sem erros de 'Failed to fetch'.
 */
export const getApiBaseUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    return `http://${hostname}:3000`;
  }
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();
