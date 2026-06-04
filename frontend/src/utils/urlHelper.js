export const resolveFileUrl = (url) => {
  if (!url) return '';
  // If it's already an absolute URL (like Cloudinary), return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Use VITE_API_URL or fallback to localhost
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const backendBaseUrl = apiBase.replace('/api', '');
  
  return url.startsWith('/') ? `${backendBaseUrl}${url}` : `${backendBaseUrl}/${url}`;
};
