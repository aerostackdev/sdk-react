import axios, { AxiosInstance } from 'axios';
import { ServicesInvokeRequest, ServicesInvokeResponse } from '../models/ServicesModels';

export class ServicesInvocationService {
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

  async invoke(data: ServicesInvokeRequest): Promise<ServicesInvokeResponse> {
    const response = await this.apiClient.post('/services/invoke', data);
    return response.data;
  }
}