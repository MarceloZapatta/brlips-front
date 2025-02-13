import { BaseApiService } from "./base-api-service";

interface Prediction {
  id: string;
  text: string;
  created_at: string;
}

interface PredictionsResponse {
  predictions: Prediction[];
  current_page: number;
  total: number;
  next_page: number;
}

class PredictionsService extends BaseApiService {
  constructor() {
    super();
  }

  async getPredictions(
    page: number,
    per_page: number = 20
  ): Promise<PredictionsResponse> {
    try {
      // Create request config
      const config = {
        params: { page, per_page },
      };

      const response = await this.api.get("/predictions/", config);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
      throw error;
    }
  }
}

export default new PredictionsService();
