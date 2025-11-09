// API Base URL configuration
// In production on Vercel, use relative URLs (empty string)
// In local development, use localhost:3000
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper to construct API URLs
export const apiUrl = (path) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
