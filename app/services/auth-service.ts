import axios, { AxiosInstance } from "axios";
import store from "../../src/store/store";

// Types based on your Swagger schemas
interface RegisterInputDto {
  email: string;
  name: string;
  password: string;
  password_confirm: string;
}

interface LoginInputDto {
  email: string;
  password: string;
}

interface LoginOutputDto {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface LoginResponseDto {
  data: LoginOutputDto;
}

class AuthService {
  private api: AxiosInstance;

  constructor() {
    if (!process.env.EXPO_PUBLIC_API_URL) {
      console.error("EXPO_PUBLIC_API_URL not configured in .env");
    }

    this.api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async register(data: RegisterInputDto) {
    try {
      const response = await this.api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      console.error("Falha ao registrar:", error);
      throw error;
    }
  }

  async login(credentials: LoginInputDto) {
    try {
      const response: LoginResponseDto = await this.api.post(
        "/auth/login",
        credentials
      );
      const user = response.data;

      // Add user to store with token
      store.getActions().user.setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        token: user.token,
      });

      return response.data;
    } catch (error) {
      console.error("Falha ao fazer login:", error);
      throw error;
    }
  }

  async logout() {
    store.getActions().user.clearUser();
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Falha ao obter o usuário atual:", error);
      throw error;
    }
  }

  getAuthToken() {
    return store.getState().user.user?.token || null;
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }
}

export default new AuthService();
