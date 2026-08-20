import axios from 'axios';

let hostIp = '10.207.54.45';
try {
  const Constants = require('expo-constants')?.default || require('expo-constants');
  const hostUri = Constants?.expoConfig?.hostUri;
  if (hostUri) {
    hostIp = hostUri.split(':')[0];
  }
} catch {
  // fallback to detected LAN IP
}

const DEFAULT_BASE_URL = `http://${hostIp}:5000/api`;

const api = axios.create({
  baseURL: process.env.API_BASE_URL || DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
