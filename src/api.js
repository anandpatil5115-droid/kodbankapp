// Centralized API base URL
// In dev: empty string → Vite proxy handles /api → localhost:3001
// In prod: set VITE_API_URL to your Railway backend URL, e.g. https://kodbank-server.up.railway.app
const BASE = import.meta.env.VITE_API_URL || '';

export const apiFetch = (path, options = {}) =>
    fetch(`${BASE}${path}`, { credentials: 'include', ...options });
