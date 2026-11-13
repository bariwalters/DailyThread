const API_BASE_URL: string = 
  import.meta.env.MODE === 'production'
    ? 'https://dailythread.onrender.com'
    : 'http://localhost:5000';

export default API_BASE_URL;