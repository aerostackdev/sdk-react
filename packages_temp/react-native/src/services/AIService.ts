import axios, { AxiosInstance } from 'axios';
import { AIRequest, AIResponse } from '../models/AIModels';

export class AIService {
  private apiClient: AxiosInstance;

  constructor(apiKey: string, baseUrl: string) {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-Aerostack-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async chat(data: AIRequest): Promise<AIResponse> {
    const response = await this.apiClient.post('/ai/chat', data);
    return response.data;
  }
}