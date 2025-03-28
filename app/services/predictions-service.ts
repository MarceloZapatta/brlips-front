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

interface PredictionResponse {
  id: string;
  text: string;
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

  async predict(videoUri: string): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append("video_file", {
      uri: videoUri,
      type: "video/mp4",
      name: "recording.mp4",
    } as any);

    try {
      const response = await this.api.post("/predictions/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  }
}

export default new PredictionsService();
