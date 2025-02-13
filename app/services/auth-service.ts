import { BaseApiService } from "./base-api-service";
import store from "../../src/store/store";
import { Router } from "expo-router";

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

class AuthService extends BaseApiService {
  constructor() {
    super();
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

  async login(credentials: LoginInputDto, router: Router) {
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

      // Navigate to home after successful login
      router.replace("/home");

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
