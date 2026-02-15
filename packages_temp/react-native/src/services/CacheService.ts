import axios, { AxiosInstance } from 'axios';
import { CacheGetRequest, CacheGetResponse, CacheSetRequest } from '../models/CacheModels';

export class CacheService {
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

  async get(data: CacheGetRequest): Promise<CacheGetResponse> {
    const response = await this.apiClient.post('/cache/get', data);
    return response.data;
  }

  async set(data: CacheSetRequest): Promise<{ success: boolean }> {
    const response = await this.apiClient.post('/cache/set', data);
    return response.data;
  }
}