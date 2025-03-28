import axios, { AxiosInstance } from "axios";
import store from "../../src/store/store";

export class BaseApiService {
  protected api: AxiosInstance;

  constructor() {
    if (!process.env.EXPO_PUBLIC_API_URL) {
      console.error("EXPO_PUBLIC_API_URL not configured in .env");
    }

    this.api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Add a request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Do something before request is sent
        const state = store.getState();
        const token = state.user?.user?.token;

        if (token) {
          // Ensure headers object exists
          config.headers = config.headers || {};
          config.headers.Authorization = `${token}`;
        }
        return config;
      },
      (error) => {
        // Do something with request error
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Add a response interceptor
    this.api.interceptors.response.use(
      (response) => {
        // Any status code within the range of 2xx triggers this function
        console.log("Response received:", response.status);
        return response;
      },
      (error) => {
        // Any status codes outside the range of 2xx trigger this function
        if (error.response?.status === 401) {
          store.getActions().user.clearUser();
        }
        return Promise.reject(error);
      }
    );
  }
}
