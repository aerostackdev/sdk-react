import axios, { AxiosInstance } from 'axios';
import { DbQueryRequest, DbQueryResponse } from '../models/DatabaseModels';

export class DatabaseService {
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

  async query(data: DbQueryRequest): Promise<DbQueryResponse> {
    const response = await this.apiClient.post('/db/query', data);
    return response.data;
  }
}