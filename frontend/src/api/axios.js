import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://quicktask-f0jl.onrender.com/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const analyticsAPI = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_URL || 'https://quicktas.onrender.com/api/analytics',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default API;
