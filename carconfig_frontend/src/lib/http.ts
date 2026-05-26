import axios from "axios";
import { useAuthStore } from "@/features/Auth/AuthStore";
import { myEnv } from "./env";

export const http = axios.create({
    baseURL:   myEnv.backendApiUrl,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },  
})

http.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
