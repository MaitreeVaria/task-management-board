// Environment-based API configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001'
  : 'http://ec2-3-129-45-165.us-east-2.compute.amazonaws.com';

export const config = {
  apiBaseUrl: API_BASE_URL,
  isDevelopment,
  isProduction: !isDevelopment
}; 