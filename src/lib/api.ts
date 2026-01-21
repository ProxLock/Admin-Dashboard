import axios from 'axios';
import type { User } from '../models';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// Add a request interceptor to attach the Clerk token dynamically
api.interceptors.request.use(async (config) => {
    try {
        // @ts-ignore - Clerk is exposed globally by the Clerk Provider script
        const token = await window.Clerk?.session?.getToken({ template: "default" });
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Error fetching Clerk token", error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


export const lookupUser = async (userId: string): Promise<User> => {
    const { data } = await api.get<User>(`/admin/${userId}/user`);
    return data;
};

export const setProjectLimit = async (userId: string, limit: number | null): Promise<User> => {
    const { data } = await api.post<User>(`/admin/${userId}/projects/override-limit`, limit, {
        headers: { 'Content-Type': 'application/json' }
    });
    return data;
}

export const setApiKeyLimit = async (userId: string, limit: number | null): Promise<User> => {
    const { data } = await api.post<User>(`/admin/${userId}/keys/override-limit`, limit, {
        headers: { 'Content-Type': 'application/json' }
    });
    return data;
}
